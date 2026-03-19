/**
 * Google (Gemini) model provider using native @google/genai SDK
 */

import {
  GoogleGenAI,
  Type,
  type Content,
  type Part,
  type FunctionDeclaration,
  type Schema,
} from '@google/genai';
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

function mapFinishReason(reason: string | undefined): FinishReason {
  switch (reason) {
    case 'STOP':
      return 'stop';
    case 'MAX_TOKENS':
      return 'length';
    case 'SAFETY':
    case 'RECITATION':
      return 'content-filter';
    default:
      return reason ? 'other' : 'stop';
  }
}

const JSON_TYPE_TO_GEMINI: Record<string, Type> = {
  string: Type.STRING,
  number: Type.NUMBER,
  integer: Type.INTEGER,
  boolean: Type.BOOLEAN,
  array: Type.ARRAY,
  object: Type.OBJECT,
  null: Type.NULL,
};

function jsonSchemaToGeminiParameters(params: Record<string, unknown>): Schema {
  const jsonType = ((params.type as string) ?? 'object').toLowerCase();
  const type = JSON_TYPE_TO_GEMINI[jsonType] ?? Type.OBJECT;
  const properties = (params.properties as Record<string, unknown>) ?? {};
  const required = (params.required as string[]) ?? [];
  const schema: Schema = {
    type,
    description: params.description as string | undefined,
    properties: Object.fromEntries(
      Object.entries(properties).map(([k, v]) => [
        k,
        jsonSchemaProperty(v as Record<string, unknown>),
      ])
    ),
    required: required.length ? required : undefined,
  };
  return schema;
}

function jsonSchemaProperty(p: Record<string, unknown>): Schema {
  const jsonType = ((p.type as string) ?? 'string').toLowerCase();
  const type = JSON_TYPE_TO_GEMINI[jsonType] ?? Type.STRING;
  const out: Schema = { type, description: p.description as string | undefined };
  if (type === Type.OBJECT && p.properties) {
    out.properties = Object.fromEntries(
      Object.entries(p.properties as Record<string, unknown>).map(([k, v]) => [
        k,
        jsonSchemaProperty(v as Record<string, unknown>),
      ])
    );
  }
  return out;
}

function toGeminiContents(messages: ModelMessage[]): Content[] {
  const contents: Content[] = [];
  let currentRole: 'user' | 'model' = 'user';
  let currentParts: Part[] = [];

  const flush = (role: 'user' | 'model') => {
    if (currentParts.length > 0) {
      contents.push({ role: currentRole, parts: currentParts });
      currentParts = [];
    }
    currentRole = role;
  };

  for (const msg of messages) {
    if (msg.role === 'system') {
      flush('user');
      const text = typeof msg.content === 'string' ? msg.content : '';
      currentParts.push({ text: `System: ${text}` });
      continue;
    }
    if (msg.role === 'user') {
      flush('user');
      const content = msg.content;
      if (typeof content === 'string') {
        currentParts.push({ text: content });
      } else {
        for (const part of content) {
          if (part.type === 'text') currentParts.push({ text: part.text });
          else {
            currentParts.push({
              inlineData: {
                mimeType: (part as { mimeType?: string }).mimeType ?? 'image/png',
                data: (part as { image: string }).image.replace(/^data:[^;]+;base64,/, ''),
              },
            });
          }
        }
      }
      continue;
    }
    if (msg.role === 'assistant') {
      flush('model');
      for (const part of msg.content) {
        if (part.type === 'text') currentParts.push({ text: part.text });
        else
          currentParts.push({
            functionCall: {
              name: part.toolName,
              args:
                part.input && typeof part.input === 'object' && !Array.isArray(part.input)
                  ? (part.input as Record<string, unknown>)
                  : {},
            },
          });
      }
      continue;
    }
    if (msg.role === 'tool') {
      for (const tr of msg.content) {
        flush('user');
        const value = tr.output.type === 'text' ? tr.output.value : tr.output.value;
        currentParts.push({
          functionResponse: {
            name: tr.toolName,
            response: {
              output: typeof value === 'string' ? value : JSON.stringify(value),
            } as Record<string, unknown>,
          },
        });
      }
    }
  }
  if (currentParts.length > 0) contents.push({ role: currentRole, parts: currentParts });

  return contents;
}

function toGeminiTools(tools: Record<string, Tool>): FunctionDeclaration[] {
  return Object.entries(tools).map(([name, t]) => {
    const params = (t.parameters ?? { type: 'object', properties: {} }) as Record<string, unknown>;
    const schema = jsonSchemaToGeminiParameters(params);
    return {
      name,
      description: t.description,
      parameters: schema,
    };
  });
}

/**
 * Create a Google (Gemini) model instance
 */
export function createGoogleModel(config: ModelConfig): Model {
  const { model: modelName, apiKey } = config;

  const client = new GoogleGenAI({ apiKey: apiKey ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY });

  return {
    provider: 'google',
    modelName,

    async invoke(messages: ModelMessage[], options?: InvokeOptions): Promise<ModelResponse> {
      try {
        const contents = toGeminiContents(messages);
        const request = {
          model: `models/${modelName}`,
          contents,
          config: {
            maxOutputTokens: options?.maxOutputTokens,
            temperature: options?.temperature,
            ...(options?.tools && Object.keys(options.tools).length > 0
              ? { tools: [{ functionDeclarations: toGeminiTools(options.tools) }] }
              : {}),
          },
        };

        const response = await client.models.generateContent(request);

        const candidate = response.candidates?.[0];
        const content = candidate?.content;
        const parts = content?.parts ?? [];
        let text = '';
        const toolCalls: ModelToolCall[] = [];
        for (const part of parts) {
          if ('text' in part && part.text) text += part.text;
          if ('functionCall' in part && part.functionCall) {
            toolCalls.push({
              toolCallId:
                (part.functionCall as { name: string }).name +
                '_' +
                Math.random().toString(36).slice(2),
              toolName: (part.functionCall as { name: string }).name,
              input: (part.functionCall as { args?: unknown }).args ?? {},
            });
          }
        }

        const usageMetadata = response.usageMetadata;
        const usage: LanguageModelUsage = usageMetadata
          ? {
              inputTokens: usageMetadata.promptTokenCount,
              outputTokens: usageMetadata.candidatesTokenCount,
              totalTokens: usageMetadata.totalTokenCount,
            }
          : { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

        return {
          text,
          toolCalls,
          usage,
          finishReason: mapFinishReason(candidate?.finishReason),
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ModelError(`Failed to invoke google/${modelName}: ${err.message}`, 'google', err);
      }
    },

    async generateVision(
      prompt: string,
      images: ImageInput[],
      options?: VisionOptions
    ): Promise<ModelResponse> {
      try {
        const parts: Part[] = [];
        for (const img of images) {
          parts.push({
            inlineData: { mimeType: img.mimeType, data: img.base64 },
          });
        }
        parts.push({ text: prompt });

        const contents: Content[] = [];
        if (options?.systemPrompt) {
          contents.push({ role: 'user', parts: [{ text: options.systemPrompt }] });
        }
        contents.push({ role: 'user', parts });

        const response = await client.models.generateContent({
          model: `models/${modelName}`,
          contents,
          config: {
            maxOutputTokens: options?.maxOutputTokens,
            temperature: options?.temperature,
          },
        });

        const candidate = response.candidates?.[0];
        const textParts =
          candidate?.content?.parts?.filter(
            (p): p is { text: string } => 'text' in p && !!p.text
          ) ?? [];
        const text = textParts.map(p => p.text).join('');
        const usageMetadata = response.usageMetadata;
        const usage: LanguageModelUsage = usageMetadata
          ? {
              inputTokens: usageMetadata.promptTokenCount,
              outputTokens: usageMetadata.candidatesTokenCount,
              totalTokens: usageMetadata.totalTokenCount,
            }
          : { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

        return {
          text,
          toolCalls: [],
          usage,
          finishReason: mapFinishReason(candidate?.finishReason),
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ModelError(`Failed to generate vision response`, 'google', err);
      }
    },
  };
}
