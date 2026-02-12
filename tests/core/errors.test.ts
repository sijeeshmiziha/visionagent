/**
 * Tests for custom error classes
 */

import { describe, it, expect } from 'vitest';
import {
  LibraryError,
  ModelError,
  ToolError,
  ValidationError,
  AgentError,
} from '../../src/lib/utils/errors';

describe('errors', () => {
  describe('LibraryError', () => {
    it('should create error with message', () => {
      const error = new LibraryError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('LibraryError');
    });

    it('should include cause', () => {
      const cause = new Error('Original error');
      const error = new LibraryError('Wrapped error', cause);
      expect(error.cause).toBe(cause);
    });

    it('should be instanceof Error and LibraryError', () => {
      const error = new LibraryError('Test');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(LibraryError);
    });

    it('should chain stack trace when cause is provided', () => {
      const cause = new Error('Original');
      const error = new LibraryError('Wrapped', cause);
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Wrapped');
      expect(error.stack).toContain('Caused by:');
      expect(error.stack).toContain('Original');
    });

    it('should allow undefined cause', () => {
      const error = new LibraryError('No cause');
      expect(error.cause).toBeUndefined();
    });
  });

  describe('ModelError', () => {
    it('should include provider', () => {
      const error = new ModelError('Model failed', 'openai');
      expect(error.provider).toBe('openai');
      expect(error.name).toBe('ModelError');
    });

    it('should be instanceof Error, LibraryError, and ModelError', () => {
      const error = new ModelError('Fail', 'openai');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(LibraryError);
      expect(error).toBeInstanceOf(ModelError);
    });

    it('should include cause when provided', () => {
      const cause = new Error('API timeout');
      const error = new ModelError('Model failed', 'openai', cause);
      expect(error.cause).toBe(cause);
      expect(error.provider).toBe('openai');
    });

    it('should allow undefined provider', () => {
      const error = new ModelError('Generic model error');
      expect(error.provider).toBeUndefined();
      expect(error.name).toBe('ModelError');
    });
  });

  describe('ToolError', () => {
    it('should include tool name', () => {
      const error = new ToolError('Tool failed', 'search');
      expect(error.toolName).toBe('search');
      expect(error.name).toBe('ToolError');
    });

    it('should be instanceof Error, LibraryError, and ToolError', () => {
      const error = new ToolError('Fail', 'my_tool');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(LibraryError);
      expect(error).toBeInstanceOf(ToolError);
    });

    it('should include cause when provided', () => {
      const cause = new Error('Network error');
      const error = new ToolError('Tool failed', 'fetch', cause);
      expect(error.cause).toBe(cause);
      expect(error.toolName).toBe('fetch');
    });

    it('should allow undefined tool name', () => {
      const error = new ToolError('Generic tool error');
      expect(error.toolName).toBeUndefined();
      expect(error.name).toBe('ToolError');
    });
  });

  describe('ValidationError', () => {
    it('should include validation errors', () => {
      const errors = [{ path: 'name', message: 'required' }];
      const error = new ValidationError('Validation failed', errors);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe('ValidationError');
    });

    it('should be instanceof Error, LibraryError, and ValidationError', () => {
      const error = new ValidationError('Invalid');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(LibraryError);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should allow undefined errors array', () => {
      const error = new ValidationError('Validation failed');
      expect(error.errors).toBeUndefined();
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('AgentError', () => {
    it('should include iteration', () => {
      const error = new AgentError('Agent failed', 5);
      expect(error.iteration).toBe(5);
      expect(error.name).toBe('AgentError');
    });

    it('should be instanceof Error, LibraryError, and AgentError', () => {
      const error = new AgentError('Fail', 3);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(LibraryError);
      expect(error).toBeInstanceOf(AgentError);
    });

    it('should include cause when provided', () => {
      const cause = new Error('Max iterations');
      const error = new AgentError('Agent failed', 10, cause);
      expect(error.cause).toBe(cause);
      expect(error.iteration).toBe(10);
    });

    it('should allow undefined iteration', () => {
      const error = new AgentError('Agent failed');
      expect(error.iteration).toBeUndefined();
      expect(error.name).toBe('AgentError');
    });
  });

  describe('serialization', () => {
    it('should not throw when JSON.stringify is used (no circular refs)', () => {
      const cause = new Error('Inner');
      const error = new ModelError('Outer', 'openai', cause);
      expect(() => JSON.stringify(error)).not.toThrow();
      const str = JSON.stringify(error);
      expect(typeof str).toBe('string');
      expect(str).toContain('ModelError');
    });

    it('should serialize LibraryError without cause', () => {
      const error = new LibraryError('Simple');
      const str = JSON.stringify({ message: error.message, name: error.name });
      expect(str).toContain('Simple');
      expect(str).toContain('LibraryError');
    });
  });

  describe('error names', () => {
    it('should have correct name for all error types', () => {
      expect(new LibraryError('').name).toBe('LibraryError');
      expect(new ModelError('').name).toBe('ModelError');
      expect(new ToolError('').name).toBe('ToolError');
      expect(new ValidationError('').name).toBe('ValidationError');
      expect(new AgentError('').name).toBe('AgentError');
    });
  });
});
