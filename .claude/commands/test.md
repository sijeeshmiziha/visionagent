# Smart Test Runner

Run tests intelligently based on what changed, then fix any failures.

## Arguments

$ARGUMENTS

## Behavior

### If no arguments — run full test suite:

```bash
npm test
```

Then if failures exist, diagnose and fix them. Re-run until green.

### If a file path is provided — run targeted tests:

- Find the corresponding test file in `tests/`
- Run only those tests: `npx vitest run tests/path/to/test.ts`
- Fix failures, re-run until green

### If "coverage" — run with coverage:

```bash
npm run test:coverage
```

Report which files are below 80% coverage and suggest what to add.

### If "integration" — run integration tests:

```bash
npm run test:integration
```

Note: Integration tests use real API keys from `.env`. Failures may be due to network or key issues, not code bugs.

### If "all" — run everything:

```bash
npm run test:all
```

## After Tests Pass

Always run:

```bash
npm run typecheck
```

Report: total tests, pass/fail counts, any coverage gaps, and TypeScript status.
