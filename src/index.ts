/**
 * VisionAgent - Multi-provider AI agent framework
 * with vision, tool calling, and MCP support
 *
 * @example
 * ```typescript
 * import { createModel, runAgent, defineTool } from 'visionagent';
 *
 * const model = createModel({ provider: 'openai', model: 'gpt-4o' });
 *
 * const result = await runAgent({
 *   model,
 *   tools: [],
 *   systemPrompt: 'You are a helpful assistant.',
 *   input: 'Hello!',
 * });
 *
 * console.log(result.output);
 * ```
 */

// Core
export * from './core/index';

// Types
export type * from './types/index';

// Models
export { createModel } from './models/index';
export { createOpenAIModel } from './models/providers/openai';
export { createAnthropicModel } from './models/providers/anthropic';
export { createGoogleModel } from './models/providers/google';

// Tools
export { defineTool } from './tools/define-tool';
export { executeTool, executeToolByName } from './tools/execute-tool';
export { createToolSet, getTools, getTool, getToolSchemas } from './tools/tool-set';

// Hello World module
export { helloWorldTool, runHelloWorldAgent, createHelloWorldMCPServer } from './hello-world';
export type { HelloWorldAgentConfig } from './hello-world';

// Agents
export { runAgent } from './agents/run-agent';
export { agentLoop } from './agents/agent-loop';

// MCP
export { createMCPServer } from './mcp/server';
export { createMCPClient } from './mcp/client';
