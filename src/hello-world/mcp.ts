/**
 * Hello World MCP server - exposes the hello world tool via MCP
 */

import type { MCPServer } from '../types/mcp';
import { createMCPServer } from '../mcp/server';
import { helloWorldTool } from './tool';

export function createHelloWorldMCPServer(): MCPServer {
  return createMCPServer({
    name: 'hello-world',
    version: '1.0.0',
    tools: { hello_world: helloWorldTool },
    description: 'Hello World MCP server',
  });
}
