/**
 * MCP client types - transport, config, and response shapes
 * for the Model Context Protocol client infrastructure.
 */

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

/** Minimal transport interface matching the MCP SDK's transport contract. */
export interface McpTransport {
  start(): Promise<void>;
  close(): Promise<void>;
  send(message: unknown): Promise<void>;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** How to connect to an MCP server. Exactly one of (url) or (command) must be set. */
export interface McpClientConfig {
  /** Streamable HTTP endpoint for the MCP server. */
  url?: string;

  /** Custom headers to send with HTTP requests (e.g. auth headers). */
  headers?: Record<string, string>;

  /** For stdio transport: command to spawn (e.g. "npx"). */
  command?: string;

  /** For stdio transport: arguments for the command. */
  args?: string[];
}

/** Identity advertised to the MCP server during the handshake. */
export interface McpClientInfo {
  name: string;
  version: string;
}

// ---------------------------------------------------------------------------
// MCP response helpers
// ---------------------------------------------------------------------------

/** A single content block returned by an MCP tool call. */
export interface McpToolContent {
  type: string;
  text?: string;
}

// ---------------------------------------------------------------------------
// Resolved config (internal)
// ---------------------------------------------------------------------------

/**
 * Options for `resolveConfig` that describe which env-var prefix to read
 * and what error message to show when no config is found.
 */
export interface McpResolveOptions {
  /**
   * Env-var prefix. Given "STITCH_MCP" the helper reads:
   *   STITCH_MCP_URL, STITCH_MCP_API_KEY, STITCH_MCP_COMMAND, STITCH_MCP_ARGS
   */
  envPrefix: string;

  /** Human-readable server name used in error messages (e.g. "Stitch"). */
  serverLabel?: string;

  /**
   * Header name for the API key read from env (<PREFIX>_API_KEY).
   * Defaults to "Authorization" (value sent as "Bearer <key>").
   */
  apiKeyHeader?: string;
}
