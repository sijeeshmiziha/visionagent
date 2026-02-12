/**
 * Screen context: build ScreenWithContext list from Stitch screens (shared by tool and pipeline)
 */

import type { StitchClient } from '../../client';
import { parseScreenName } from '../../utils';
import { runSubagent } from '../../../../lib/subagents';
import type { Model } from '../../../../lib/types/model';
import type { SubagentDefinition } from '../../../../lib/types/subagent';
import type { ScreenSummary } from './types';
import { extractJson } from './utils';
import {
  getScreenHtml,
  getContentSummary,
  getScreenshotUrl,
  type ScreenContentCache,
  type ScreenHtmlEntry,
} from './screen-content';
import { screenSummarizerDef } from './subagents';

/** One screen with full context for subagents (contentSummary, screenSummary, screenshotDownloadUrl) */
export interface ScreenWithContext {
  screenId: string;
  resourceName: string;
  projectId: string;
  contentSummary: string;
  screenshotDownloadUrl?: string;
  screenSummary?: ScreenSummary;
}

export interface BuildScreensWithContextOptions {
  cache?: ScreenContentCache;
  model?: Model;
  screenSummarizerDef?: SubagentDefinition;
}

/**
 * For each screen: fetch full screen, get HTML, get content summary, optionally run
 * screen-summarizer subagent, then return ScreenWithContext[].
 * Used by both createGetDesignContextTool and runDesignRequirementsAgent.
 */
export async function buildScreensWithContext(
  screens: { name: string }[],
  client: StitchClient,
  options: BuildScreensWithContextOptions = {}
): Promise<ScreenWithContext[]> {
  const {
    cache = new Map<string, ScreenHtmlEntry>(),
    model,
    screenSummarizerDef: summarizerDef = screenSummarizerDef,
  } = options;
  const result: ScreenWithContext[] = [];

  for (const s of screens) {
    const parsed = parseScreenName(s.name);
    if (!parsed) continue;

    const full = await client.getScreen(s.name);
    const htmlEntry = await getScreenHtml(full, cache);
    const contentSummary = getContentSummary(htmlEntry, full);

    let screenSummary: ScreenSummary | undefined;
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
        const subagentResult = await runSubagent(summarizerDef, payload, { parentModel: model });
        const parsedOutput = extractJson(subagentResult.output) as {
          screenId: string;
          screenSummary: ScreenSummary;
        };
        if (parsedOutput?.screenSummary) {
          screenSummary = parsedOutput.screenSummary;
          console.log('[design-requirements] Screen summary', {
            screenId: parsed.screenId,
            screenName: screenSummary.screenName,
            screenSummary: screenSummary,
          });
        }
      } catch {
        // keep screenSummary undefined on parse or run failure
      }
    }

    result.push({
      screenId: parsed.screenId,
      resourceName: s.name,
      projectId: parsed.projectId,
      contentSummary,
      screenshotDownloadUrl: getScreenshotUrl(full),
      ...(screenSummary ? { screenSummary } : {}),
    });
  }

  return result;
}
