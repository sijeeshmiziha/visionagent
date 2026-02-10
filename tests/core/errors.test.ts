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
  MCPError,
} from '../../src/core/errors';

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
  });

  describe('ModelError', () => {
    it('should include provider', () => {
      const error = new ModelError('Model failed', 'openai');
      expect(error.provider).toBe('openai');
      expect(error.name).toBe('ModelError');
    });
  });

  describe('ToolError', () => {
    it('should include tool name', () => {
      const error = new ToolError('Tool failed', 'search');
      expect(error.toolName).toBe('search');
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
  });

  describe('AgentError', () => {
    it('should include iteration', () => {
      const error = new AgentError('Agent failed', 5);
      expect(error.iteration).toBe(5);
      expect(error.name).toBe('AgentError');
    });
  });

  describe('MCPError', () => {
    it('should create MCP error', () => {
      const error = new MCPError('Connection failed');
      expect(error.name).toBe('MCPError');
    });
  });
});
