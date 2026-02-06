/**
 * Figma to Requirements Library
 *
 * Analyze Figma design images using AI vision to extract
 * product requirements, user stories, and feature specifications.
 *
 * @example
 * ```typescript
 * import { createModel, analyzeFigmaDesigns } from 'figma-to-requirements';
 *
 * const model = createModel({ provider: 'openai', model: 'gpt-4o' });
 *
 * const result = await analyzeFigmaDesigns({
 *   model,
 *   source: '/path/to/figma/exports'
 * });
 *
 * console.log(result.analysis);
 * ```
 */

// Core
export * from './core/index';

// Types
export * from './types/index';

// Models
export { createModel } from './models/index';
export { createOpenAIModel } from './models/providers/openai';
export { createAnthropicModel } from './models/providers/anthropic';
export { createGoogleModel } from './models/providers/google';

// Tools
export { defineTool } from './tools/define-tool';
export { executeTool, executeToolByName } from './tools/execute-tool';
export { createToolSet, getTools, getTool, getToolSchemas } from './tools/tool-set';

// Agents
export { runAgent } from './agents/run-agent';
export { agentLoop } from './agents/agent-loop';

// Figma (Core Feature)
// Legacy analyzer (markdown output)
export { analyzeFigmaDesigns, analyzeFigmaFiles, analyzeFigmaFolder } from './figma/analyzer';
export { loadImagesFromFolder, loadImagesFromPaths } from './figma/loader';
export { validateFigmaFolder, validateImagePaths } from './figma/validator';
export { figmaAnalysisPrompt, figmaSystemPrompt } from './figma/prompts';

// New code-oriented analyzers (structured JSON output)
export { identifyScreens } from './figma/screen-identifier';
export { extractComponents } from './figma/component-extractor';
export { generateAPIEndpoints } from './figma/api-generator';
export { analyzeFigmaForCode } from './figma/code-analyzer';

// MCP
export { createMCPServer } from './mcp/server';
export { createMCPClient } from './mcp/client';
