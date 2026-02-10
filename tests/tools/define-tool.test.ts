/**
 * Tests for defineTool
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { defineTool } from '../../src/tools';

describe('defineTool', () => {
  it('should return AI SDK Tool with description and execute', () => {
    const t = defineTool({
      name: 'test_tool',
      description: 'A test tool',
      input: z.object({ value: z.string() }),
      handler: async ({ value }) => ({ result: value }),
    });

    expect(t.description).toBe('A test tool');
    expect(t.inputSchema).toBeDefined();
    expect(t.execute).toBeDefined();
  });

  it('should execute handler with valid input', async () => {
    const t = defineTool({
      name: 'echo',
      description: 'Echo the input',
      input: z.object({ message: z.string() }),
      handler: async ({ message }) => ({ echoed: message }),
    });

    const result = await t.execute!({ message: 'hello' }, { toolCallId: '', messages: [] });
    expect(result).toEqual({ echoed: 'hello' });
  });

  it('should throw on invalid input', async () => {
    const t = defineTool({
      name: 'number_tool',
      description: 'Requires a number',
      input: z.object({ num: z.number() }),
      handler: async ({ num }) => ({ doubled: num * 2 }),
    });

    await expect(
      t.execute!({ num: 'not a number' as unknown as number }, { toolCallId: '', messages: [] })
    ).rejects.toThrow();
  });

  it('should have inputSchema (Zod) with object shape', () => {
    const t = defineTool({
      name: 'schema_tool',
      description: 'Tool with schema',
      input: z.object({
        name: z.string().describe('The name'),
        age: z.number().optional(),
      }),
      handler: async input => input,
    });

    const schema = t.inputSchema as z.ZodType;
    expect(schema).toBeDefined();
    const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>;
    expect(jsonSchema.type).toBe('object');
    const props = jsonSchema.properties as Record<string, unknown> | undefined;
    expect(props?.name).toBeDefined();
  });
});
