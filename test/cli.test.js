import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { collectFormulas, parseArgs } from "../src/cli.js";
import { writePreview } from "../src/preview.js";

test("parseArgs: latex after --", () => {
  const opts = parseArgs(["--no-open", "--", "-x^2"]);
  assert.equal(opts.open, false);
  assert.deepEqual(opts.inputs, ["-x^2"]);
});

test("collectFormulas: raw arg is display math", () => {
  const formulas = collectFormulas(["E = mc^2"], "");
  assert.deepEqual(formulas, [{ tex: "E = mc^2", display: true }]);
});

test("collectFormulas: markdown file extracts delimiters", () => {
  const dir = mkdtempSync(join(tmpdir(), "mathshow-"));
  const file = join(dir, "notes.md");
  writeFileSync(file, "Intro\n\n$$\\sum n$$\n\nand $x$.\n");
  const formulas = collectFormulas([file], "");
  assert.deepEqual(formulas, [
    { tex: "\\sum n", display: true },
    { tex: "x", display: false },
  ]);
});

test("writePreview: katex html and assets", () => {
  const dir = mkdtempSync(join(tmpdir(), "mathshow-"));
  const htmlPath = writePreview([{ tex: "x^2", display: true }], dir);
  const html = readFileSync(htmlPath, "utf8");
  assert.match(html, /color-scheme:\s*dark/);
  assert.match(html, /--bg:\s*#141414/);
  assert.doesNotMatch(html, /<pre class="src">/);
  assert.match(readFileSync(join(dir, "katex", "katex.min.css"), "utf8"), /@font-face/);
});
