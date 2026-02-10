/**
 * Tests for tool-set functions
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { defineTool } from '../../src/tools/define-tool';
import {
  createToolSet,
  getTools,
  getTool,
  getToolSchemas,
} from '../../src/tools/tool-set';

describe('tool-set', () => {
  const tool1 = defineTool({
    name: 'tool1',
    description: 'First tool',
    input: z.object({ a: z.string() }),
    handler: async ({ a }) => a,
  });

  const tool2 = defineTool({
    name: 'tool2',
    description: 'Second tool',
    input: z.object({ b: z.number() }),
    handler: async ({ b }) => b * 2,
  });

  describe('createToolSet', () => {
    it('should create a tool set from an array', () => {
      const tools = createToolSet([tool1, tool2]);
      expect(tools).toHaveLength(2);
    });

    it('should throw on duplicate names', () => {
      const duplicate = defineTool({
        name: 'tool1',
        description: 'Duplicate',
        input: z.object({}),
        handler: async () => null,
      });

      expect(() => createToolSet([tool1, duplicate])).toThrow('Duplicate tool name');
    });
  });

  describe('getTools', () => {
    it('should return all tools', () => {
      const toolSet = createToolSet([tool1, tool2]);
      const tools = getTools(toolSet);
      expect(tools).toHaveLength(2);
    });
  });

  describe('getTool', () => {
    it('should find a tool by name', () => {
      const toolSet = createToolSet([tool1, tool2]);
      const found = getTool(toolSet, 'tool1');
      expect(found?.name).toBe('tool1');
    });

    it('should return undefined for unknown tool', () => {
      const toolSet = createToolSet([tool1]);
      const found = getTool(toolSet, 'unknown');
      expect(found).toBeUndefined();
    });
  });

  describe('getToolSchemas', () => {
    it('should return tool definitions for LLM', () => {
      const toolSet = createToolSet([tool1, tool2]);
      const schemas = getToolSchemas(toolSet);
      expect(schemas).toHaveLength(2);
      expect(schemas[0]?.type).toBe('function');
    });
  });

});
