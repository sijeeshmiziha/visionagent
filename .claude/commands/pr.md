# Create Pull Request

Create a well-structured PR for the current branch's changes.

## Arguments

$ARGUMENTS
(Optional: PR title or description hints)

## Steps

### 1. Verify CI is Green

```bash
npm run ci
```

Do NOT create a PR if CI fails. Fix issues first.

### 2. Gather Context

```bash
git log main...HEAD --oneline
git diff main...HEAD --stat
```

Read all changed files to understand the full scope of changes.

### 3. Craft PR Content

**Title format:**

- `feat: <description>` — new feature
- `fix: <description>` — bug fix
- `refactor: <description>` — code cleanup
- `docs: <description>` — documentation only
- `test: <description>` — tests only
- `chore: <description>` — tooling, deps, config

**Body must include:**

- What changed and why
- How to test it
- Any breaking changes
- Screenshots/examples if it's a UI or output change

### 4. Create PR

```bash
gh pr create --title "..." --body "..."
```

Use HEREDOC for body formatting.

### 5. Report

Return the PR URL.
