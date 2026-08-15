---
name: show-math
description: >-
  Render LaTeX math so the user can actually see it. CLI agents do not typeset
  $...$ or $$...$$. Use when writing or explaining formulas, equations,
  derivations, integrals, matrices, or when the user mentions LaTeX, KaTeX,
  or showing math. Run mathshow; do not leave raw TeX as the only view.
license: MIT
compatibility: Requires Node.js 18+ and a way to open a browser (or --no-open in CI).
metadata:
  author: iCodeCraft
  version: "0.1.0"
---

# Show math

CLI transcripts cannot render LaTeX. When the user should **see** a formula, run `mathshow`. Do not wrap the agent. Do not generate an image of the formula.

## Command

Prefer `npx` so no global install is required:

```bash
npx --yes mathshow -- '<latex>'
```

If `mathshow` is already on PATH:

```bash
mathshow -- '<latex>'
```

From this repo while developing:

```bash
node bin/mathshow.js -- '<latex>'
```

| Input | Example |
|---|---|
| One formula | `npx --yes mathshow -- 'E = mc^2'` |
| Several | `npx --yes mathshow -- 'E = mc^2' 'F = ma'` |
| Markdown with `$` / `$$` / `\[...\]` | `npx --yes mathshow notes.md` |

`--no-open` only in CI. Default must open the KaTeX browser preview.

## Rules

- MUST run `mathshow` when the reply contains math the user needs to see
- MUST pass real TeX (`\int`, `\frac`, `\sum`), not Unicode approximations as the source
- NEVER skip the preview because the transcript already shows `$...$`
- NEVER use image-generation tools to draw equations
- NEVER paste a screenshot instead of TeX
