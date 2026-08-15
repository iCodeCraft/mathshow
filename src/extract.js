const FENCE = /```[\s\S]*?```/g;
const INLINE_CODE = /`[^`]+`/g;

const DISPLAY_DOLLARS = /\$\$([\s\S]+?)\$\$/g;
const DISPLAY_BRACKETS = /\\\[([\s\S]+?)\\\]/g;
const INLINE_PARENS = /\\\(([\s\S]+?)\\\)/g;
const INLINE_DOLLARS = /(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g;

function stripCode(text) {
  return text.replace(FENCE, " ").replace(INLINE_CODE, " ");
}

function isMoney(tex) {
  return /^\s*[\d][\d,.]*(?:\s*(?:usd|eur|gbp))?\s*$/i.test(tex);
}

function collect(src, re, display) {
  return [...src.matchAll(re)].map((match) => ({
    index: match.index,
    end: match.index + match[0].length,
    tex: match[1].trim(),
    display,
  }));
}

function overlaps(hit, spans) {
  return spans.some((span) => hit.index >= span.index && hit.end <= span.end);
}

export function extractMath(text) {
  const src = stripCode(text);
  const hits = [
    ...collect(src, DISPLAY_DOLLARS, true),
    ...collect(src, DISPLAY_BRACKETS, true),
    ...collect(src, INLINE_PARENS, false),
  ];

  for (const hit of collect(src, INLINE_DOLLARS, false)) {
    if (!overlaps(hit, hits)) hits.push(hit);
  }

  hits.sort((a, b) => a.index - b.index);

  const out = [];
  for (const hit of hits) {
    if (!hit.tex) continue;
    if (!hit.display && isMoney(hit.tex)) continue;
    out.push({ tex: hit.tex, display: hit.display });
  }
  return out;
}
