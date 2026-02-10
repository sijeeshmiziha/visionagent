/**
 * Example 05: MCP Server Demo
 *
 * Run with: npm run example:05
 *
 * Demonstrates creating an MCP server with tools.
 * This server can be used with MCP-compatible clients.
 */

import { createMCPServer, createToolSet, defineTool } from '../src/index';
import { z } from 'zod';

const weatherTool = defineTool({
  name: 'get_weather',
  description: 'Get current weather for a city',
  input: z.object({
    city: z.string().describe('The city name'),
  }),
  handler: async ({ city }) => {
    // Mock weather data
    const mockWeather: Record<string, { temp: number; condition: string }> = {
      'New York': { temp: 72, condition: 'Sunny' },
      London: { temp: 58, condition: 'Cloudy' },
      Tokyo: { temp: 68, condition: 'Partly Cloudy' },
      Sydney: { temp: 75, condition: 'Clear' },
    };

    const weather = mockWeather[city] || { temp: 65, condition: 'Unknown' };
    return { city, ...weather };
  },
});

const calculatorTool = defineTool({
  name: 'calculate',
  description: 'Perform mathematical calculations',
  input: z.object({
    expression: z.string().describe('Mathematical expression to evaluate'),
  }),
  handler: async ({ expression }) => {
    try {
      // Simple and safe math eval (only basic operations)
      const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
      const result = eval(sanitized);
      return { expression, result };
    } catch {
      return { expression, error: 'Invalid expression' };
    }
  },
});

async function main() {
  console.log('Starting MCP server demo...\n');

  const server = createMCPServer({
    name: 'demo-tools',
    version: '1.0.0',
    tools: createToolSet([weatherTool, calculatorTool]),
    description: 'Demo MCP server with weather and calculator tools',
  });

  console.log('Server configuration:');
  console.log('  Name:', server.name);
  console.log('  Version:', server.version);
  console.log('  Tools:', Object.keys(server.tools).join(', '));
  console.log('  Transport: stdio');

  console.log('\nTo use this server with an MCP client:');
  console.log('1. Configure your MCP client to connect via stdio');
  console.log('2. Point it to: npx tsx examples/05-mcp-server.ts');
  console.log('\nStarting server on stdio...');

  // Start the server
  await server.start('stdio');

  console.log('✓ Server started on stdio');
  console.log('\nPress Ctrl+C to stop');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    void server.stop().then(() => process.exit(0));
  });
}

main().catch(console.error);
