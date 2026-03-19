/**
 * Common types shared across modules
 * Canonical message and content types (no AI SDK dependency)
 */

/** Text content part */
export interface TextContentPart {
  type: 'text';
  text: string;
}

/** Image content part for user messages */
export interface ImageContentPart {
  type: 'image';
  image: string;
  mimeType?: string;
}

/** Tool call part in assistant messages */
export interface ToolCallContentPart {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  input: unknown;
}

/** Tool result output value (text or error) */
export type ToolResultOutput =
  | { type: 'text'; value: string }
  | { type: 'error-text'; value: string };

/** Tool result part in tool messages */
export interface ToolResultContentPart {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  output: ToolResultOutput;
}

/** User message content: string or array of text/image parts */
export type UserContent = string | (TextContentPart | ImageContentPart)[];

/** Assistant message content: array of text and/or tool-call parts */
export type AssistantContent = (TextContentPart | ToolCallContentPart)[];

/** Tool message content: array of tool-result parts */
export type ToolContent = ToolResultContentPart[];

/** Canonical model message (provider-agnostic) */
export type ModelMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: UserContent }
  | { role: 'assistant'; content: AssistantContent }
  | { role: 'tool'; content: ToolContent };

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
