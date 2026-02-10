/**
 * Tests for helloWorldTool
 */

import { describe, it, expect } from 'vitest';
import { helloWorldTool } from '../../src/hello-world';

describe('helloWorldTool', () => {
  it('should have correct name and description', () => {
    expect(helloWorldTool.name).toBe('hello_world');
    expect(helloWorldTool.description).toBe(
      'Returns a greeting message for the given name'
    );
  });

  it('should execute and return greeting for given name', async () => {
    const result = await helloWorldTool.execute({ name: 'Alice' });
    expect(result).toEqual({
      greeting: 'Hello, Alice! Welcome to VisionAgent.',
    });
  });

  it('should throw on invalid input', async () => {
    await expect(
      helloWorldTool.execute({ name: 123 as unknown as string })
    ).rejects.toThrow();
  });

  it('should throw when name is missing', async () => {
    await expect(
      helloWorldTool.execute({} as { name: string })
    ).rejects.toThrow();
  });

  it('should generate JSON Schema with name property', () => {
    const schema = helloWorldTool.getInputSchema();
    expect(schema.type).toBe('object');
    expect(schema.properties).toBeDefined();
    expect(schema.properties?.name).toBeDefined();
  });

  it('should generate correct LLM tool definition', () => {
    const definition = helloWorldTool.toDefinition();
    expect(definition.type).toBe('function');
    expect(definition.function.name).toBe('hello_world');
    expect(definition.function.description).toBe(
      'Returns a greeting message for the given name'
    );
  });
});
