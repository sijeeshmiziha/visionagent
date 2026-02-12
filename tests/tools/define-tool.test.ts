/**
 * Tests for defineTool
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { defineTool } from '../../src/lib/tools';
import { ToolError } from '../../src/lib/utils/errors';

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

  it('should throw ToolError with tool name on invalid input', async () => {
    const t = defineTool({
      name: 'named_tool',
      description: 'Tool',
      input: z.object({ x: z.number() }),
      handler: async () => ({}),
    });

    await expect(
      t.execute!({ x: 'invalid' as unknown as number }, { toolCallId: '', messages: [] })
    ).rejects.toMatchObject({
      name: 'ToolError',
      toolName: 'named_tool',
      message: expect.stringContaining('Invalid input'),
    });
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

  it('should execute with optional fields in schema', async () => {
    const t = defineTool({
      name: 'opt_tool',
      description: 'Optional fields',
      input: z.object({
        required: z.string(),
        optional: z.number().optional(),
      }),
      handler: async ({ required, optional }) => ({ required, optional: optional ?? 0 }),
    });

    const result = await t.execute!({ required: 'a' }, { toolCallId: '', messages: [] });
    expect(result).toEqual({ required: 'a', optional: 0 });

    const result2 = await t.execute!(
      { required: 'b', optional: 10 },
      { toolCallId: '', messages: [] }
    );
    expect(result2).toEqual({ required: 'b', optional: 10 });
  });

  it('should execute with nested object schema', async () => {
    const t = defineTool({
      name: 'nested_tool',
      description: 'Nested schema',
      input: z.object({
        outer: z.object({
          inner: z.string(),
          count: z.number(),
        }),
      }),
      handler: async ({ outer }) => ({ result: `${outer.inner}-${outer.count}` }),
    });

    const result = await t.execute!(
      { outer: { inner: 'x', count: 2 } },
      { toolCallId: '', messages: [] }
    );
    expect(result).toEqual({ result: 'x-2' });

    await expect(
      t.execute!({ outer: { inner: 'x', count: 'not number' } } as never, {
        toolCallId: '',
        messages: [],
      })
    ).rejects.toThrow();
  });

  it('should execute with array and enum input types', async () => {
    const t = defineTool({
      name: 'array_enum_tool',
      description: 'Array and enum',
      input: z.object({
        tags: z.array(z.string()),
        kind: z.enum(['a', 'b', 'c']),
      }),
      handler: async ({ tags, kind }) => ({ tags: tags.length, kind }),
    });

    const result = await t.execute!(
      { tags: ['x', 'y'], kind: 'b' },
      { toolCallId: '', messages: [] }
    );
    expect(result).toEqual({ tags: 2, kind: 'b' });
  });

  it('should re-throw ToolError from handler without wrapping', async () => {
    const originalError = new ToolError('Original tool error', 'my_tool');
    const t = defineTool({
      name: 'rethrow_tool',
      description: 'Throws ToolError',
      input: z.object({}),
      handler: async () => {
        throw originalError;
      },
    });

    await expect(t.execute!({}, { toolCallId: '', messages: [] })).rejects.toBe(originalError);
    await expect(t.execute!({}, { toolCallId: '', messages: [] })).rejects.toMatchObject({
      message: 'Original tool error',
      toolName: 'my_tool',
    });
  });

  it('should wrap non-Error throws in ToolError', async () => {
    const t = defineTool({
      name: 'string_throw_tool',
      description: 'Throws string',
      input: z.object({}),
      handler: async () => {
        throw new Error('something went wrong');
      },
    });

    await expect(t.execute!({}, { toolCallId: '', messages: [] })).rejects.toMatchObject({
      name: 'ToolError',
      toolName: 'string_throw_tool',
      message: expect.stringContaining('something went wrong'),
    });
  });

  it('should allow empty description', () => {
    const t = defineTool({
      name: 'no_desc',
      description: '',
      input: z.object({}),
      handler: async () => ({}),
    });
    expect(t.description).toBe('');
    expect(t.execute).toBeDefined();
  });
});
