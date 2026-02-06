/**
 * MCP Server implementation using @modelcontextprotocol/sdk
 */

import type { MCPServer, MCPServerConfig, MCPServerStartOptions, MCPTransport } from '../types/mcp';
import { MCPError } from '../core/errors';
import { createLogger } from '../core/logger';

const logger = createLogger({ prefix: 'mcp-server' });

/**
 * Create an MCP server that exposes tools
 *
 * @example
 * ```typescript
 * const server = createMCPServer({
 *   name: 'figma-analyzer',
 *   version: '1.0.0',
 *   tools: [figmaAnalysisTool]
 * });
 *
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
        // Dynamic import to avoid requiring the package if not used
        const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
        const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');

        // Create MCP server
        server = new McpServer(
          {
            name,
            version,
          },
          {
            capabilities: {
              tools: {},
            },
          }
        );

        const mcpServer = server as {
          registerTool: (
            name: string,
            meta: { description: string; inputSchema: Record<string, unknown> },
            handler: (args: unknown) => Promise<{ content: { type: string; text: string }[] }>
          ) => void;
          connect: (transport: unknown) => Promise<void>;
          close: () => Promise<void>;
        };

        // Register all tools
        for (const tool of tools) {
          mcpServer.registerTool(
            tool.name,
            {
              description: tool.description,
              inputSchema: tool.getInputSchema(),
            },
            async (args: unknown) => {
              try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const result = await tool.execute(args as Record<string, unknown>);
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
                  content: [
                    {
                      type: 'text',
                      text: `Error: ${(error as Error).message}`,
                    },
                  ],
                  isError: true,
                };
              }
            }
          );
        }

        // Create transport
        if (transportType === 'stdio') {
          transport = new StdioServerTransport();
          logger.info(`Starting MCP server "${name}" with stdio transport`);
        } else if (transportType === 'sse' || transportType === 'http') {
          // SSE/HTTP transport would require additional setup
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
