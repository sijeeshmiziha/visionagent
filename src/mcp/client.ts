/**
 * MCP Client implementation using @modelcontextprotocol/sdk
 */

import type { MCPClient, MCPClientConfig } from '../types/mcp';
import type { Tool } from '../types/tool';
import { MCPError } from '../core/errors';
import { createLogger } from '../core/logger';
import { defineTool } from '../tools/define-tool';
import { z } from 'zod';

const logger = createLogger({ prefix: 'mcp-client' });

/**
 * Create an MCP client to connect to MCP servers
 *
 * @example
 * ```typescript
 * const client = createMCPClient({
 *   transport: 'stdio',
 *   command: 'npx',
 *   args: ['-y', '@anthropic/mcp-server-filesystem']
 * });
 *
 * await client.connect();
 * const tools = await client.getTools();
 * ```
 */
export function createMCPClient(config: MCPClientConfig): MCPClient {
  const { transport: transportType, command, args, url: _url } = config;

  let client: unknown = null;
  let transport: unknown = null;

  /**
   * Convert MCP tools to our tool format
   */
  function convertMCPTool(mcpTool: {
    name: string;
    description?: string;
    inputSchema?: unknown;
  }): Tool {
    const tool = defineTool({
      name: mcpTool.name,
      description: mcpTool.description || '',
      input: z.record(z.unknown()), // Generic input since we don't have the Zod schema
      handler: async input => {
        if (!client) {
          throw new MCPError('Client not connected');
        }
        return callMCPTool(mcpTool.name, input);
      },
    });
    return tool as Tool;
  }

  /**
   * Call a tool on the MCP server
   */
  async function callMCPTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    if (!client) {
      throw new MCPError('Client not connected');
    }

    const mcpClient = client as {
      request: (request: unknown, schema: unknown) => Promise<unknown>;
    };

    const response = await mcpClient.request(
      {
        method: 'tools/call',
        params: {
          name,
          arguments: args,
        },
      },
      {} // Schema placeholder
    );

    const result = response as { content?: { text?: string }[] };
    if (result.content?.[0]?.text) {
      try {
        return JSON.parse(result.content[0].text);
      } catch {
        return result.content[0].text;
      }
    }

    return response;
  }

  return {
    async connect(): Promise<void> {
      try {
        const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
        const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');

        if (transportType === 'stdio') {
          if (!command) {
            throw new MCPError('Command is required for stdio transport');
          }

          transport = new StdioClientTransport({
            command,
            args: args ?? [],
          });

          logger.info(`Connecting to MCP server via stdio: ${command} ${args?.join(' ') ?? ''}`);
        } else {
          throw new MCPError(`Transport "${transportType}" is not yet implemented`);
        }

        client = new Client(
          {
            name: 'visionagent-mcp-client',
            version: '1.0.0',
          },
          {
            capabilities: {},
          }
        );

        const mcpClient = client as { connect: (transport: unknown) => Promise<void> };
        await mcpClient.connect(transport);

        logger.info('Connected to MCP server');
      } catch (error) {
        if ((error as Error).message?.includes('Cannot find module')) {
          throw new MCPError(
            'Failed to load @modelcontextprotocol/sdk. Please install it: npm install @modelcontextprotocol/sdk',
            error as Error
          );
        }
        throw new MCPError(`Failed to connect: ${(error as Error).message}`, error as Error);
      }
    },

    async disconnect(): Promise<void> {
      if (client) {
        const mcpClient = client as { close: () => Promise<void> };
        await mcpClient.close();
        logger.info('Disconnected from MCP server');
        client = null;
        transport = null;
      }
    },

    async getTools(): Promise<Tool[]> {
      if (!client) {
        throw new MCPError('Client not connected');
      }

      const mcpClient = client as {
        request: (request: unknown, schema: unknown) => Promise<unknown>;
      };

      const response = await mcpClient.request({ method: 'tools/list' }, {});

      const result = response as {
        tools?: { name: string; description?: string; inputSchema?: unknown }[];
      };

      if (!result.tools) {
        return [];
      }

      return result.tools.map(convertMCPTool);
    },

    async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
      return callMCPTool(name, args);
    },
  };
}
