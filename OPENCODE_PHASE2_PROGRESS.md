# Phase 2 Progress Report

This report captures the first observability checkpoint under shadow/plan operation.

## Runtime Modes

- `OPENCODE_ENFORCEMENT_MODE=shadow`
- `OPENCODE_STOP_CHECK_MODE=plan`

## Checkpoint Metrics (Snapshot #2)

- sessions observed: 17
- edited file records: 16
- applied skill records: 5
- total violations: 5
- violation breakdown:
  - `frontend-dev-guidelines` (`block`): 5

## Event Coverage

- `tui.prompt.append`: 19
- `tool.execute.before`: 17
- `tool.execute.after`: 15
- `file.edited`: 6
- `session.idle`: 9

## Top Rule Hits

1. `frontend-dev-guidelines` (block)

## Top 3 Tuning Actions

1. Completed: labeled current violations in `OPENCODE_PHASE2_LABELS.md`.
2. Completed: added provisional exclusions for stories/fixtures/mocks in frontend guidance triggers.
3. Completed: split frontend block logic into strict `frontend-mui-v7-guardrail` and `frontend-dev-guidelines` warning mode.

## Notes

- Current violations are still concentrated in frontend component edit scenarios.
- Preliminary labeling result: 3 FP and 2 TP from current rows (`false_positive_rate = 0.60`).
- Tuning handoff created: `OPENCODE_PHASE4_TUNING.md`.
