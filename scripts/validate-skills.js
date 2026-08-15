#!/usr/bin/env node
// Lightweight SKILL.md frontmatter checks (mirrors CI).
// Source of truth for installable skills: skills/<name>/SKILL.md
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const skillsRoot = join(process.cwd(), "skills");
const entries = readdirSync(skillsRoot);
const skillFiles = [];

for (const name of entries) {
  const dir = join(skillsRoot, name);
  if (!statSync(dir).isDirectory()) continue;
  const skillPath = join(dir, "SKILL.md");
  try {
    if (statSync(skillPath).isFile()) skillFiles.push({ folder: name, path: skillPath });
  } catch {
    // no SKILL.md
  }
}

if (!skillFiles.length) {
  console.error("No skills/<name>/SKILL.md found");
  process.exit(1);
}

const errors = [];
const nameRe = /^name:\s*["']?([a-z0-9-]+)["']?\s*$/m;
const hasNameRe = /^name:\s*\S+/m;
const hasDescRe = /^description:\s*\S+/m;
const folderRe = /^[a-z0-9-]+$/;

for (const { folder, path } of skillFiles) {
  const text = readFileSync(path, "utf8");
  if (!text.startsWith("---")) {
    errors.push(`${path}: missing opening YAML frontmatter`);
    continue;
  }
  const end = text.indexOf("\n---", 3);
  if (end === -1) {
    errors.push(`${path}: missing closing YAML frontmatter`);
    continue;
  }
  const fm = text.slice(3, end);
  if (!hasNameRe.test(fm)) errors.push(`${path}: missing name`);
  if (
    !hasDescRe.test(fm) &&
    !fm.includes("description: >-") &&
    !fm.includes("description: |")
  ) {
    errors.push(`${path}: missing description`);
  }
  const nameM = fm.match(nameRe);
  if (nameM && nameM[1] !== folder) {
    errors.push(`${path}: name ${JSON.stringify(nameM[1])} != folder ${JSON.stringify(folder)}`);
  }
  if (!folderRe.test(folder)) {
    errors.push(`${path}: folder must be lowercase/hyphens only`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`OK — ${skillFiles.length} skill(s)`);
for (const { path } of skillFiles) console.log(`  - ${path}`);
