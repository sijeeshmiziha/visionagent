/**
 * Design Requirements Orchestrator - runs specialized subagents to produce technical requirements from Stitch designs
 */

import { z } from 'zod';
import { StitchClient } from '../../client';
import { buildProjectResourceName, parseScreenName } from '../../utils';
import { createModel } from '../../../../lib/models/create-model';
import { runSubagent } from '../../../../lib/subagents';
import { defineTool } from '../../../../lib/tools';
import {
  userPersonaAnalyzerDef,
  userFlowAnalyzerDef,
  userStoryGeneratorDef,
  apiRequirementsAnalyzerDef,
  screenSummarizerDef,
} from './subagents';
import type {
  DesignRequirementsOutput,
  UserPersona,
  UserFlow,
  UserStory,
  ApiRequirement,
  ScreenSummary,
} from './types';
import type { StitchConfig } from '../../types';
import { createStitchReadOnlyToolSet } from '../../tools';
import type { ModelConfig, Model } from '../../../../lib/types/model';
import type { SubagentDefinition } from '../../../../lib/types/subagent';

/** Extract JSON from subagent output (may be wrapped in ```json ... ```) */
function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const codeBlockRegex = /^```(?:json)?\s*([\s\S]*?)```$/m;
  const codeBlock = codeBlockRegex.exec(trimmed);
  const str = codeBlock?.[1]?.trim() ?? trimmed;
  return JSON.parse(str);
}

const MAX_DESIGN_DEPTH = 10;
const MAX_DESIGN_TEXT_LEN = 800;
const MAX_HTML_TEXT_LEN = 4000;
const MAX_HTML_BODY_LEN = 150_000;
const TEXT_KEYS = new Set([
  'text',
  'label',
  'title',
  'content',
  'name',
  'placeholder',
  'heading',
  'description',
  'caption',
  'alt',
  'value',
  'ariaLabel',
  'hint',
]);

/** Decode common HTML entities so contentSummary is readable */
function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * Fetch raw HTML from a Stitch download URL. Returns { rawHtml, plainText }.
 * rawHtml: the full HTML with script/style removed (structure preserved for the LLM).
 * plainText: tags stripped, entities decoded, truncated — for contentSummary in payloads.
 */
async function fetchScreenHtml(url: string): Promise<{ rawHtml: string; plainText: string }> {
  const empty = { rawHtml: '', plainText: '' };
  try {
    const res = await fetch(url);
    console.log('[design-requirements] Fetched HTML', {
      status: res.status,
      ok: res.ok,
      url: url.slice(0, 80),
    });
    if (!res.ok) return empty;
    let html = await res.text();
    console.log('[design-requirements] HTML raw length', { rawLength: html.length });
    if (html.length > MAX_HTML_BODY_LEN) html = html.slice(0, MAX_HTML_BODY_LEN);
    // Remove script and style blocks (keep structure for LLM)
    const cleaned = html
      .replace(/<script\b[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[\s\S]*?<\/style>/gi, '');
    // Plain text version: strip tags, decode entities, truncate for contentSummary
    let text = cleaned
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    text = decodeHtmlEntities(text);
    const plainText =
      text.length > MAX_HTML_TEXT_LEN ? text.slice(0, MAX_HTML_TEXT_LEN) + '…' : text;
    console.log('[design-requirements] Parsed HTML text', {
      htmlLength: cleaned.length,
      plainTextLength: plainText.length,
      preview: plainText.slice(0, 200),
    });
    return { rawHtml: cleaned, plainText };
  } catch (err) {
    console.log('[design-requirements] fetchScreenHtml error', err);
    return empty;
  }
}

/**
 * Recursively extract readable text from a design object so the model can infer
 * screen purpose, features, and user flows. Skips long hashes and IDs.
 */
function summarizeDesign(design: unknown, depth = 0): string {
  if (depth > MAX_DESIGN_DEPTH) return '';
  if (design == null) return '';
  if (typeof design === 'string') {
    const t = design.trim();
    if (t.length > 0 && t.length < 120 && !/^[a-f0-9-]{20,}$/i.test(t)) return t;
    return '';
  }
  if (Array.isArray(design)) {
    return design
      .map(item => summarizeDesign(item, depth + 1))
      .filter(Boolean)
      .join(' ');
  }
  if (typeof design === 'object') {
    const parts: string[] = [];
    for (const [key, val] of Object.entries(design)) {
      const keyLower = key.toLowerCase();
      const isTextLike =
        TEXT_KEYS.has(keyLower) || keyLower.endsWith('text') || keyLower.endsWith('label');
      if (typeof val === 'string' && val.trim().length > 0 && val.length < 200) {
        if (isTextLike || !/^[a-f0-9-]{20,}$/i.test(val)) parts.push(val.trim());
      } else if (val !== null && typeof val === 'object') {
        const nested = summarizeDesign(val, depth + 1);
        if (nested) parts.push(nested);
      }
    }
    const out = parts.join(' ').replace(/\s+/g, ' ').trim();
    return out.length > MAX_DESIGN_TEXT_LEN ? out.slice(0, MAX_DESIGN_TEXT_LEN) + '…' : out;
  }
  return '';
}

const FALLBACK_SUMMARY = '(No text content extracted from design)';

/** Cached screen HTML: rawHtml for LLM, plainText for contentSummary */
interface ScreenHtmlEntry {
  rawHtml: string;
  plainText: string;
}

/** Optional cache: URL -> { rawHtml, plainText } */
export type ScreenContentCache = Map<string, ScreenHtmlEntry>;

/** One screen with full context for subagents (contentSummary, screenSummary, screenshotDownloadUrl) */
export interface ScreenWithContext {
  screenId: string;
  resourceName: string;
  projectId: string;
  contentSummary: string;
  screenshotDownloadUrl?: string;
  screenSummary?: ScreenSummary;
}

export interface GetDesignContextToolOptions {
  cache?: ScreenContentCache;
  /** When set, screen-summarizer agent runs per screen and screens include screenSummary */
  model?: Model;
  screenSummarizerDef?: SubagentDefinition;
  /** When set, tool returns this for the matching projectId instead of fetching */
  precomputed?: { projectId: string; projectTitle: string; screens: ScreenWithContext[] };
}

function getHtmlUrl(screen: {
  htmlCode?: { downloadUrl?: string };
  [key: string]: unknown;
}): string | undefined {
  const htmlCode =
    screen.htmlCode ??
    (screen as { design?: { htmlCode?: { downloadUrl?: string } } }).design?.htmlCode;
  return typeof htmlCode === 'object' &&
    htmlCode !== null &&
    typeof (htmlCode as { downloadUrl?: string }).downloadUrl === 'string'
    ? (htmlCode as { downloadUrl: string }).downloadUrl
    : undefined;
}

/**
 * Fetch and cache screen HTML. Returns { rawHtml, plainText } or empty if unavailable.
 * rawHtml is the full HTML (script/style removed) for the LLM.
 * plainText is the stripped/truncated text for contentSummary.
 */
async function getScreenHtml(
  screen: { design?: unknown; htmlCode?: { downloadUrl?: string }; [key: string]: unknown },
  cache?: ScreenContentCache
): Promise<ScreenHtmlEntry> {
  const url = getHtmlUrl(screen);
  if (url) {
    const cached = cache?.get(url);
    if (cached) return cached;
    const entry = await fetchScreenHtml(url);
    if (entry.plainText) {
      cache?.set(url, entry);
      return entry;
    }
  }
  return { rawHtml: '', plainText: '' };
}

/**
 * Get a short text summary for a screen (plainText from HTML, or fallback to summarizeDesign).
 */
function getContentSummary(
  htmlEntry: ScreenHtmlEntry,
  screen: { design?: unknown; [key: string]: unknown }
): string {
  if (htmlEntry.plainText) return htmlEntry.plainText;
  if (screen.design != null) {
    const out = summarizeDesign(screen.design);
    if (out) return out;
  }
  const fromScreen = summarizeDesign(screen);
  return fromScreen || FALLBACK_SUMMARY;
}

function getScreenshotUrl(screen: {
  screenshot?: { downloadUrl?: string };
  design?: unknown;
  [key: string]: unknown;
}): string | undefined {
  const s =
    screen.screenshot ??
    (typeof screen.design === 'object' && screen.design !== null && 'screenshot' in screen.design
      ? (screen.design as { screenshot?: { downloadUrl?: string } }).screenshot
      : undefined);
  return typeof s?.downloadUrl === 'string' ? s.downloadUrl : undefined;
}

/** Tool input: projectId only. Used by subagents to fetch project title and screens with contentSummary. */
export function createGetDesignContextTool(
  config?: StitchConfig,
  options?: GetDesignContextToolOptions
) {
  const cache = options?.cache ?? undefined;
  const model = options?.model;
  const summarizerDef = options?.screenSummarizerDef ?? screenSummarizerDef;
  const precomputed = options?.precomputed;
  return defineTool({
    name: 'get_design_context',
    description:
      'Fetch project title and all screens with content summaries for a Stitch project. Call with projectId (e.g. 4044680601076201931). Returns { projectTitle, projectId, screens: [{ screenId, resourceName, projectId, contentSummary, screenshotDownloadUrl?, screenSummary? }] }.',
    input: z.object({
      projectId: z.string().describe('Stitch project ID (without projects/ prefix)'),
    }),
    handler: async ({ projectId }) => {
      console.log('[design-requirements] get_design_context called', { projectId });
      if (precomputed?.projectId === projectId) {
        return {
          projectTitle: precomputed.projectTitle,
          projectId,
          screens: precomputed.screens,
        };
      }
      const client = new StitchClient(config);
      const projectName = buildProjectResourceName(projectId);
      const project = await client.getProject(projectName);
      const projectTitle = project.title ?? projectId;
      const listResponse = await client.listScreens(projectId);
      const screens = listResponse.screens ?? [];
      const requestCache = cache ?? new Map<string, ScreenHtmlEntry>();
      const screensOut: ScreenWithContext[] = [];
      for (const s of screens) {
        const parsed = parseScreenName(s.name);
        if (!parsed) continue;
        const full = await client.getScreen(s.name);
        const htmlEntry = await getScreenHtml(full, requestCache);
        const contentSummary = getContentSummary(htmlEntry, full);
        let screenSummary: ScreenSummary | undefined;
        if (model && htmlEntry.rawHtml) {
          try {
            const payload = JSON.stringify(
              { screenId: parsed.screenId, screenHtml: htmlEntry.rawHtml },
              null,
              2
            );
            const result = await runSubagent(summarizerDef, payload, { parentModel: model });
            const parsedOutput = extractJson(result.output) as {
              screenId: string;
              screenSummary: ScreenSummary;
            };
            if (parsedOutput?.screenSummary) {
              screenSummary = parsedOutput.screenSummary;
            }
          } catch {
            // keep screenSummary undefined on parse or run failure
          }
        }
        screensOut.push({
          screenId: parsed.screenId,
          resourceName: s.name,
          projectId: parsed.projectId,
          contentSummary,
          screenshotDownloadUrl: getScreenshotUrl(full),
          ...(screenSummary != null ? { screenSummary } : {}),
        });
      }
      console.log('[design-requirements] get_design_context returning', {
        projectTitle,
        screensCount: screensOut.length,
      });
      return { projectTitle, projectId, screens: screensOut };
    },
  });
}

export interface DesignRequirementsAgentConfig {
  /** User instruction or context (e.g. "Analyze this e-commerce app design") */
  input: string;
  /** Stitch project ID to analyze (without projects/ prefix) */
  projectId: string;
  /** Model config; defaults to OpenAI gpt-4o-mini */
  model?: ModelConfig;
  /** Stitch MCP config override */
  stitchMcpConfig?: StitchConfig;
}

export interface DesignRequirementsResult {
  /** Structured requirements output */
  output: DesignRequirementsOutput;
}

/**
 * Design-to-requirements pipeline flow:
 * 1. Fetch project and list screens.
 * 2. For each screen: getScreen, fetch HTML from htmlCode.downloadUrl (decode properly), run
 *    screen-summarizer agent → build screensWithContext (contentSummary, screenSummary, screenshotDownloadUrl).
 * 3. Create get_design_context tool with precomputed context so it returns screensWithContext when called.
 * 4. Run subagents in order (persona → flow → story → api), passing screensWithContext in each payload
 *    so they use the precomputed screen data directly; parse JSON from each and assemble DesignRequirementsOutput.
 */
export async function runDesignRequirementsAgent(
  config: DesignRequirementsAgentConfig
): Promise<DesignRequirementsResult> {
  const { input: userInput, projectId, model: modelConfig, stitchMcpConfig } = config;

  console.log('[design-requirements] Starting pipeline', {
    projectId,
    userInput: userInput?.slice(0, 80),
  });

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const client = new StitchClient(stitchMcpConfig);

  const projectName = buildProjectResourceName(projectId);
  const project = await client.getProject(projectName);
  const projectTitle = project.title ?? projectId;
  console.log('[design-requirements] Fetched project', { projectTitle });

  const listResponse = await client.listScreens(projectId);
  const screens = listResponse.screens ?? [];
  console.log('[design-requirements] Listed screens', { count: screens.length });

  const screenContentCache: ScreenContentCache = new Map();
  const screensWithContext: ScreenWithContext[] = [];

  for (const s of screens) {
    const parsed = parseScreenName(s.name);
    if (!parsed) continue;
    const full = await client.getScreen(s.name);
    const htmlEntry = await getScreenHtml(full, screenContentCache);
    const contentSummary = getContentSummary(htmlEntry, full);
    let screenSummary: ScreenSummary | undefined;
    // Pass the FULL HTML (rawHtml) to the screen-summarizer LLM, not the truncated plainText
    if (model && htmlEntry.rawHtml) {
      try {
        const payload = JSON.stringify(
          { screenId: parsed.screenId, screenHtml: htmlEntry.rawHtml },
          null,
          2
        );
        console.log('[design-requirements] Running screen-summarizer', {
          screenId: parsed.screenId,
          htmlLength: htmlEntry.rawHtml.length,
        });
        const result = await runSubagent(screenSummarizerDef, payload, { parentModel: model });
        const parsedOutput = extractJson(result.output) as {
          screenId: string;
          screenSummary: ScreenSummary;
        };
        if (parsedOutput?.screenSummary) {
          screenSummary = parsedOutput.screenSummary;
          console.log('[design-requirements] Screen summary', {
            screenId: parsed.screenId,
            screenName: screenSummary.screenName,
          });
        }
      } catch {
        // keep screenSummary undefined on failure
      }
    }
    screensWithContext.push({
      screenId: parsed.screenId,
      resourceName: s.name,
      projectId: parsed.projectId,
      contentSummary,
      screenshotDownloadUrl: getScreenshotUrl(full),
      ...(screenSummary != null ? { screenSummary } : {}),
    });
  }

  const readOnlyStitchTools = createStitchReadOnlyToolSet(stitchMcpConfig);
  const designContextTool = createGetDesignContextTool(stitchMcpConfig, {
    cache: screenContentCache,
    model,
    screenSummarizerDef,
    precomputed: { projectId, projectTitle, screens: screensWithContext },
  });
  const parentTools = { ...readOnlyStitchTools, get_design_context: designContextTool };

  console.log('[design-requirements] Running subagent: user-persona');
  const personaPayload = JSON.stringify(
    { projectId, projectContext: userInput, screens: screensWithContext },
    null,
    2
  );
  const personaResult = await runSubagent(userPersonaAnalyzerDef, personaPayload, {
    parentModel: model,
    parentTools,
  });
  const personaData = extractJson(personaResult.output) as { personas: UserPersona[] };
  const personas = personaData.personas ?? [];
  console.log('[design-requirements] user-persona done', { personas: personas.length });

  console.log('[design-requirements] Running subagent: user-flow');
  const flowsPayload = JSON.stringify(
    { projectId, projectContext: userInput, personas, screens: screensWithContext },
    null,
    2
  );
  const flowResult = await runSubagent(userFlowAnalyzerDef, flowsPayload, {
    parentModel: model,
    parentTools,
  });
  const flowData = extractJson(flowResult.output) as { userFlows: UserFlow[] };
  const userFlows = flowData.userFlows ?? [];
  console.log('[design-requirements] user-flow done', { userFlows: userFlows.length });

  console.log('[design-requirements] Running subagent: user-story');
  const storiesPayload = JSON.stringify(
    { projectId, projectContext: userInput, personas, userFlows, screens: screensWithContext },
    null,
    2
  );
  const storyResult = await runSubagent(userStoryGeneratorDef, storiesPayload, {
    parentModel: model,
    parentTools,
  });
  const storyData = extractJson(storyResult.output) as { userStories: UserStory[] };
  const userStories = storyData.userStories ?? [];
  console.log('[design-requirements] user-story done', { userStories: userStories.length });

  console.log('[design-requirements] Running subagent: api-requirements');
  const apiPayload = JSON.stringify(
    { projectId, projectContext: userInput, userStories, screens: screensWithContext },
    null,
    2
  );
  const apiResult = await runSubagent(apiRequirementsAnalyzerDef, apiPayload, {
    parentModel: model,
    parentTools,
  });
  const apiData = extractJson(apiResult.output) as { apiRequirements: ApiRequirement[] };
  const apiRequirements = apiData.apiRequirements ?? [];
  console.log('[design-requirements] api-requirements done', {
    apiRequirements: apiRequirements.length,
  });

  const output: DesignRequirementsOutput = {
    projectId,
    projectName: projectTitle,
    analyzedAt: new Date().toISOString(),
    personas,
    userFlows,
    userStories,
    apiRequirements,
    summary: {
      totalScreens: screensWithContext.length,
      totalPersonas: personas.length,
      totalFlows: userFlows.length,
      totalStories: userStories.length,
      totalApis: apiRequirements.length,
    },
  };

  console.log('[design-requirements] Pipeline complete', output.summary);
  return { output };
}

export type { DesignRequirementsOutput } from './types';
