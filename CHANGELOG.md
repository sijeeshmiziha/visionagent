# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Design-to-Code Engine** — the industry's first built-in Figma-to-React conversion pipeline in an AI agent framework
  - `FigmaToReact` class and `convertFigmaToReact()` one-call API for converting any Figma design URL to production React + Tailwind CSS
  - `FigmaToHTML` converter: 1,878-line engine handling auto-layout, fills, strokes, vectors, SVGs, gradients, shadows, images, and responsive sizing
  - `FigmaToTailwindConverter`: CSS-to-Tailwind class mapping via PostCSS with full declaration/media/pseudo mappings
  - `css-to-tailwind/` module: complete PostCSS-based CSS-to-Tailwind converter ported and adapted for VisionAgent
  - Image asset pipeline: automatic image extraction, download, base64 encoding, and URL replacement in generated JSX
- **AI-Powered Code Cleanup** — multi-provider code cleaner that works with OpenAI, Anthropic, or Google
  - `cleanupGeneratedCode()` function accepts any VisionAgent `Model` or `ModelConfig`
  - 80+ cleanup rules: removes machine-generated junk classes, fixes absolute positioning, makes code responsive, adds semantic HTML, and enhances UX with hover/focus states
- **Component Extraction** — Babel AST analysis to refactor repeated JSX patterns into named sub-components
  - `transformJsx()` function detects repeated sibling elements and extracts them into reusable components with props
- **3 New Figma Tools** (15 total, up from 12)
  - `figma_convert_to_react`: Convert a Figma design to React + Tailwind CSS (the main design-to-code tool)
  - `figma_cleanup_code`: AI-powered cleanup of machine-generated JSX using any provider
  - `figma_extract_components`: Extract repeated JSX patterns into sub-components
- **Design-to-Code Agent** — `runFigmaToCodeAgent()` with a code-generation-focused system prompt that autonomously analyzes designs, generates code, and optionally cleans up the output
- **4 New Examples** (examples/figma/13-16)
  - `13-convert-to-react.ts`: Basic Figma URL to React conversion
  - `14-convert-with-tailwind.ts`: Conversion with Tailwind CSS and component optimization
  - `15-convert-with-cleanup.ts`: Conversion + AI code cleanup
  - `16-figma-to-code-agent.ts`: Full autonomous agent-driven design-to-code workflow

### Changed

- `FigmaClient.getFile()` and `FigmaClient.getFileNodes()` now accept optional `geometry` and `depth` parameters for vector path data
- `createFigmaToolSet()` now returns 15 tools (up from 12)
- Figma module exports expanded with converter classes, design-to-code functions, and new tool references
- ESLint config extended with relaxed rules for the ported converter directory
- Updated test assertions for 15-tool count

---

## [0.0.1] - 2026-02-05

### Added

#### Core Features

- **Multi-Provider Model Support**
  - OpenAI integration (GPT-4o, GPT-4o-mini, GPT-4 Turbo)
  - Anthropic integration (Claude 3.5 Sonnet, Claude 3 Opus)
  - Google integration (Gemini 1.5 Pro, Gemini 1.5 Flash)
  - Unified `createModel()` API across all providers
  - Environment variable auto-detection for API keys

- **Vision Capabilities**
  - `generateVision()` method for image analysis
  - Support for PNG, JPEG, WebP, GIF formats
  - Configurable detail levels (high/low/auto)
  - Base64 and file path image input

- **Tool System**
  - `defineTool()` for type-safe tool definitions
  - Zod schema integration for input validation
  - Automatic JSON schema generation for LLM function calling
  - `createToolSet()` for managing multiple tools
  - `getToolSchemas()` for extracting LLM-compatible schemas

- **Agent Framework**
  - `runAgent()` for autonomous agent execution
  - Configurable iteration limits
  - Step-by-step progress callbacks (`onStep`)
  - Full conversation history tracking
  - Token usage aggregation

- **Figma Analysis**
  - `analyzeFigmaDesigns()` for extracting requirements from designs
  - Folder and file array input support
  - Built-in prompts for user story extraction
  - `validateFigmaFolder()` for input validation

#### Developer Experience

- Full TypeScript support with comprehensive type definitions
- Tree-shakeable module exports
- ESM and CommonJS builds
- Vitest test suite
- ESLint and Prettier configuration
- Husky pre-commit hooks
- Changeset-based versioning

#### Documentation

- Comprehensive README with examples
- API reference documentation
- Example scripts for all features
- Contributing guidelines
- Security policy
- Code of Conduct

---

## Version History

| Version | Date       | Highlights                                                              |
| ------- | ---------- | ----------------------------------------------------------------------- |
| 0.0.2   | TBD        | Design-to-Code engine, 15 Figma tools, AI cleanup, component extraction |
| 0.0.1   | 2026-02-05 | Initial release with vision, tools, and agents                          |

---

## Versioning Strategy

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes to public API
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

### Pre-1.0 Development

While in 0.x.x versions:

- Minor versions may include breaking changes
- Patch versions are backward compatible
- We recommend pinning to exact versions

### Stability Guarantees

| Component                | Stability |
| ------------------------ | --------- |
| `createModel()`          | Stable    |
| `defineTool()`           | Stable    |
| `runAgent()`             | Stable    |
| `convertFigmaToReact()`  | Stable    |
| `cleanupGeneratedCode()` | Stable    |
| `runFigmaToCodeAgent()`  | Stable    |

---

## Upgrade Guides

### Upgrading to 0.1.0 (Future)

_No breaking changes planned yet._

---

## Links

- [GitHub Releases](https://github.com/sijeeshmiziha/visionagent/releases)
- [npm Package](https://www.npmjs.com/package/visionagent)
- [Contributing Guide](CONTRIBUTING.md)

[Unreleased]: https://github.com/sijeeshmiziha/visionagent/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/sijeeshmiziha/visionagent/releases/tag/v0.0.1
