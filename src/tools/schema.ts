/**
 * Convert Zod schemas to JSON Schema
 */

import type { z } from 'zod';
import type { JsonSchema } from '../types/tool';

/**
 * Convert a Zod schema to JSON Schema
 *
 * Uses zod-to-json-schema under the hood
 */
// Import at top level for ESM compatibility
import { zodToJsonSchema as zodToJsonSchemaLib } from 'zod-to-json-schema';

export function zodToJsonSchema(schema: z.ZodType, _name?: string): JsonSchema {
  const result = zodToJsonSchemaLib(schema, {
    $refStrategy: 'none',
  });

  // Remove $schema and definitions if present
  const {
    $schema: _schema,
    definitions: _definitions,
    ...jsonSchema
  } = result as JsonSchema & {
    $schema?: string;
    definitions?: unknown;
  };

  return jsonSchema as JsonSchema;
}

