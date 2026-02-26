# Block Policy

## Modes

- `shadow` (default): block rules are reported but do not stop execution
- `enforce`: block rules stop execution with rule-specific message when available

Set mode with:

```bash
export OPENCODE_ENFORCEMENT_MODE=shadow
```

or

```bash
export OPENCODE_ENFORCEMENT_MODE=enforce
```

## Bypass Conditions

Bypass behavior comes from each rule's `skipConditions` in `.claude/skills/skill-rules.json`:

- env-based override (`envOverride`)
- session skill usage requirement (`sessionSkillUsed`)
- marker-based skip (`fileMarkers`)

## Rollout Recommendation

1. Start in `shadow`
2. Observe violations in session state files
3. Tune false positives (path patterns, exclusions, markers)
4. Move to `enforce`
