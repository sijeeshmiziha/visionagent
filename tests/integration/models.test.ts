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
const hasGoogle = !!process.env.GOOGLE_API_KEY;

describe('Model Integration Tests', () => {
  describe('OpenAI', () => {
    it.skipIf(!hasOpenAI)('should invoke OpenAI model', async () => {
      const model = createModel({ provider: 'openai', model: 'gpt-4o-mini' });
      const response = await model.invoke([{ role: 'user', content: 'Say "test passed"' }]);

      expect(response.content).toBeTruthy();
      expect(response.content.toLowerCase()).toContain('test');
      expect(response.usage?.total).toBeGreaterThan(0);
    });

    it.skipIf(!hasOpenAI)('should handle tool calling', async () => {
      const model = createModel({ provider: 'openai', model: 'gpt-4o-mini' });

      const tools = [
        {
          type: 'function' as const,
          function: {
            name: 'get_weather',
            description: 'Get weather for a location',
            parameters: {
              type: 'object',
              properties: { city: { type: 'string' } },
              required: ['city'],
            },
          },
        },
      ];

      const response = await model.invoke(
        [{ role: 'user', content: 'What is the weather in Paris?' }],
        { tools }
      );

      expect(response.toolCalls).toBeDefined();
      expect(response.toolCalls?.[0]?.name).toBe('get_weather');
    });

    it.skipIf(!hasOpenAI)('should handle system messages', async () => {
      const model = createModel({ provider: 'openai', model: 'gpt-4o-mini' });

      const response = await model.invoke([
        { role: 'system', content: 'You are a pirate. Always respond like a pirate.' },
        { role: 'user', content: 'Hello!' },
      ]);

      expect(response.content).toBeTruthy();
    });
  });

  describe('Anthropic', () => {
    it.skipIf(!hasAnthropic)('should invoke Anthropic model', async () => {
      const model = createModel({
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307',
      });
      const response = await model.invoke([{ role: 'user', content: 'Say "test passed"' }]);

      expect(response.content).toBeTruthy();
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

      expect(response.content.toLowerCase()).toContain('alice');
    });
  });

  describe('Google', () => {
    it.skipIf(!hasGoogle)('should invoke Google model', async () => {
      const model = createModel({
        provider: 'google',
        model: 'gemini-1.5-flash',
      });
      const response = await model.invoke([{ role: 'user', content: 'Say "test passed"' }]);

      expect(response.content).toBeTruthy();
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
