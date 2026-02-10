/**
 * Convert Zod schemas to JSON Schema (Zod 4 native)
 */

import { z } from 'zod';

/** JSON Schema shape for MCP / tool parameters */
export type JsonSchemaObject = Record<string, unknown>;

/**
 * Convert a Zod schema to JSON Schema
 *
 * Uses Zod 4 native z.toJSONSchema()
 */
export function zodToJsonSchema(schema: z.ZodType, _name?: string): JsonSchemaObject {
  const result = z.toJSONSchema(schema) as JsonSchemaObject & {
    $schema?: string;
    definitions?: unknown;
  };

  const { $schema: _schema, definitions: _definitions, ...jsonSchema } = result;

  return jsonSchema as JsonSchemaObject;
}
