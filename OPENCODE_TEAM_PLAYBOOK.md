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
