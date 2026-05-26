# Project: my-project

## Quick Start

```bash
npm run setup       # Install deps, build binaries, set up Husky hooks
npm start           # Launch the application
```

## Process

### Iteration Cycle

Every fix follows strict DAG gates — no skipping:

```
1. REPRODUCE — Run the real entry point the user reported.
   Collect evidence: logs, response body, file state.
2. HYPOTHESIS — Based on evidence, state what is wrong and what the fix must achieve.
3. EXPERIMENT — Write a failing test that reproduces the exact bug (red).
4. IMPLEMENT — Write minimal code. The test passes (green).
5. VERIFY — Run the full gate: unit tests, lint, E2E, coverage.
6. MANUAL VALIDATE — Run the real entry point again. Confirm fix works.
7. PR — Only after step 6 passes.
```

### Rules

1. **Evidence before hypothesis** — Before forming a theory, check logs, files, ports, and response bodies. Hypothesis without evidence is guessing.
2. **Test the real entry point** — Every test must exercise the same command/URL the user uses. After all tests pass, manually validate before opening a PR.
3. **One DAG gate at a time** — Reproduce → evidence → hypothesis → experiment → implement → validate → PR. No skipping. If a gate fails, go back to the previous gate.

### Before Branch Creation

Before creating any new feature branch, always:

1. **List open PRs** — `gh pr list --state open` to see what's in flight
2. **Build the commit DAG** — `git log --oneline --all --graph --decorate` to visualize branch topology
3. **Check ancestry** — for each open PR branch, determine if related to your planned work:
   ```
   git merge-base --is-ancestor <pr-branch> <your-proposed-base> && echo "is ancestor" || echo "unrelated"
   ```
4. **Determine merge order**:
   - If PR A is an ancestor of PR B (`git merge-base --is-ancestor A B`), merge A first, or merge B (supersedes A) and close A
   - If neither is ancestor of the other, both PRs have **disjoint DAGs** — they can be developed and merged in **parallel** with no dependency
5. **Open parallel PRs only when DAGs are disjoint** — never branch from an unmerged PR unless intentional (stacked PR pattern)

### Commit Flow (TDD: red → green)

Every feature starts with failing tests, then implementation:

```
1. git checkout -b fix/descriptive-name   # Feature branch
2. Write tests first                       — red
3. Implement feature                       — green
4. Pre-commit hooks auto-run on commit (via Husky):
       - lint-staged (eslint --max-warnings 0 + prettier)
       - project-specific checks (tsc, fmt, etc.)
5. npm run gate                           # Full gate (tests + coverage + build)
6. Pre-push hooks auto-run on push (via Husky):
       - npm ls --production (lock integrity)
       - npm run audit:deps (deprecation check)
       - project-specific tests
7. git push origin fix/descriptive-name
8. gh pr create --title "..." --body "..."
   → STOP. Present PR summary to user. Wait for review.
9. [If user requests changes:] Make changes, git push, gh pr edit --body, STOP again.
10. User approves
11. User says "merge it" → agent merges: gh pr merge --squash
```

**Before every PR, the agent checks:**

- ☐ Is this the simplest approach that matches existing patterns in the codebase?
- ☐ Does each UI component render independently when its data arrives (no unnecessary blocking)?
- ☐ If using child processes, is it a dedicated file (not an inline script)?
- ☐ Have the E2E tests been run against the actual startup path?

**Rules:**

- **Never push directly to `main`** — the Husky `pre-push` hook blocks it.
- Pre-commit hooks must pass; `--no-verify` only if hooks are broken, fix immediately
- **Zero tolerance**: all ESLint warnings, TypeScript errors, test failures, coverage regressions, deprecation warnings must be resolved — never suppressed without documented reason
- All `[spec]` tagged tests must pass before PR
- Test coverage must be ≥80% lines/branches/functions/statements
- **Agent MUST STOP after creating a PR** — No merging without explicit `merge it` / `merge <n>` / `merge all`. Interpreting `go`, `proceed`, `continue` as merge authorization is a process violation.
- *Exception — parallel disjoint PRs:* When the DAG plan specifies disjoint PRs, the agent may create all PRs in the batch before the first STOP.
- *Pushing changes to an open PR:* If the user requests changes, the agent may push to the same branch and update the PR body, then STOP again. After any push, a new review cycle is required.
- *Violation:* If the agent merges without authorization, it must log the violation in the learnings log and await user acknowledgment.

### Test Categories

| Tag | Means | Runs in fast gate | Example |
|---|---|---|---|
| `[spec]` | Feature contract — never skip | ✓ | Returns 200, validates schema |
| (none) | Fast edge case — always run | ✓ | 404 on unknown resource |
| `[slow]` | Takes >10s | ✗ | Full integration test |
| `[e2e]` | Browser test | ✗ | Full user flow |
| `[coverage-safe]` | Low regression value; skip if coverage ≥80% | ✗ | Edge case with improbable input |

### Code Quality Gate (Zero Tolerance)

All checks must pass before PR. Automated entirely via Husky (no CI):

- pre-commit: `eslint --max-warnings 0`, `prettier --check`, project type check
- commit-msg: `commitlint` (conventional commits)
- pre-push: `npm ls --production`, `npm run audit:deps`, project tests
- manual: `npm run gate` — coverage ≥80%, build, all `[spec]` tests

**Command output warnings** — All warnings from git, npm, eslint, tsc, cargo, and test output are subject to zero tolerance. Each warning must be resolved, suppressed in `.deprecations.json`, or documented in AGENTS.md.

### Dependency Pinning

Production deps are exact (e.g. `"express": "4.22.2"`). Dev deps float (`^`). To bump:

```bash
npm install package@x.y.z --save-exact && npm run gate && git commit
```

Minimum viable version: install the lowest version that passes `npm run gate`. Lockfiles are committed and enforced by pre-push hooks.

## Learnings Log

| Date | Lesson | Codified in |
|---|---|---|
| 2026-05-25 | Template created from studio-metadata-pipeline best practices | All sections |
