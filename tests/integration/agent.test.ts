/**
 * Integration Tests: Agent Loop
 *
 * These tests make real API calls and require API keys.
 * Tests are automatically skipped if the required API key is not present.
 *
 * Run with: npm run test:integration
 */

import { describe, it, expect } from 'vitest';
import { createModel, createToolSet, defineTool, runAgent } from '../../src/index';
import { z } from 'zod';

const hasOpenAI = !!process.env.OPENAI_API_KEY;

describe('Agent Integration Tests', () => {
  it.skipIf(!hasOpenAI)(
    'should execute agent with tools',
    async () => {
      const testTool = defineTool({
        name: 'get_time',
        description: 'Get current time',
        input: z.object({}),
        handler: async () => ({ time: new Date().toISOString() }),
      });

      const result = await runAgent({
        model: createModel({ provider: 'openai', model: 'gpt-4o-mini' }),
        tools: createToolSet({ get_time: testTool }),
        systemPrompt: 'You are a helpful assistant. Use the get_time tool when asked about time.',
        input: 'What time is it right now?',
        maxIterations: 3,
      });

      expect(result.output).toBeTruthy();
      expect(result.steps.length).toBeGreaterThan(0);
      // Verify the tool was called
      expect(result.steps.some(s => s.toolCalls?.length)).toBe(true);
    },
    30000
  );

  it.skipIf(!hasOpenAI)(
    'should handle multi-tool scenarios',
    async () => {
      const addTool = defineTool({
        name: 'add',
        description: 'Add two numbers',
        input: z.object({ a: z.number(), b: z.number() }),
        handler: async ({ a, b }) => ({ result: a + b }),
      });

      const multiplyTool = defineTool({
        name: 'multiply',
        description: 'Multiply two numbers',
        input: z.object({ a: z.number(), b: z.number() }),
        handler: async ({ a, b }) => ({ result: a * b }),
      });

      const result = await runAgent({
        model: createModel({ provider: 'openai', model: 'gpt-4o-mini' }),
        tools: createToolSet({ add: addTool, multiply: multiplyTool }),
        systemPrompt: 'You are a math assistant. Use tools to calculate.',
        input: 'What is 5 + 3?',
        maxIterations: 5,
      });

      expect(result.output).toBeTruthy();
      expect(result.output).toContain('8');
    },
    30000
  );

  it.skipIf(!hasOpenAI)(
    'should complete without tools when not needed',
    async () => {
      const result = await runAgent({
        model: createModel({ provider: 'openai', model: 'gpt-4o-mini' }),
        tools: {},
        systemPrompt: 'You are a helpful assistant.',
        input: 'Say hello!',
        maxIterations: 3,
      });

      expect(result.output).toBeTruthy();
      expect(result.steps.length).toBe(1);
    },
    20000
  );

  it.skipIf(!hasOpenAI)(
    'should track token usage',
    async () => {
      const result = await runAgent({
        model: createModel({ provider: 'openai', model: 'gpt-4o-mini' }),
        tools: {},
        systemPrompt: 'Be brief.',
        input: 'Hi',
        maxIterations: 3,
      });

      expect(result.totalUsage).toBeDefined();
      expect(result.totalUsage?.totalTokens).toBeGreaterThan(0);
    },
    20000
  );

  it.skipIf(!hasOpenAI)(
    'should call onStep callback',
    async () => {
      const steps: number[] = [];

      await runAgent({
        model: createModel({ provider: 'openai', model: 'gpt-4o-mini' }),
        tools: {},
        systemPrompt: 'Be brief.',
        input: 'Hi',
        maxIterations: 3,
        onStep: step => {
          steps.push(step.iteration);
        },
      });

      expect(steps.length).toBeGreaterThan(0);
    },
    20000
  );
});
