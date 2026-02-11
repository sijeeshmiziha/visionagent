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
export { createModel } from './models';
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
export { tool, jsonSchema } from './types/tool';
export {
  defineTool,
  executeTool,
  executeToolByName,
  createToolSet,
  getTools,
  getTool,
} from './tools';
export type { ToolSet, Tool, ToolConfig, ToolContext, ToolExecutionResult } from './tools';

// MCP
export { BaseMcpClient } from './mcp';
export type {
  McpClientConfig,
  McpClientInfo,
  McpToolContent,
  McpTransport,
  McpResolveOptions,
} from './mcp';
