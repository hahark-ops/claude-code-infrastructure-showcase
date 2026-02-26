import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

type PromptTriggers = {
  keywords?: string[];
  intentPatterns?: string[];
};

type SkillRule = {
  priority?: "critical" | "high" | "medium" | "low";
  promptTriggers?: PromptTriggers;
};

type SkillRules = {
  version?: string;
  skills?: Record<string, SkillRule>;
};

type EditedRecord = {
  ts: number;
  path: string;
};

const EMPTY_RULES: SkillRules = { version: "0", skills: {} };

function normalizeSessionId(event: any): string {
  return (
    event?.session_id ??
    event?.sessionId ??
    event?.session?.id ??
    "default"
  );
}

function normalizeEditedPath(event: any): string | null {
  return (
    event?.path ??
    event?.file_path ??
    event?.filePath ??
    event?.tool_input?.file_path ??
    null
  );
}

async function readRules(projectDir: string): Promise<SkillRules> {
  const rulesPath = join(projectDir, ".claude", "skills", "skill-rules.json");
  if (!existsSync(rulesPath)) return EMPTY_RULES;
  try {
    const raw = await readFile(rulesPath, "utf-8");
    const parsed = JSON.parse(raw) as SkillRules;
    return parsed?.skills ? parsed : EMPTY_RULES;
  } catch {
    return EMPTY_RULES;
  }
}

function pickSkills(prompt: string, rules: SkillRules): string[] {
  const p = prompt.toLowerCase();
  const skills = rules.skills ?? {};
  const matched = new Set<string>();

  for (const [name, config] of Object.entries(skills)) {
    const triggers = config.promptTriggers;
    if (!triggers) continue;

    const keywordMatch = (triggers.keywords ?? []).some((kw) => p.includes(kw.toLowerCase()));
    const intentMatch = (triggers.intentPatterns ?? []).some((pattern) => {
      try {
        return new RegExp(pattern, "i").test(prompt);
      } catch {
        return false;
      }
    });

    if (keywordMatch || intentMatch) matched.add(name);
  }

  return [...matched];
}

async function appendEdited(projectDir: string, sessionId: string, path: string): Promise<void> {
  const dir = join(projectDir, ".opencode", "cache", "hook-compat");
  await mkdir(dir, { recursive: true });
  const file = join(dir, `${sessionId}.json`);

  let rows: EditedRecord[] = [];
  if (existsSync(file)) {
    try {
      rows = JSON.parse(await readFile(file, "utf-8")) as EditedRecord[];
    } catch {
      rows = [];
    }
  }

  rows.push({ ts: Date.now(), path });
  const uniq = Array.from(new Map(rows.map((r) => [r.path, r])).values());
  await writeFile(file, JSON.stringify(uniq, null, 2), "utf-8");
}

async function readEdited(projectDir: string, sessionId: string): Promise<EditedRecord[]> {
  const file = join(projectDir, ".opencode", "cache", "hook-compat", `${sessionId}.json`);
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(await readFile(file, "utf-8")) as EditedRecord[];
  } catch {
    return [];
  }
}

function suggestChecks(paths: string[]): string[] {
  const checks = new Set<string>();
  const hasTs = paths.some((p) => p.endsWith(".ts") || p.endsWith(".tsx"));
  const hasJs = paths.some((p) => p.endsWith(".js") || p.endsWith(".jsx"));
  const hasPkg = paths.some((p) => p.endsWith("package.json"));
  const hasPrisma = paths.some((p) => p.includes("prisma") && p.endsWith(".prisma"));

  if (hasTs) checks.add("npx tsc --noEmit");
  if (hasJs || hasTs) checks.add("npm run lint");
  if (hasPkg) checks.add("npm install");
  if (hasPrisma) checks.add("npx prisma generate");
  if (checks.size === 0) checks.add("npm test");

  return [...checks];
}

export default async function HookCompatPlugin(context: { directory?: string } = {}) {
  const projectDir = context.directory ?? process.cwd();

  return {
    "tui.prompt.append": async (input: { text?: string }, output: { text: string }) => {
      const prompt = input?.text ?? "";
      if (!prompt.trim()) return;

      const rules = await readRules(projectDir);
      const matched = pickSkills(prompt, rules);
      if (matched.length === 0) return;

      output.text += `\n\n[SKILL ACTIVATION] ${matched.join(", ")}`;
    },

    "file.edited": async (event: any) => {
      const sessionId = normalizeSessionId(event);
      const edited = normalizeEditedPath(event);
      if (!edited) return;
      await appendEdited(projectDir, sessionId, edited);
    },

    "session.idle": async (event: any, output?: { text?: string }) => {
      const sessionId = normalizeSessionId(event);
      const edited = await readEdited(projectDir, sessionId);
      if (edited.length === 0 || !output) return;

      const checks = suggestChecks(edited.map((e) => e.path));
      output.text = `${output.text ?? ""}\n\n[STOP CHECKS] ${checks.join(" | ")}`;
    },
  };
}
