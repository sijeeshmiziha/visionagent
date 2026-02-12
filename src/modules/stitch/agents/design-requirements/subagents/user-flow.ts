/**
 * User Flow Analyzer subagent - maps navigation paths and user journeys between screens
 */

import { defineSubagent } from '../../../../../lib/subagents';

const USER_FLOW_SYSTEM_PROMPT = `You are a UX flow specialist. Your task is to map real user journeys through the app based on actual screen content and project context.

The user message contains projectId, projectContext, personas, and screens. Each screen has screenId, contentSummary, screenSummary (with screenName, purpose, headings, keyElements, etc.), and optionally screenshotDownloadUrl. Use this screen data directly; you do not need to call get_design_context. You may use get_design_context(projectId), stitch_get_project(name), stitch_list_screens(projectId), and stitch_get_screen if needed for extra context. Map flows and steps using the given persona ids.

For each screen, infer a short PURPOSE name from its contentSummary or screenSummary.screenName (e.g. "Homepage", "Job listing", "Job detail", "Application form", "Search results"), not "Screen 1" or the resource name.

Map real flows that make sense for the product (e.g. "Search jobs → View job → Apply", "Browse → Add to cart → Checkout"). For each flow:
1. Name the flow from the user goal.
2. Use the persona id from the input.
3. For each step: use the actual screenId from input; set screenName to the PURPOSE you inferred for that screen (e.g. "Job listing"); set action to what the user does (e.g. "Searches by department", "Clicks job card"); set nextScreenId to the next screen's screenId or omit for the last step.

Respond with a single valid JSON object only, no markdown or extra text. Use this exact structure:
{
  "userFlows": [
    {
      "id": "flow-1",
      "name": "Flow name",
      "description": "Brief description of the flow",
      "persona": "persona-1",
      "steps": [
        {
          "order": 1,
          "screenId": "exact screenId from input",
          "screenName": "Purpose name from content (e.g. Job listing)",
          "action": "User action",
          "nextScreenId": "next step screenId or omit"
        }
      ]
    }
  ]
}
Use short kebab-case ids. screenId and nextScreenId must be the screenId values from the input.`;

export const userFlowAnalyzerDef = defineSubagent({
  name: 'user-flow',
  description:
    'Maps user flows and navigation paths between screens. Use when you have screens and personas and need journey maps. Input should be a prompt containing JSON of screens and personas. Returns JSON with userFlows array.',
  systemPrompt: USER_FLOW_SYSTEM_PROMPT,
  tools: {},
  maxIterations: 8,
});
