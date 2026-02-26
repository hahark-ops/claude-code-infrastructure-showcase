# OpenCode Observability Baseline

This file captures the Phase 2 observability kickoff state.

## Runtime Mode Baseline

- `OPENCODE_ENFORCEMENT_MODE=shadow`
- `OPENCODE_STOP_CHECK_MODE=plan`

## Initial Evidence Snapshot

- Session state sample: `.opencode/cache/hook-compat/phase2baseline.json`
- Verified fields:
  - `editedFiles[]`
  - `appliedSkills[]`
  - `payloadSamples[]`

## KPI Template

Track these at each review checkpoint:

1. block hit rate
2. false-positive rate
3. stop-check pass rate

## Current Observation

- Session capture and payload key logging are functioning.
- No rule violations in baseline sample.
- Stop checks remain in `plan` mode for now.
