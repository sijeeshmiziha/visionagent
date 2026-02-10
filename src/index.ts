/**
 * VisionAgent - Multi-provider AI agent framework
 * with vision and tool calling support
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

// Framework
export * from './lib';

// Modules
export * from './modules';
