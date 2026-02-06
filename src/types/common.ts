/**
 * Common types shared across modules
 */

/**
 * Message role in a conversation
 */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * A message in a conversation
 */
export interface Message {
  role: MessageRole;
  content: string;
  /** For tool messages, the ID of the tool call this responds to */
  toolCallId?: string;
  /** Tool calls requested by the assistant */
  toolCalls?: ToolCall[];
}

/**
 * A tool call from the model
 */
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

/**
 * Result of executing a tool
 */
export interface ToolResult {
  callId: string;
  result: unknown;
  error?: string;
}

/**
 * Image input for vision models
 */
export interface ImageInput {
  /** Base64-encoded image data */
  base64: string;
  /** MIME type of the image */
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';
  /** Optional path to the source file */
  path?: string;
}

/**
 * Logger interface for pluggable logging
 */
export interface Logger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, error?: Error | Record<string, unknown>): void;
}

/**
 * Token usage statistics
 */
export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}
