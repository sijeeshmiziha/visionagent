/**
 * OpenAI model provider using native openai SDK
 */

import OpenAI from 'openai';
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

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

function mapFinishReason(reason: string | null): FinishReason {
  if (
    reason === 'stop' ||
    reason === 'length' ||
    reason === 'content_filter' ||
    reason === 'tool_calls'
  )
    return reason as FinishReason;
  if (reason === 'error') return 'error';
  return 'other';
}

function toOpenAIMessages(messages: ModelMessage[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  for (const msg of messages) {
    if (msg.role === 'system') {
      out.push({ role: 'system', content: msg.content });
      continue;
    }
    if (msg.role === 'user') {
      const content = msg.content;
      if (typeof content === 'string') {
        out.push({ role: 'user', content });
      } else {
        const parts: OpenAI.Chat.ChatCompletionContentPart[] = content.map(part => {
          if (part.type === 'text') return { type: 'text', text: part.text };
          return {
            type: 'image_url',
            image_url: {
              url: part.image.startsWith('data:')
                ? part.image
                : `data:${part.mimeType ?? 'image/png'};base64,${part.image}`,
            },
          };
        });
        out.push({ role: 'user', content: parts });
      }
      continue;
    }
    if (msg.role === 'assistant') {
      const parts = msg.content;
      const textParts = parts.filter((p): p is { type: 'text'; text: string } => p.type === 'text');
      const toolCallParts = parts.filter(
        (p): p is { type: 'tool-call'; toolCallId: string; toolName: string; input: unknown } =>
          p.type === 'tool-call'
      );
      const content = textParts.length > 0 ? textParts.map(p => p.text).join('\n') : null;
      const openaiToolCalls =
        toolCallParts.length > 0
          ? toolCallParts.map(tc => ({
              id: tc.toolCallId,
              type: 'function' as const,
              function: {
                name: tc.toolName,
                arguments: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input ?? {}),
              },
            }))
          : undefined;
      out.push({ role: 'assistant', content, tool_calls: openaiToolCalls });
      continue;
    }
    if (msg.role === 'tool') {
      for (const tr of msg.content) {
        const value = tr.output.type === 'text' ? tr.output.value : tr.output.value;
        out.push({ role: 'tool', content: value, tool_call_id: tr.toolCallId });
      }
    }
  }
  return out;
}

function toOpenAITools(tools: Record<string, Tool>): OpenAI.Chat.ChatCompletionTool[] {
  return Object.entries(tools).map(([name, t]) => ({
    type: 'function' as const,
    function: {
      name,
      description: t.description,
      parameters: t.parameters ?? { type: 'object', properties: {} },
    },
  }));
}

/**
 * Create an OpenAI model instance
 */
export function createOpenAIModel(config: ModelConfig): Model {
  const { model: modelName, apiKey, baseUrl } = config;

  const client = new OpenAI({
    apiKey: apiKey ?? process.env.OPENAI_API_KEY,
    baseURL: baseUrl,
  });

  return {
    provider: 'openai',
    modelName,

    async invoke(messages: ModelMessage[], options?: InvokeOptions): Promise<ModelResponse> {
      try {
        const body: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
          model: modelName,
          messages: toOpenAIMessages(messages),
          max_tokens: options?.maxOutputTokens,
          temperature: options?.temperature,
          stop: options?.stop?.length ? options.stop : undefined,
        };
        if (options?.tools && Object.keys(options.tools).length > 0) {
          body.tools = toOpenAITools(options.tools);
        }

        const completion = await client.chat.completions.create(body);

        const choice = completion.choices?.[0];
        const msg = choice?.message;
        const content = msg?.content ?? '';
        const rawToolCalls = msg?.tool_calls ?? [];
        const toolCalls: ModelToolCall[] = rawToolCalls.map(
          (tc: { id: string; function?: { name?: string; arguments?: string } }) => {
            const argsStr = tc.function?.arguments ?? '{}';
            let input: unknown;
            try {
              input = JSON.parse(argsStr);
            } catch {
              input = argsStr;
            }
            return { toolCallId: tc.id, toolName: tc.function?.name ?? '', input };
          }
        );

        const usage: LanguageModelUsage = completion.usage
          ? {
              inputTokens: completion.usage.prompt_tokens,
              outputTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

        return {
          text: typeof content === 'string' ? content : '',
          toolCalls,
          usage,
          finishReason: mapFinishReason(choice?.finish_reason ?? 'stop'),
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ModelError(`Failed to invoke openai/${modelName}: ${err.message}`, 'openai', err);
      }
    },

    async generateVision(
      prompt: string,
      images: ImageInput[],
      options?: VisionOptions
    ): Promise<ModelResponse> {
      try {
        const content: OpenAI.Chat.ChatCompletionContentPart[] = [];
        for (const img of images) {
          content.push({
            type: 'image_url',
            image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
          });
        }
        content.push({ type: 'text', text: prompt });

        const messages: ChatMessage[] = [];
        if (options?.systemPrompt) {
          messages.push({ role: 'system', content: options.systemPrompt });
        }
        messages.push({ role: 'user', content });

        const completion = await client.chat.completions.create({
          model: modelName,
          messages,
          max_tokens: options?.maxOutputTokens,
          temperature: options?.temperature,
        });

        const choice = completion.choices?.[0];
        const text = typeof choice?.message?.content === 'string' ? choice.message.content : '';
        const usage: LanguageModelUsage = completion.usage
          ? {
              inputTokens: completion.usage.prompt_tokens,
              outputTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

        return {
          text,
          toolCalls: [],
          usage,
          finishReason: mapFinishReason(choice?.finish_reason ?? 'stop'),
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ModelError(`Failed to generate vision response`, 'openai', err);
      }
    },
  };
}
