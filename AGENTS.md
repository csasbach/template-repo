# Project: my-project

## Quick Start

```bash
npm run setup       # Install deps, build binaries, set up Husky hooks
npm start           # Launch the application
```

## Process

### Iteration Cycle

Every fix follows strict DAG gates — each gate depends on the previous; no skipping:

```
1. REPRODUCE — Run the real entry point the user reported.
   Collect evidence: logs, response body, file state.

2. HYPOTHESIS — Based on evidence, state what is wrong and what the fix must achieve.

2.5 SELF-REVIEW (hypothesis) — Before writing any code, challenge your own hypothesis:
      - What evidence directly supports this? What contradicts it?
      - What alternative hypotheses were excluded? On what basis?
      - Can I reproduce the failure in under 30 seconds by running the real entry point?

3. EXPERIMENT — Write a failing test that reproduces the exact bug (red).

4. IMPLEMENT — Write minimal code. The test passes (green).

4.5 SELF-REVIEW (implementation) — Before running the full gate:
      - Is this the simplest approach that matches existing patterns?
      - Could this be solved with a smaller change (one file, one concept)?
      - Are there edge cases not covered? Resource leaks? Timing issues?
      - Does the diff include only what was asked for (no scope creep)?

5. VERIFY — Run the full gate: unit tests, lint, E2E, coverage.

6. MANUAL VALIDATE — Run the real entry point again. Confirm fix works.

6.5 CODE-REVIEW (pre-PR) — Review the full diff holistically:
      - Does every changed file belong in this PR? Any unintended drift?
      - Are test assertions meaningful (not just happy-path)?
      - Do the changes interact correctly with other parts of the system?
      - Is this safe to deploy? What's the rollback plan?

7. PR — Only after step 6.5 passes.
```

### Rules

1. **Evidence before hypothesis** — Before forming a theory, check logs, files, ports, and response bodies. Hypothesis without evidence is guessing.

2. **Test the real entry point** — Every test must exercise the same command/URL the user uses. After all tests pass, manually validate before opening a PR. Mocks are acceptable only as a last resort and must be documented.

3. **One DAG gate at a time** — No skipping. If a gate fails, go back to the previous gate.

4. **Self-review before every gate transition** — At steps 2.5, 4.5, and 6.5, conduct a structured self-review. A skipped self-review is a process violation.

### Before Branch Creation

Before creating any new feature branch, always:

1. **List open PRs** — `gh pr list --state open`
2. **Build the commit DAG** — `git log --oneline --all --graph --decorate`
3. **Check ancestry** — for each open PR branch, determine if related
4. **Determine merge order** — merge-base to find dependency
5. **Open parallel PRs only when DAGs are disjoint**

### Commit Flow (TDD: red to green)

```
1. git checkout -b fix/descriptive-name
2. Write tests first — red
3. Implement feature — green
4. Pre-commit hooks auto-run:
       - lint-staged (eslint + prettier)
       - project-specific checks (tsc, fmt)
5. npm run gate
6. Pre-push hooks auto-run:
       - npm ls --production (lock integrity)
       - npm run audit:deps (deprecation check)
       - project-specific tests
7. git push origin fix/descriptive-name
8. gh pr create — STOP, wait for review
9. User approves
10. User says "merge it" → gh pr merge --squash
```

**PR body checklist:**

- [ ] `npm run gate` passes locally
- [ ] CI shows green
- [ ] New code has tests
- [ ] MANUAL VALIDATE: endpoint exercised
- [ ] AGENTS.md learnings log updated if applicable

**Rules:**

- Never push directly to main
- Zero tolerance: all warnings resolved
- Agent MUST STOP after creating a PR

### Test Categories

| Tag               | Means                | Runs fast | Example          |
| ----------------- | -------------------- | --------- | ---------------- |
| `[spec]`          | Feature contract     | Yes       | Returns 200      |
| (none)            | Fast edge case       | Yes       | 404 on unknown   |
| `[slow]`          | Takes >10s           | No        | Integration      |
| `[e2e]`           | Browser test         | No        | Full flow        |
| `[coverage-safe]` | Low regression value | No        | Improbable input |

### Code Quality Gate

- pre-commit: eslint, prettier, type check
- commit-msg: commitlint
- pre-push: blocking (lock, tsc, lint, tests) + warning (coverage, audit)
- manual: npm run gate

### CI Pipeline

If using GitHub Actions, add `.github/workflows/gate.yml` with caching, concurrency, timeout-minutes.

### Dependency Pinning

Production deps exact, dev deps float. Lockfiles committed and enforced.

## Learnings Log

| Date       | Lesson                                                                     | Codified in        |
| ---------- | -------------------------------------------------------------------------- | ------------------ |
| 2026-05-27 | Template backported with self-review gates, CI template, blocking pre-push | AGENTS.md, .husky/ |
