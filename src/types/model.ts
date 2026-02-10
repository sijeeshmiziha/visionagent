/**
 * Model-related types
 * Uses AI SDK types for messages, tools, usage, and result shape
 */

import type { Tool, ModelMessage, FinishReason, LanguageModelUsage } from 'ai';
import type { ImageInput } from './common';

export type { LanguageModelUsage, FinishReason } from 'ai';

/**
 * Tool type for model invocation
 * Uses the default Tool type which accepts any input/output schema
 */
export type ModelTool = Tool;

/**
 * Supported model providers
 */
export type ModelProvider = 'openai' | 'anthropic' | 'google';

/**
 * Configuration for creating a model
 */
export interface ModelConfig {
  /** The provider to use */
  provider: ModelProvider;
  /** The model name/ID */
  model: string;
  /** API key (optional, uses environment variable by default) */
  apiKey?: string;
  /** Temperature for generation (0-1) */
  temperature?: number;
  /** Maximum output tokens to generate */
  maxOutputTokens?: number;
  /** Base URL for the API (optional) */
  baseUrl?: string;
}

/**
 * Tool call shape returned by the model (AI SDK compatible)
 */
export interface ModelToolCall {
  toolCallId: string;
  toolName: string;
  input: unknown;
}

/**
 * Options for model invocation
 */
export interface InvokeOptions {
  /** Tools the model can call */
  tools?: Record<string, ModelTool>;
  /** Maximum output tokens to generate */
  maxOutputTokens?: number;
  /** Temperature for generation */
  temperature?: number;
  /** Stop sequences */
  stop?: string[];
}

/**
 * Options for vision generation
 */
export interface VisionOptions extends InvokeOptions {
  /** System prompt */
  systemPrompt?: string;
  /** Detail level for image analysis */
  detail?: 'low' | 'high' | 'auto';
}

/**
 * Response from a model invocation (AI SDK GenerateTextResult subset)
 */
export interface ModelResponse {
  /** The generated text */
  text: string;
  /** Tool calls if any were made */
  toolCalls: ModelToolCall[];
  /** Token usage */
  usage: LanguageModelUsage;
  /** The finish reason */
  finishReason: FinishReason;
}

/**
 * A model instance that can generate responses
 */
export interface Model {
  /** The provider of this model */
  provider: ModelProvider;
  /** The model name */
  modelName: string;

  /**
   * Invoke the model with messages (AI SDK ModelMessage[])
   */
  invoke(messages: ModelMessage[], options?: InvokeOptions): Promise<ModelResponse>;

  /**
   * Generate a response with vision (images)
   */
  generateVision(
    prompt: string,
    images: ImageInput[],
    options?: VisionOptions
  ): Promise<ModelResponse>;
}
