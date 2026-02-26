# Phase 2 Progress Report

This report captures the first observability checkpoint under shadow/plan operation.

## Runtime Modes

- `OPENCODE_ENFORCEMENT_MODE=shadow`
- `OPENCODE_STOP_CHECK_MODE=plan`

## Checkpoint Metrics (Snapshot)

- sessions observed: 12
- edited file records: 9
- applied skill records: 3
- total violations: 4
- violation breakdown:
  - `frontend-dev-guidelines` (`block`): 4

## Event Coverage

- `tui.prompt.append`: 4
- `tool.execute.before`: 10
- `tool.execute.after`: 6
- `file.edited`: 6
- `session.idle`: 5

## Top Rule Hits

1. `frontend-dev-guidelines` (block)

## Tuning Candidates

1. Keep `frontend-dev-guidelines` in shadow until enough real-task samples are collected.
2. Review whether `src/**/*.tsx` and `components/**/*.tsx` should remain broad or receive project-specific exclusions.
3. Add at least one real backend-route workflow sample before moving this guardrail family to enforce mode.

## Notes

- Current violations come mostly from controlled verification sessions, not extended production-like task traffic.
- False-positive rate is not finalized yet and requires manual labeling during burn-in.
