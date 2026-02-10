/**
 * Shared AI SDK adapter - pass-through to generateText (no conversions)
 */

import { generateText } from 'ai';
import type { LanguageModelV3 } from '@ai-sdk/provider';
import type {
  Model,
  ModelResponse,
  InvokeOptions,
  VisionOptions,
  ModelProvider,
  ModelToolCall,
} from '../../types/model';
import type { ModelMessage, ImageInput } from '../../types/common';
import { ModelError } from '../../utils/errors';

export interface CreateAIModelParams {
  provider: ModelProvider;
  modelName: string;
  getModel: () => LanguageModelV3 | Promise<LanguageModelV3>;
}

/**
 * Create a VisionAgent Model that uses an AI SDK LanguageModel.
 * Messages and tools are passed through to generateText; result returned as ModelResponse.
 */
export function createAIModel(params: CreateAIModelParams): Model {
  const { provider, modelName, getModel } = params;

  return {
    provider,
    modelName,

    async invoke(messages: ModelMessage[], options?: InvokeOptions): Promise<ModelResponse> {
      try {
        const model = await getModel();
        const result = await generateText({
          model,
          messages,
          tools: options?.tools,
          maxOutputTokens: options?.maxOutputTokens,
          temperature: options?.temperature,
          stopSequences: options?.stop,
        });

        const toolCalls: ModelToolCall[] = result.toolCalls.map(tc => ({
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          input: tc.input as unknown,
        }));

        return {
          text: result.text,
          toolCalls,
          usage: result.usage,
          finishReason: result.finishReason,
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ModelError(`Failed to invoke ${provider} model`, provider, err);
      }
    },

    async generateVision(
      prompt: string,
      images: ImageInput[],
      options?: VisionOptions
    ): Promise<ModelResponse> {
      try {
        const model = await getModel();

        const content: (
          | { type: 'text'; text: string }
          | { type: 'image'; image: string; mimeType?: string }
        )[] = [];
        for (const img of images) {
          content.push({
            type: 'image',
            image: `data:${img.mimeType};base64,${img.base64}`,
            mimeType: img.mimeType,
          });
        }
        content.push({ type: 'text', text: prompt });

        const messages: ModelMessage[] = [];
        if (options?.systemPrompt) {
          messages.push({ role: 'system', content: options.systemPrompt });
        }
        messages.push({ role: 'user', content });

        const result = await generateText({
          model,
          messages,
          maxOutputTokens: options?.maxOutputTokens,
          temperature: options?.temperature,
        });

        return {
          text: result.text,
          toolCalls: [],
          usage: result.usage,
          finishReason: result.finishReason,
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ModelError(`Failed to generate vision response`, provider, err);
      }
    },
  };
}
