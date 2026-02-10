/**
 * MCP Server implementation using @modelcontextprotocol/sdk
 */

import type { MCPServer, MCPServerConfig, MCPServerStartOptions, MCPTransport } from '../types/mcp';
import type { Tool } from '../types/tool';
import { MCPError } from '../core/errors';
import { createLogger } from '../core/logger';

const logger = createLogger({ prefix: 'mcp-server' });

/**
 * Get JSON schema from an AI SDK Tool's parameters (Schema has .jsonSchema)
 */
function getInputSchemaFromTool(tool: Tool): Record<string, unknown> {
  const params = tool.parameters as { jsonSchema?: Record<string, unknown> } | undefined;
  return params?.jsonSchema ?? {};
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
                const result = await tool.execute(args, { toolCallId: '', messages: [] });
                return {
                  content: [
                    {
                      type: 'text',
                      text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                    },
                  ],
                };
              } catch (error) {
                return {
                  content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
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
        if ((error as Error).message?.includes('Cannot find module')) {
          throw new MCPError(
            'Failed to load @modelcontextprotocol/sdk. Please install it: npm install @modelcontextprotocol/sdk',
            error as Error
          );
        }
        throw new MCPError(
          `Failed to start MCP server: ${(error as Error).message}`,
          error as Error
        );
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
