import { readFileSync, statSync } from "node:fs";
import { stdin as stdinFd } from "node:process";
import { extractMath } from "./extract.js";
import { openPreview, shouldOpen } from "./open.js";
import { defaultOutDir, writePreview } from "./preview.js";

const HELP = `mathshow — show LaTeX math in the browser (KaTeX)

Usage:
  mathshow 'E = mc^2'
  mathshow notes.md
  echo '$$\\\\int x$$' | mathshow

Options:
  --no-open      write preview, do not open browser
  --out <dir>    preview directory (default: $TMPDIR/mathshow-preview)
  -h, --help
`;

export function parseArgs(argv) {
  const opts = {
    help: false,
    open: true,
    outDir: defaultOutDir(),
    inputs: [],
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") {
      opts.inputs.push(...argv.slice(i + 1));
      break;
    }
    if (arg === "-h" || arg === "--help") opts.help = true;
    else if (arg === "--no-open") opts.open = false;
    else if (arg === "--out") {
      const dir = argv[++i];
      if (!dir) throw new Error("--out needs a directory");
      opts.outDir = dir;
    } else if (arg.startsWith("-")) {
      throw new Error(`unknown option: ${arg}`);
    } else {
      opts.inputs.push(arg);
    }
  }

  return opts;
}

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function readStdin() {
  if (stdinFd.isTTY) return "";
  return readFileSync(0, "utf8");
}

export function collectFormulas(inputs, stdinText) {
  const formulas = [];

  const pushSource = (name, text, rawFallback) => {
    const found = extractMath(text);
    if (found.length) {
      formulas.push(...found);
      return;
    }
    const trimmed = text.trim();
    if (rawFallback && trimmed) {
      formulas.push({ tex: trimmed, display: true });
      return;
    }
    if (!rawFallback) {
      throw new Error(`no math found in ${name}`);
    }
  };

  if (stdinText.trim()) {
    pushSource("stdin", stdinText, true);
  }

  for (const input of inputs) {
    if (isFile(input)) {
      pushSource(input, readFileSync(input, "utf8"), false);
    } else {
      pushSource("arg", input, true);
    }
  }

  return formulas;
}

export async function main(argv = process.argv.slice(2)) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (err) {
    console.error(`mathshow: ${err.message}`);
    console.error("try mathshow --help");
    return 1;
  }

  if (opts.help) {
    console.log(HELP);
    return 0;
  }

  const stdinText = readStdin();
  if (!opts.inputs.length && !stdinText.trim()) {
    console.error("mathshow: pass LaTeX, a markdown file, or pipe stdin");
    console.error("try mathshow --help");
    return 1;
  }

  let formulas;
  try {
    formulas = collectFormulas(opts.inputs, stdinText);
  } catch (err) {
    console.error(`mathshow: ${err.message}`);
    return 1;
  }

  if (!formulas.length) {
    console.error("mathshow: no formulas to show");
    return 1;
  }

  const htmlPath = writePreview(formulas, opts.outDir);
  const n = formulas.length;
  console.log(`mathshow: ${n} formula${n === 1 ? "" : "s"}`);
  for (const formula of formulas) {
    const wrap = formula.display ? "$$" : "$";
    console.log(`${wrap}${formula.tex}${wrap}`);
  }
  console.log(htmlPath);

  if (shouldOpen({ openFlag: opts.open })) {
    const ok = await openPreview(htmlPath);
    if (!ok) console.error("mathshow: could not open browser; open the path above");
  }

  return 0;
}
