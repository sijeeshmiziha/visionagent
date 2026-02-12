/**
 * Custom error classes for the library
 */

/**
 * Base error class for all library errors
 */
export class LibraryError extends Error {
  constructor(message: string, cause?: Error) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'LibraryError';
    if (cause?.stack) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

/**
 * Error thrown when model operations fail
 */
export class ModelError extends LibraryError {
  constructor(
    message: string,
    public readonly provider?: string,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'ModelError';
  }
}

/**
 * Error thrown when tool execution fails
 */
export class ToolError extends LibraryError {
  constructor(
    message: string,
    public readonly toolName?: string,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'ToolError';
  }
}

/**
 * Error thrown when tool input validation fails
 */
export class ValidationError extends LibraryError {
  constructor(
    message: string,
    public readonly errors?: unknown[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when agent execution fails
 */
export class AgentError extends LibraryError {
  constructor(
    message: string,
    public readonly iteration?: number,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'AgentError';
  }
}

/**
 * Error thrown when subagent execution fails
 */
export class SubagentError extends LibraryError {
  constructor(
    message: string,
    public readonly subagentName?: string,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'SubagentError';
  }
}
