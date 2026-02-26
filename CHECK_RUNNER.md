# Stop Check Runner

Stop checks run on `session.idle` from `.opencode/plugins/hook-compat.ts`.

## Modes

- `plan` (default): prints scoped commands without execution
- `execute`: runs scoped commands and reports pass/fail summary

Set mode with:

```bash
export OPENCODE_STOP_CHECK_MODE=plan
```

or

```bash
export OPENCODE_STOP_CHECK_MODE=execute
```

## Package Manager Detection

Per package root:

- `pnpm-lock.yaml` -> `pnpm`
- `yarn.lock` -> `yarn`
- `bun.lock`/`bun.lockb` -> `bun`
- fallback -> `npm`

## Command Selection

Per package root, command plan prefers:

1. `check` script, else `typecheck` script, else `npx tsc --noEmit` when `tsconfig.json` exists
2. `lint` script
3. `test` script (only when `OPENCODE_STOP_INCLUDE_TEST=1`)
4. `build` script
5. `npx prisma generate` when Prisma schema exists

Use `OPENCODE_STOP_MAX_COMMANDS` to cap generated commands.
