/**
 * Tests for tool-set functions
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { defineTool } from '../../src/tools/define-tool';
import { createToolSet, getTools, getTool } from '../../src/tools/tool-set';

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
      expect(Object.keys(tools)).toHaveLength(2);
      expect(tools.tool1).toBeDefined();
      expect(tools.tool2).toBeDefined();
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
      expect(found).toBeDefined();
      expect(found).toBe(tool1.tool);
    });

    it('should return undefined for unknown tool', () => {
      const toolSet = createToolSet([tool1]);
      const found = getTool(toolSet, 'unknown');
      expect(found).toBeUndefined();
    });
  });
});
