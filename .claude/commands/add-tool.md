# Add New Tool

Scaffold and implement a new tool for VisionAgent.

## Arguments

$ARGUMENTS
(Format: "<module> <tool-name> <description>" e.g., "figma get-variables Retrieves all variables from a Figma file")

## Steps

### 1. Parse Arguments

Extract:

- `module`: `figma` | `stitch` | (new module name)
- `tool-name`: kebab-case name
- `description`: what this tool does

### 2. Read Existing Tool for Pattern

Read one existing tool from `src/modules/<module>/tools/` to understand the exact pattern used.

### 3. Create Tool File

Create `src/modules/<module>/tools/<tool-name>.ts`:

```typescript
import { z } from 'zod';
import type { ToolConfig } from '@/lib/types';

const <ToolName>InputSchema = z.object({
  // Define input parameters with .describe() on each field
});

export const <toolCamelCase>Tool: ToolConfig<typeof <ToolName>InputSchema> = {
  name: '<tool-name>',
  description: '<description>',
  input: <ToolName>InputSchema,
  handler: async (input) => {
    // Implementation
  },
};
```

### 4. Export the Tool

- Add to `src/modules/<module>/tools/index.ts`
- Add to `src/modules/<module>/index.ts`
- Add to `src/index.ts`

### 5. Write Tests

Create `tests/tools/<tool-name>.test.ts`:

- Test happy path with MSW mock
- Test error handling (API errors, invalid input)
- Test input validation (Zod schema)

Run: `npm test`

### 6. Add Example

Create `examples/<module>/<tool-name>.ts`:

```typescript
import { createModel, <toolCamelCase>Tool, runAgent } from 'visionagent';

// Minimal working example
```

Register in `examples/lib/registry.ts`.

Test the example:

```bash
npm run example -- examples/<module>/<tool-name>.ts
```

### 7. Quality Gates

```bash
npm run typecheck
npm run lint:fix
npm run build
npm run ci
```

Report: tool created, tests written, example added, CI status.
