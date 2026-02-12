/**
 * Tests for MCP: parseToolResult and BaseMcpClient.resolveConfig
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseToolResult } from '../../src/lib/mcp/transports';
import { BaseMcpClient } from '../../src/lib/mcp/client';

describe('parseToolResult', () => {
  it('should parse JSON object content', () => {
    const result = parseToolResult({
      content: [{ type: 'text', text: '{"a":1,"b":"x"}' }],
    });
    expect(result).toEqual({ a: 1, b: 'x' });
  });

  it('should parse JSON array content', () => {
    const result = parseToolResult({
      content: [{ type: 'text', text: '[1,2,3]' }],
    });
    expect(result).toEqual([1, 2, 3]);
  });

  it('should return { text } for non-JSON text', () => {
    const result = parseToolResult({
      content: [{ type: 'text', text: 'plain text output' }],
    });
    expect(result).toEqual({ text: 'plain text output' });
  });

  it('should return { raw } for invalid JSON text', () => {
    const result = parseToolResult({
      content: [{ type: 'text', text: '{ invalid json' }],
    });
    expect(result).toEqual({ raw: '{ invalid json' });
  });

  it('should return {} for empty content array', () => {
    const result = parseToolResult({ content: [] });
    expect(result).toEqual({});
  });

  it('should return {} for undefined content', () => {
    const result = parseToolResult({});
    expect(result).toEqual({});
  });

  it('should return raw result for non-text content type', () => {
    const result = parseToolResult({
      content: [{ type: 'image', image: 'base64data' }] as unknown as {
        type: string;
        text?: string;
      }[],
    });
    expect(result).toEqual({
      content: [{ type: 'image', image: 'base64data' }],
    });
  });

  it('should trim whitespace before parsing', () => {
    const result = parseToolResult({
      content: [{ type: 'text', text: '  {"x":1}  ' }],
    });
    expect(result).toEqual({ x: 1 });
  });
});

describe('BaseMcpClient.resolveConfig', () => {
  const envVars = ['MCP_URL', 'MCP_API_KEY', 'MCP_COMMAND', 'MCP_ARGS'] as const;

  beforeEach(() => {
    envVars.forEach(k => vi.stubEnv(k, undefined));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should use URL from env when options not provided', () => {
    vi.stubEnv('MCP_URL', 'https://mcp.example.com');
    const config = BaseMcpClient.resolveConfig(undefined, { envPrefix: 'MCP' });
    expect(config.url).toBe('https://mcp.example.com');
  });

  it('should use command from env when URL not set', () => {
    vi.stubEnv('MCP_COMMAND', 'npx');
    vi.stubEnv('MCP_ARGS', 'mcp-server');
    const config = BaseMcpClient.resolveConfig(undefined, { envPrefix: 'MCP' });
    expect(config.command).toBe('npx');
    expect(config.args).toEqual(['mcp-server']);
  });

  it('should add Authorization Bearer header when API key in env', () => {
    vi.stubEnv('MCP_URL', 'https://mcp.example.com');
    vi.stubEnv('MCP_API_KEY', 'secret-key');
    const config = BaseMcpClient.resolveConfig(undefined, { envPrefix: 'MCP' });
    expect(config.headers).toEqual({ Authorization: 'Bearer secret-key' });
  });

  it('should use custom API key header when apiKeyHeader set', () => {
    vi.stubEnv('STITCH_URL', 'https://stitch.com');
    vi.stubEnv('STITCH_API_KEY', 'stitch-key');
    const config = BaseMcpClient.resolveConfig(undefined, {
      envPrefix: 'STITCH',
      apiKeyHeader: 'X-API-Key',
    });
    expect(config.headers).toEqual({ 'X-API-Key': 'stitch-key' });
  });

  it('should throw when no URL or command', () => {
    expect(() => BaseMcpClient.resolveConfig(undefined, { envPrefix: 'MCP' })).toThrow(
      'MCP uses MCP only'
    );
    expect(() => BaseMcpClient.resolveConfig(undefined, { envPrefix: 'MCP' })).toThrow('MCP_URL');
    expect(() => BaseMcpClient.resolveConfig(undefined, { envPrefix: 'MCP' })).toThrow(
      'MCP_COMMAND'
    );
  });

  it('should use explicit options over env', () => {
    vi.stubEnv('MCP_URL', 'https://env-url.com');
    const config = BaseMcpClient.resolveConfig(
      { url: 'https://option-url.com' },
      { envPrefix: 'MCP' }
    );
    expect(config.url).toBe('https://option-url.com');
  });

  it('should parse ARGS env as comma-separated and trim', () => {
    vi.stubEnv('MCP_COMMAND', 'node');
    vi.stubEnv('MCP_ARGS', ' server , --port=3000 ');
    const config = BaseMcpClient.resolveConfig(undefined, { envPrefix: 'MCP' });
    expect(config.command).toBe('node');
    expect(config.args).toEqual(['server', '--port=3000']);
  });
});
