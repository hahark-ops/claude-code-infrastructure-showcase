# Event Payload Notes

This project captures event-key samples per session into `.opencode/cache/hook-compat/<session>.json`.

## Captured Events

- `tui.prompt.append`
- `tool.execute.before`
- `tool.execute.after`
- `file.edited`
- `session.idle`

## Why

OpenCode and plugin versions can expose different event shapes. Payload-key capture prevents silent breakage from hardcoded assumptions.

## Session State Fields

- `payloadSamples[]`: event name + top-level keys
- `editedFiles[]`: session-scoped edited path list
- `appliedSkills[]`: skills used in the session
- `violations[]`: warn/block rule hits and action mode

## Tuning Knobs

- `OPENCODE_HOOK_SAMPLE_LIMIT` (default `8`)
- `OPENCODE_ENFORCEMENT_MODE` (`shadow` or `enforce`, default `shadow`)
- `OPENCODE_STOP_CHECK_MODE` (`plan` or `execute`, default `plan`)
- `OPENCODE_STOP_MAX_COMMANDS` (default `6`)
