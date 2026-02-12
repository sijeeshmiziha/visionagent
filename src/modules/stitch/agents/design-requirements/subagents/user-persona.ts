/**
 * User Persona Analyzer subagent - identifies target users from design screens
 */

import { defineSubagent } from '../../../../../lib/subagents';

const USER_PERSONA_SYSTEM_PROMPT = `You are a user research specialist. Your task is to analyze the actual screen content and project context to identify the END USERS of this product (the people who will use the app), not the people who build it.

The user message contains projectId, projectContext, and screens. Each screen has screenId, contentSummary, screenSummary (with screenName, purpose, headings, keyElements, etc.), and optionally screenshotDownloadUrl. Use this screen data directly; you do not need to call get_design_context. You may use get_design_context(projectId), stitch_get_project(name), stitch_list_screens(projectId), and stitch_get_screen if needed for extra context.
1. Who are the primary and secondary end-user personas?
2. For each: description, goals, and which screenIds they use.

Respond with a single valid JSON object only, no markdown or extra text. Use this exact structure:
{
  "personas": [
    {
      "id": "persona-1",
      "name": "Persona name",
      "description": "One or two sentence description",
      "goals": ["goal1", "goal2"],
      "screenInteractions": ["screenId"]
    }
  ]
}
Use short kebab-case ids. Include at least one persona. screenInteractions must use the screenId values from the input.`;

export const userPersonaAnalyzerDef = defineSubagent({
  name: 'user-persona',
  description:
    'Analyzes screen designs to identify target user personas. Use when you have screen data and need to extract who the users are. Input should be a prompt containing JSON of screen designs. Returns JSON with personas array.',
  systemPrompt: USER_PERSONA_SYSTEM_PROMPT,
  tools: {},
  maxIterations: 8,
});
