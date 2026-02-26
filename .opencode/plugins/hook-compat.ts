import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { exec as execCb } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execCb);

type Enforcement = "suggest" | "warn" | "block";
type Priority = "critical" | "high" | "medium" | "low";

type PromptTriggers = {
  keywords?: string[];
  intentPatterns?: string[];
};

type FileTriggers = {
  pathPatterns?: string[];
  pathExclusions?: string[];
  contentPatterns?: string[];
};

type SkipConditions = {
  sessionSkillUsed?: boolean;
  fileMarkers?: string[];
  envOverride?: string;
};

type SkillRule = {
  enforcement?: Enforcement;
  priority?: Priority;
  promptTriggers?: PromptTriggers;
  fileTriggers?: FileTriggers;
  blockMessage?: string;
  skipConditions?: SkipConditions;
};

type SkillRules = {
  version?: string;
  skills?: Record<string, SkillRule>;
};

type EditedRecord = {
  ts: number;
  path: string;
};

type ViolationRecord = {
  ts: number;
  skill: string;
  enforcement: Enforcement;
  path: string;
  source: string;
  action: "shadow" | "enforce";
};

type PayloadSample = {
  ts: number;
  event: string;
  keys: string[];
};

type SessionState = {
  editedFiles: EditedRecord[];
  appliedSkills: string[];
  violations: ViolationRecord[];
  payloadSamples: PayloadSample[];
};

type CheckPlan = {
  cwd: string;
  command: string;
};

const EMPTY_RULES: SkillRules = { version: "0", skills: {} };
const EMPTY_STATE: SessionState = {
  editedFiles: [],
  appliedSkills: [],
  violations: [],
  payloadSamples: [],
};

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const EDIT_TOOLS = new Set(["Edit", "MultiEdit", "Write", "NotebookEdit"]);

function readEnvMode(name: string, fallback: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) return fallback;
  return value.trim().toLowerCase();
}

function normalizeSessionId(event: any): string {
  return event?.session_id ?? event?.sessionId ?? event?.session?.id ?? "default";
}

function normalizePrompt(input: any): string {
  return input?.text ?? input?.prompt ?? input?.message ?? "";
}

function normalizeToolName(event: any): string {
  return event?.tool_name ?? event?.toolName ?? event?.tool?.name ?? "";
}

function normalizeEditedPath(event: any): string | null {
  return (
    event?.path ??
    event?.file_path ??
    event?.filePath ??
    event?.tool_input?.file_path ??
    event?.tool?.input?.file_path ??
    null
  );
}

function normalizeSkillFromEvent(event: any): string | null {
  const tool = normalizeToolName(event).toLowerCase();
  if (tool !== "skill") return null;
  return event?.tool_input?.name ?? event?.tool?.input?.name ?? null;
}

function resolveFile(projectDir: string, filePath: string): string {
  if (!filePath) return filePath;
  if (filePath.startsWith("/")) return filePath;
  return resolve(projectDir, filePath);
}

function toPosix(p: string): string {
  return p.replaceAll("\\", "/");
}

function escapeRegex(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function globToRegExp(pattern: string): RegExp {
  const source = toPosix(pattern);
  let regex = "^";
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch !== "*") {
      regex += escapeRegex(ch);
      continue;
    }

    const next = source[i + 1];
    if (next === "*") {
      const after = source[i + 2];
      if (after === "/") {
        regex += "(?:.*/)?";
        i += 2;
      } else {
        regex += ".*";
        i += 1;
      }
      continue;
    }

    regex += "[^/]*";
  }

  regex += "$";
  return new RegExp(regex, "i");
}

async function readRules(projectDir: string): Promise<SkillRules> {
  const file = join(projectDir, ".claude", "skills", "skill-rules.json");
  if (!existsSync(file)) return EMPTY_RULES;
  try {
    const parsed = JSON.parse(await readFile(file, "utf-8")) as SkillRules;
    return parsed?.skills ? parsed : EMPTY_RULES;
  } catch {
    return EMPTY_RULES;
  }
}

async function ensureStateDir(projectDir: string): Promise<string> {
  const dir = join(projectDir, ".opencode", "cache", "hook-compat");
  await mkdir(dir, { recursive: true });
  return dir;
}

async function readState(projectDir: string, sessionId: string): Promise<SessionState> {
  const dir = await ensureStateDir(projectDir);
  const file = join(dir, `${sessionId}.json`);
  if (!existsSync(file)) return { ...EMPTY_STATE };
  try {
    const parsed = JSON.parse(await readFile(file, "utf-8")) as SessionState;
    return {
      editedFiles: parsed.editedFiles ?? [],
      appliedSkills: parsed.appliedSkills ?? [],
      violations: parsed.violations ?? [],
      payloadSamples: parsed.payloadSamples ?? [],
    };
  } catch {
    return { ...EMPTY_STATE };
  }
}

async function writeState(projectDir: string, sessionId: string, state: SessionState): Promise<void> {
  const dir = await ensureStateDir(projectDir);
  const file = join(dir, `${sessionId}.json`);
  await writeFile(file, JSON.stringify(state, null, 2), "utf-8");
}

function dedupeEdited(rows: EditedRecord[]): EditedRecord[] {
  return Array.from(new Map(rows.map((row) => [row.path, row])).values()).slice(-200);
}

function dedupeStrings(rows: string[]): string[] {
  return Array.from(new Set(rows));
}

function matchesPrompt(prompt: string, triggers?: PromptTriggers): boolean {
  if (!triggers) return false;
  const lower = prompt.toLowerCase();
  const keyword = (triggers.keywords ?? []).some((kw) => lower.includes(kw.toLowerCase()));
  if (keyword) return true;
  return (triggers.intentPatterns ?? []).some((pattern) => {
    try {
      return new RegExp(pattern, "i").test(prompt);
    } catch {
      return false;
    }
  });
}

async function matchesFileTrigger(projectDir: string, filePath: string, rule: SkillRule): Promise<boolean> {
  const triggers = rule.fileTriggers;
  if (!triggers) return false;
  const rel = toPosix(relative(projectDir, resolveFile(projectDir, filePath)));
  const paths = triggers.pathPatterns ?? [];
  const excluded = (triggers.pathExclusions ?? []).some((pattern) => globToRegExp(pattern).test(rel));
  if (excluded) return false;
  const pathMatched = paths.length === 0 ? true : paths.some((pattern) => globToRegExp(pattern).test(rel));
  if (!pathMatched) return false;
  const contentPatterns = triggers.contentPatterns ?? [];
  if (contentPatterns.length === 0) return true;
  const abs = resolveFile(projectDir, filePath);
  if (!existsSync(abs)) return true;
  try {
    const content = await readFile(abs, "utf-8");
    return contentPatterns.some((pattern) => {
      try {
        return new RegExp(pattern, "i").test(content);
      } catch {
        return false;
      }
    });
  } catch {
    return true;
  }
}

function sortedSkills(items: Array<{ name: string; rule: SkillRule }>): Array<{ name: string; rule: SkillRule }> {
  return [...items].sort((a, b) => {
    const ap = PRIORITY_ORDER[a.rule.priority ?? "low"];
    const bp = PRIORITY_ORDER[b.rule.priority ?? "low"];
    return ap - bp;
  });
}

function formatPromptHints(items: Array<{ name: string; rule: SkillRule }>, mode: string): string {
  const suggest = sortedSkills(items.filter((x) => (x.rule.enforcement ?? "suggest") === "suggest"));
  const warn = sortedSkills(items.filter((x) => x.rule.enforcement === "warn"));
  const block = sortedSkills(items.filter((x) => x.rule.enforcement === "block"));
  const lines: string[] = [];
  if (suggest.length > 0) lines.push(`[SUGGEST] ${suggest.map((x) => x.name).join(", ")}`);
  if (warn.length > 0) lines.push(`[WARN] ${warn.map((x) => x.name).join(", ")}`);
  if (block.length > 0) {
    const prefix = mode === "enforce" ? "[BLOCK]" : "[BLOCK-SHADOW]";
    lines.push(`${prefix} ${block.map((x) => x.name).join(", ")}`);
  }
  return lines.join("\n");
}

function shouldBypassBlock(rule: SkillRule, state: SessionState, fileContent?: string): boolean {
  const skip = rule.skipConditions;
  if (!skip) return false;
  if (skip.envOverride && process.env[skip.envOverride]) return true;
  if (skip.sessionSkillUsed && state.appliedSkills.length > 0) return true;
  if (skip.fileMarkers && fileContent) {
    if (skip.fileMarkers.some((marker) => fileContent.includes(marker))) return true;
  }
  return false;
}

function detectPackageManager(root: string): "pnpm" | "yarn" | "bun" | "npm" {
  if (existsSync(join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(root, "yarn.lock"))) return "yarn";
  if (existsSync(join(root, "bun.lockb")) || existsSync(join(root, "bun.lock"))) return "bun";
  return "npm";
}

function scriptExists(pkg: any, name: string): boolean {
  return Boolean(pkg?.scripts && typeof pkg.scripts[name] === "string");
}

async function findPackageRoot(projectDir: string, filePath: string): Promise<string | null> {
  let current = dirname(resolveFile(projectDir, filePath));
  const base = resolve(projectDir);
  while (toPosix(current).startsWith(toPosix(base))) {
    if (existsSync(join(current, "package.json"))) return current;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return existsSync(join(projectDir, "package.json")) ? projectDir : null;
}

async function planChecks(projectDir: string, paths: string[]): Promise<CheckPlan[]> {
  const roots = new Set<string>();
  for (const path of paths) {
    const root = await findPackageRoot(projectDir, path);
    if (root) roots.add(root);
  }
  if (roots.size === 0 && existsSync(join(projectDir, "package.json"))) roots.add(projectDir);

  const plans: CheckPlan[] = [];
  for (const root of roots) {
    let pkg: any = {};
    try {
      pkg = JSON.parse(await readFile(join(root, "package.json"), "utf-8"));
    } catch {
      pkg = {};
    }
    const pm = detectPackageManager(root);
    const run = (script: string) => {
      if (pm === "npm") return `npm run ${script}`;
      return `${pm} ${script}`;
    };

    if (scriptExists(pkg, "typecheck")) plans.push({ cwd: root, command: run("typecheck") });
    else if (existsSync(join(root, "tsconfig.json"))) plans.push({ cwd: root, command: "npx tsc --noEmit" });

    if (scriptExists(pkg, "lint")) plans.push({ cwd: root, command: run("lint") });
    if (scriptExists(pkg, "test")) plans.push({ cwd: root, command: run("test") });
    if (scriptExists(pkg, "build")) plans.push({ cwd: root, command: run("build") });
    if (existsSync(join(root, "prisma", "schema.prisma")) || existsSync(join(root, "schema.prisma"))) {
      plans.push({ cwd: root, command: "npx prisma generate" });
    }
  }

  const deduped = Array.from(new Map(plans.map((p) => [`${p.cwd}|${p.command}`, p])).values());
  const limit = Number(process.env.OPENCODE_STOP_MAX_COMMANDS ?? 6);
  return deduped.slice(0, Number.isFinite(limit) ? limit : 6);
}

async function runChecks(plans: CheckPlan[]): Promise<Array<{ plan: CheckPlan; ok: boolean; output: string }>> {
  const results: Array<{ plan: CheckPlan; ok: boolean; output: string }> = [];
  for (const plan of plans) {
    try {
      const { stdout, stderr } = await exec(plan.command, { cwd: plan.cwd, timeout: 120000 });
      results.push({ plan, ok: true, output: `${stdout}\n${stderr}`.trim() });
    } catch (error: any) {
      const out = `${error?.stdout ?? ""}\n${error?.stderr ?? ""}`.trim();
      results.push({ plan, ok: false, output: out || String(error?.message ?? "failed") });
    }
  }
  return results;
}

async function recordPayloadSample(projectDir: string, sessionId: string, eventName: string, payload: any): Promise<void> {
  const state = await readState(projectDir, sessionId);
  const max = Number(process.env.OPENCODE_HOOK_SAMPLE_LIMIT ?? 8);
  if (state.payloadSamples.length >= max) return;
  const keys = Object.keys(payload ?? {}).slice(0, 32);
  state.payloadSamples.push({ ts: Date.now(), event: eventName, keys });
  await writeState(projectDir, sessionId, state);
}

export default async function HookCompatPlugin(context: { directory?: string } = {}) {
  const projectDir = context.directory ?? process.cwd();
  const enforcementMode = readEnvMode("OPENCODE_ENFORCEMENT_MODE", "shadow");
  const stopCheckMode = readEnvMode("OPENCODE_STOP_CHECK_MODE", "plan");

  return {
    "tui.prompt.append": async (input: any, output: { text?: string }) => {
      const sessionId = normalizeSessionId(input);
      await recordPayloadSample(projectDir, sessionId, "tui.prompt.append", input);
      const prompt = normalizePrompt(input);
      if (!prompt.trim()) return;

      const rules = await readRules(projectDir);
      const matched = Object.entries(rules.skills ?? {})
        .filter(([, rule]) => matchesPrompt(prompt, rule.promptTriggers))
        .map(([name, rule]) => ({ name, rule }));

      if (matched.length === 0) return;
      const hint = formatPromptHints(matched, enforcementMode);
      output.text = `${output.text ?? ""}\n\n${hint}`;

      const blocked = matched.filter((x) => x.rule.enforcement === "block");
      if (blocked.length > 0 && enforcementMode === "enforce") {
        throw new Error(`Blocked by guardrail: ${blocked.map((x) => x.name).join(", ")}`);
      }
    },

    "tool.execute.before": async (event: any, output?: { text?: string }) => {
      const sessionId = normalizeSessionId(event);
      await recordPayloadSample(projectDir, sessionId, "tool.execute.before", event);
      const toolName = normalizeToolName(event);
      const path = normalizeEditedPath(event);
      if (!EDIT_TOOLS.has(toolName) || !path) return;

      const state = await readState(projectDir, sessionId);
      const abs = resolveFile(projectDir, path);
      let content = "";
      if (existsSync(abs)) {
        try {
          content = await readFile(abs, "utf-8");
        } catch {
          content = "";
        }
      }

      const rules = await readRules(projectDir);
      const violations: ViolationRecord[] = [];
      for (const [skill, rule] of Object.entries(rules.skills ?? {})) {
        const enforcement = rule.enforcement ?? "suggest";
        if (enforcement === "suggest") continue;
        const matched = await matchesFileTrigger(projectDir, path, rule);
        if (!matched) continue;
        if (enforcement === "block" && shouldBypassBlock(rule, state, content)) continue;
        violations.push({
          ts: Date.now(),
          skill,
          enforcement,
          path,
          source: "tool.execute.before",
          action: enforcementMode === "enforce" && enforcement === "block" ? "enforce" : "shadow",
        });
      }

      if (violations.length === 0) return;
      state.violations = [...state.violations, ...violations].slice(-200);
      await writeState(projectDir, sessionId, state);

      const warns = violations.filter((x) => x.enforcement === "warn");
      const blocks = violations.filter((x) => x.enforcement === "block");
      const pieces: string[] = [];
      if (warns.length > 0) pieces.push(`[WARN] ${warns.map((x) => x.skill).join(", ")}`);
      if (blocks.length > 0) {
        const prefix = enforcementMode === "enforce" ? "[BLOCK]" : "[BLOCK-SHADOW]";
        pieces.push(`${prefix} ${blocks.map((x) => x.skill).join(", ")}`);
      }
      if (output && pieces.length > 0) output.text = `${output.text ?? ""}\n\n${pieces.join("\n")}`;

      if (blocks.length > 0 && enforcementMode === "enforce") {
        const message = blocks
          .map((x) => rules.skills?.[x.skill]?.blockMessage)
          .filter(Boolean)
          .join("\n\n")
          .replaceAll("{file_path}", path);
        throw new Error(message || `Blocked by guardrail: ${blocks.map((x) => x.skill).join(", ")}`);
      }
    },

    "tool.execute.after": async (event: any) => {
      const sessionId = normalizeSessionId(event);
      await recordPayloadSample(projectDir, sessionId, "tool.execute.after", event);
      const state = await readState(projectDir, sessionId);

      const skill = normalizeSkillFromEvent(event);
      if (skill) {
        state.appliedSkills = dedupeStrings([...state.appliedSkills, skill]);
      }

      const path = normalizeEditedPath(event);
      const toolName = normalizeToolName(event);
      if (path && EDIT_TOOLS.has(toolName)) {
        state.editedFiles = dedupeEdited([...state.editedFiles, { ts: Date.now(), path }]);
      }

      await writeState(projectDir, sessionId, state);
    },

    "file.edited": async (event: any) => {
      const sessionId = normalizeSessionId(event);
      await recordPayloadSample(projectDir, sessionId, "file.edited", event);
      const path = normalizeEditedPath(event);
      if (!path) return;

      const state = await readState(projectDir, sessionId);
      state.editedFiles = dedupeEdited([...state.editedFiles, { ts: Date.now(), path }]);
      await writeState(projectDir, sessionId, state);
    },

    "session.idle": async (event: any, output?: { text?: string }) => {
      const sessionId = normalizeSessionId(event);
      await recordPayloadSample(projectDir, sessionId, "session.idle", event);
      const state = await readState(projectDir, sessionId);
      const editedPaths = state.editedFiles.map((x) => x.path);
      if (editedPaths.length === 0) return;

      const plans = await planChecks(projectDir, editedPaths);
      if (plans.length === 0) return;

      if (stopCheckMode === "execute") {
        const results = await runChecks(plans);
        const summary = results
          .map((r) => `${r.ok ? "OK" : "FAIL"} ${relative(projectDir, r.plan.cwd) || "."}: ${r.plan.command}`)
          .join("\n");
        if (output) output.text = `${output.text ?? ""}\n\n[STOP CHECKS]\n${summary}`;
      } else {
        const summary = plans
          .map((plan) => `${relative(projectDir, plan.cwd) || "."}: ${plan.command}`)
          .join("\n");
        if (output) output.text = `${output.text ?? ""}\n\n[STOP CHECK PLAN]\n${summary}`;
      }
    },
  };
}
