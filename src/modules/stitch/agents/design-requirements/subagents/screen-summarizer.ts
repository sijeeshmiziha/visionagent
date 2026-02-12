/**
 * Screen Summarizer subagent - converts screenId + screenHtml into structured screenSummary
 */

import { defineSubagent } from '../../../../../lib/subagents';

const SCREEN_SUMMARIZER_SYSTEM_PROMPT = `You are a UI analyst. You receive a screenId and the HTML content of one UI screen. Your task is to analyze the HTML and produce a structured screenSummary with all available information.

Output only a single valid JSON object, no markdown or extra text. Use this exact structure:
{
  "screenId": "<the same screenId from the input>",
  "screenSummary": {
    "screenName": "Short label for the screen (e.g. Job Listings, Job Detail)",
    "purpose": "One sentence describing what this screen is for",
    "headings": ["h1 or main heading", "h2 or section heading", ...],
    "keyElements": [{"type": "button|link|input|label", "label": "text"}, ...],
    "forms": { "fields": ["field name or label"], "submitAction": "Submit or button text" },
    "sections": ["section or region label if identifiable"],
    "rawTextSummary": "Flattened readable text summary, max 500 chars"
  }
}

Rules:
- screenId must be the exact string from the input.
- Include only fields you can infer from the HTML; omit or use empty arrays/strings if unknown.
- keyElements can be objects with type and label, or plain strings.
- Keep screenName and purpose concise. Extract real headings, buttons, links, and form labels from the HTML.`;

export const screenSummarizerDef = defineSubagent({
  name: 'screen-summarizer',
  description:
    'Analyzes one screen HTML and returns structured screenSummary (screenName, purpose, headings, keyElements, forms, sections, rawTextSummary). Input: JSON with screenId and screenHtml. Output: JSON with screenId and screenSummary.',
  systemPrompt: SCREEN_SUMMARIZER_SYSTEM_PROMPT,
  tools: {},
  maxIterations: 3,
});
