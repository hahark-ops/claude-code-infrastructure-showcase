# Phase 8 Week 1 Optimization Report

This report captures the first weekly optimization checkpoint.

## KPI Snapshot

- sessions observed: 42
- violations: 16
- block violations: 11
- warning violations: 5
- block hit rate: `11 / 42 = 0.262`
- labeled false-positive rate (from Phase 2 labels): `3 / (2 + 3) = 0.60`

## Distribution

- by rule:
  - `frontend-dev-guidelines`: 10
  - `frontend-mui-v7-guardrail`: 6
- by action:
  - `shadow`: 9
  - `enforce`: 7

## Week 1 Decisions

1. Keep current model tier mapping unchanged for now.
2. Keep strict MUI rule in progressive enforce mode.
3. Keep broad frontend guidance in warn mode.
4. Keep stop checks scoped in execute mode only for healthy package roots.

## Week 2 Optimization Actions

1. Expand label coverage beyond Phase 2 rows to reduce KPI uncertainty.
2. Add one additional healthy package root to execute mode rollout.
3. Recalculate false-positive rate after new labels and retune frontend path exclusions if still high.
