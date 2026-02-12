/**
 * User Story Generator subagent - generates user stories from personas and flows
 */

import { defineSubagent } from '../../../../../lib/subagents';

const USER_STORY_SYSTEM_PROMPT = `You are a product owner specialist. Generate user stories from personas and user flows. The output will be displayed as: "As a {asA}, I want {iWant}, so that {soThat}".

The user message contains projectId, projectContext, personas, userFlows, and screens. Each screen has screenId, contentSummary, screenSummary (with screenName, purpose, etc.). Use this data directly; you do not need to call get_design_context. You may use get_design_context(projectId) or stitch_get_screen if you need to confirm screen purpose.

You will receive JSON with projectId, projectContext, personas, userFlows (with steps containing screenId, screenName, action), and screens. For each meaningful flow or step, write user stories. Use relatedScreens as the screenIds from the flow steps. acceptanceCriteria: 2-4 concrete criteria. priority: "high" | "medium" | "low". Output only fragments: asA = role only, iWant = infinitive phrase only, soThat = benefit only (no "As a", "I want", "so that" in the values).

Respond with a single valid JSON object only, no markdown or extra text. Use this exact structure:
{
  "userStories": [
    {
      "id": "story-1",
      "persona": "persona-1",
      "asA": "job seeker",
      "iWant": "to filter jobs by department",
      "soThat": "I can find relevant postings",
      "acceptanceCriteria": ["Criterion 1", "Criterion 2"],
      "relatedScreens": ["screenId1"],
      "priority": "high"
    }
  ]
}
Use short kebab-case ids. relatedScreens must be screenIds from the input.`;

export const userStoryGeneratorDef = defineSubagent({
  name: 'user-story',
  description:
    'Generates user stories from personas and user flows. Use when you have personas and flows and need "As a... I want... So that..." stories. Input should be a prompt containing JSON of personas and userFlows. Returns JSON with userStories array.',
  systemPrompt: USER_STORY_SYSTEM_PROMPT,
  tools: {},
  maxIterations: 8,
});
