/**
 * Tests for createGoogleModel (native @google/genai)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ModelMessage } from '../../../src/lib/types/common';
import type { Tool } from '../../../src/lib/types/tool';

const { mockGenerateContent } = vi.hoisted(() => ({ mockGenerateContent: vi.fn() }));

vi.mock('@google/genai', () => {
  class MockGoogleGenAI {
    models = { generateContent: mockGenerateContent };
  }
  return {
    GoogleGenAI: MockGoogleGenAI,
    Type: {
      STRING: 'STRING',
      OBJECT: 'OBJECT',
      NUMBER: 'NUMBER',
      INTEGER: 'INTEGER',
      BOOLEAN: 'BOOLEAN',
      ARRAY: 'ARRAY',
      NULL: 'NULL',
    },
  };
});

import { createGoogleModel } from '../../../src/lib/models/providers/google';

const mockUsageMetadata = {
  promptTokenCount: 10,
  candidatesTokenCount: 5,
  totalTokenCount: 15,
};

describe('createGoogleModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateContent.mockResolvedValue({
      candidates: [
        {
          content: { parts: [{ text: 'Mocked Gemini response' }] },
          finishReason: 'STOP',
        },
      ],
      usageMetadata: mockUsageMetadata,
    });
  });

  it('should set provider to google and modelName', () => {
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    expect(model.provider).toBe('google');
    expect(model.modelName).toBe('gemini-2.0-flash');
  });

  it('should call generateContent with contents on invoke', async () => {
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    const messages: ModelMessage[] = [{ role: 'user', content: 'Hello' }];
    const response = await model.invoke(messages);
    expect(mockGenerateContent).toHaveBeenCalledOnce();
    expect(response.text).toBe('Mocked Gemini response');
    expect(response.finishReason).toBe('stop');
  });

  it('should pass tools to generateContent when provided', async () => {
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    const tools = {
      my_tool: {
        description: 'A tool',
        parameters: { type: 'object', properties: {} },
        execute: async () => ({}),
      } as unknown as Tool,
    };
    await model.invoke([{ role: 'user', content: 'Hi' }], { tools });
    const call = mockGenerateContent.mock.calls[0]![0];
    expect(call.config?.tools).toBeDefined();
    expect(call.config.tools[0].functionDeclarations).toHaveLength(1);
    expect(call.config.tools[0].functionDeclarations[0]).toMatchObject({
      name: 'my_tool',
      description: 'A tool',
    });
  });

  it('should map functionCall to toolCalls in the response', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      candidates: [
        {
          content: {
            parts: [{ functionCall: { name: 'lookup', args: { id: 42 } } }],
          },
          finishReason: 'STOP',
        },
      ],
      usageMetadata: mockUsageMetadata,
    });
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    const response = await model.invoke([{ role: 'user', content: 'Lookup' }]);
    expect(response.toolCalls).toHaveLength(1);
    expect(response.toolCalls?.[0]?.toolName).toBe('lookup');
    expect(response.toolCalls?.[0]?.input).toEqual({ id: 42 });
  });

  it('should wrap errors in ModelError with provider google', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Quota exceeded'));
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    await expect(model.invoke([{ role: 'user', content: 'Hi' }])).rejects.toMatchObject({
      name: 'ModelError',
      provider: 'google',
      message: expect.stringContaining('Failed to invoke google/'),
    });
  });

  it('should build correct image content in generateVision', async () => {
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    await model.generateVision('Describe', [{ base64: 'YWJj', mimeType: 'image/jpeg' }]);
    const call = mockGenerateContent.mock.calls[0]![0];
    const contents = call.contents as { role: string; parts: unknown[] }[];
    const userContent = contents.find((c: { role: string }) => c.role === 'user');
    expect(userContent?.parts).toEqual(
      expect.arrayContaining([
        { inlineData: { mimeType: 'image/jpeg', data: 'YWJj' } },
        { text: 'Describe' },
      ])
    );
  });

  it('should prepend system prompt in generateVision when provided', async () => {
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    await model.generateVision('What?', [{ base64: 'x', mimeType: 'image/png' }], {
      systemPrompt: 'You are a vision expert.',
    });
    const call = mockGenerateContent.mock.calls[0]![0];
    const contents = call.contents as { role: string; parts: unknown[] }[];
    expect(contents[0]).toMatchObject({
      role: 'user',
      parts: [{ text: 'You are a vision expert.' }],
    });
  });

  it('should wrap generateVision errors in ModelError', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Vision error'));
    const model = createGoogleModel({ provider: 'google', model: 'gemini-2.0-flash' });
    await expect(
      model.generateVision('Describe', [{ base64: 'x', mimeType: 'image/png' }])
    ).rejects.toMatchObject({
      name: 'ModelError',
      provider: 'google',
      message: expect.stringContaining('Failed to generate vision response'),
    });
  });
});
