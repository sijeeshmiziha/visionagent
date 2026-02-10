/**
 * Simple functions for working with tool collections
 */

import type { Tool, ToolDefinition } from '../types/tool';
import { ToolError } from '../core/errors';

/**
 * A tool set is just an array of tools with helper functions
 */
export type ToolSet = Tool[];

/**
 * Create a tool set from an array of tools
 *
 * @example
 * ```typescript
 * const tools = createToolSet([searchTool, calculatorTool]);
 * ```
 */
export function createToolSet(tools: Tool[]): ToolSet {
  // Validate no duplicate names
  const names = new Set<string>();
  for (const tool of tools) {
    if (names.has(tool.name)) {
      throw new ToolError(`Duplicate tool name: ${tool.name}`);
    }
    names.add(tool.name);
  }

  return tools;
}

/**
 * Get all tools from a tool set
 */
export function getTools(toolSet: ToolSet): Tool[] {
  return toolSet;
}

/**
 * Get a tool by name from a tool set
 */
export function getTool(toolSet: ToolSet, name: string): Tool | undefined {
  return toolSet.find(t => t.name === name);
}

/**
 * Get tool definitions for LLM function calling
 */
export function getToolSchemas(toolSet: ToolSet): ToolDefinition[] {
  return toolSet.map(tool => tool.toDefinition());
}

