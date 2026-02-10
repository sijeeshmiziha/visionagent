/**
 * Example 07: Hello World MCP Server
 *
 * Run with: npm run example:07
 *
 * MCP server from the hello-world module (exposes hello_world tool over stdio).
 */

import { createHelloWorldMCPServer } from '../src/hello-world';

async function main() {
  console.log('Starting Hello World MCP server...\n');

  const server = createHelloWorldMCPServer();

  console.log('Server configuration:');
  console.log('  Name:', server.name);
  console.log('  Version:', server.version);
  console.log('  Tools:', server.tools.map(t => t.name).join(', '));
  console.log('  Transport: stdio');

  console.log('\nTo use this server with an MCP client:');
  console.log('1. Configure your MCP client to connect via stdio');
  console.log('2. Point it to: npx tsx examples/07-hello-world-mcp.ts');
  console.log('\nStarting server on stdio...');

  await server.start('stdio');

  console.log('✓ Server started on stdio');
  console.log('\nPress Ctrl+C to stop');

  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    void server.stop().then(() => process.exit(0));
  });
}

main().catch(console.error);
