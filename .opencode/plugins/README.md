# OpenCode Plugin Skeletons

This folder contains migration skeletons for converting Claude-style hook workflows to OpenCode events.

## Included

- `hook-compat-skeleton.ts`: event handler skeleton for prompt-time skill hints, edited file tracking, and idle-time checks

## Event Mapping

- Claude `UserPromptSubmit` -> OpenCode `tui.prompt.append`
- Claude `PostToolUse` -> OpenCode `file.edited`
- Claude `Stop` -> OpenCode `session.idle`

## Wiring Steps

1. Keep using `.claude/skills/skill-rules.json` as your trigger source
2. Replace `defaultRules` in the skeleton with file-backed loading
3. Add persistence for edited files by session ID
4. Add TypeScript/build/test checks in `session.idle`
5. Register this plugin in your OpenCode config after implementation
