import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  external: ['ai', '@ai-sdk/openai', '@ai-sdk/anthropic', '@ai-sdk/google'],
});
