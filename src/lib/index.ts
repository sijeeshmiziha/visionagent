/**
 * VisionAgent framework - core library exports
 */

// Utils (errors, logger, utils)
export * from './utils';

// Types
export type * from './types';

// Agents
export { runAgent } from './agents';
export type { AgentConfig, AgentResult, AgentStep } from './agents';

// Models
export { createModel, registerProvider, KNOWN_MODELS } from './models';
export { createOpenAIModel } from './models/providers/openai';
export { createAnthropicModel } from './models/providers/anthropic';
export { createGoogleModel } from './models/providers/google';
export type {
  Model,
  ModelConfig,
  ModelProvider,
  ModelResponse,
  InvokeOptions,
  VisionOptions,
} from './models';

// Tools
export {
  defineTool,
  executeTool,
  executeToolByName,
  createToolSet,
  getTools,
  getTool,
  zodToJsonSchema,
} from './tools';
export type {
  ToolSet,
  JsonSchemaObject,
  Tool,
  ToolConfig,
  ToolContext,
  ToolExecutionOptions,
  ToolExecutionResult,
} from './tools';

// Subagents
export {
  defineSubagent,
  runSubagent,
  createSubagentTool,
  createSubagentToolSet,
} from './subagents';
export type {
  SubagentConfig,
  SubagentDefinition,
  SubagentResult,
  RunSubagentOptions,
  CreateSubagentToolOptions,
} from './subagents';

// MCP
export { BaseMcpClient } from './mcp';
export type {
  McpClientConfig,
  McpClientInfo,
  McpToolContent,
  McpTransport,
  McpResolveOptions,
} from './mcp';
