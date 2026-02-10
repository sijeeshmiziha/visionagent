/**
 * Example 04: Agent with Multiple Tools
 *
 * Run with: npm run example:04
 *
 * Demonstrates a complex agent with multiple tools.
 * Requires: OPENAI_API_KEY environment variable
 */

import { createModel, defineTool, runAgent } from '../src/index';
import { z } from 'zod';

const searchTool = defineTool({
  name: 'web_search',
  description: 'Search for information on the web',
  input: z.object({ query: z.string() }),
  handler: async ({ query }) => {
    console.log(`  [Search] Searching for: "${query}"`);
    // Mock search results
    return {
      results: [
        `Result 1: Best practices for ${query}`,
        `Result 2: Common patterns in ${query}`,
        `Result 3: Advanced tips for ${query}`,
      ],
    };
  },
});

const writeFileTool = defineTool({
  name: 'write_file',
  description: 'Write content to a file (simulated)',
  input: z.object({
    filename: z.string(),
    content: z.string(),
  }),
  handler: async ({ filename, content }) => {
    console.log(`  [WriteFile] Would write ${content.length} chars to ${filename}`);
    // Don't actually write, just simulate
    return { success: true, bytes: content.length, filename };
  },
});

const getCurrentTimeTool = defineTool({
  name: 'get_current_time',
  description: 'Get the current date and time',
  input: z.object({}),
  handler: async () => {
    const now = new Date().toISOString();
    console.log(`  [Time] Current time: ${now}`);
    return { time: now };
  },
});

async function main() {
  console.log('Testing multi-tool agent...\n');

  const result = await runAgent({
    model: createModel({ provider: 'openai', model: 'gpt-4o-mini' }),
    tools: [searchTool, writeFileTool, getCurrentTimeTool],
    systemPrompt:
      'You are a research assistant. When asked to research a topic, use the search tool to find information, then summarize what you found.',
    input: 'Search for React hooks best practices and tell me what you found.',
    maxIterations: 10,
    onStep: step => {
      if (step.toolCalls?.length) {
        step.toolCalls.forEach(tc => {
          console.log(`Step ${step.iteration + 1}: ${tc.name}()`);
        });
      } else {
        console.log(`Step ${step.iteration + 1}: Generating response...`);
      }
    },
  });

  console.log('\n✓ Agent completed');
  console.log('\n--- ANSWER ---\n');
  console.log(result.output);
  console.log('\n--- STATS ---');
  console.log('Steps:', result.steps.length);
  console.log('Total tokens:', result.totalUsage);
}

main().catch(console.error);
