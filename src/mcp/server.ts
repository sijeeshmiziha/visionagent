/**
 * MCP Server implementation using @modelcontextprotocol/sdk
 */

import type { z } from 'zod';
import type { ToolExecutionOptions } from 'ai';
import type {
  MCPServer,
  MCPServerConfig,
  MCPServerStartOptions,
  MCPTransport,
  MCPTool,
} from '../types/mcp';
import { MCPError } from '../core/errors';
import { createLogger } from '../core/logger';
import { zodToJsonSchema } from '../tools';

const logger = createLogger({ prefix: 'mcp-server' });

/** Shape of a schema that might be a Zod schema (has safeParse) */
interface ZodLikeSchema {
  safeParse?: (input: unknown) => unknown;
}

/** Shape of a schema that has jsonSchema property */
interface JsonSchemaWrapper {
  jsonSchema?: Record<string, unknown>;
}

/**
 * Get JSON schema from an AI SDK Tool (inputSchema: Zod or { jsonSchema })
 */
function getInputSchemaFromTool(tool: MCPTool): Record<string, unknown> {
  const schema = tool.inputSchema as unknown;
  if (!schema) return {};

  // Check if it's a Zod schema (has safeParse method)
  const zodLike = schema as ZodLikeSchema;
  if (typeof zodLike.safeParse === 'function') {
    return zodToJsonSchema(schema as z.ZodType);
  }

  // Check if it has a jsonSchema property
  const withJson = schema as JsonSchemaWrapper;
  return withJson.jsonSchema ?? {};
}

/**
 * Create an MCP server that exposes tools (Record<string, Tool>)
 *
 * @example
 * ```typescript
 * const server = createMCPServer({
 *   name: 'figma-analyzer',
 *   version: '1.0.0',
 *   tools: { figmaAnalysis: figmaAnalysisTool }
 * });
 * await server.start('stdio');
 * ```
 */
export function createMCPServer(config: MCPServerConfig): MCPServer {
  const { name, version, tools, description: _description } = config;

  let server: unknown = null;
  let transport: unknown = null;

  return {
    name,
    version,
    tools,

    async start(transportType: MCPTransport, _options?: MCPServerStartOptions): Promise<void> {
      try {
        const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
        const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');

        server = new McpServer({ name, version }, { capabilities: { tools: {} } });

        const mcpServer = server as {
          registerTool: (
            toolName: string,
            meta: { description: string; inputSchema: Record<string, unknown> },
            handler: (
              args: unknown
            ) => Promise<{ content: { type: string; text: string }[]; isError?: boolean }>
          ) => void;
          connect: (t: unknown) => Promise<void>;
          close: () => Promise<void>;
        };

        for (const [toolName, tool] of Object.entries(tools)) {
          mcpServer.registerTool(
            toolName,
            {
              description: tool.description ?? '',
              inputSchema: getInputSchemaFromTool(tool),
            },
            async (args: unknown) => {
              try {
                if (!tool.execute) {
                  return {
                    content: [{ type: 'text', text: 'Tool has no execute function' }],
                    isError: true,
                  };
                }
                const execOptions: ToolExecutionOptions = {
                  toolCallId: '',
                  messages: [],
                };
                const result: unknown = await tool.execute(args, execOptions);
                const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
                return {
                  content: [{ type: 'text', text }],
                };
              } catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                return {
                  content: [{ type: 'text', text: `Error: ${err.message}` }],
                  isError: true,
                };
              }
            }
          );
        }

        if (transportType === 'stdio') {
          transport = new StdioServerTransport();
          logger.info(`Starting MCP server "${name}" with stdio transport`);
        } else if (transportType === 'sse' || transportType === 'http') {
          throw new MCPError(`Transport "${transportType}" is not yet implemented`);
        } else {
          throw new MCPError(`Unknown transport: ${transportType}`);
        }

        await mcpServer.connect(transport);
        logger.info(`MCP server "${name}" started`);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (err.message.includes('Cannot find module')) {
          throw new MCPError(
            'Failed to load @modelcontextprotocol/sdk. Please install it: npm install @modelcontextprotocol/sdk',
            err
          );
        }
        throw new MCPError(`Failed to start MCP server: ${err.message}`, err);
      }
    },

    async stop(): Promise<void> {
      if (server) {
        const mcpServer = server as { close: () => Promise<void> };
        await mcpServer.close();
        logger.info(`MCP server "${name}" stopped`);
        server = null;
        transport = null;
      }
    },
  };
}
