# Phase 6 Execute Expansion (Real Workspace)

This checkpoint validates execute-mode stop checks against a real workspace root.

## Real Scope Used

- workspace: `.claude/hooks`
- trigger file: `.claude/hooks/skill-activation-prompt.ts`

## Observed Result

- execute-mode output:
  - `FAIL .claude/hooks: npm run check`

## Interpretation

- execute-mode plumbing works on a real package root.
- this specific scope is currently noisy (check script fails), so it should remain triage-only until fixed.

## Tuning Applied

- stop-check planner now prefers `npm run check` over typecheck fallback when available
- test script execution is now opt-in with:
  - `OPENCODE_STOP_INCLUDE_TEST=1`

## Decision

- keep execute-mode expansion active for healthy scopes
- keep `.claude/hooks` in triage state until `npm run check` passes
