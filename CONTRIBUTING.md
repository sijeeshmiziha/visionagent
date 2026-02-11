# Contributing to VisionAgent

Thank you for your interest in contributing to VisionAgent! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Commit Messages](#commit-messages)
- [Documentation](#documentation)
- [Community](#community)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [sijeeshmonbalan@gmail.com](mailto:sijeeshmonbalan@gmail.com).

---

## Getting Started

### Types of Contributions

We welcome many types of contributions:

| Type              | Examples                                       |
| ----------------- | ---------------------------------------------- |
| **Bug fixes**     | Fix errors, edge cases, or unexpected behavior |
| **Features**      | New capabilities, provider integrations, tools |
| **Documentation** | Improve README, add examples, fix typos        |
| **Tests**         | Add missing tests, improve coverage            |
| **Performance**   | Optimize code, reduce bundle size              |
| **Accessibility** | Improve error messages, add logging            |

### Good First Issues

New to the project? Look for issues labeled:

- `good first issue` - Simple, well-defined tasks
- `help wanted` - Issues where we need community help
- `documentation` - Documentation improvements

---

## Development Setup

### Prerequisites

| Requirement | Version            |
| ----------- | ------------------ |
| Node.js     | >= 18.0.0          |
| npm         | >= 8.0.0           |
| Git         | Any recent version |

### Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/visionagent.git
cd visionagent

# Add upstream remote
git remote add upstream https://github.com/sijeeshmiziha/visionagent.git
```

### Install Dependencies

```bash
npm install
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Add your API keys for testing and examples
# OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY - for integration tests and Core/Stitch examples
# FIGMA_API_KEY - for Figma examples and figma tool tests
```

### Verify Setup

```bash
# Run tests
npm test

# Run linting
npm run lint

# Build the project
npm run build
```

If all commands pass, you're ready to contribute!

---

## Making Changes

### Branch Naming

Create a descriptive branch name:

```bash
# Feature
git checkout -b feature/add-streaming-support

# Bug fix
git checkout -b fix/memory-leak-in-agent-loop

# Documentation
git checkout -b docs/improve-api-reference

# Chore/maintenance
git checkout -b chore/update-dependencies
```

### Keep Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Rebase your branch
git rebase upstream/main
```

### Development Workflow

```bash
# 1. Create a branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit files ...

# 3. Run tests
npm test

# 4. Run linting
npm run lint:fix

# 5. Commit changes
git add .
git commit -m "feat: add my feature"

# 6. Push to your fork
git push origin feature/my-feature

# 7. Open a Pull Request
```

---

## Code Style

### TypeScript Guidelines

We follow strict TypeScript practices:

```typescript
// Use explicit types for function parameters and returns
function processImage(path: string, options?: ImageOptions): Promise<ImageResult> {
  // ...
}

// Use interfaces for object shapes
interface ImageOptions {
  detail: 'high' | 'low' | 'auto';
  maxSize?: number;
}

// Use type for unions and computed types
type Provider = 'openai' | 'anthropic' | 'google';

// Prefer const assertions for literal types
const SUPPORTED_FORMATS = ['png', 'jpg', 'webp'] as const;
```

### ESLint & Prettier

The project uses ESLint and Prettier for code formatting:

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format
```

### Pre-commit Hooks

Husky runs checks before each commit:

- ESLint on `.ts` files
- Prettier on all supported files

If a commit fails, fix the issues and try again.

### Import Order

Organize imports in this order:

```typescript
// 1. Node built-ins
import { readFileSync } from 'fs';
import path from 'path';

// 2. External dependencies
import { z } from 'zod';

// 3. Internal modules (absolute imports)
import { createModel } from '../models';

// 4. Relative imports
import { parseResponse } from './utils';

// 5. Types (if separate)
import type { ModelConfig } from '../types';
```

---

## Testing

### Test Structure

```
tests/
├── unit/           # Unit tests (fast, isolated)
│   ├── agents/     # Agent loop tests
│   └── models/     # Model provider tests
├── tools/          # Tool tests (define-tool, tool-set, figma, hello-world)
├── core/           # Core utility tests (e.g. errors)
├── integration/    # Integration tests (require API keys)
└── mocks/          # Mock handlers and fixtures
```

### Running Tests

```bash
# Run unit tests only (fast, no API keys needed)
npm test

# Run all tests including integration
npm run test:all

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Writing Tests

Use Vitest for testing:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { defineTool } from '../../src/tools';

describe('defineTool', () => {
  it('should create a tool with valid schema', () => {
    const tool = defineTool({
      name: 'test',
      description: 'A test tool',
      input: z.object({ query: z.string() }),
      handler: async ({ query }) => ({ result: query }),
    });

    expect(tool.name).toBe('test');
    expect(tool.schema).toBeDefined();
  });

  it('should validate input against schema', async () => {
    // ...
  });
});
```

### Test Guidelines

1. **Unit tests**: Test individual functions in isolation
2. **Integration tests**: Test real API interactions (skipped in CI without keys)
3. **Mock external services**: Use MSW or manual mocks for API calls
4. **Test edge cases**: Empty inputs, invalid data, error conditions

---

## Pull Request Process

### Before Submitting

- [ ] Code follows the style guide
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Documentation updated (if needed)
- [ ] Changeset created (`npx changeset`)

### PR Title Format

Use conventional commit format:

```
feat: add streaming support for agent responses
fix: resolve memory leak in tool execution
docs: update API reference for createModel
chore: update TypeScript to 5.7
```

### PR Description Template

```markdown
## Summary

Brief description of what this PR does.

## Changes

- List of specific changes
- Another change

## Testing

How was this tested?

## Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Changeset created
```

### Review Process

1. **Automated checks**: CI runs tests, linting, and type checking
2. **Code review**: A maintainer will review your changes
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, a maintainer will merge

### After Merge

- Delete your branch
- The changeset bot will create a version PR
- Your changes will be released in the next version

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description                             |
| ---------- | --------------------------------------- |
| `feat`     | New feature                             |
| `fix`      | Bug fix                                 |
| `docs`     | Documentation only                      |
| `style`    | Formatting, no code change              |
| `refactor` | Code change that neither fixes nor adds |
| `perf`     | Performance improvement                 |
| `test`     | Adding or updating tests                |
| `chore`    | Maintenance tasks                       |

### Examples

```bash
# Feature
git commit -m "feat(agents): add streaming response support"

# Bug fix
git commit -m "fix(models): handle rate limit errors gracefully"

# Documentation
git commit -m "docs: add troubleshooting section to README"

# Breaking change
git commit -m "feat(tools)!: rename defineTool to createTool

BREAKING CHANGE: defineTool has been renamed to createTool for consistency."
```

---

## Documentation

### When to Update Docs

Update documentation when you:

- Add new features
- Change API signatures
- Add new configuration options
- Fix confusing behavior

### Documentation Locations

| Location             | Content                           |
| -------------------- | --------------------------------- |
| `README.md`          | Main documentation, API reference |
| `examples/README.md` | Example usage documentation       |
| JSDoc comments       | Inline API documentation          |
| `CHANGELOG.md`       | Auto-generated from changesets    |

### JSDoc Format

````typescript
/**
 * Creates a new AI model instance.
 *
 * @param config - Model configuration options
 * @param config.provider - AI provider ('openai', 'anthropic', 'google')
 * @param config.model - Model identifier (e.g., 'gpt-4o')
 * @param config.apiKey - API key (uses env var if not provided)
 * @returns Configured model instance
 *
 * @example
 * ```typescript
 * const model = createModel({
 *   provider: 'openai',
 *   model: 'gpt-4o',
 * });
 * ```
 */
export function createModel(config: ModelConfig): Model {
  // ...
}
````

---

## Community

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and discussions

### Recognition

Contributors are recognized in:

- Release notes
- GitHub contributors page
- Special mentions for significant contributions

### Maintainers

Current maintainers:

- [@sijeeshmiziha](https://github.com/sijeeshmiziha) - Creator and lead maintainer

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing to VisionAgent!
