type SkillRules = {
  version?: string;
  skills?: Record<
    string,
    {
      promptTriggers?: {
        keywords?: string[];
        intentPatterns?: string[];
      };
      priority?: "critical" | "high" | "medium" | "low";
    }
  >;
};

const defaultRules: SkillRules = {
  version: "0",
  skills: {},
};

export async function HookCompatSkeleton() {
  return {
    "tui.prompt.append": async (input: { text?: string }, output: { text: string }) => {
      const prompt = (input?.text ?? "").toLowerCase();
      const rules = defaultRules;
      const matched: string[] = [];

      for (const [skillName, config] of Object.entries(rules.skills ?? {})) {
        const triggers = config.promptTriggers;
        if (!triggers) continue;

        const keywordHit = (triggers.keywords ?? []).some((kw) => prompt.includes(kw.toLowerCase()));
        const intentHit = (triggers.intentPatterns ?? []).some((pattern) => {
          try {
            return new RegExp(pattern, "i").test(prompt);
          } catch {
            return false;
          }
        });

        if (keywordHit || intentHit) {
          matched.push(skillName);
        }
      }

      if (matched.length > 0) {
        output.text += `\n\n[SKILL ACTIVATION] Consider loading: ${matched.join(", ")}`;
      }
    },

    "file.edited": async (event: { path?: string }) => {
      if (!event?.path) return;
    },

    "session.idle": async () => {
    },
  };
}
