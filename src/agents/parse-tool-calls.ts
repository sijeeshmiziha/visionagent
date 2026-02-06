/**
 * Parse tool calls from model responses
 */

import type { ToolCall } from '../types/common';
import type { ModelResponse } from '../types/model';

/**
 * Parse tool calls from a model response
 *
 * Returns an empty array if no tool calls are present
 */
export function parseToolCalls(response: ModelResponse): ToolCall[] {
  return response.toolCalls ?? [];
}

/**
 * Check if a response has tool calls
 */
export function hasToolCalls(response: ModelResponse): boolean {
  return (response.toolCalls?.length ?? 0) > 0;
}

/**
 * Get the names of tools called in a response
 */
export function getCalledToolNames(response: ModelResponse): string[] {
  return response.toolCalls?.map(tc => tc.name) ?? [];
}

/**
 * Find a specific tool call by name
 */
export function findToolCall(response: ModelResponse, name: string): ToolCall | undefined {
  return response.toolCalls?.find(tc => tc.name === name);
}
