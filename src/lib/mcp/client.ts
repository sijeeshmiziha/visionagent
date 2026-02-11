/**
 * BaseMcpClient - reusable MCP client with lazy connection,
 * transport resolution, and typed tool invocation.
 *
 * Modules extend this class and add domain-specific methods:
 *
 * ```ts
 * class StitchClient extends BaseMcpClient {
 *   constructor(opts?: McpClientConfig) {
 *     super(
 *       { name: 'visionagent-stitch', version: '1.0.0' },
 *       BaseMcpClient.resolveConfig(opts, { envPrefix: 'STITCH_MCP', serverLabel: 'Stitch' }),
 *     );
 *   }
 *   async createProject(title?: string) {
 *     return this.callTool<Project>('create_project', { title });
 *   }
 * }
 * ```
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client';
import { ToolError } from '../utils/errors';
import type {
  McpClientConfig,
  McpClientInfo,
  McpToolContent,
  McpTransport,
  McpResolveOptions,
} from './types';

// ---------------------------------------------------------------------------
// SDK path resolution (done once at module load)
// ---------------------------------------------------------------------------

const require = createRequire(import.meta.url);
const sdkClientEntry = require.resolve('@modelcontextprotocol/sdk/client');
const sdkRoot = path.dirname(path.dirname(path.dirname(path.dirname(sdkClientEntry))));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse the first text content block of an MCP tool result into JSON or a wrapper object. */
function parseToolResult(result: { content?: McpToolContent[] }): unknown {
  const content = result.content;
  if (!content?.length) return {};

  const first = content[0];
  if (first?.type === 'text' && typeof first.text === 'string') {
    const text = first.text.trim();
    if (text.startsWith('{') || text.startsWith('[')) {
      try {
        return JSON.parse(text) as unknown;
      } catch {
        return { raw: text };
      }
    }
    return { text };
  }

  return result;
}

// ---------------------------------------------------------------------------
// BaseMcpClient
// ---------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Static config resolver
  // -------------------------------------------------------------------------

  /**
   * Build an `McpClientConfig` from explicit options merged with env vars.
   *
   * Reads `<PREFIX>_URL`, `<PREFIX>_API_KEY`, `<PREFIX>_COMMAND`, `<PREFIX>_ARGS`
   * from `process.env` using the given `envPrefix`. When an API key is present,
   * it is added to `headers` using `resolveOpts.apiKeyHeader` (default
   * "Authorization" with value "Bearer <key>").
   *
   * Throws a descriptive `ToolError` when neither URL nor command is available.
   */
  static resolveConfig(
    options?: McpClientConfig,
    resolveOpts: McpResolveOptions = { envPrefix: 'MCP' }
  ): McpClientConfig {
    const { envPrefix, serverLabel, apiKeyHeader } = resolveOpts;
    const label = serverLabel ?? envPrefix;

    const url = options?.url ?? process.env[`${envPrefix}_URL`];
    const apiKey = process.env[`${envPrefix}_API_KEY`];
    const command = options?.command ?? process.env[`${envPrefix}_COMMAND`];
    const argsEnv = process.env[`${envPrefix}_ARGS`];
    const args = options?.args ?? (argsEnv ? argsEnv.split(',').map(a => a.trim()) : undefined);

    let headers = options?.headers ? { ...options.headers } : undefined;
    if (apiKey) {
      const name = apiKeyHeader ?? 'Authorization';
      const value = name === 'Authorization' ? `Bearer ${apiKey}` : apiKey;
      headers = headers ?? {};
      headers[name] = value;
    }

    if (url) {
      return { url, headers };
    }

    if (command) {
      return { command, args: args?.length ? args : [] };
    }

    throw new ToolError(
      `${label} uses MCP only. Set ${envPrefix}_URL for Streamable HTTP, ` +
        `or ${envPrefix}_COMMAND (and optionally ${envPrefix}_ARGS) for stdio.`,
      'mcp_client'
    );
  }

  // -------------------------------------------------------------------------
  // Connection lifecycle
  // -------------------------------------------------------------------------

  /** Lazy-connect: returns the live `Client` instance, connecting on first call. */
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

  /** Perform the actual connect sequence (Streamable HTTP or stdio). */
  private async doConnect(): Promise<void> {
    const client = new Client(
      { name: this.info.name, version: this.info.version },
      { capabilities: {} }
    );

    if (this.config.url) {
      this.transport = await this.createHttpTransport(this.config.url);
    } else if (this.config.command) {
      this.transport = await this.createStdioTransport(this.config.command, this.config.args ?? []);
    } else {
      throw new ToolError('MCP config missing: provide a url or command.', 'mcp_client');
    }

    await client.connect(this.transport as Parameters<Client['connect']>[0]);
    this.client = client;
  }

  /** Build a StreamableHTTPClientTransport from the SDK. */
  private async createHttpTransport(url: string): Promise<McpTransport> {
    const modPath = path.join(sdkRoot, 'dist', 'esm', 'client', 'streamableHttp.js');
    const mod = (await import(pathToFileURL(modPath).href)) as {
      StreamableHTTPClientTransport: new (
        url: URL,
        opts?: { requestInit?: RequestInit }
      ) => McpTransport;
    };

    const requestInit: RequestInit | undefined = this.config.headers
      ? { headers: new Headers(this.config.headers) }
      : undefined;

    return new mod.StreamableHTTPClientTransport(
      new URL(url),
      requestInit ? { requestInit } : undefined
    );
  }

  /** Build a StdioClientTransport from the SDK. */
  private async createStdioTransport(command: string, args: string[]): Promise<McpTransport> {
    const modPath = path.join(sdkRoot, 'dist', 'esm', 'client', 'stdio.js');
    const mod = (await import(pathToFileURL(modPath).href)) as {
      StdioClientTransport: new (params: { command: string; args: string[] }) => McpTransport;
    };

    return new mod.StdioClientTransport({ command, args });
  }

  // -------------------------------------------------------------------------
  // Tool invocation
  // -------------------------------------------------------------------------

  /**
   * Call a tool on the MCP server and parse the result.
   *
   * Subclasses use this to build typed domain methods:
   * ```ts
   * async listProjects() {
   *   return this.callTool<ListProjectsResponse>('list_projects');
   * }
   * ```
   */
  protected async callTool<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
    const client = await this.ensureConnected();
    const result = await client.callTool({ name, arguments: args });

    if (result && typeof result === 'object' && 'content' in result) {
      return parseToolResult(result as { content?: McpToolContent[] }) as T;
    }
    return result as T;
  }

  // -------------------------------------------------------------------------
  // Teardown
  // -------------------------------------------------------------------------

  /** Disconnect from the MCP server and release resources. */
  async close(): Promise<void> {
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
    this.client = null;
    this.connectPromise = null;
  }
}
