/**
 * MCP Client implementation using @modelcontextprotocol/sdk
 */

import type { MCPClient, MCPClientConfig, MCPTool } from '../types/mcp';
import { MCPError } from '../core/errors';
import { createLogger } from '../core/logger';
import { defineTool } from '../tools/define-tool';
import { z } from 'zod';

const logger = createLogger({ prefix: 'mcp-client' });

/** Shape of an MCP tool definition from server */
interface MCPToolDefinition {
  name: string;
  description?: string;
  inputSchema?: unknown;
}

/** Shape of MCP tool call response content */
interface MCPToolResponseContent {
  text?: string;
}

/** Shape of MCP tool call response */
interface MCPToolResponse {
  content?: MCPToolResponseContent[];
}

/** Shape of MCP tools list response */
interface MCPToolsListResponse {
  tools?: MCPToolDefinition[];
}

/** MCP client request method signature */
interface MCPClientRequestMethod {
  request: (request: { method: string; params?: unknown }, schema: object) => Promise<unknown>;
}

/** MCP client connect method signature */
interface MCPClientConnectMethod {
  connect: (transport: unknown) => Promise<void>;
}

/** MCP client close method signature */
interface MCPClientCloseMethod {
  close: () => Promise<void>;
}

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
   * Convert one MCP tool to AI SDK Tool (via defineTool -> .tool)
   */
  function convertMCPTool(mcpTool: MCPToolDefinition): { name: string; tool: MCPTool } {
    const named = defineTool({
      name: mcpTool.name,
      description: mcpTool.description ?? '',
      input: z.record(z.string(), z.unknown()),
      handler: async (input: Record<string, unknown>): Promise<unknown> => {
        if (!client) throw new MCPError('Client not connected');
        return callMCPTool(mcpTool.name, input);
      },
    });
    return { name: named.name, tool: named.tool };
  }

  /**
   * Call a tool on the MCP server
   */
  async function callMCPTool(name: string, toolArgs: Record<string, unknown>): Promise<unknown> {
    if (!client) {
      throw new MCPError('Client not connected');
    }

    const mcpClient = client as MCPClientRequestMethod;

    const response = await mcpClient.request(
      {
        method: 'tools/call',
        params: {
          name,
          arguments: toolArgs,
        },
      },
      {}
    );

    const result = response as MCPToolResponse;
    const textContent = result.content?.[0]?.text;
    if (textContent) {
      try {
        return JSON.parse(textContent) as unknown;
      } catch {
        return textContent;
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

        const mcpClient = client as MCPClientConnectMethod;
        await mcpClient.connect(transport);

        logger.info('Connected to MCP server');
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (err.message.includes('Cannot find module')) {
          throw new MCPError(
            'Failed to load @modelcontextprotocol/sdk. Please install it: npm install @modelcontextprotocol/sdk',
            err
          );
        }
        throw new MCPError(`Failed to connect: ${err.message}`, err);
      }
    },

    async disconnect(): Promise<void> {
      if (client) {
        const mcpClient = client as MCPClientCloseMethod;
        await mcpClient.close();
        logger.info('Disconnected from MCP server');
        client = null;
        transport = null;
      }
    },

    async getTools(): Promise<Record<string, MCPTool>> {
      if (!client) {
        throw new MCPError('Client not connected');
      }

      const mcpClient = client as MCPClientRequestMethod;
      const response = await mcpClient.request({ method: 'tools/list' }, {});
      const result = response as MCPToolsListResponse;

      if (!result.tools) {
        return {};
      }

      const record: Record<string, MCPTool> = {};
      for (const mcpTool of result.tools) {
        const { name, tool } = convertMCPTool(mcpTool);
        record[name] = tool;
      }
      return record;
    },

    async callTool(name: string, toolArgs: Record<string, unknown>): Promise<unknown> {
      return callMCPTool(name, toolArgs);
    },
  };
}
