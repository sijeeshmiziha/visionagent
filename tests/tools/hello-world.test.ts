/**
 * Tests for helloWorldTool
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { helloWorldTool } from '../../src/hello-world';

describe('helloWorldTool', () => {
  it('should have correct description', () => {
    expect(helloWorldTool.description).toBe('Returns a greeting message for the given name');
  });

  it('should execute and return greeting for given name', async () => {
    const result = await helloWorldTool.execute!(
      { name: 'Alice' },
      { toolCallId: '', messages: [] }
    );
    expect(result).toEqual({
      greeting: 'Hello, Alice! Welcome to VisionAgent.',
    });
  });

  it('should throw on invalid input', async () => {
    await expect(
      helloWorldTool.execute!({ name: 123 as unknown as string }, { toolCallId: '', messages: [] })
    ).rejects.toThrow();
  });

  it('should throw when name is missing', async () => {
    await expect(
      helloWorldTool.execute!({} as { name: string }, { toolCallId: '', messages: [] })
    ).rejects.toThrow();
  });

  it('should have inputSchema (Zod) including name', () => {
    const schema = helloWorldTool.inputSchema as z.ZodType;
    expect(schema).toBeDefined();
    const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>;
    expect(jsonSchema.type).toBe('object');
    const props = jsonSchema.properties as Record<string, unknown> | undefined;
    expect(props?.name).toBeDefined();
  });
});
