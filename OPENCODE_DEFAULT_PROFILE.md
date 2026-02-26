# OpenCode Default Profile (Locked)

This profile is locked based on Week 1-4 optimization checkpoints.

## Runtime Defaults

- `OPENCODE_ENFORCEMENT_MODE=shadow`
- `OPENCODE_STOP_CHECK_MODE=plan`
- `OPENCODE_STOP_MAX_COMMANDS=6`
- `OPENCODE_STOP_INCLUDE_TEST` unset (tests are opt-in)

## Guardrail Policy

- `frontend-mui-v7-guardrail`: strict rule, can be promoted to enforce per approved canary scope
- `frontend-dev-guidelines`: warning-only guidance rule

## Execute Rollout Policy

- allow execute mode only on healthy package roots (check script passes)
- keep noisy roots in plan mode until stabilized

## Promotion Rule

Promote a scope from plan -> execute only when:

1. scope health checks pass consistently
2. no critical false-positive incidents in recent canary
3. rollback owner is designated
