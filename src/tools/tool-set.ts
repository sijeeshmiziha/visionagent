/**
 * Tool set as Record<string, Tool> (AI SDK ToolSet)
 */

import type { Tool } from '../types/tool';
import type { NamedTool } from './define-tool';
import { ToolError } from '../core/errors';

/**
 * Tool set is a record of tool name to AI SDK Tool
 */
export type ToolSet = Record<string, Tool>;

/**
 * Create a tool set from an array of named tools or from an existing record.
 *
 * @example
 * ```typescript
 * const tools = createToolSet([defineTool({ name: 'search', ... }), defineTool({ name: 'calc', ... })]);
 * ```
 */
export function createToolSet(tools: NamedTool[] | Record<string, Tool>): ToolSet {
  if (Array.isArray(tools)) {
    const record: ToolSet = {};
    for (const item of tools) {
      if (record[item.name]) {
        throw new ToolError(`Duplicate tool name: ${item.name}`);
      }
      record[item.name] = item.tool;
    }
    return record;
  }
  return tools;
}

/**
 * Get all tools from a tool set (array of Tool values)
 */
export function getTools(toolSet: ToolSet): Tool[] {
  return Object.values(toolSet);
}

/**
 * Get a tool by name from a tool set
 */
export function getTool(toolSet: ToolSet, name: string): Tool | undefined {
  return toolSet[name];
}
