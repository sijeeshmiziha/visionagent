/**
 * Convert Zod schemas to JSON Schema
 */

import type { z } from 'zod';
// Import at top level for ESM compatibility
import { zodToJsonSchema as zodToJsonSchemaLib } from 'zod-to-json-schema';

/** JSON Schema shape for MCP / tool parameters */
export type JsonSchemaObject = Record<string, unknown>;

/**
 * Convert a Zod schema to JSON Schema
 *
 * Uses zod-to-json-schema under the hood
 */
export function zodToJsonSchema(schema: z.ZodType, _name?: string): JsonSchemaObject {
  const result = zodToJsonSchemaLib(schema, {
    $refStrategy: 'none',
  });

  const {
    $schema: _schema,
    definitions: _definitions,
    ...jsonSchema
  } = result as JsonSchemaObject & { $schema?: string; definitions?: unknown };

  return jsonSchema as JsonSchemaObject;
}
