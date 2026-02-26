# OpenCode Rollout Plan

This file tracks the execution order for the OpenCode-only operational rollout.

## Phase 1 - Merge and Baseline Lock

Status: completed

- Merge runtime enforcement PR
- Sync local `main`
- Create and push baseline tag `v0.1-opencode-runtime`

## Phase 2 - Observability Setup

Status: completed

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

Status: completed

- Operate with real tasks for 1-2 days
- Identify top false-positive rules
- Create tuning candidates for path patterns and exclusions

Current artifacts:

- Labels: `OPENCODE_PHASE2_LABELS.md`
- Progress snapshots: `OPENCODE_PHASE2_PROGRESS.md`
- Burn-in report: `OPENCODE_PHASE3_BURNIN.md`

## Phase 4 - Rule Tuning

Status: completed

- Tune `skill-rules.json` path patterns, exclusions, and skip markers
- Re-run burn-in sample

Current artifact:

- Tuning notes: `OPENCODE_PHASE4_TUNING.md`

## Phase 5 - Progressive Enforce

Status: in_progress

- Enable `enforce` on one guardrail family first
- Keep remaining rules in shadow mode
- Roll back immediately on noisy blocks

Current checkpoint:

- Canary result included in `OPENCODE_PHASE3_BURNIN.md`
- Expansion report: `OPENCODE_PHASE5_PROGRESS.md`

## Phase 6 - Stop Runner Progressive Execute

Status: in_progress

- Move from `plan` to `execute` by scope
- Verify package-manager and monorepo command resolution
- Tune command cap and timeout behavior

Current checkpoint:

- Execute-mode report: `OPENCODE_PHASE6_PROGRESS.md`
- Real-scope expansion: `OPENCODE_PHASE6_EXPANSION.md`

## Phase 7 - Team Playbook

Status: in_progress

- Document role vs task-agent usage
- Document incident response and rollback procedure

Current artifact:

- Team playbook: `OPENCODE_TEAM_PLAYBOOK.md`

## Phase 8 - Weekly Optimization

Status: pending

- Review runtime KPIs
- Adjust model tiers and concurrency
- Adjust guardrails and stop-check strategy
