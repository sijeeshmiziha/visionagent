<p align="center">
  <h1 align="center">VisionAgent</h1>
  <p align="center">
    <strong>The industry's most complete design-to-code AI agent framework. Figma to production React + Tailwind in one call.</strong>
  </p>
  <p align="center">
    The only framework that converts Figma designs to production-ready React components with Tailwind CSS, AI-powered cleanup, and multi-provider support — all built in. No plugins, no glue code, no compromises.
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/visionagent"><img src="https://img.shields.io/npm/v/visionagent.svg?style=flat-square&color=0ea5e9&labelColor=0c4a6e" alt="npm version"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://github.com/sijeeshmiziha/visionagent/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-8b5cf6?style=flat-square" alt="License"></a>
  <a href="https://github.com/sijeeshmiziha/visionagent/pulls"><img src="https://img.shields.io/badge/PRs-Welcome-10b981?style=flat-square&labelColor=064e3b" alt="PRs Welcome"></a>
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#examples">Examples</a> •
  <a href="#faq">FAQ</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Table of Contents

- [Why VisionAgent?](#why-visionagent)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Reference](#api-reference)
  - [Models](#models)
  - [Tools](#tools)
  - [Agents](#agents)
  - [Figma Module](#figma-module)
  - [Stitch Module](#stitch-module)
- [Module Exports](#module-exports)
- [Examples](#examples)
- [Comparison with Alternatives](#comparison-with-alternatives)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Support](#support)
- [Sponsors](#sponsors)
- [License](#license)

---

## Why VisionAgent?

VisionAgent is the **only AI agent framework with a built-in design-to-code pipeline**. While other frameworks stop at generic LLM orchestration, VisionAgent takes a Figma URL and produces production-ready React + Tailwind components — with AI-powered code cleanup, automatic component extraction, and image asset handling — all in a single function call.

No other open-source framework offers this. Not LangChain. Not LlamaIndex. Not AutoGPT. VisionAgent is purpose-built for the workflows that matter most to product teams:

- **Design-to-Code**: Convert any Figma design to production React + Tailwind CSS with one call. AI cleanup makes the output cleaner than hand-written code
- **Multi-Provider**: Unified API across OpenAI, Anthropic, and Google — use any model for code generation and cleanup
- **15 Figma Tools**: The most comprehensive Figma integration of any AI framework — screenshots, design context, variables, Code Connect, FigJam, diagrams, and now full code generation
- **Agent-First**: Tool calling, autonomous agents, and iteration control out of the box
- **Google Stitch**: Built-in Stitch integration for AI-powered UI generation
- **Type-Safe**: Full TypeScript support with Zod schema validation
- **Zero Extra Deps**: All AI provider SDKs included; set API keys and go

```typescript
// Run an agent with tools in a few lines
import { createModel, runAgent, defineTool } from 'visionagent';
import { z } from 'zod';

const model = createModel({ provider: 'openai', model: 'gpt-4o-mini' });
const greetTool = defineTool({
  name: 'greet',
  description: 'Greet someone',
  input: z.object({ name: z.string() }),
  handler: async ({ name }) => ({ message: `Hello, ${name}!` }),
});

const result = await runAgent({
  model,
  tools: [greetTool],
  systemPrompt: 'You are a helpful assistant.',
  input: 'Greet Alice',
});
console.log(result.output);
```

---

## Features

| Feature             | Description                                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Design-to-Code**  | Convert Figma designs to production React + Tailwind CSS with AI cleanup and component extraction — no other framework has this built in |
| **Multi-Provider**  | Support for OpenAI (GPT-4o), Anthropic (Claude), and Google (Gemini) — use any provider for code generation and cleanup                  |
| **Tool System**     | Define custom tools with Zod schema validation and type inference                                                                        |
| **Agent Framework** | Build autonomous agents with tool calling, reasoning, and iteration control                                                              |
| **Figma Module**    | 15 tools for Figma — screenshots, design context, variables, Code Connect, FigJam, diagrams, **and full code generation**                |
| **AI Code Cleanup** | Multi-provider AI cleaner that transforms machine-generated JSX into production-ready, responsive, semantic code                         |
| **Stitch Module**   | 8 tools for Google Stitch (projects, screens, generate/edit/variants)                                                                    |
| **Type-Safe**       | Full TypeScript support with comprehensive type definitions                                                                              |
| **Zero Config**     | Works out of the box with environment variables                                                                                          |

---

## Installation

### Using npm

```bash
npm install visionagent
```

### Using yarn

```bash
yarn add visionagent
```

### Using pnpm

```bash
pnpm add visionagent
```

### Using bun

```bash
bun add visionagent
```

All AI provider SDKs (OpenAI, Anthropic, Google) are included as dependencies; no extra packages are required.

### Environment Setup

Create a `.env` file in your project root:

```bash
# Required: At least one AI provider API key
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...

# Optional: For Figma examples and tools
FIGMA_API_KEY=figd_...
```

---

## Quick Start

### 1. Create a Model and Invoke

```typescript
import { createModel } from 'visionagent';

const model = createModel({
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.7,
});

const response = await model.invoke([
  { role: 'user', content: 'Explain TypeScript in one sentence.' },
]);
console.log(response.content);
```

### 2. Define Custom Tools

Create type-safe tools with Zod validation:

```typescript
import { defineTool } from 'visionagent';
import { z } from 'zod';

const calculatorTool = defineTool({
  name: 'calculator',
  description: 'Perform math calculations',
  input: z.object({
    expression: z.string().describe('Math expression to evaluate'),
  }),
  handler: async ({ expression }) => {
    const result = eval(expression); // Use a safe math parser in production
    return { result };
  },
});
```

### 3. Run an Agent

Build autonomous agents that use tools:

```typescript
import { runAgent, createModel, defineTool } from 'visionagent';
import { z } from 'zod';

const calculatorTool = defineTool({
  name: 'calculator',
  description: 'Perform math calculations',
  input: z.object({ expression: z.string() }),
  handler: async ({ expression }) => ({ result: String(eval(expression)) }),
});

const result = await runAgent({
  model: createModel({ provider: 'openai', model: 'gpt-4o-mini' }),
  tools: [calculatorTool],
  systemPrompt: 'You are a helpful assistant. Use the calculator when needed.',
  input: 'What is 25 multiplied by 4?',
  maxIterations: 10,
  onStep: step => console.log(`Step ${step.iteration}:`, step.action),
});

console.log(result.output);
```

### 4. Convert Figma Designs to React (Design-to-Code)

Convert any Figma design to a production-ready React component with Tailwind CSS — in one call:

```typescript
import { convertFigmaToReact } from 'visionagent';

const result = await convertFigmaToReact(
  'https://www.figma.com/design/ABC123/MyDesign?node-id=1-2',
  { useTailwind: true, optimizeComponents: true }
);

console.log(result.componentName); // "MyDesignComponent"
console.log(result.jsx); // Production React + Tailwind JSX
console.log(result.css); // Fallback CSS for unsupported properties
console.log(result.fonts); // Google Fonts imports
// result.assets = { "image-001.png": "data:image/png;base64,..." }
```

Or use the AI-powered cleanup to make the output even cleaner:

```typescript
import { convertFigmaToReact, cleanupGeneratedCode } from 'visionagent';

const result = await convertFigmaToReact(figmaUrl, { useTailwind: true });
const cleanedJsx = await cleanupGeneratedCode(result.jsx, {
  provider: 'google',
  model: 'gemini-2.0-flash',
});
```

### 5. Run the Design-to-Code Agent

Let an autonomous agent handle the entire design-to-code workflow:

```typescript
import { runFigmaToCodeAgent } from 'visionagent';

const result = await runFigmaToCodeAgent({
  input: 'Convert this Figma design to React with Tailwind: https://figma.com/design/...',
  model: { provider: 'openai', model: 'gpt-4o' },
  onStep: step =>
    console.log(
      `Step ${step.iteration}:`,
      step.toolCalls?.map(t => t.toolName)
    ),
});

console.log(result.output);
```

### 6. Use the Figma Module (Inspection Tools)

Run the Figma agent or use individual tools (screenshots, design context, variables, Code Connect, etc.):

```typescript
import { runFigmaAgent, createFigmaToolSet, createModel } from 'visionagent';

const model = createModel({ provider: 'openai', model: 'gpt-4o-mini' });
const figmaTools = createFigmaToolSet();

const result = await runFigmaAgent({
  model,
  tools: figmaTools,
  systemPrompt: 'You help with Figma design tasks.',
  input: 'Get a screenshot of the node at https://figma.com/design/...',
  maxIterations: 5,
});
console.log(result.output);
```

### 7. Use the Stitch Module

Create projects and generate or edit screens with Google Stitch:

```typescript
import { runStitchAgent, createStitchToolSet, createModel } from 'visionagent';

const model = createModel({ provider: 'openai', model: 'gpt-4o-mini' });
const stitchTools = createStitchToolSet();

const result = await runStitchAgent({
  model,
  tools: stitchTools,
  systemPrompt: 'You help with Stitch UI generation.',
  input: 'Create a project called "My App" and generate a login screen.',
  maxIterations: 10,
});
```

---

## Architecture

```mermaid
graph TB
    subgraph Client[Client Application]
        App[Your App]
    end

    subgraph VisionAgent[VisionAgent]
        Models[Models]
        Tools[Tools]
        Agents[Agent Loop]
        subgraph FigmaModule[Figma Module - 15 Tools]
            FigmaInspect[Inspection Tools]
            DesignToCode[Design-to-Code Engine]
            AICleanup[AI Code Cleaner]
        end
        StitchModule[Stitch Module]
        HelloWorld[Hello World]
    end

    subgraph Providers[AI Providers]
        OpenAI[OpenAI]
        Anthropic[Anthropic]
        Google[Google]
    end

    App --> Models
    App --> Tools
    App --> Agents
    App --> FigmaModule
    App --> StitchModule
    App --> HelloWorld
    Models --> OpenAI
    Models --> Anthropic
    Models --> Google
    Agents --> Models
    Agents --> Tools
    DesignToCode --> Models
    AICleanup --> Models
    FigmaInspect --> Models
    StitchModule --> Models
```

### Agent Execution Flow

```mermaid
sequenceDiagram
    participant User
    participant Agent
    participant Model
    participant Tools

    User->>Agent: Input + Tools + System Prompt
    loop Until Complete or Max Iterations
        Agent->>Model: Messages + Tool Schemas
        Model-->>Agent: Response (Text or Tool Calls)
        alt Tool Calls Present
            Agent->>Tools: Execute Tool Calls
            Tools-->>Agent: Tool Results
            Agent->>Agent: Append Results to Messages
        else Final Answer
            Agent-->>User: Output + Steps + Usage
        end
    end
```

---

## API Reference

### Models

Create and configure AI models. All imports are from the main package:

```typescript
import { createModel } from 'visionagent';

const model = createModel({
  provider: 'openai' | 'anthropic' | 'google',
  model: string,           // e.g., 'gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet-20241022'
  apiKey?: string,         // Uses env var by default (OPENAI_API_KEY, etc.)
  temperature?: number,    // 0-2, default varies by provider
  maxTokens?: number,      // Max tokens in response
});

// Invoke with messages (and optional tools for agent use)
const response = await model.invoke(messages, { tools });
```

#### Supported Models

| Provider  | Models                                                 | Vision Support |
| --------- | ------------------------------------------------------ | -------------- |
| OpenAI    | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`                 | Yes            |
| Anthropic | `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229` | Yes            |
| Google    | `gemini-1.5-pro`, `gemini-1.5-flash`                   | Yes            |

### Tools

Define type-safe tools with Zod; the agent uses them via `createToolSet`:

```typescript
import { defineTool, createToolSet, getTool } from 'visionagent';
import { z } from 'zod';

const calculatorTool = defineTool({
  name: 'calculator',
  description: 'Perform mathematical calculations',
  input: z.object({
    expression: z.string().describe('Math expression to evaluate'),
  }),
  handler: async ({ expression }) => {
    const result = eval(expression); // Use a safe math parser in production
    return { result };
  },
});

// Create a tool set for the agent
const tools = createToolSet({ calculator: calculatorTool, search: searchTool });

// Retrieve a specific tool by name
const tool = getTool(tools, 'calculator');
```

### Agents

Run autonomous agents with tool calling:

```typescript
import { runAgent } from 'visionagent';

const result = await runAgent({
  model,                    // Created with createModel()
  tools,                    // Array of tools or ToolSet
  systemPrompt: string,     // Instructions for the agent
  input: string,            // User's request
  maxIterations?: number,   // Default: 10
  onStep?: (step) => void,  // Callback for each step
});

// Result structure
interface AgentResult {
  output: string;           // Final answer from the agent
  steps: AgentStep[];       // Array of steps with tool calls
  messages: Message[];      // Full conversation history
  totalUsage: TokenUsage;   // Total tokens used
}
```

### Figma Module

The Figma module is the most comprehensive Figma integration in any AI framework — **15 tools** spanning design inspection, code generation, and design system management. It is the only framework that offers a complete design-to-code pipeline with AI cleanup.

#### Design-to-Code (Converter API)

Convert Figma designs directly to React + Tailwind without an agent:

```typescript
import { convertFigmaToReact, cleanupGeneratedCode, FigmaToReact, transformJsx } from 'visionagent';

// One-call conversion
const result = await convertFigmaToReact(figmaUrl, {
  useTailwind: true,
  optimizeComponents: true,
});
// result = { jsx, css, assets, componentName, fonts }

// AI cleanup with any provider
const cleaned = await cleanupGeneratedCode(result.jsx, {
  provider: 'openai', // or 'anthropic' or 'google'
  model: 'gpt-4o',
});

// Component extraction (refactors repeated JSX into named sub-components)
const optimized = transformJsx(result.jsx, { minRepeats: 2 });

// Class-based API for advanced control
const converter = new FigmaToReact({ useTailwind: true }, process.env.FIGMA_API_KEY);
const output = await converter.convertFromUrl(figmaUrl);
```

#### Design-to-Code Agent

```typescript
import { runFigmaToCodeAgent } from 'visionagent';

const result = await runFigmaToCodeAgent({
  input: 'Convert this design to React + Tailwind: <figma-url>',
  model: { provider: 'openai', model: 'gpt-4o' },
  maxIterations: 10,
});
```

#### Inspection Agent and Tools

```typescript
import {
  runFigmaAgent,
  createFigmaToolSet,
  figmaGetScreenshotTool,
  figmaGetDesignContextTool,
  FigmaClient,
  parseFigmaUrl,
} from 'visionagent';

// Run the Figma agent with all 15 tools
const figmaTools = createFigmaToolSet();
const result = await runFigmaAgent({
  model: createModel({ provider: 'openai', model: 'gpt-4o-mini' }),
  tools: figmaTools,
  systemPrompt: 'You help with Figma design tasks.',
  input: 'Get a screenshot of the design at <url>',
  maxIterations: 5,
});

// Low-level: FigmaClient for direct API access
const client = new FigmaClient({ apiKey: process.env.FIGMA_API_KEY });
```

**All 15 Figma tools:**

| Tool                                 | Description                                  |
| ------------------------------------ | -------------------------------------------- |
| `figmaWhoamiTool`                    | Verify auth / current user                   |
| `figmaGetScreenshotTool`             | Export node as PNG/JPG/SVG/PDF               |
| `figmaGetDesignContextTool`          | Structured layout, styles, typography        |
| `figmaGetMetadataTool`               | Node metadata and tree structure             |
| `figmaGetVariableDefsTool`           | Local and published variables                |
| `figmaGetCodeConnectMapTool`         | Code Connect mappings                        |
| `figmaAddCodeConnectMapTool`         | Add a Code Connect mapping                   |
| `figmaGetCodeConnectSuggestionsTool` | Component linking suggestions                |
| `figmaSendCodeConnectMappingsTool`   | Bulk-send mappings                           |
| `figmaCreateDesignSystemRulesTool`   | Generate design system rules                 |
| `figmaGetFigjamTool`                 | FigJam board content                         |
| `figmaGenerateDiagramTool`           | Generate Mermaid diagrams                    |
| `figmaConvertToReactTool`            | **Convert design to React + Tailwind**       |
| `figmaCleanupCodeTool`               | **AI-powered code cleanup**                  |
| `figmaExtractComponentsTool`         | **Extract repeated JSX into sub-components** |

### Stitch Module

The Stitch module provides an agent and 8 tools for [Google Stitch](https://stitch.withgoogle.com/docs/mcp/setup) (projects, screens, generate/edit/variants).

```typescript
import {
  runStitchAgent,
  createStitchToolSet,
  stitchCreateProjectTool,
  stitchGenerateScreenTool,
  StitchClient,
} from 'visionagent';

// Run the Stitch agent with all tools
const stitchTools = createStitchToolSet();
const result = await runStitchAgent({
  model: createModel({ provider: 'openai', model: 'gpt-4o-mini' }),
  tools: stitchTools,
  systemPrompt: 'You help with UI generation using Stitch.',
  input: 'Create a project "My App" and generate a login screen.',
  maxIterations: 10,
});

// Or use individual tools
const tools = createToolSet({
  createProject: stitchCreateProjectTool,
  generateScreen: stitchGenerateScreenTool,
});
```

**Stitch tools:** `stitchCreateProjectTool`, `stitchGetProjectTool`, `stitchListProjectsTool`, `stitchListScreensTool`, `stitchGetScreenTool`, `stitchGenerateScreenTool`, `stitchEditScreensTool`, `stitchGenerateVariantsTool`.

---

## Module Exports

VisionAgent uses a single entry point. Import everything from `visionagent`:

```typescript
import {
  // Core
  createModel,
  runAgent,
  defineTool,
  createToolSet,

  // Figma - Design-to-Code
  convertFigmaToReact,
  cleanupGeneratedCode,
  FigmaToReact,
  transformJsx,
  runFigmaToCodeAgent,

  // Figma - Inspection
  runFigmaAgent,
  createFigmaToolSet,
  figmaConvertToReactTool,
  figmaCleanupCodeTool,
  figmaExtractComponentsTool,

  // Stitch
  runStitchAgent,
  createStitchToolSet,

  // Hello World
  runHelloWorldAgent,
  helloWorldTool,
} from 'visionagent';
```

---

## Examples

See the [examples directory](./examples/README.md) for runnable examples. Use the interactive launcher or run a specific file:

```bash
# Interactive launcher (pick example and provide inputs)
npm run example:interactive

# Run a specific example
npm run example -- examples/core/01-basic-model.ts
npm run example -- examples/figma/02-get-screenshot.ts
npm run example -- examples/stitch/06-generate-screen.ts
```

| Group           | Examples                                                               | Description                                                                                   |
| --------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Core**        | 01 Basic Model, 02 All Providers, 03 Tool Calling, 04 Multi-Tool Agent | Models, agents, tools                                                                         |
| **Figma**       | 01 Whoami through 16 Design-to-Code Agent                              | 16 examples: inspection tools, **design-to-code conversion**, AI cleanup, and agent workflows |
| **Hello World** | 01 Hello World                                                         | Minimal agent with greeting tool                                                              |
| **Stitch**      | 01 Create Project through 08 Generate Variants                         | Google Stitch (projects, screens, generate/edit/variants)                                     |

---

## Comparison with Alternatives

| Feature               | VisionAgent                      | LangChain                 | LlamaIndex    | AutoGPT           |
| --------------------- | -------------------------------- | ------------------------- | ------------- | ----------------- |
| **Design-to-Code**    | **Built-in** (Figma to React+TW) | Not available             | Not available | Not available     |
| **Figma Integration** | **Built-in (15 tools)**          | Manual                    | Manual        | Manual            |
| **AI Code Cleanup**   | **Built-in** (multi-provider)    | Manual                    | Manual        | Manual            |
| **Focus**             | Design-to-Code + Agents          | General LLM Orchestration | Data/RAG      | Autonomous Agents |
| **TypeScript**        | First-class                      | Good                      | Good          | Python Only       |
| **Learning Curve**    | Low                              | High                      | Medium        | High              |
| **Google Stitch**     | Built-in (8 tools)               | Manual                    | Manual        | Manual            |

### When to Use VisionAgent

- **You need design-to-code**: Convert Figma designs to production React + Tailwind — no other framework does this
- You want agents with tool calling (OpenAI, Anthropic, Google)
- You need Figma integration (15 tools: screenshots, design context, Code Connect, FigJam, code generation)
- You use Google Stitch for UI generation
- You're building TypeScript/Node.js applications with a simple, focused API

### When to Consider Alternatives

- **LangChain**: Complex chains, extensive integrations, Python ecosystem
- **LlamaIndex**: Heavy RAG workloads, document indexing
- **AutoGPT**: Fully autonomous long-running tasks

---

## FAQ

### Which AI provider should I use?

**For vision tasks**: OpenAI GPT-4o offers the best balance of quality and speed. Claude 3.5 Sonnet is excellent for detailed analysis. Gemini 1.5 Pro is cost-effective for high-volume processing.

**For general agents**: All providers work well. Choose based on your existing infrastructure and pricing preferences.

### How do I handle rate limits?

VisionAgent doesn't include built-in rate limiting. Use a retry library (e.g. `p-retry`) around model or agent calls if your provider rate-limits requests.

### What image formats are supported?

- **Supported**: PNG, JPEG, WebP, GIF (first frame)
- **Recommended**: PNG for UI screenshots (lossless)
- **Max size**: Varies by provider (typically 20MB)

### How do I optimize token usage?

1. Use `detail: 'low'` for simple images
2. Resize large images before analysis
3. Batch related images together
4. Use specific prompts to focus analysis

### Can I use VisionAgent in the browser?

VisionAgent is designed for Node.js environments. For browser usage, you'll need to proxy API calls through your backend for security.

---

## Troubleshooting

### API Key Issues

**Error**: `Invalid API key` or `Authentication failed`

```bash
# Verify your API key is set
echo $OPENAI_API_KEY

# Check .env file is being loaded (use --env-file with tsx/node)
node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY)"
```

For Figma examples, ensure `FIGMA_API_KEY` is set (personal access token from Figma).

### Image Loading Errors

**Error**: `Failed to load image` or `Invalid image format`

```typescript
// Verify the image exists and is readable
import { existsSync } from 'fs';
console.log(existsSync('./image.png')); // Should be true

// Check supported formats
const supported = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
```

### Model Not Available

**Error**: `Model not found` or `Invalid model`

```typescript
// Verify model name matches provider's naming
const validModels = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash'],
};
```

### Memory Issues with Large Payloads

For long agent runs or many tools, process in smaller batches or limit `maxIterations`. For Figma screenshots, request one node at a time if memory is constrained.

---

## Roadmap

### Completed (v0.0.1)

- [x] Multi-provider model abstraction
- [x] Vision analysis capabilities
- [x] Tool definition with Zod schemas
- [x] Agent loop with tool calling
- [x] Figma module (15 tools, 2 agents)
- [x] Stitch module (8 tools, agent)
- [x] **Design-to-Code engine** — Figma to React + Tailwind CSS
- [x] **AI-powered code cleanup** — multi-provider (OpenAI, Anthropic, Google)
- [x] **Component extraction** — Babel AST analysis for repeated patterns
- [x] **CSS-to-Tailwind converter** — PostCSS-based conversion engine
- [x] **Design-to-Code agent** — autonomous Figma-to-code workflow

### Short Term (v0.1.x)

- [ ] Streaming responses support
- [ ] Built-in rate limiting and retries
- [ ] Conversation memory/history
- [ ] Vue / Svelte / HTML output targets for design-to-code
- [ ] Enhanced error messages

### Medium Term (v0.2.x - v0.5.x)

- [ ] Web UI for Figma analysis and code preview
- [ ] Agent workflows and chains
- [ ] Built-in caching layer
- [ ] Ollama/local model support
- [ ] Multi-page Figma file conversion

### Long Term (v1.0+)

- [ ] Visual agent builder
- [ ] Plugin ecosystem
- [ ] Cloud-hosted design-to-code service
- [ ] Multi-modal outputs (not just text)

### Community Contributions Welcome

We especially welcome contributions for:

- Additional AI provider integrations
- New tool templates
- Documentation improvements
- Example applications
- Bug fixes and tests

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

**Contributors** – thank you to everyone who has contributed to VisionAgent:

<p align="center">
  <a href="https://github.com/sijeeshmiziha/visionagent/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=sijeeshmiziha/visionagent" alt="Contributors" />
  </a>
</p>

### Quick Start for Contributors

```bash
# Clone the repository
git clone https://github.com/sijeeshmiziha/visionagent.git
cd visionagent

# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Build the project
npm run build
```

### Development Commands

| Command                    | Description                |
| -------------------------- | -------------------------- |
| `npm run dev`              | Watch mode for development |
| `npm test`                 | Run unit tests             |
| `npm run test:integration` | Run integration tests      |
| `npm run lint`             | Check code style           |
| `npm run lint:fix`         | Auto-fix code style        |
| `npm run typecheck`        | TypeScript type checking   |
| `npm run build`            | Production build           |

---

## Support

### Get Help

- [GitHub Issues](https://github.com/sijeeshmiziha/visionagent/issues) - Bug reports and feature requests
- [GitHub Discussions](https://github.com/sijeeshmiziha/visionagent/discussions) - Questions and community help

### Stay Updated

- [Star the repo](https://github.com/sijeeshmiziha/visionagent) to get notified of releases
- [Star History](https://star-history.com/#sijeeshmiziha/visionagent&Date) – view star growth over time
- Watch the repo for updates on new features

### Sponsorship

If VisionAgent helps your business, consider supporting development:

- [GitHub Sponsors](https://github.com/sponsors/sijeeshmiziha)

---

## Sponsors

Support VisionAgent by becoming a [sponsor](https://github.com/sponsors/sijeeshmiziha). Your logo will appear here with a link to your site.

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ❤️ by the CompilersLab team!
</p>
