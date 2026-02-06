/**
 * OpenAI model provider using LangChain
 */

import type {
  Model,
  ModelConfig,
  ModelResponse,
  InvokeOptions,
  VisionOptions,
} from '../../types/model';
import type { Message, ImageInput, ToolCall } from '../../types/common';
import { ModelError } from '../../core/errors';

/**
 * Create an OpenAI model instance
 */
export function createOpenAIModel(config: ModelConfig): Model {
  const { model: modelName, apiKey, temperature = 0.7, maxTokens, baseUrl } = config;

  // Lazy load to avoid requiring the package if not used
  let chatModel: unknown = null;

  async function getModel() {
    if (chatModel) return chatModel;

    try {
      const { ChatOpenAI } = await import('@langchain/openai');
      chatModel = new ChatOpenAI({
        modelName,
        temperature,
        maxTokens,
        openAIApiKey: apiKey,
        configuration: baseUrl ? { baseURL: baseUrl } : undefined,
      });
      return chatModel;
    } catch (error) {
      throw new ModelError(
        'Failed to load @langchain/openai. Please install it: npm install @langchain/openai',
        'openai',
        error as Error
      );
    }
  }

  function convertMessages(messages: Message[]): unknown[] {
    return messages.map(msg => {
      switch (msg.role) {
        case 'system':
          return ['system', msg.content];
        case 'user':
          return ['human', msg.content];
        case 'assistant':
          // If the assistant message has tool calls, we need to include them
          if (msg.toolCalls?.length) {
            return {
              type: 'ai',
              content: msg.content,
              tool_calls: msg.toolCalls.map(tc => ({
                id: tc.id,
                name: tc.name,
                args: tc.args,
              })),
            };
          }
          return ['ai', msg.content];
        case 'tool':
          return {
            type: 'tool',
            content: msg.content,
            tool_call_id: msg.toolCallId,
          };
        default:
          return ['human', msg.content];
      }
    });
  }

  function convertToolCalls(response: unknown): ToolCall[] | undefined {
    const aiMessage = response as { tool_calls?: { id: string; name: string; args: unknown }[] };
    if (!aiMessage.tool_calls?.length) return undefined;

    return aiMessage.tool_calls.map(tc => ({
      id: tc.id,
      name: tc.name,
      args: tc.args as Record<string, unknown>,
    }));
  }

  return {
    provider: 'openai',
    modelName,

    async invoke(messages: Message[], options?: InvokeOptions): Promise<ModelResponse> {
      const model = await getModel();
      const langchainModel = model as {
        invoke: (messages: unknown[], options?: unknown) => Promise<unknown>;
        bindTools?: (tools: unknown[]) => unknown;
      };

      try {
        let boundModel = langchainModel;

        // Bind tools if provided
        if (options?.tools?.length && langchainModel.bindTools) {
          const toolDefs = options.tools.map(t => ({
            type: 'function' as const,
            function: {
              name: t.function.name,
              description: t.function.description,
              parameters: t.function.parameters,
            },
          }));
          boundModel = langchainModel.bindTools(toolDefs) as typeof langchainModel;
        }

        const response = await boundModel.invoke(convertMessages(messages));
        const aiResponse = response as {
          content: string;
          usage_metadata?: { input_tokens: number; output_tokens: number; total_tokens: number };
          response_metadata?: { finish_reason: string };
        };

        return {
          content: typeof aiResponse.content === 'string' ? aiResponse.content : '',
          toolCalls: convertToolCalls(response),
          usage: aiResponse.usage_metadata
            ? {
                input: aiResponse.usage_metadata.input_tokens,
                output: aiResponse.usage_metadata.output_tokens,
                total: aiResponse.usage_metadata.total_tokens,
              }
            : undefined,
          finishReason: aiResponse.response_metadata
            ?.finish_reason as ModelResponse['finishReason'],
        };
      } catch (error) {
        throw new ModelError('Failed to invoke OpenAI model', 'openai', error as Error);
      }
    },

    async generateVision(
      prompt: string,
      images: ImageInput[],
      options?: VisionOptions
    ): Promise<ModelResponse> {
      const model = await getModel();
      const langchainModel = model as {
        invoke: (messages: unknown[]) => Promise<unknown>;
      };

      try {
        // Build content array with images
        const content: unknown[] = [];

        // Add images first
        for (const image of images) {
          content.push({
            type: 'image_url',
            image_url: {
              url: `data:${image.mimeType};base64,${image.base64}`,
              detail: options?.detail ?? 'auto',
            },
          });
        }

        // Add text prompt
        content.push({
          type: 'text',
          text: prompt,
        });

        const messages: unknown[] = [];

        // Add system message if provided
        if (options?.systemPrompt) {
          messages.push(['system', options.systemPrompt]);
        }

        // Add user message with images
        messages.push(['human', content]);

        const response = await langchainModel.invoke(messages);
        const aiResponse = response as {
          content: string;
          usage_metadata?: { input_tokens: number; output_tokens: number; total_tokens: number };
        };

        return {
          content: typeof aiResponse.content === 'string' ? aiResponse.content : '',
          usage: aiResponse.usage_metadata
            ? {
                input: aiResponse.usage_metadata.input_tokens,
                output: aiResponse.usage_metadata.output_tokens,
                total: aiResponse.usage_metadata.total_tokens,
              }
            : undefined,
        };
      } catch (error) {
        throw new ModelError('Failed to generate vision response', 'openai', error as Error);
      }
    },
  };
}
