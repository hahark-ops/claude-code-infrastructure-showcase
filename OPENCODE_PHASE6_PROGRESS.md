# Phase 6 Stop Runner Execute Report

This report captures the first execute-mode checkpoint for stop checks.

## Scope

- mode: `OPENCODE_STOP_CHECK_MODE=execute`
- command cap: `OPENCODE_STOP_MAX_COMMANDS=6`
- enforcement mode during this test: `shadow`

## Scenarios

1. `phase6-exec-ok`
   - package: `.tmp-phase6/okpkg`
   - expected: all checks pass
   - observed:
     - `OK npm run typecheck`
     - `OK npm run lint`
     - `OK npm run test`
     - `OK npm run build`

2. `phase6-exec-fail`
   - package: `.tmp-phase6/failpkg`
   - expected: lint fails, others pass
   - observed:
     - `OK npm run typecheck`
     - `FAIL npm run lint`
     - `OK npm run test`

## Rollout Guard

- Keep execute-mode rollout scoped per package/workspace.
- If a package becomes noisy, revert that scope to `plan` mode for triage.
- Maintain current guardrail split: strict rule enforce, broad frontend guidance warn.

## Decision

Phase 6 execute-mode behavior is functioning and can be expanded gradually to real package roots.
