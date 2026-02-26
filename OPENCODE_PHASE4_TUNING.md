# Phase 4 Rule Tuning

This document records the first tuning pass derived from Phase 2 observations.

## Applied Changes

1. `frontend-dev-guidelines`
   - enforcement changed: `block` -> `warn`
   - purpose narrowed to general frontend guidance
   - exclusions expanded for stories, fixtures, mocks

2. `frontend-mui-v7-guardrail` (new)
   - enforcement: `block`
   - purpose: block only strict/high-risk MUI legacy usage
   - content triggers include legacy imports and old Grid prop patterns

## Why This Split

- Observed block hits were concentrated in broad component-edit flows.
- Broad block behavior raised likely false positives during shadow burn-in.
- Splitting guidance (`warn`) from strict legacy misuse (`block`) reduces noise while preserving guardrail safety.

## Next Verification

1. Run another shadow checkpoint and compare block hit deltas.
2. Confirm `frontend-mui-v7-guardrail` only triggers on real legacy patterns.
3. Move to progressive enforce only after false-positive rate remains below target threshold.
