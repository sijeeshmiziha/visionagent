/**
 * MCP (Model Context Protocol) types
 */

import type { Tool } from './tool';

/**
 * Transport type for MCP server
 */
export type MCPTransport = 'stdio' | 'sse' | 'http';

/**
 * Configuration for creating an MCP server
 */
export interface MCPServerConfig {
  /** Server name */
  name: string;
  /** Server version */
  version: string;
  /** Tools to expose via MCP (Record<string, Tool>) */
  tools: Record<string, Tool>;
  /** Optional description */
  description?: string;
}

/**
 * Options for starting an MCP server
 */
export interface MCPServerStartOptions {
  /** Port for HTTP/SSE transport */
  port?: number;
  /** Host for HTTP/SSE transport */
  host?: string;
}

/**
 * MCP Server instance
 */
export interface MCPServer {
  /** Server name */
  name: string;
  /** Server version */
  version: string;
  /** Tools exposed by the server */
  tools: Record<string, Tool>;
  /** Start the server with the specified transport */
  start(transport: MCPTransport, options?: MCPServerStartOptions): Promise<void>;
  /** Stop the server */
  stop(): Promise<void>;
}

/**
 * Configuration for MCP client connection
 */
export interface MCPClientConfig {
  /** Transport type */
  transport: MCPTransport;
  /** Command to run (for stdio) */
  command?: string;
  /** Arguments for the command */
  args?: string[];
  /** URL for HTTP/SSE transport */
  url?: string;
}

/**
 * MCP Client instance
 */
export interface MCPClient {
  /** Connect to the MCP server */
  connect(): Promise<void>;
  /** Disconnect from the server */
  disconnect(): Promise<void>;
  /** Get available tools from the server (Record<string, Tool>) */
  getTools(): Promise<Record<string, Tool>>;
  /** Call a tool on the server */
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
}
