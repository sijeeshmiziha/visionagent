/**
 * Model-related types
 * Canonical types for model invocation and responses (no AI SDK dependency)
 */

import type { ImageInput, ModelMessage } from './common';
import type { AnyTool } from './tool';

export type { ModelMessage } from './common';

/**
 * Token usage returned by model invocations
 */
export interface LanguageModelUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  inputTokenDetails?: {
    noCacheTokens?: number;
    cacheReadTokens?: number;
    cacheWriteTokens?: number;
  };
  outputTokenDetails?: {
    textTokens?: number;
    reasoningTokens?: number;
  };
}

/**
 * Finish reason from model
 */
export type FinishReason = 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other';

/**
 * Tool type for model invocation (VisionAgent Tool, any shape)
 */
export type ModelTool = AnyTool;

/**
 * Built-in model providers
 */
export type BuiltinProvider = 'openai' | 'anthropic' | 'google';

/**
 * Supported model providers — open for extension via registerProvider()
 */
export type ModelProvider = BuiltinProvider | (string & {});

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
 * Tool call shape returned by the model
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
 * Response from a model invocation
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
   * Invoke the model with messages
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
