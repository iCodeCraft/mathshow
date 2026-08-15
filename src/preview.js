import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import katex from "katex";

const require = createRequire(import.meta.url);
const katexRoot = dirname(require.resolve("katex/package.json"));
const katexDist = join(katexRoot, "dist");

export function defaultOutDir() {
  return join(tmpdir(), "mathshow-preview");
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderFormula(formula) {
  try {
    return katex.renderToString(formula.tex, {
      displayMode: formula.display,
      throwOnError: true,
      output: "html",
    });
  } catch (err) {
    return `<pre class="err">${escapeHtml(err.message)}\n\n${escapeHtml(formula.tex)}</pre>`;
  }
}

function syncKatexAssets(outDir) {
  const dest = join(outDir, "katex");
  const fontDest = join(dest, "fonts");
  mkdirSync(fontDest, { recursive: true });
  copyFileSync(join(katexDist, "katex.min.css"), join(dest, "katex.min.css"));
  for (const name of readdirSync(join(katexDist, "fonts"))) {
    if (/\.(woff2?|ttf)$/i.test(name)) {
      copyFileSync(join(katexDist, "fonts", name), join(fontDest, name));
    }
  }
}

function page(formulas) {
  const blocks = formulas
    .map((formula, i) => {
      const html = renderFormula(formula);
      return `<article class="block">
  <div class="math">${html}</div>
  <div class="n">${i + 1}</div>
</article>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>mathshow</title>
  <link rel="stylesheet" href="katex/katex.min.css">
  <style>
    :root {
      color-scheme: dark;
      --bg: #141414;
      --elevated: #1c1c1c;
      --stroke: #333;
      --text: #ececec;
      --text-muted: #9a9a9a;
      --text-faint: #666;
      --warn: #f59e0b;
      --sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
      --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font: 15px/1.45 var(--sans);
    }
    main { max-width: 52rem; margin: 0 auto; padding: 24px 16px 48px; }
    h1 {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-faint);
      margin: 0 0 18px;
    }
    .block {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 52px;
      padding: 14px 16px;
      margin: 0 0 12px;
      border-radius: 10px;
      border: 1px solid var(--stroke);
      background: var(--elevated);
    }
    .math { overflow-x: auto; text-align: center; width: 100%; }
    .math .katex { font-size: 1.1em; color: var(--text); }
    .n {
      position: absolute;
      top: 10px;
      right: 12px;
      color: var(--text-faint);
      font-size: 12px;
    }
    .err {
      margin: 0;
      width: 100%;
      text-align: left;
      color: var(--warn);
      font: 13px/1.4 var(--mono);
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <main>
    <h1>mathshow</h1>
    ${blocks}
  </main>
</body>
</html>
`;
}

export function writePreview(formulas, outDir = defaultOutDir()) {
  mkdirSync(outDir, { recursive: true });
  syncKatexAssets(outDir);
  const htmlPath = join(outDir, "index.html");
  writeFileSync(htmlPath, page(formulas), "utf8");
  return htmlPath;
}
