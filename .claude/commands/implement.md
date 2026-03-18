# Implement Feature

You are in full autonomous implementation mode. Follow the VisionAgent agentic task approach from CLAUDE.md rigorously.

## Task

$ARGUMENTS

## Execution Plan

Work through these steps in order without stopping to ask unless genuinely blocked:

### 1. Understand & Plan

- Read CLAUDE.md for project conventions
- Identify all files that need to be created or modified
- Trace the call chain from public API → implementation
- Check `src/index.ts` to understand current exports
- Read any existing similar code for patterns to follow

### 2. Implement

- Write source code in `src/`
- Follow naming conventions (kebab-case files, PascalCase interfaces, camelCase functions)
- Use `@/` imports internally, `visionagent` alias in examples
- Add explicit return types on all public functions
- No `any` in `src/` — use Zod inference or proper typing

### 3. Export

- Add exports through the module's `index.ts`
- Add to `src/index.ts` if it's part of the public API

### 4. Test

- Write tests in `tests/` (not co-located)
- Use MSW mocks for external API calls
- Run: `npm test`
- Fix any failures before proceeding

### 5. Quality Gates

Run these in sequence and fix all issues:

```bash
npm run typecheck
npm run lint:fix
npm run format
npm run build
```

### 6. Example (if new feature)

- Add an example in `examples/<module>/<feature>.ts`
- Register it in `examples/lib/registry.ts`
- Verify it runs: `npm run example -- examples/<module>/<feature>.ts`

### 7. Final Verification

```bash
npm run ci
```

Report what was implemented, what tests were added, and confirm `npm run ci` passed.
