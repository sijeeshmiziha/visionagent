/**
 * MCP SDK transport creation and result parsing. Isolates SDK path and dynamic imports.
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { McpTransport, McpToolContent } from './types';

function getSdkRoot(): string {
  const require = createRequire(import.meta.url);
  const entry = require.resolve('@modelcontextprotocol/sdk/client');
  return path.dirname(path.dirname(path.dirname(path.dirname(entry))));
}

const sdkRoot = getSdkRoot();

/** Parse first text content block of an MCP tool result to JSON or { text } / { raw }. */
export function parseToolResult(result: { content?: McpToolContent[] }): unknown {
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

/** Build StreamableHTTPClientTransport from the MCP SDK. */
export async function createHttpTransport(
  url: string,
  headers?: Record<string, string>
): Promise<McpTransport> {
  const modPath = path.join(sdkRoot, 'dist', 'esm', 'client', 'streamableHttp.js');
  const mod = (await import(pathToFileURL(modPath).href)) as {
    StreamableHTTPClientTransport: new (
      url: URL,
      opts?: { requestInit?: RequestInit }
    ) => McpTransport;
  };
  const requestInit: RequestInit | undefined = headers
    ? { headers: new Headers(headers) }
    : undefined;
  return new mod.StreamableHTTPClientTransport(
    new URL(url),
    requestInit ? { requestInit } : undefined
  );
}

/** Build StdioClientTransport from the MCP SDK. */
export async function createStdioTransport(command: string, args: string[]): Promise<McpTransport> {
  const modPath = path.join(sdkRoot, 'dist', 'esm', 'client', 'stdio.js');
  const mod = (await import(pathToFileURL(modPath).href)) as {
    StdioClientTransport: new (params: { command: string; args: string[] }) => McpTransport;
  };
  return new mod.StdioClientTransport({ command, args });
}
