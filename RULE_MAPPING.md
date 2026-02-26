# Rule Mapping: Claude Showcase -> OpenCode Runtime

## Event Mapping

| Source Concept | Claude Event | OpenCode Event | Runtime File |
|---|---|---|---|
| Prompt-time skill activation | UserPromptSubmit | `tui.prompt.append` | `.opencode/plugins/hook-compat.ts` |
| Edit tracking | PostToolUse (Edit/Write/MultiEdit) | `tool.execute.after` + `file.edited` | `.opencode/plugins/hook-compat.ts` |
| Pre-edit guardrail gate | PreToolUse | `tool.execute.before` | `.opencode/plugins/hook-compat.ts` |
| Stop-time verification | Stop | `session.idle` | `.opencode/plugins/hook-compat.ts` |

## Enforcement Mapping

| `skill-rules.json` enforcement | Behavior in OpenCode plugin |
|---|---|
| `suggest` | Appends skill suggestion hints in prompt stage |
| `warn` | Emits warning hints before edit operations |
| `block` | Shadow mode by default, enforce mode available |

## Sources of Truth

- Rule definitions: `.claude/skills/skill-rules.json`
- Runtime adapter: `.opencode/plugins/hook-compat.ts`
- OpenCode plugin wiring: `.opencode/opencode.jsonc`
