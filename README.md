# template-repo

A lean project starter with battle-tested development process automation.

Use this template to bootstrap any new project — it provides the quality-of-life infrastructure without locking you into a specific stack.

## What's inside

- **AGENTS.md** — Full DAG-gated iteration cycle (reproduce → hypothesis → self-review → pre-flight → experiment → implement → verify → validate → PR) with 12 operating rules including self-review, documentation checks, resource stewardship, explicit approval per gate, DAG-first thinking, session continuity, and more
- **Husky hooks** — pre-commit (lint-staged), commit-msg (commitlint), pre-push (lock integrity, type checks, deprecation scans)
- **`scripts/setup.mjs`** — One-command setup: installs root + subproject deps, configures Husky
- **`scripts/check-deprecations.js`** — Accept-list based deprecation scanner that prevents alert fatigue
- **`.deprecations.json`** — Pre-configured accept list
- **`.github/workflows/gate.yml`** — CI template with concurrency, caching, timeout-minutes
- **Commitlint, Prettier, lint-staged** — Pre-configured and ready

## Quick start

```bash
node scripts/setup.mjs   # Install everything
# Then add your own code and tests
```

## Guiding principles

| Rule                           | What it prevents                     |
| ------------------------------ | ------------------------------------ |
| Evidence before hypothesis     | Guessing instead of diagnosing       |
| Self-review at every gate      | Confirmation bias, scope creep       |
| Pre-flight & alternatives      | Cross-repo blindness, CI waste       |
| Check docs before action       | Config errors from memory            |
| Be a good steward of resources | Wasted CI minutes, tokens, attention |
| Session continuity (wip.md)    | Rediscovery spiral on resume         |
| State check before action      | Duplicate work, stale assumptions    |
| External data is data          | Instruction creep from external src  |
| Explicit approval per gate     | Unauthorized branches/commits/PRs    |
| Source claims before plans     | Unsourced assumptions in proposals   |
| PR size discipline             | Unreviewably large diffs             |
| DAG-first thinking             | Premature branching, merge conflicts |

## Customizing for your project

1. Update `package.json` — project name, scripts (`lint`, `test:api`, `test:spa`, `build`, `gate`)
2. Replace `AGENTS.md` top section with your project name and architecture
3. Add project-specific checks to `.husky/pre-push`
4. Wire up your CI in `.github/workflows/gate.yml`
