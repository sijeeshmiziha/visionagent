# Code Review

Perform a thorough code review of changes in this branch.

## Arguments

$ARGUMENTS
(Optional: a specific file path, PR number, or "staged" for staged changes only)

## Review Process

### 1. Identify Changes

```bash
git diff main...HEAD --name-only
```

Or if reviewing staged:

```bash
git diff --staged --name-only
```

### 2. Read Every Changed File

Read each changed file completely. Don't skim — understand the full context.

### 3. Review Checklist

**Type Safety:**

- [ ] No `any` types in `src/` (tests/examples may use them)
- [ ] All public functions have explicit return types
- [ ] Zod schemas match the actual data being validated
- [ ] `import type` used for type-only imports

**Correctness:**

- [ ] Error cases are handled (not silently swallowed)
- [ ] Async/await used correctly (no floating promises)
- [ ] No race conditions in agent execution loops
- [ ] Edge cases covered (empty inputs, null/undefined, API errors)

**Architecture:**

- [ ] New tools follow the ToolConfig<T> pattern
- [ ] New modules are exported through proper index.ts chain
- [ ] No circular imports
- [ ] New features are exported from src/index.ts if public API

**Testing:**

- [ ] New functionality has corresponding tests in `tests/`
- [ ] Tests use MSW mocks (not real API calls)
- [ ] Tests cover happy path AND error cases
- [ ] Coverage doesn't regress

**Code Quality:**

- [ ] No dead code or unused imports
- [ ] Consistent naming with existing codebase
- [ ] No console.log left in production code (use logger)
- [ ] Comments explain WHY, not WHAT

**Documentation:**

- [ ] New public API documented in README.md
- [ ] CHANGELOG.md updated
- [ ] JSDoc on exported functions/interfaces

### 4. Security Check

- No API keys or secrets hardcoded
- No user input passed directly to shell commands
- No path traversal vulnerabilities in file operations

### 5. Run Validation

```bash
npm run ci
```

### 6. Report

Provide:

- Summary of what the change does
- Issues found (if any) with file:line references
- Suggested improvements
- Overall verdict: APPROVE / REQUEST_CHANGES / NEEDS_DISCUSSION
