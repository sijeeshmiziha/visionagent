/**
 * Tests for helloWorldTool
 */

import { describe, it, expect } from 'vitest';
import { helloWorldTool } from '../../src/hello-world';

describe('helloWorldTool', () => {
  it('should have correct name and description (NamedTool)', () => {
    expect(helloWorldTool.name).toBe('hello_world');
    expect(helloWorldTool.tool.description).toBe('Returns a greeting message for the given name');
  });

  it('should execute and return greeting for given name', async () => {
    const result = await helloWorldTool.tool.execute!(
      { name: 'Alice' },
      { toolCallId: '', messages: [] }
    );
    expect(result).toEqual({
      greeting: 'Hello, Alice! Welcome to VisionAgent.',
    });
  });

  it('should throw on invalid input', async () => {
    await expect(
      helloWorldTool.tool.execute!(
        { name: 123 as unknown as string },
        { toolCallId: '', messages: [] }
      )
    ).rejects.toThrow();
  });

  it('should throw when name is missing', async () => {
    await expect(
      helloWorldTool.tool.execute!({} as { name: string }, { toolCallId: '', messages: [] })
    ).rejects.toThrow();
  });

  it('should have parameters with jsonSchema including name', () => {
    const params = helloWorldTool.tool.parameters as { jsonSchema?: Record<string, unknown> };
    expect(params?.jsonSchema).toBeDefined();
    expect(params?.jsonSchema?.type).toBe('object');
    const props = params?.jsonSchema?.properties as Record<string, unknown> | undefined;
    expect(props?.name).toBeDefined();
  });
});
