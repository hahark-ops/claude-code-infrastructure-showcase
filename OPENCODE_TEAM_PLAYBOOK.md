# OpenCode Team Playbook

Operational guide for day-to-day use of the OpenCode runtime guardrails.

## Daily Operating Mode

- default guardrail mode:
  - `OPENCODE_ENFORCEMENT_MODE=shadow`
- strict rollout scope only:
  - `frontend-mui-v7-guardrail` can run in enforce mode
- stop checks:
  - default `OPENCODE_STOP_CHECK_MODE=plan`
  - enable `execute` per healthy package scope

Reference baseline:

- `OPENCODE_DEFAULT_PROFILE.md`

## Role vs Task-Agent Usage

- roles (`.opencode/oh-my-opencode.json`): orchestration and model routing
- task agents (`.claude/agents/*.md`): specialized execution prompts

Use both:

1. pick role/category for model tier
2. invoke task-agent for domain-specific execution instructions

## Incident Response

If sudden blocking noise appears:

1. set `OPENCODE_ENFORCEMENT_MODE=shadow`
2. keep trace by preserving `.opencode/cache/hook-compat/*.json`
3. inspect recent violations and affected rule IDs
4. patch `skill-rules.json` exclusions/markers
5. re-run canary before restoring enforce mode

If stop checks become noisy:

1. set `OPENCODE_STOP_CHECK_MODE=plan`
2. reduce scope or command count (`OPENCODE_STOP_MAX_COMMANDS`)
3. disable test execution unless needed (`OPENCODE_STOP_INCLUDE_TEST=1` only when required)

## Weekly Cadence

1. review KPIs from progress docs
2. confirm false-positive trend is stable
3. promote additional scopes to enforce/execute only after canary passes

## Phase 7 Completion Checklist

- role vs task-agent operating split is documented and shared
- incident response fallback (`enforce -> shadow`, `execute -> plan`) is documented
- canary-first rollout rule is documented
- on-call reviewer knows where session traces are stored (`.opencode/cache/hook-compat/*.json`)

## Handoff Notes

For new operators:

1. Read `OPENCODE_ROLLOUT_PLAN.md` for current phase status.
2. Read `OPENCODE_PHASE5_PROGRESS.md` and `OPENCODE_PHASE6_PROGRESS.md` for latest runtime behavior.
3. Start in conservative mode unless explicitly running a canary:
   - `OPENCODE_ENFORCEMENT_MODE=shadow`
   - `OPENCODE_STOP_CHECK_MODE=plan`
