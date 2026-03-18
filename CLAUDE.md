# VisionAgent — Claude Code Guide

## Project Overview

VisionAgent is a TypeScript framework for AI-driven design-to-code automation. It provides:

- **Multi-provider AI support**: OpenAI, Anthropic, Google Gemini
- **Figma design system conversion**: Screenshots → React + Tailwind CSS
- **Google Stitch integration**: UI generation via MCP
- **Agent framework**: Tool calling loop with maxIterations control
- **MCP support**: Model Context Protocol client

**Stack:** TypeScript 5.7, Vercel AI SDK, Zod, tsup, Vitest, ESLint, Prettier, Husky

---

## Architecture

```
src/
├── index.ts                  # Public API surface — export everything from here
├── lib/                      # Core framework (provider-agnostic)
│   ├── agents/               # runAgent() — the central agent executor
│   ├── models/               # createModel() factory + 3 provider adapters
│   ├── tools/                # Tool definition, execution, toolset helpers
│   ├── subagents/            # Orchestrating nested agents
│   ├── mcp/                  # MCP client + transport
│   ├── types/                # Shared TypeScript interfaces
│   └── utils/                # Logger, errors, misc helpers
└── modules/                  # Feature modules (domain-specific)
    ├── figma/                # 15 Figma tools + converter + 2 agents
    │   ├── agents/           # runFigmaAgent, runFigmaToCodeAgent
    │   ├── client.ts         # FigmaClient (REST wrapper)
    │   ├── converter/        # Figma → HTML → JSX → React+Tailwind pipeline
    │   └── tools/            # One file per tool
    ├── stitch/               # 8 Stitch tools + agents
    │   ├── agents/           # runStitchAgent, runDesignRequirementsAgent
    │   ├── client.ts         # StitchClient (MCP-based)
    │   └── tools/            # One file per tool
    └── hello-world/          # Minimal example module
```

### Key Abstractions

```typescript
// Model — unified LLM interface
interface Model {
  provider: 'openai' | 'anthropic' | 'google';
  modelName: string;
  invoke(messages, options?): Promise<ModelResponse>;
  generateVision(prompt, images, options?): Promise<ModelResponse>;
}

// Tool — Zod-validated tool definition
interface ToolConfig<T extends ZodSchema> {
  name: string;
  description: string;
  input: T;
  handler: (input: z.infer<T>) => Promise<unknown>;
}

// Agent — autonomous execution loop
interface AgentConfig {
  model: Model;
  tools: Tool[] | ToolSet;
  systemPrompt: string;
  input: string;
  maxIterations?: number; // default: 10
  onStep?: (step: AgentStep) => void;
}
```

---

## Development Workflow

### Initial Setup

```bash
npm install
cp .env.example .env   # Fill in API keys
```

### Day-to-day Commands

```bash
npm run dev            # Watch mode build
npm test               # Unit + tools + core tests (fast)
npm run test:watch     # Test watcher for TDD
npm run test:integration  # Full end-to-end tests (uses live APIs)
npm run test:coverage  # Coverage report (v8)
npm run typecheck      # TypeScript strict check
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Prettier format all files
npm run build          # Full build: typecheck → lint → tsup bundle
npm run ci             # Everything: typecheck + lint + format:check + build + test
```

### Running Examples

```bash
npm run example -- examples/figma/get-screenshot.ts
npm run example:interactive   # Interactive launcher (30+ examples)
```

---

## Testing Strategy

Test files live in `tests/` (not co-located with source):

```
tests/
├── unit/         # Per-function tests for models, agents, tools
├── tools/        # Tool-specific behavior tests
├── core/         # Core library tests
├── integration/  # Full workflow tests (requires real API keys)
└── mocks/        # MSW handler definitions for API mocking
```

**Rules:**

- Unit/core/tools tests use MSW mocks — never call real APIs
- Integration tests may call real APIs — run separately with `npm run test:integration`
- Always run `npm test` after any source change before declaring a task done
- Use `describe` + `it` blocks; avoid `test()` at top level
- Import from `visionagent` path alias (maps to `src/index.ts`)

**Test utilities available:**

- `tests/mocks/` — MSW handlers for Figma, OpenAI, Anthropic, Google
- `tests/setup.ts` — global test setup

---

## Release Process

```bash
# Patch release (bug fixes)
npm run release:patch   # bumps version, creates tag, pushes → triggers CI release

# Minor release (new features)
npm run release:minor

# Major release (breaking changes)
npm run release:major
```

The GitHub Actions release workflow (`/.github/workflows/release.yml`) triggers on `v*` tags and:

1. Runs full build
2. Publishes to npm with `NPM_TOKEN`
3. Creates GitHub release with auto-generated notes

**Before releasing:**

- Ensure `npm run ci` passes clean
- Update `CHANGELOG.md`
- All public API changes must be reflected in `README.md`

---

## Code Conventions

### TypeScript

- Strict mode — no `any` in `src/` (tests and examples are relaxed)
- Use `z.infer<typeof Schema>` for derived types, don't duplicate
- Prefer `interface` over `type` for object shapes
- Use `satisfies` operator instead of casting when possible
- All public exports must have explicit return types

### Naming

- Interfaces: `PascalCase` (e.g., `ModelConfig`)
- Functions: `camelCase` (e.g., `runAgent`)
- Tool names: `kebab-case` strings (e.g., `"get-screenshot"`)
- Files: `kebab-case` (e.g., `get-screenshot.ts`)
- Constants: `SCREAMING_SNAKE_CASE`

### Imports

- Use type-only imports: `import type { Foo } from '...'`
- Internal source: use `@/` alias (e.g., `import { logger } from '@/lib/utils/logger'`)
- Public-facing examples: use `visionagent` alias (maps to src/index.ts)

### Adding a New Tool

1. Create `src/modules/<module>/tools/<tool-name>.ts`
2. Implement using `ToolConfig<T>` pattern with Zod input schema
3. Export from `src/modules/<module>/tools/index.ts`
4. Export from `src/modules/<module>/index.ts`
5. Export from `src/index.ts`
6. Add test in `tests/tools/<tool-name>.test.ts`
7. Add example in `examples/<module>/<tool-name>.ts`
8. Register example in `examples/lib/registry.ts`

### Adding a New Provider

1. Create `src/lib/models/providers/<provider>.ts` implementing `Model`
2. Update `src/lib/models/create-model.ts` factory
3. Export from `src/lib/models/index.ts`
4. Add MSW mock in `tests/mocks/`
5. Add test in `tests/unit/models/`

---

## Critical Files

| File                                         | Purpose                                         |
| -------------------------------------------- | ----------------------------------------------- |
| `src/index.ts`                               | Public API — all exports go through here        |
| `src/lib/agents/run-agent.ts`                | Core agent execution loop                       |
| `src/lib/models/create-model.ts`             | Model factory (provider routing)                |
| `src/lib/tools/index.ts`                     | Tool execution and toolset helpers              |
| `src/modules/figma/converter/figma-react.ts` | Main Figma→React converter                      |
| `src/modules/figma/converter/cleaner.ts`     | AI code cleanup                                 |
| `src/modules/stitch/client.ts`               | Google Stitch MCP client                        |
| `examples/lib/registry.ts`                   | Example registration (for interactive launcher) |
| `tsup.config.ts`                             | Build config (CJS + ESM dual output)            |
| `vitest.config.ts`                           | Test config (paths, timeout, coverage)          |

---

## Environment Variables

```bash
# Required for AI providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=

# Required for Figma tools
FIGMA_API_KEY=
FIGMA_URL=        # https://www.figma.com/design/<file-id>/<name>

# Required for Stitch tools
STITCH_MCP_URL=
STITCH_API_KEY=
```

---

## Build Output

tsup produces dual-format output in `dist/`:

- `dist/index.js` — ESM
- `dist/index.cjs` — CommonJS
- `dist/index.d.ts` — TypeScript declarations (ESM)
- `dist/index.d.cts` — TypeScript declarations (CJS)

External dependencies (not bundled): `ai`, all `@ai-sdk/*`

---

## Agentic Task Approach

When implementing any feature, follow this order:

1. **Read** existing code in the relevant module before writing anything
2. **Plan** — identify all files that need to change
3. **Implement** — write source code
4. **Test** — write or update tests, run `npm test`
5. **Typecheck** — run `npm run typecheck`
6. **Lint** — run `npm run lint:fix`
7. **Build** — run `npm run build` to verify dual output
8. **Example** — add/update an example if it's a new feature

Never declare a task done until `npm run ci` passes.
