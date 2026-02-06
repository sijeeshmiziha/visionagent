# Examples

This directory contains runnable examples demonstrating VisionAgent's capabilities.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Available Examples](#available-examples)
  - [01 - Basic Model](#01---basic-model)
  - [02 - All Providers](#02---all-providers)
  - [03 - Tool Calling](#03---tool-calling)
  - [04 - Figma Analysis](#04---figma-analysis)
  - [05 - Vision Test](#05---vision-test)
  - [06 - Multi-Tool Agent](#06---multi-tool-agent)
  - [07 - MCP Server](#07---mcp-server)
- [Test Data](#test-data)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before running any examples, ensure you have:

### System Requirements

| Requirement | Version   |
| ----------- | --------- |
| Node.js     | >= 18.0.0 |
| npm         | >= 8.0.0  |

### API Keys

You need at least one AI provider API key:

| Provider  | Environment Variable | Get Key                                                       |
| --------- | -------------------- | ------------------------------------------------------------- |
| OpenAI    | `OPENAI_API_KEY`     | [platform.openai.com](https://platform.openai.com/api-keys)   |
| Anthropic | `ANTHROPIC_API_KEY`  | [console.anthropic.com](https://console.anthropic.com/)       |
| Google    | `GOOGLE_API_KEY`     | [aistudio.google.com](https://aistudio.google.com/app/apikey) |

---

## Quick Start

### 1. Install Dependencies

```bash
# From the project root
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys
```

Example `.env` file:

```bash
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_API_KEY=AIza...
```

### 3. Run an Example

```bash
# Run the basic model example
npm run example:01

# Or run any other example
npm run example:03
```

---

## Available Examples

### 01 - Basic Model

**Command**: `npm run example:01`

**What it does**: Simple model invocation with OpenAI GPT-4o-mini.

**Use case**: Verify your setup works and understand the basic model API.

**Required API key**: `OPENAI_API_KEY`

<details>
<summary><strong>Expected Output</strong></summary>

```
Testing OpenAI model...

Response: TypeScript is a strongly-typed superset of JavaScript that compiles to plain JavaScript, adding optional static typing and class-based object-oriented programming.
Tokens: { promptTokens: 15, completionTokens: 32, totalTokens: 47 }
```

</details>

---

### 02 - All Providers

**Command**: `npm run example:02`

**What it does**: Tests all three AI providers (OpenAI, Anthropic, Google) with the same prompt.

**Use case**: Compare responses across providers, verify multi-provider setup.

**Required API keys**: All three (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`)

<details>
<summary><strong>Expected Output</strong></summary>

```
Testing all providers...

[OpenAI] Response: TypeScript adds static typing to JavaScript...
[OpenAI] Tokens: { promptTokens: 15, completionTokens: 28 }

[Anthropic] Response: TypeScript is a typed superset of JavaScript...
[Anthropic] Tokens: { promptTokens: 15, completionTokens: 35 }

[Google] Response: TypeScript extends JavaScript with type annotations...
[Google] Tokens: { promptTokens: 15, completionTokens: 30 }
```

</details>

---

### 03 - Tool Calling

**Command**: `npm run example:03`

**What it does**: Demonstrates an agent using a calculator tool to solve math problems.

**Use case**: Learn how to define tools and run agents with tool calling.

**Required API key**: `OPENAI_API_KEY`

<details>
<summary><strong>Expected Output</strong></summary>

```
Testing agent with tools...

Step 1: calculator
  [Calculator] 25 multiply 4 = 100
Step 2: thinking...

Final answer: 25 multiplied by 4 equals 100.
Steps taken: 2
Total tokens: { promptTokens: 245, completionTokens: 67, totalTokens: 312 }
```

</details>

**Key concepts demonstrated**:

- `defineTool()` - Creating type-safe tools with Zod schemas
- `runAgent()` - Running an autonomous agent
- `onStep` callback - Monitoring agent progress

---

### 04 - Figma Analysis

**Command**: `npm run example:04`

**What it does**: Analyzes Figma design screenshots and extracts requirements.

**Use case**: Turn design mockups into user stories and acceptance criteria.

**Required API key**: `OPENAI_API_KEY`

**Required test data**: Images in `examples/test-data/figma-screens/`

<details>
<summary><strong>Expected Output</strong></summary>

```
Analyzing Figma designs...

Found 3 images in ./examples/test-data/figma-screens

Analysis:
## User Types
- Admin users
- Regular users

## User Stories
- As a user, I want to log in so that I can access my dashboard
- As an admin, I want to manage users so that I can control access

## Features
1. Authentication
   - Login form with email/password
   - Remember me checkbox
   - Forgot password link

2. Dashboard
   - Overview statistics
   - Recent activity feed
   ...

Tokens used: { promptTokens: 1250, completionTokens: 450 }
```

</details>

---

### 05 - Vision Test

**Command**: `npm run example:05`

**What it does**: Custom image analysis with configurable prompts.

**Use case**: Analyze any image with custom questions (not just Figma designs).

**Required API key**: `OPENAI_API_KEY`

**Required test data**: `examples/test-data/sample-ui.png`

<details>
<summary><strong>Expected Output</strong></summary>

```
Testing vision capabilities...

Analyzing: ./examples/test-data/sample-ui.png

Response: This image shows a modern web application dashboard with...
- Navigation sidebar on the left
- Main content area with cards
- Header with user profile dropdown
...
```

</details>

---

### 06 - Multi-Tool Agent

**Command**: `npm run example:06`

**What it does**: Complex agent with multiple tools (search, file operations, calculations).

**Use case**: Build sophisticated agents that can orchestrate multiple capabilities.

**Required API key**: `OPENAI_API_KEY`

<details>
<summary><strong>Expected Output</strong></summary>

```
Running multi-tool agent...

Step 1: web_search
  [Search] Searching for: "React best practices 2024"
Step 2: write_file
  [File] Writing to: ./output/react-best-practices.md
Step 3: thinking...

Final answer: I've researched React best practices and saved a summary to...
Steps taken: 3
```

</details>

---

### 07 - MCP Server

**Command**: `npm run example:07`

**What it does**: Creates an MCP (Model Context Protocol) server with custom tools.

**Use case**: Expose your tools to MCP-compatible clients (Cursor, Claude Desktop).

**Required API key**: None (server-side only)

<details>
<summary><strong>Expected Output</strong></summary>

```
Starting MCP server...

Server: my-tools v1.0.0
Transport: stdio
Available tools:
  - search: Search the web for information
  - analyze: Analyze text content

Server is running. Press Ctrl+C to stop.
```

</details>

**To use with Cursor/Claude Desktop**:

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "visionagent-example": {
      "command": "npx",
      "args": ["tsx", "examples/07-mcp-server.ts"]
    }
  }
}
```

---

## Test Data

For vision and Figma analysis examples, you need test images:

```
examples/
└── test-data/
    ├── README.md           # Test data documentation
    ├── sample-ui.png       # For vision tests (05)
    └── figma-screens/      # For Figma analysis (04)
        ├── login.png
        ├── dashboard.png
        └── settings.png
```

See [test-data/README.md](./test-data/README.md) for details on preparing test images.

---

## Troubleshooting

### "Missing API key" Error

```
Error: OPENAI_API_KEY environment variable is not set
```

**Solution**: Ensure your `.env` file exists and contains the required key:

```bash
# Check if .env exists
ls -la .env

# Verify the key is set (should show masked value)
grep OPENAI_API_KEY .env
```

### "Module not found" Error

```
Error: Cannot find module '../src/index'
```

**Solution**: Run examples from the project root:

```bash
# Wrong - from examples directory
cd examples && npx tsx 01-basic-model.ts

# Correct - from project root
npm run example:01
```

### "Model not available" Error

```
Error: The model 'gpt-4o' does not exist
```

**Solution**: Verify your API key has access to the model. Some models require specific API tiers.

### Vision Example Shows No Output

**Cause**: Missing test images.

**Solution**: Add test images to `examples/test-data/`:

```bash
# Create the directory if it doesn't exist
mkdir -p examples/test-data/figma-screens

# Add your images
cp ~/Downloads/my-design.png examples/test-data/figma-screens/
```

### Timeout Errors

```
Error: Request timed out after 30000ms
```

**Solution**: Large images or complex analysis may take longer:

```typescript
// Increase timeout in your code
const model = createModel({
  provider: 'openai',
  model: 'gpt-4o',
  timeout: 60000, // 60 seconds
});
```

---

## Next Steps

After running the examples, check out:

- [Main README](../README.md) - Full API documentation
- [API Reference](../README.md#api-reference) - Detailed API docs
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute

---

<p align="center">
  <a href="../README.md">Back to Main README</a>
</p>
