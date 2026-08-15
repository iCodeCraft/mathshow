# Contributing

This pack stays small on purpose. Prefer a sharper rule over a longer essay.

## Rules for skill changes

1. Keep `show-math` focused — **one job**: make math visible via `mathshow`.
2. Descriptions must include **what** and **when** (routing keywords the agent can match).
3. Prefer MUST/NEVER rules and checklists over prose.
4. Keep the skill portable under [`skills/`](./skills/) (works via `npx skills add`). Optional Cursor plugin manifest: [`.cursor-plugin/plugin.json`](./.cursor-plugin/plugin.json) — don't replace the skill with Cursor-only rules.
5. Don't turn the skill into a general math tutoring guide.

## Description guidance

The YAML `description` is the router. Keep it roughly **1–3 sentences / ~400 chars**:

- Lead with **what** the skill does
- End with **when** to use it (verbs + user phrases)
- Avoid marketing language; agents match keywords, not vibes

```yaml
description: >-
  Render LaTeX math so the user can actually see it. CLI agents do not typeset
  $...$ or $$...$$. Use when writing or explaining formulas, equations,
  derivations, integrals, matrices, or when the user mentions LaTeX, KaTeX,
  or showing math.
```

## CLI changes

- Keep the public surface small: args in → HTML preview out
- Prefer `npx --yes mathshow` in docs/skill so no global install is required
- Add or update tests under `test/` when behavior changes

## Validate locally

```bash
npm test
npm run validate:skills
npx skills add . -a cursor -y
npx skills list
```

CI checks tests and that every `skills/*/SKILL.md` has `name` + `description` frontmatter matching the folder name.

## Release checklist

Do these in order before announcing:

1. **GitHub** — repo `iCodeCraft/mathshow` is **public**, `main` has the release commit, LICENSE is MIT
2. **npm** — `npm publish` so `npx --yes mathshow` works (the skill depends on it)
3. **Tag** — `git tag v0.1.0 && git push origin v0.1.0` (optional but nice)
4. **skills.sh** — after the repo is public, `npx skills add iCodeCraft/mathshow` should discover `skills/show-math`
5. Smoke-test in a fresh Cursor chat: ask for a formula → agent runs `npx --yes mathshow -- '...'` → browser preview opens
