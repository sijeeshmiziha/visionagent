/**
 * Example: Subagents (researcher + summarizer)
 *
 * A parent agent delegates to two subagents: a researcher (read-only search tool)
 * and a summarizer (no tools). The parent coordinates by calling subagent tools.
 *
 * Setup:
 *   npm install visionagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx 05-subagents.ts
 */
import {
  createModel,
  createToolSet,
  defineTool,
  defineSubagent,
  createSubagentToolSet,
  runAgent,
} from 'visionagent';
import type { AgentStep } from 'visionagent';
import { z } from 'zod';

// --- Read-only tool for the researcher subagent ---
const searchTool = defineTool({
  name: 'web_search',
  description: 'Search for information on the web',
  input: z.object({ query: z.string() }),
  handler: async ({ query }) => {
    console.log(`    [Researcher/search] "${query}"`);
    return {
      results: [
        `Summary: Key points about ${query} from source A.`,
        `Summary: Additional context on ${query} from source B.`,
      ],
    };
  },
});

// --- Subagent definitions ---
const researcherDef = defineSubagent({
  name: 'researcher',
  description:
    'Research specialist. Use when you need to gather information or look up facts. Returns research findings as text.',
  systemPrompt: `You are a research assistant. Use the web_search tool to find information. Call the tool once or twice, then return a concise summary of what you found. Do not make up facts.`,
  tools: { web_search: searchTool },
  maxIterations: 5,
});

const summarizerDef = defineSubagent({
  name: 'summarizer',
  description:
    'Summarization specialist. Use when you have text (e.g. research results) and need a short, clear summary.',
  systemPrompt: `You are a summarization assistant. You have no tools. The user will give you text to summarize. Respond with a clear, concise summary only. Do not add new information.`,
  tools: {},
  maxIterations: 2,
});

const PARENT_SYSTEM_PROMPT = `You are a coordinator. When the user asks a question:
1. Use subagent_researcher with a prompt that asks for relevant research (e.g. "Research: <topic>").
2. Then use subagent_summarizer with a prompt that includes the researcher's output and asks for a short summary.
3. Reply to the user with the final summary.`;

async function main() {
  console.log('=== Subagents Example (researcher + summarizer) ===\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';
  const agentInput =
    process.env.AGENT_INPUT ?? 'Research "TypeScript 5 features" and give me a short summary.';
  const maxIterations = Number(process.env.MAX_ITERATIONS ?? '10') || 10;

  const parentModel = createModel({
    provider,
    model: modelName,
    apiKey: process.env.OPENAI_API_KEY,
  });
  const subagentTools = createSubagentToolSet([researcherDef, summarizerDef], {
    parentModel,
  });
  const parentTools = createToolSet(subagentTools);

  console.log('Prompt:', agentInput);
  console.log('Model:', provider, modelName);
  console.log('');

  const result = await runAgent({
    model: parentModel,
    tools: parentTools,
    systemPrompt: PARENT_SYSTEM_PROMPT,
    input: agentInput,
    maxIterations,
    onStep: (step: AgentStep) => {
      console.log(`--- Step ${step.iteration + 1} ---`);
      if (step.content) {
        console.log('Agent:', step.content);
      }
      if (step.toolCalls?.length) {
        for (const tc of step.toolCalls) {
          const inputStr =
            typeof tc.input === 'object' && tc.input && 'prompt' in tc.input
              ? (tc.input as { prompt: string }).prompt.slice(0, 80)
              : JSON.stringify(tc.input).slice(0, 80);
          console.log(`  Tool: ${tc.toolName}(${inputStr}...)`);
        }
      }
      console.log('');
    },
  });

  console.log('=== Done ===\n');
  console.log('Final output:\n');
  console.log(result.output);
  console.log('\nSteps:', result.steps.length);
  if (result.totalUsage) {
    console.log('Total tokens:', result.totalUsage);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
