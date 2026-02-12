/**
 * Tests for executeTool, executeToolByName, zodToJsonSchema
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  defineTool,
  createToolSet,
  executeTool,
  executeToolByName,
  zodToJsonSchema,
} from '../../src/lib/tools';
import { ToolError } from '../../src/lib/utils/errors';

describe('executeTool', () => {
  it('should return success and output on successful execution', async () => {
    const tool = defineTool({
      name: 'ok_tool',
      description: 'OK',
      input: z.object({ x: z.number() }),
      handler: async ({ x }) => ({ doubled: x * 2 }),
    });
    const result = await executeTool(tool, { x: 5 });
    expect(result.success).toBe(true);
    expect(result.output).toEqual({ doubled: 10 });
    expect(result).not.toHaveProperty('error');
  });

  it('should return success: false when tool has no execute function', async () => {
    const toolWithoutExecute = {
      description: 'No execute',
      inputSchema: z.object({}),
    };
    const result = await executeTool(toolWithoutExecute as never, {});
    expect(result.success).toBe(false);
    expect(result.error).toBe('Tool has no execute function');
  });

  it('should return success: false when tool throws', async () => {
    const tool = defineTool({
      name: 'throw_tool',
      description: 'Throws',
      input: z.object({}),
      handler: async () => {
        throw new Error('Tool failed');
      },
    });
    const result = await executeTool(tool, {});
    expect(result.success).toBe(false);
    expect(result.error).toContain('Tool failed');
  });

  it('should accept toolCallId and abortSignal in options', async () => {
    const abortSignal = new AbortController().signal;
    const options = { toolCallId: 'call_123', abortSignal };
    const tool = defineTool({
      name: 'opts_tool',
      description: 'Options',
      input: z.object({}),
      handler: async () => ({ ok: true }),
    });
    const result = await executeTool(tool, {}, options);
    expect(result.success).toBe(true);
    expect(result.output).toEqual({ ok: true });
  });
});

describe('executeToolByName', () => {
  it('should find and execute tool by name', async () => {
    const tool = defineTool({
      name: 'named_tool',
      description: 'Named',
      input: z.object({ v: z.string() }),
      handler: async ({ v }) => ({ out: v }),
    });
    const tools = createToolSet({ named_tool: tool });
    const result = await executeToolByName(tools, 'named_tool', { v: 'hello' });
    expect(result.success).toBe(true);
    expect(result.output).toEqual({ out: 'hello' });
  });

  it('should throw ToolError when tool not found', async () => {
    const tools = createToolSet({});
    await expect(executeToolByName(tools, 'missing', {})).rejects.toThrow(ToolError);
    await expect(executeToolByName(tools, 'missing', {})).rejects.toMatchObject({
      message: expect.stringContaining('Tool not found'),
      toolName: undefined,
    });
  });
});

describe('zodToJsonSchema', () => {
  it('should convert Zod schema to JSON schema object', () => {
    const schema = z.object({
      name: z.string(),
      count: z.number().optional(),
    });
    const result = zodToJsonSchema(schema);
    expect(result).toHaveProperty('type', 'object');
    expect(result).toHaveProperty('properties');
    const props = result.properties as Record<string, unknown>;
    expect(props.name).toBeDefined();
    expect(props.count).toBeDefined();
  });

  it('should remove $schema and definitions', () => {
    const schema = z.object({ x: z.string() });
    const result = zodToJsonSchema(schema);
    expect(result).not.toHaveProperty('$schema');
    expect(result).not.toHaveProperty('definitions');
  });
});
