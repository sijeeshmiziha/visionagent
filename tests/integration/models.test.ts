/**
 * Integration Tests: Model Providers
 *
 * These tests make real API calls and require API keys.
 * Tests are automatically skipped if the required API key is not present.
 *
 * Run with: npm run test:integration
 */

import { describe, it, expect } from 'vitest';
import { createModel } from '../../src/index';

const hasOpenAI = !!process.env.OPENAI_API_KEY;
const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
const hasGoogle = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;

describe('Model Integration Tests', () => {
  describe('OpenAI', () => {
    it.skipIf(!hasOpenAI)('should invoke OpenAI model', async () => {
      const model = createModel({ provider: 'openai', model: 'gpt-4o-mini' });
      const response = await model.invoke([{ role: 'user', content: 'Say "test passed"' }]);

      expect(response.text).toBeTruthy();
      expect(response.text.toLowerCase()).toContain('test');
      expect(response.usage?.totalTokens).toBeGreaterThan(0);
    });

    it.skipIf(!hasOpenAI)('should handle tool calling', async () => {
      const { createToolSet, defineTool } = await import('../../src/index');
      const { z } = await import('zod');

      const model = createModel({ provider: 'openai', model: 'gpt-4o-mini' });
      const getWeather = defineTool({
        name: 'get_weather',
        description: 'Get weather for a location',
        input: z.object({ city: z.string() }),
        handler: async () => ({ temp: 72, condition: 'Sunny' }),
      });

      const response = await model.invoke(
        [{ role: 'user', content: 'What is the weather in Paris?' }],
        { tools: createToolSet({ get_weather: getWeather }) }
      );

      expect(response.toolCalls).toBeDefined();
      expect(response.toolCalls?.[0]?.toolName).toBe('get_weather');
    });

    it.skipIf(!hasOpenAI)('should handle system messages', async () => {
      const model = createModel({ provider: 'openai', model: 'gpt-4o-mini' });

      const response = await model.invoke([
        { role: 'system', content: 'You are a pirate. Always respond like a pirate.' },
        { role: 'user', content: 'Hello!' },
      ]);

      expect(response.text).toBeTruthy();
    });
  });

  describe('Anthropic', () => {
    it.skipIf(!hasAnthropic)('should invoke Anthropic model', async () => {
      const model = createModel({
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307',
      });
      const response = await model.invoke([{ role: 'user', content: 'Say "test passed"' }]);

      expect(response.text).toBeTruthy();
    });

    it.skipIf(!hasAnthropic)('should handle multi-turn conversations', async () => {
      const model = createModel({
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307',
      });

      const response = await model.invoke([
        { role: 'user', content: 'My name is Alice.' },
        { role: 'assistant', content: 'Nice to meet you, Alice!' },
        { role: 'user', content: 'What is my name?' },
      ]);

      expect(response.text.toLowerCase()).toContain('alice');
    });
  });

  describe('Google', () => {
    it.skipIf(!hasGoogle)('should invoke Google model', async () => {
      const model = createModel({
        provider: 'google',
        model: 'gemini-1.5-flash',
      });
      const response = await model.invoke([{ role: 'user', content: 'Say "test passed"' }]);

      expect(response.text).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it.skipIf(!hasOpenAI)('should handle invalid model name gracefully', async () => {
      const model = createModel({
        provider: 'openai',
        model: 'invalid-model-name-12345',
      });

      await expect(model.invoke([{ role: 'user', content: 'Hello' }])).rejects.toThrow();
    });
  });
});
