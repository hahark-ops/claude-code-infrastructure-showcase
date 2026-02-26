# Migration to OpenCode

This repository started as a Claude Code infrastructure showcase. This guide documents the OpenCode migration plan and what changed.

## Goals

- Preserve the original reference structure and examples
- Keep skills and agent patterns reusable
- Replace Claude-specific runtime assumptions with OpenCode-compatible configuration
- Remove Antigravity model dependencies and use OpenAI GPT-family models

## Compatibility Snapshot

- Skills: mostly portable as content
- Agents: portable with path and invocation updates
- Commands: portable with OpenCode command layout
- Hooks: require adaptation because Claude hook events and OpenCode plugin events differ

## What Is Added in This Fork

- `.opencode/opencode.jsonc`: OpenCode base config template
- `.opencode/oh-my-opencode.json`: oh-my-opencode role/category model mapping using GPT models
- `.opencode/plugins/hook-compat-skeleton.ts`: starter event mapping for Claude-style hooks
- `.opencode/plugins/README.md`: wiring notes for event and persistence adaptation
- `.gitignore` updates for OpenCode local runtime files and local secrets

## Migration Checklist

1. Keep upstream reference in sync
2. Start from core skills and agent files
3. Port hook logic to OpenCode plugin events using `.opencode/plugins/hook-compat-skeleton.ts`
4. Re-map project path triggers in `skill-rules.json`
5. Validate skill activation, edited-file tracking, and stop-time checks
6. Iterate on provider/model settings after workload profiling

## Plugin Wiring Checklist

1. Read trigger source from `.claude/skills/skill-rules.json`
2. Implement prompt-time matcher in `tui.prompt.append`
3. Record edited files from `file.edited` by session
4. Run scoped checks from `session.idle`
5. Register plugin in OpenCode config after implementation is complete

## Verification Checklist

1. Prompt includes matched keyword and outputs skill hint
2. Edit events append file paths to session-scoped tracking storage
3. Idle event runs check command list only for touched scopes
4. No local secrets or runtime caches are tracked by git

## Upstream Sync Strategy

- `origin`: this fork
- `upstream`: `diet103/claude-code-infrastructure-showcase`

Recommended update flow:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

Then rebase migration branches as needed:

```bash
git checkout feat/opencode-migration
git rebase main
```
