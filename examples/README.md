# Examples

<p align="center">
  <strong>Runnable examples</strong> demonstrating VisionAgent's capabilities — models, tools, agents, Figma, and Stitch.
</p>

<p align="center">
  <a href="../README.md">← Main README</a> •
  <a href="../README.md#api-reference">API Reference</a> •
  <a href="../CONTRIBUTING.md">Contributing</a>
</p>

---

This directory contains copy-pasteable scripts you can run from the project root or adapt for your own project. Each example documents required env vars and how to run it.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Usage in Your Project](#usage-in-your-project)
- [How to Run](#how-to-run)
- [Available Examples](#available-examples)
  - [Core](#core)
  - [Figma](#figma)
  - [Hello World](#hello-world)
  - [Stitch](#stitch)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

| Requirement | Version   |
| ----------- | --------- |
| Node.js     | >= 18.0.0 |
| npm         | >= 8.0.0  |

### API Keys

Set these in a `.env` file at the project root (copy from `.env.example`).

| Purpose   | Environment Variable           | Required For                   |
| --------- | ------------------------------ | ------------------------------ |
| OpenAI    | `OPENAI_API_KEY`               | Core, Hello World, most agents |
| Anthropic | `ANTHROPIC_API_KEY`            | Core (02 All Providers)        |
| Google    | `GOOGLE_GENERATIVE_AI_API_KEY` | Core (02 All Providers)        |
| Figma     | `FIGMA_API_KEY`                | All Figma examples (01–12)     |

---

## Quick Start

**In this repo (development):**

```bash
# From the project root
npm install
cp .env.example .env
# Edit .env and add at least OPENAI_API_KEY (and FIGMA_API_KEY for Figma examples)
```

**In your own project (using the published package):**

```bash
npm install visionagent
# Set API keys in .env or export them (see Usage in Your Project below)
```

---

## Usage in Your Project

All examples are written so you can copy them into an external project. They import from the package name and use environment variables for configuration.

### Install and import

```bash
npm install visionagent
```

```typescript
import { createModel, runAgent, executeTool, figmaWhoamiTool } from 'visionagent';
```

### API keys

Pass keys via **environment variables** (recommended) or explicitly in config:

| Service   | Env variable                             | Example in code                                                                                 |
| --------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| OpenAI    | `OPENAI_API_KEY`                         | `createModel({ provider: 'openai', model: 'gpt-4o-mini', apiKey: process.env.OPENAI_API_KEY })` |
| Anthropic | `ANTHROPIC_API_KEY`                      | Same pattern with `provider: 'anthropic'`                                                       |
| Google    | `GOOGLE_GENERATIVE_AI_API_KEY`           | Same pattern with `provider: 'google'`                                                          |
| Figma     | `FIGMA_API_KEY`                          | Tools read from env automatically                                                               |
| Stitch    | `STITCH_MCP_URL` or `STITCH_MCP_COMMAND` | MCP client reads from env                                                                       |

### Model selection

```typescript
const model = createModel({
  provider: 'openai', // 'openai' | 'anthropic' | 'google'
  model: 'gpt-4o-mini', // e.g. gpt-4o, claude-3-haiku-20240307, gemini-1.5-flash
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7, // optional
});
```

Each example file includes a **Setup** and **Run** block in its header showing the exact env vars and how to run it with `npx tsx`.

---

## How to Run

### Interactive launcher (recommended)

Pick a folder (Core, Figma, Hello World, Stitch), then an example. You’ll be prompted for any inputs (prompt, Figma URL, Stitch project ID, etc.):

```bash
npm run example:interactive
```

### Run a specific example

```bash
npm run example -- examples/core/01-basic-model.ts
npm run example -- examples/figma/02-get-screenshot.ts
npm run example -- examples/stitch/06-generate-screen.ts
```

Always run from the **project root** so that `--env-file=.env` and module resolution work.

---

## Available Examples

### Core

| Example                        | Path                                            | Description                                                     |
| ------------------------------ | ----------------------------------------------- | --------------------------------------------------------------- |
| 01 - Basic Model               | `examples/core/01-basic-model.ts`               | Simple model invocation (OpenAI).                               |
| 02 - All Providers             | `examples/core/02-all-providers.ts`             | Same prompt with OpenAI, Anthropic, and Google.                 |
| 03 - Tool Calling              | `examples/core/03-tool-calling.ts`              | Agent with a calculator tool.                                   |
| 04 - Agent with Multiple Tools | `examples/core/04-agent-with-multiple-tools.ts` | Agent with search, file write, and calculator tools.            |
| 05 - Subagents                 | `examples/core/05-subagents.ts`                 | Parent agent delegating to researcher and summarizer subagents. |

**Required**: `OPENAI_API_KEY`. For 02, also `ANTHROPIC_API_KEY` and `GOOGLE_GENERATIVE_AI_API_KEY`.

**Example output** (01 - Basic Model): A one-sentence explanation of TypeScript from the model, e.g. `"TypeScript is a typed superset of JavaScript that compiles to plain JavaScript."`

**Related**: [03 - Tool Calling](core/03-tool-calling.ts) builds on the model with a single tool; [04 - Agent with Multiple Tools](core/04-agent-with-multiple-tools.ts) shows a full multi-tool agent.

---

### Figma

| Example                           | Path                                                | Description                       |
| --------------------------------- | --------------------------------------------------- | --------------------------------- |
| 01 - Whoami                       | `examples/figma/01-whoami.ts`                       | Verify Figma auth (current user). |
| 02 - Get Screenshot               | `examples/figma/02-get-screenshot.ts`               | Export a node as PNG/PDF/etc.     |
| 03 - Get Design Context           | `examples/figma/03-get-design-context.ts`           | Get UI code context for a node.   |
| 04 - Get Metadata                 | `examples/figma/04-get-metadata.ts`                 | Get metadata for a node.          |
| 05 - Get Variable Defs            | `examples/figma/05-get-variable-defs.ts`            | Get variable definitions.         |
| 06 - Get Code Connect Map         | `examples/figma/06-get-code-connect-map.ts`         | Get Code Connect mappings.        |
| 07 - Add Code Connect Map         | `examples/figma/07-add-code-connect-map.ts`         | Add a Code Connect mapping.       |
| 08 - Get Code Connect Suggestions | `examples/figma/08-get-code-connect-suggestions.ts` | Get linking suggestions.          |
| 09 - Send Code Connect Mappings   | `examples/figma/09-send-code-connect-mappings.ts`   | Send multiple mappings.           |
| 10 - Create Design System Rules   | `examples/figma/10-create-design-system-rules.ts`   | Generate design system rules.     |
| 11 - Get FigJam                   | `examples/figma/11-get-figjam.ts`                   | Get FigJam board content.         |
| 12 - Generate Diagram             | `examples/figma/12-generate-diagram.ts`             | Generate a diagram from a prompt. |

**Required**: `FIGMA_API_KEY` (Figma personal access token). Some examples also use `OPENAI_API_KEY` (e.g. design context, diagrams).

**Example output** (01 - Whoami): Your Figma user handle and email. (02 - Get Screenshot): A PNG (or chosen format) of the requested node.

**Related**: [03 - Get Design Context](figma/03-get-design-context.ts) for UI code; [12 - Generate Diagram](figma/12-generate-diagram.ts) for Mermaid diagrams in FigJam.

---

### Hello World

| Example          | Path                                     | Description                         |
| ---------------- | ---------------------------------------- | ----------------------------------- |
| 01 - Hello World | `examples/hello-world/01-hello-world.ts` | Minimal agent with a greeting tool. |

**Required**: `OPENAI_API_KEY`.

**Example output**: The agent uses the greeting tool and returns a friendly message, e.g. `"Hello, World!"` or a custom name you provide.

**Related**: [Core 03 - Tool Calling](core/03-tool-calling.ts) for a calculator tool; [Core 04 - Agent with Multiple Tools](core/04-agent-with-multiple-tools.ts) for a richer agent.

---

### Stitch

| Example                | Path                                      | Description                             |
| ---------------------- | ----------------------------------------- | --------------------------------------- |
| 01 - Create Project    | `examples/stitch/01-create-project.ts`    | Create a Stitch project.                |
| 02 - Get Project       | `examples/stitch/02-get-project.ts`       | Get project details.                    |
| 03 - List Projects     | `examples/stitch/03-list-projects.ts`     | List projects (owned/shared).           |
| 04 - List Screens      | `examples/stitch/04-list-screens.ts`      | List screens in a project.              |
| 05 - Get Screen        | `examples/stitch/05-get-screen.ts`        | Get screen details.                     |
| 06 - Generate Screen   | `examples/stitch/06-generate-screen.ts`   | Generate a screen from a text prompt.   |
| 07 - Edit Screens      | `examples/stitch/07-edit-screens.ts`      | Edit existing screen(s) with a prompt.  |
| 08 - Generate Variants | `examples/stitch/08-generate-variants.ts` | Generate design variants.               |
| 09 - Run Agent         | `examples/stitch/09-run-agent.ts`         | Run the Stitch agent (autonomous loop). |

**Required**: Stitch uses the same AI provider keys as the rest of VisionAgent (e.g. `OPENAI_API_KEY`). No separate Stitch API key.

**Example output** (01 - Create Project): Project ID and title. (06 - Generate Screen): Generated screen metadata and preview URL.

**Related**: [09 - Run Agent](stitch/09-run-agent.ts) runs the full Stitch agent; [Core 04 - Agent with Multiple Tools](core/04-agent-with-multiple-tools.ts) for the general agent pattern.

---

## Troubleshooting

### "Missing API key" Error

Ensure `.env` exists in the project root and contains the needed keys (e.g. `OPENAI_API_KEY`, `FIGMA_API_KEY` for Figma). Run from the project root so `npm run example` / `example:interactive` load `.env`.

### "Module not found" Error

Run from the **project root**, not from inside `examples/`:

```bash
# Wrong
cd examples && npx tsx core/01-basic-model.ts

# Correct
npm run example -- examples/core/01-basic-model.ts
```

### "Model not available" Error

Confirm your API key has access to the model (e.g. `gpt-4o-mini`). Some models require a paid or higher tier.

### Figma examples fail

- Set `FIGMA_API_KEY` in `.env` (Figma → Settings → Personal access tokens).
- Use a valid Figma file URL; for node-specific examples (e.g. screenshot), include `node-id=...` in the URL or provide the node when prompted.

### Timeout errors

For long-running agent or Stitch/Figma calls, the default timeout may be too low. Increase timeouts in your code or environment if your provider allows.

---

## Next Steps

- [Main README](../README.md) – Full API documentation
- [API Reference](../README.md#api-reference) – Models, tools, agents, Figma, Stitch
- [Contributing Guide](../CONTRIBUTING.md) – How to contribute

<p align="center">
  <a href="../README.md">Back to Main README</a>
</p>
