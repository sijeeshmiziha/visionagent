/**
 * Tests for defineTool
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { defineTool } from '../../src/tools/define-tool';

describe('defineTool', () => {
  it('should return NamedTool with name and tool (AI SDK Tool)', () => {
    const named = defineTool({
      name: 'test_tool',
      description: 'A test tool',
      input: z.object({ value: z.string() }),
      handler: async ({ value }) => ({ result: value }),
    });

    expect(named.name).toBe('test_tool');
    expect(named.tool.description).toBe('A test tool');
    expect(named.tool.parameters).toBeDefined();
    expect(named.tool.execute).toBeDefined();
  });

  it('should execute handler with valid input via .tool.execute', async () => {
    const named = defineTool({
      name: 'echo',
      description: 'Echo the input',
      input: z.object({ message: z.string() }),
      handler: async ({ message }) => ({ echoed: message }),
    });

    const result = await named.tool.execute!(
      { message: 'hello' },
      { toolCallId: '', messages: [] }
    );
    expect(result).toEqual({ echoed: 'hello' });
  });

  it('should throw on invalid input', async () => {
    const named = defineTool({
      name: 'number_tool',
      description: 'Requires a number',
      input: z.object({ num: z.number() }),
      handler: async ({ num }) => ({ doubled: num * 2 }),
    });

    await expect(
      named.tool.execute!(
        { num: 'not a number' as unknown as number },
        { toolCallId: '', messages: [] }
      )
    ).rejects.toThrow();
  });

  it('should have parameters with jsonSchema (AI SDK Schema)', () => {
    const named = defineTool({
      name: 'schema_tool',
      description: 'Tool with schema',
      input: z.object({
        name: z.string().describe('The name'),
        age: z.number().optional(),
      }),
      handler: async input => input,
    });

    const params = named.tool.parameters as { jsonSchema?: Record<string, unknown> };
    expect(params?.jsonSchema).toBeDefined();
    expect(params?.jsonSchema?.type).toBe('object');
    const props = params?.jsonSchema?.properties as Record<string, unknown> | undefined;
    expect(props?.name).toBeDefined();
  });
});
