/**
 * Model-related types
 */

import type { Message, ImageInput, TokenUsage, ToolCall } from './common';
import type { ToolDefinition } from './tool';

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
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Base URL for the API (optional) */
  baseUrl?: string;
}

/**
 * Options for model invocation
 */
export interface InvokeOptions {
  /** Tool definitions for function calling */
  tools?: ToolDefinition[];
  /** Maximum tokens to generate */
  maxTokens?: number;
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
  /** The generated content */
  content: string;
  /** Tool calls if any were made */
  toolCalls?: ToolCall[];
  /** Token usage statistics */
  usage?: TokenUsage;
  /** The finish reason */
  finishReason?: 'stop' | 'tool_calls' | 'length' | 'content_filter';
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
  invoke(messages: Message[], options?: InvokeOptions): Promise<ModelResponse>;

  /**
   * Generate a response with vision (images)
   */
  generateVision(
    prompt: string,
    images: ImageInput[],
    options?: VisionOptions
  ): Promise<ModelResponse>;
}
