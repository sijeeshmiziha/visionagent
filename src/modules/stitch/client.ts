/**
 * Stitch MCP client - uses the Stitch MCP server (no REST API URL).
 * Configure via STITCH_MCP_URL (Streamable HTTP) or STITCH_MCP_COMMAND + STITCH_MCP_ARGS (stdio).
 * See: https://stitch.withgoogle.com/docs/mcp/setup
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client';
import { ToolError } from '../../lib/utils/errors';
import type {
  StitchProject,
  StitchScreen,
  CreateProjectResponse,
  ListProjectsResponse,
  ListScreensResponse,
  GenerateScreenResponse,
  EditScreensResponse,
  GenerateVariantsResponse,
  VariantOptions,
} from './types';
import type { DeviceType, ModelId } from './types';

export interface StitchMcpConfig {
  url?: string;
  /** When using Streamable HTTP (url): API key sent as X-Goog-Api-Key header. */
  apiKey?: string;
  command?: string;
  args?: string[];
}

const require = createRequire(import.meta.url);
// Resolve package root from @modelcontextprotocol/sdk/client (dist/cjs/client/index.js) -> 4 dirnames = sdk root
const sdkClientEntry = require.resolve('@modelcontextprotocol/sdk/client');
const sdkRoot = path.dirname(path.dirname(path.dirname(path.dirname(sdkClientEntry))));

interface McpToolContent {
  type: string;
  text?: string;
}

function getMcpConfig(options?: StitchMcpConfig): StitchMcpConfig {
  const url = options?.url ?? process.env.STITCH_MCP_URL;
  const apiKey = options?.apiKey ?? process.env.STITCH_MCP_API_KEY;
  const command = options?.command ?? process.env.STITCH_MCP_COMMAND;
  const argsEnv = process.env.STITCH_MCP_ARGS;
  const args = options?.args ?? (argsEnv ? argsEnv.split(',').map(a => a.trim()) : undefined);
  if (url) return { url, apiKey: apiKey ?? undefined };
  if (command) return { command, args: args?.length ? args : [] };
  throw new ToolError(
    'Stitch uses MCP only (no API URL). Set STITCH_MCP_URL for Streamable HTTP, or STITCH_MCP_COMMAND and optionally STITCH_MCP_ARGS for stdio. See https://stitch.withgoogle.com/docs/mcp/setup',
    'stitch_client'
  );
}

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

interface McpTransport {
  start(): Promise<void>;
  close(): Promise<void>;
  send(message: unknown): Promise<void>;
}

/**
 * Client for Stitch via MCP. Connects to the Stitch MCP server using the configured transport.
 */
export class StitchClient {
  private readonly config: StitchMcpConfig;
  private client: Client | null = null;
  private transport: McpTransport | null = null;
  private connectPromise: Promise<void> | null = null;

  constructor(options?: StitchMcpConfig) {
    this.config = getMcpConfig(options);
  }

  private async ensureConnected(): Promise<Client> {
    if (this.client) return this.client;
    if (this.connectPromise) {
      await this.connectPromise;
      const c = this.client;
      if (!c) throw new ToolError('Stitch MCP connection failed.', 'stitch_client');
      return c;
    }
    this.connectPromise = this.doConnect();
    await this.connectPromise;
    this.connectPromise = null;
    const c = this.client;
    if (!c) throw new ToolError('Stitch MCP connection failed.', 'stitch_client');
    return c;
  }

  private async doConnect(): Promise<void> {
    const client = new Client(
      { name: 'visionagent-stitch', version: '1.0.0' },
      { capabilities: {} }
    );
    if (this.config.url) {
      const streamableHttpPath = path.join(sdkRoot, 'dist', 'esm', 'client', 'streamableHttp.js');
      const mod = (await import(pathToFileURL(streamableHttpPath).href)) as {
        StreamableHTTPClientTransport: new (
          url: URL,
          opts?: { requestInit?: RequestInit }
        ) => McpTransport;
      };
      const requestInit: RequestInit | undefined = this.config.apiKey
        ? {
            headers: new Headers({ 'X-Goog-Api-Key': this.config.apiKey }),
          }
        : undefined;
      this.transport = new mod.StreamableHTTPClientTransport(
        new URL(this.config.url),
        requestInit ? { requestInit } : undefined
      );
    } else if (this.config.command) {
      const stdioPath = path.join(sdkRoot, 'dist', 'esm', 'client', 'stdio.js');
      const mod = (await import(pathToFileURL(stdioPath).href)) as {
        StdioClientTransport: new (params: { command: string; args: string[] }) => McpTransport;
      };
      this.transport = new mod.StdioClientTransport({
        command: this.config.command,
        args: this.config.args ?? [],
      });
    } else {
      throw new ToolError(
        'Stitch MCP config missing: set STITCH_MCP_URL or STITCH_MCP_COMMAND.',
        'stitch_client'
      );
    }
    await client.connect(this.transport as Parameters<Client['connect']>[0]);
    this.client = client;
  }

  private async callTool<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
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

  async createProject(title?: string): Promise<CreateProjectResponse & StitchProject> {
    const out = await this.callTool<CreateProjectResponse & StitchProject>('create_project', {
      title: title ?? undefined,
    });
    return out ?? ({} as CreateProjectResponse & StitchProject);
  }

  async getProject(name: string): Promise<StitchProject> {
    const out = await this.callTool<StitchProject>('get_project', { name });
    return out ?? ({} as StitchProject);
  }

  async listProjects(filter?: string): Promise<ListProjectsResponse> {
    const out = await this.callTool<ListProjectsResponse>('list_projects', {
      filter: filter ?? undefined,
    });
    return out ?? { projects: [] };
  }

  async listScreens(projectId: string): Promise<ListScreensResponse> {
    const out = await this.callTool<ListScreensResponse>('list_screens', { projectId });
    return out ?? { screens: [] };
  }

  async getScreen(name: string): Promise<StitchScreen> {
    const out = await this.callTool<StitchScreen>('get_screen', { name });
    return out ?? ({} as StitchScreen);
  }

  async generateScreenFromText(
    projectId: string,
    prompt: string,
    opts?: { deviceType?: DeviceType; modelId?: ModelId }
  ): Promise<GenerateScreenResponse> {
    const out = await this.callTool<GenerateScreenResponse>('generate_screen_from_text', {
      projectId,
      prompt,
      deviceType: opts?.deviceType ?? 'DEVICE_TYPE_UNSPECIFIED',
      modelId: opts?.modelId ?? 'MODEL_ID_UNSPECIFIED',
    });
    return out ?? {};
  }

  async editScreens(
    projectId: string,
    selectedScreenIds: string[],
    prompt: string,
    opts?: { deviceType?: DeviceType; modelId?: ModelId }
  ): Promise<EditScreensResponse> {
    const out = await this.callTool<EditScreensResponse>('edit_screens', {
      projectId,
      selectedScreenIds,
      prompt,
      deviceType: opts?.deviceType ?? 'DEVICE_TYPE_UNSPECIFIED',
      modelId: opts?.modelId ?? 'MODEL_ID_UNSPECIFIED',
    });
    return out ?? { screens: [] };
  }

  async generateVariants(
    projectId: string,
    selectedScreenIds: string[],
    prompt: string,
    variantOptions: VariantOptions,
    opts?: { deviceType?: DeviceType; modelId?: ModelId }
  ): Promise<GenerateVariantsResponse> {
    const out = await this.callTool<GenerateVariantsResponse>('generate_variants', {
      projectId,
      selectedScreenIds,
      prompt,
      variantOptions: {
        variantCount: variantOptions.variantCount ?? 3,
        creativeRange: variantOptions.creativeRange ?? 'EXPLORE',
        aspects: variantOptions.aspects ?? [],
      },
      deviceType: opts?.deviceType ?? 'DEVICE_TYPE_UNSPECIFIED',
      modelId: opts?.modelId ?? 'MODEL_ID_UNSPECIFIED',
    });
    return out ?? { screens: [] };
  }
}
