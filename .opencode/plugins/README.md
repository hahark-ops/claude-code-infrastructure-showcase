# OpenCode Plugin Skeletons

This folder contains migration skeletons for converting Claude-style hook workflows to OpenCode events.

## Included

- `hook-compat.ts`: runtime adapter for suggest/warn/block enforcement, session state tracking, and stop-check planning/execution
- `hook-compat-skeleton.ts`: minimal starter for custom adaptation

## Event Mapping

- Claude `UserPromptSubmit` -> OpenCode `tui.prompt.append`
- Claude `PostToolUse` -> OpenCode `file.edited`
- Claude `Stop` -> OpenCode `session.idle`

## Wiring Steps

1. Keep using `.claude/skills/skill-rules.json` as your trigger source
2. Keep `./.opencode/plugins/hook-compat.ts` in the `plugin` list of `.opencode/opencode.jsonc`
3. Verify session state output under `.opencode/cache/hook-compat/`
4. Start with `OPENCODE_ENFORCEMENT_MODE=shadow`, then move to `enforce` after tuning
5. Start with `OPENCODE_STOP_CHECK_MODE=plan`, then move to `execute` when stable
