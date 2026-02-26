# OpenCode Rollout Plan

This file tracks the execution order for the OpenCode-only operational rollout.

## Phase 1 - Merge and Baseline Lock

Status: completed

- Merge runtime enforcement PR
- Sync local `main`
- Create and push baseline tag `v0.1-opencode-runtime`

## Phase 2 - Observability Setup

Status: in_progress

- Run in `OPENCODE_ENFORCEMENT_MODE=shadow`
- Run in `OPENCODE_STOP_CHECK_MODE=plan`
- Collect session state and payload samples
- Define KPI snapshots: block hit rate, false-positive rate, stop-check pass rate

Kickoff evidence:

- Baseline note: `OPENCODE_OBSERVABILITY_BASELINE.md`
- Session sample: `.opencode/cache/hook-compat/phase2baseline.json`

Checkpoint artifacts:

- Progress report: `OPENCODE_PHASE2_PROGRESS.md`
- Labeling sheet: `OPENCODE_PHASE2_LABELS.md`

## Phase 3 - Shadow Burn-in

Status: pending

- Operate with real tasks for 1-2 days
- Identify top false-positive rules
- Create tuning candidates for path patterns and exclusions

## Phase 4 - Rule Tuning

Status: pending

- Tune `skill-rules.json` path patterns, exclusions, and skip markers
- Re-run burn-in sample

## Phase 5 - Progressive Enforce

Status: pending

- Enable `enforce` on one guardrail family first
- Keep remaining rules in shadow mode
- Roll back immediately on noisy blocks

## Phase 6 - Stop Runner Progressive Execute

Status: pending

- Move from `plan` to `execute` by scope
- Verify package-manager and monorepo command resolution
- Tune command cap and timeout behavior

## Phase 7 - Team Playbook

Status: pending

- Document role vs task-agent usage
- Document incident response and rollback procedure

## Phase 8 - Weekly Optimization

Status: pending

- Review runtime KPIs
- Adjust model tiers and concurrency
- Adjust guardrails and stop-check strategy
