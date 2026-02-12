/**
 * Subagents - specialized agents with isolated context, exposed as tools to a parent agent
 */

export { defineSubagent, runSubagent, createSubagentTool, createSubagentToolSet } from './subagent';
export type { RunSubagentOptions, CreateSubagentToolOptions } from './subagent';
export type { SubagentConfig, SubagentDefinition, SubagentResult } from '../types/subagent';
