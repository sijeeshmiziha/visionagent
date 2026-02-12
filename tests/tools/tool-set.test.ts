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

    it('should accept empty tool set', () => {
      const tools = createToolSet({});
      expect(Object.keys(tools)).toHaveLength(0);
      expect(tools).toEqual({});
    });
  });

  describe('getTools', () => {
    it('should return all tools', () => {
      const toolSet = createToolSet({ tool1, tool2 });
      const tools = getTools(toolSet);
      expect(tools).toHaveLength(2);
    });

    it('should return empty array for empty tool set', () => {
      const toolSet = createToolSet({});
      const tools = getTools(toolSet);
      expect(tools).toEqual([]);
      expect(tools).toHaveLength(0);
    });

    it('should return exact tool references for large set', () => {
      const t3 = defineTool({
        name: 'tool3',
        description: 'Third',
        input: z.object({}),
        handler: async () => ({}),
      });
      const t4 = defineTool({
        name: 'tool4',
        description: 'Fourth',
        input: z.object({}),
        handler: async () => ({}),
      });
      const t5 = defineTool({
        name: 'tool5',
        description: 'Fifth',
        input: z.object({}),
        handler: async () => ({}),
      });
      const toolSet = createToolSet({ tool1, tool2, tool3: t3, tool4: t4, tool5: t5 });
      const tools = getTools(toolSet);
      expect(tools).toHaveLength(5);
      expect(tools).toContain(tool1);
      expect(tools).toContain(tool2);
      expect(tools).toContain(t3);
      expect(tools).toContain(t4);
      expect(tools).toContain(t5);
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

    it('should return exact same reference (identity)', () => {
      const toolSet = createToolSet({ tool1, tool2 });
      expect(getTool(toolSet, 'tool1')).toBe(tool1);
      expect(getTool(toolSet, 'tool2')).toBe(tool2);
    });
  });
});
