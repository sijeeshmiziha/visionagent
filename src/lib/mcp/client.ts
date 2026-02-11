/**
 * BaseMcpClient - reusable MCP client with lazy connection and typed tool invocation.
 * Extend and add domain methods that call this.callTool(name, args).
 */

import { Client } from '@modelcontextprotocol/sdk/client';
import { ToolError } from '../utils/errors';
import { createHttpTransport, createStdioTransport, parseToolResult } from './transports';
import type {
  McpClientConfig,
  McpClientInfo,
  McpToolContent,
  McpTransport,
  McpResolveOptions,
} from './types';

export class BaseMcpClient {
  private readonly info: McpClientInfo;
  private readonly config: McpClientConfig;
  private client: Client | null = null;
  private transport: McpTransport | null = null;
  private connectPromise: Promise<void> | null = null;

  constructor(info: McpClientInfo, config: McpClientConfig) {
    this.info = info;
    this.config = config;
  }

  /** Build config from options + env (<PREFIX>_URL, _API_KEY, _COMMAND, _ARGS). */
  static resolveConfig(
    options?: McpClientConfig,
    resolveOpts: McpResolveOptions = { envPrefix: 'MCP' }
  ): McpClientConfig {
    const { envPrefix, serverLabel, apiKeyHeader } = resolveOpts;
    const url = options?.url ?? process.env[`${envPrefix}_URL`];
    const apiKey = process.env[`${envPrefix}_API_KEY`];
    const command = options?.command ?? process.env[`${envPrefix}_COMMAND`];
    const argsEnv = process.env[`${envPrefix}_ARGS`];
    const args = options?.args ?? (argsEnv ? argsEnv.split(',').map(a => a.trim()) : undefined);

    let headers = options?.headers ? { ...options.headers } : undefined;
    if (apiKey) {
      const name = apiKeyHeader ?? 'Authorization';

      headers = headers ?? {};

      headers[name] = name === 'Authorization' ? `Bearer ${apiKey}` : apiKey;
    }

    if (url) return { url, headers };
    if (command) return { command, args: args?.length ? args : [] };
    throw new ToolError(
      `${serverLabel ?? envPrefix} uses MCP only. Set ${envPrefix}_URL or ${envPrefix}_COMMAND (and optionally ${envPrefix}_ARGS).`,
      'mcp_client'
    );
  }

  private async ensureConnected(): Promise<Client> {
    if (this.client) return this.client;
    if (this.connectPromise) {
      await this.connectPromise;
      if (!this.client) throw new ToolError('MCP connection failed.', 'mcp_client');
      return this.client;
    }
    this.connectPromise = this.doConnect();
    await this.connectPromise;
    this.connectPromise = null;
    if (!this.client) throw new ToolError('MCP connection failed.', 'mcp_client');
    return this.client;
  }

  private async doConnect(): Promise<void> {
    const client = new Client(
      { name: this.info.name, version: this.info.version },
      { capabilities: {} }
    );
    if (this.config.url) {
      this.transport = await createHttpTransport(this.config.url, this.config.headers);
    } else if (this.config.command) {
      this.transport = await createStdioTransport(this.config.command, this.config.args ?? []);
    } else {
      throw new ToolError('MCP config missing: provide url or command.', 'mcp_client');
    }
    await client.connect(this.transport as Parameters<Client['connect']>[0]);
    this.client = client;
  }

  /** Call MCP tool and parse result. Subclasses use this for typed domain methods. */
  protected async callTool<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
    const client = await this.ensureConnected();
    const result = await client.callTool({ name, arguments: args });
    if (result && typeof result === 'object' && 'content' in result) {
      return parseToolResult(result as { content?: McpToolContent[] }) as T;
    }
    return result as T;
  }

  async close(): Promise<void> {
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
    this.client = null;
    this.connectPromise = null;
  }
}
