/**
 * Tests for tool-set functions
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { defineTool, createToolSet, getTools, getTool } from '../../src/lib/tools';

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
    it('should return the tool record (key = name)', () => {
      const tools = createToolSet({ tool1, tool2 });
      expect(Object.keys(tools)).toHaveLength(2);
      expect(tools.tool1).toBe(tool1);
      expect(tools.tool2).toBe(tool2);
    });
  });

  describe('getTools', () => {
    it('should return all tools', () => {
      const toolSet = createToolSet({ tool1, tool2 });
      const tools = getTools(toolSet);
      expect(tools).toHaveLength(2);
    });
  });

  describe('getTool', () => {
    it('should find a tool by name', () => {
      const toolSet = createToolSet({ tool1, tool2 });
      const found = getTool(toolSet, 'tool1');
      expect(found).toBe(tool1);
    });

    it('should return undefined for unknown tool', () => {
      const toolSet = createToolSet({ tool1 });
      const found = getTool(toolSet, 'unknown');
      expect(found).toBeUndefined();
    });
  });
});
