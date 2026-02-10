/**
 * Common types shared across modules
 * Re-exports AI SDK message types; keeps VisionAgent-specific ImageInput and Logger
 */

export type { CoreMessage } from 'ai';

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
