# Release Workflow

Prepare and publish a new release of VisionAgent to npm.

## Arguments

$ARGUMENTS
(Provide: patch | minor | major — defaults to patch if not specified)

## Pre-flight Checks

Run all quality gates first and DO NOT proceed if any fail:

```bash
npm run ci
```

If `npm run ci` fails, stop and report the failures. Do not release broken code.

## Release Steps

### 1. Determine version type

- `patch` — bug fixes, no API changes (e.g., 0.0.1 → 0.0.2)
- `minor` — new features, backwards-compatible (e.g., 0.1.0 → 0.2.0)
- `major` — breaking changes (e.g., 0.0.x → 1.0.0)

### 2. Check CHANGELOG.md

- Read the current CHANGELOG.md
- Verify there are entries for the changes being released
- If CHANGELOG.md is not updated, update it now with the changes from recent commits

### 3. Check README.md

- Verify any new public API is documented
- If new tools/agents/features were added, ensure they appear in README.md

### 4. Run the release command

```bash
# Based on the version type:
npm run release:patch
# or
npm run release:minor
# or
npm run release:major
```

This command: bumps the version in package.json, creates a git tag, and pushes to origin.
The GitHub Actions release workflow will automatically build and publish to npm.

### 5. Verify

After the tag is pushed:

- Check GitHub Actions: the release workflow should trigger
- Monitor the workflow run for success
- Verify the new version appears on npm after the workflow completes

Report the new version number and the GitHub Actions URL for the release workflow.
