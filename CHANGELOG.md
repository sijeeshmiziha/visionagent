# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Nothing yet

### Changed

- Nothing yet

### Deprecated

- Nothing yet

### Removed

- Nothing yet

### Fixed

- Nothing yet

### Security

- Nothing yet

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

| Version | Date       | Highlights                                     |
| ------- | ---------- | ---------------------------------------------- |
| 0.0.1   | 2026-02-05 | Initial release with vision, tools, and agents |

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

| Component               | Stability |
| ----------------------- | --------- |
| `createModel()`         | Stable    |
| `defineTool()`          | Stable    |
| `runAgent()`            | Stable    |
| `analyzeFigmaDesigns()` | Stable    |

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
