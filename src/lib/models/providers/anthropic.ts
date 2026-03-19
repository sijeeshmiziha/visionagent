/**
 * Anthropic model provider using native @anthropic-ai/sdk
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  Model,
  ModelConfig,
  ModelResponse,
  InvokeOptions,
  VisionOptions,
} from '../../types/model';
import type { ModelMessage, ImageInput } from '../../types/common';
import type { LanguageModelUsage, FinishReason, ModelToolCall } from '../../types/model';
import type { Tool } from '../../types/tool';
import { ModelError } from '../../utils/errors';

function mapStopReason(stopReason: string | null | undefined): FinishReason {
  switch (stopReason) {
    case 'end_turn':
      return 'stop';
    case 'max_tokens':
      return 'length';
    case 'tool_use':
      return 'tool-calls';
    default:
      return stopReason ? 'other' : 'stop';
  }
}

type AnthropicContent =
  | Anthropic.TextBlockParam
  | Anthropic.ImageBlockParam
  | Anthropic.ToolUseBlockParam
  | Anthropic.ToolResultBlockParam;

function toAnthropicMessages(messages: ModelMessage[]): {
  system?: string;
  messages: Anthropic.MessageParam[];
} {
  let system: string | undefined;
  const out: Anthropic.MessageParam[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      system = typeof msg.content === 'string' ? msg.content : '';
      continue;
    }
    if (msg.role === 'user') {
      const content = msg.content;
      const blocks: AnthropicContent[] =
        typeof content === 'string'
          ? [{ type: 'text', text: content }]
          : content.map(part => {
              if (part.type === 'text') return { type: 'text', text: part.text };
              return {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: ((part as { mimeType?: string }).mimeType ?? 'image/png') as
                    | 'image/png'
                    | 'image/jpeg'
                    | 'image/gif'
                    | 'image/webp',
                  data: part.image.replace(/^data:[^;]+;base64,/, ''),
                },
              };
            });
      out.push({ role: 'user', content: blocks });
      continue;
    }
    if (msg.role === 'assistant') {
      const blocks: AnthropicContent[] = msg.content.map(part => {
        if (part.type === 'text') return { type: 'text', text: part.text };
        return {
          type: 'tool_use',
          id: part.toolCallId,
          name: part.toolName,
          input: part.input as Record<string, unknown>,
        };
      });
      out.push({ role: 'assistant', content: blocks });
      continue;
    }
    if (msg.role === 'tool') {
      for (const tr of msg.content) {
        const text = tr.output.type === 'text' ? tr.output.value : tr.output.value;
        out.push({
          role: 'user',
          content: [{ type: 'tool_result', tool_use_id: tr.toolCallId, content: text }],
        });
      }
    }
  }

  return { system, messages: out };
}

function toAnthropicTools(tools: Record<string, Tool>): Anthropic.Tool[] {
  return Object.entries(tools).map(([name, t]) => ({
    name,
    description: t.description,
    input_schema: {
      type: 'object' as const,
      properties: (t.parameters as { properties?: Record<string, unknown> })?.properties ?? {},
      required: (t.parameters as { required?: string[] })?.required ?? [],
    },
  }));
}

/**
 * Create an Anthropic model instance
 */
export function createAnthropicModel(config: ModelConfig): Model {
  const { model: modelName, apiKey } = config;

  const client = new Anthropic({
    apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY,
  });

  return {
    provider: 'anthropic',
    modelName,

    async invoke(messages: ModelMessage[], options?: InvokeOptions): Promise<ModelResponse> {
      try {
        const { system, messages: apiMessages } = toAnthropicMessages(messages);
        const body: Anthropic.MessageCreateParamsNonStreaming = {
          model: modelName,
          max_tokens: options?.maxOutputTokens ?? 4096,
          system: system ?? undefined,
          messages: apiMessages,
          temperature: options?.temperature,
        };
        if (options?.tools && Object.keys(options.tools).length > 0) {
          body.tools = toAnthropicTools(options.tools);
        }

        const response = await client.messages.create(body);

        const textContent = response.content?.filter(
          (c): c is Anthropic.TextBlock => c.type === 'text'
        );
        const text = textContent?.map(c => c.text).join('\n') ?? '';
        const toolUseBlocks =
          response.content?.filter((c): c is Anthropic.ToolUseBlock => c.type === 'tool_use') ?? [];
        const toolCalls: ModelToolCall[] = toolUseBlocks.map(tc => ({
          toolCallId: tc.id,
          toolName: tc.name,
          input: tc.input,
        }));

        const usage: LanguageModelUsage = response.usage
          ? {
              inputTokens: response.usage.input_tokens,
              outputTokens: response.usage.output_tokens,
              totalTokens: (response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0),
            }
          : { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

        return {
          text,
          toolCalls,
          usage,
          finishReason: mapStopReason(response.stop_reason),
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ModelError(
          `Failed to invoke anthropic/${modelName}: ${err.message}`,
          'anthropic',
          err
        );
      }
    },

    async generateVision(
      prompt: string,
      images: ImageInput[],
      options?: VisionOptions
    ): Promise<ModelResponse> {
      try {
        const content: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[] = [];
        for (const img of images) {
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: img.mimeType,
              data: img.base64,
            },
          });
        }
        content.push({ type: 'text', text: prompt });

        const body: Anthropic.MessageCreateParamsNonStreaming = {
          model: modelName,
          max_tokens: options?.maxOutputTokens ?? 4096,
          messages: [{ role: 'user', content }],
          temperature: options?.temperature,
        };
        if (options?.systemPrompt) {
          body.system = options.systemPrompt;
        }

        const response = await client.messages.create(body);
        const textContent = response.content?.filter(
          (c): c is Anthropic.TextBlock => c.type === 'text'
        );
        const text = textContent?.map(c => c.text).join('\n') ?? '';
        const usage: LanguageModelUsage = response.usage
          ? {
              inputTokens: response.usage.input_tokens,
              outputTokens: response.usage.output_tokens,
              totalTokens: (response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0),
            }
          : { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

        return {
          text,
          toolCalls: [],
          usage,
          finishReason: mapStopReason(response.stop_reason),
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ModelError(`Failed to generate vision response`, 'anthropic', err);
      }
    },
  };
}
