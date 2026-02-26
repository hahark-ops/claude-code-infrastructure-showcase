# OpenCode Plugin Skeletons

This folder contains migration skeletons for converting Claude-style hook workflows to OpenCode events.

## Included

- `hook-compat.ts`: implementation for prompt-time skill hints, edited-file tracking, and idle-time check suggestions
- `hook-compat-skeleton.ts`: minimal starter for custom adaptation

## Event Mapping

- Claude `UserPromptSubmit` -> OpenCode `tui.prompt.append`
- Claude `PostToolUse` -> OpenCode `file.edited`
- Claude `Stop` -> OpenCode `session.idle`

## Wiring Steps

1. Keep using `.claude/skills/skill-rules.json` as your trigger source
2. Keep `./.opencode/plugins/hook-compat.ts` in the `plugin` list of `.opencode/opencode.jsonc`
3. Verify cache output under `.opencode/cache/hook-compat/`
4. Tune stop-time check suggestions for your package manager and workspace layout
