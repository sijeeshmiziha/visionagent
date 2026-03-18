# Debug Issue

Diagnose and fix a bug or failing test in VisionAgent.

## Arguments

$ARGUMENTS
(Describe the issue, error message, or paste the failing test output)

## Debug Process

### 1. Reproduce

If given a test name or file:

```bash
npx vitest run tests/path/to/failing.test.ts
```

If given an example:

```bash
npm run example -- examples/<module>/<example>.ts
```

Capture the full error output.

### 2. Locate the Root Cause

- Read the stack trace carefully — identify the exact file and line
- Read that file and the files it calls
- Trace the data flow from input to the failure point
- Check TypeScript types (run `npm run typecheck` to surface type errors)

### 3. Understand Before Fixing

- Read the failing test to understand what behavior it expects
- Read the implementation to understand what it currently does
- Identify the gap

### 4. Fix

- Make the minimal change that fixes the issue
- Do NOT refactor or clean up surrounding code unless it's causing the bug
- Do NOT add features while fixing bugs

### 5. Verify

```bash
npm test             # All tests must pass
npm run typecheck    # No type errors
npm run lint         # No lint errors
```

### 6. Check for Regression

```bash
npm run ci
```

Report: root cause, the fix applied (file:line), and CI status.
