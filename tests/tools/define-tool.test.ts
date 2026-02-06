/**
 * Tests for defineTool
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { defineTool } from '../../src/tools/define-tool';

describe('defineTool', () => {
  it('should create a tool with name and description', () => {
    const tool = defineTool({
      name: 'test_tool',
      description: 'A test tool',
      input: z.object({ value: z.string() }),
      handler: async ({ value }) => ({ result: value }),
    });

    expect(tool.name).toBe('test_tool');
    expect(tool.description).toBe('A test tool');
  });

  it('should execute handler with valid input', async () => {
    const tool = defineTool({
      name: 'echo',
      description: 'Echo the input',
      input: z.object({ message: z.string() }),
      handler: async ({ message }) => ({ echoed: message }),
    });

    const result = await tool.execute({ message: 'hello' });
    expect(result).toEqual({ echoed: 'hello' });
  });

  it('should throw on invalid input', async () => {
    const tool = defineTool({
      name: 'number_tool',
      description: 'Requires a number',
      input: z.object({ num: z.number() }),
      handler: async ({ num }) => ({ doubled: num * 2 }),
    });

    await expect(tool.execute({ num: 'not a number' as unknown as number })).rejects.toThrow();
  });

  it('should generate JSON Schema', () => {
    const tool = defineTool({
      name: 'schema_tool',
      description: 'Tool with schema',
      input: z.object({
        name: z.string().describe('The name'),
        age: z.number().optional(),
      }),
      handler: async input => input,
    });

    const schema = tool.getInputSchema();
    expect(schema.type).toBe('object');
    expect(schema.properties).toBeDefined();
    expect(schema.properties?.name).toBeDefined();
  });

  it('should generate tool definition for LLM', () => {
    const tool = defineTool({
      name: 'llm_tool',
      description: 'Tool for LLM',
      input: z.object({ query: z.string() }),
      handler: async ({ query }) => ({ answer: query }),
    });

    const definition = tool.toDefinition();
    expect(definition.type).toBe('function');
    expect(definition.function.name).toBe('llm_tool');
    expect(definition.function.description).toBe('Tool for LLM');
  });
});
