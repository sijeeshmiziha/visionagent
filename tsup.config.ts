import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  external: [
    '@langchain/openai',
    '@langchain/anthropic',
    '@langchain/google-genai',
    '@modelcontextprotocol/sdk',
  ],
});
