import assert from "node:assert/strict";
import { test } from "node:test";
import { extractMath } from "../src/extract.js";

test("display $$ and \\[ \\]", () => {
  const found = extractMath("see $$a^2+b^2=c^2$$ and \\[E=mc^2\\]");
  assert.deepEqual(found, [
    { tex: "a^2+b^2=c^2", display: true },
    { tex: "E=mc^2", display: true },
  ]);
});

test("inline $ and \\( \\)", () => {
  const found = extractMath("force $F=ma$ or \\(\\nabla \\cdot B=0\\)");
  assert.deepEqual(found, [
    { tex: "F=ma", display: false },
    { tex: "\\nabla \\cdot B=0", display: false },
  ]);
});

test("skips fenced code, inline code, and money", () => {
  const found = extractMath(
    "price $12.50 and ` $x^2$ ` \n```\n$$skip$$\n```\nreal $$x^2$$\n",
  );
  assert.deepEqual(found, [{ tex: "x^2", display: true }]);
});

test("preserves document order", () => {
  const found = extractMath("start $a$ then $$b$$ then \\(c\\)");
  assert.deepEqual(found, [
    { tex: "a", display: false },
    { tex: "b", display: true },
    { tex: "c", display: false },
  ]);
});

test("does not treat $$ as two inline dollars", () => {
  const found = extractMath("$$\\int_0^1 x\\,dx$$");
  assert.deepEqual(found, [{ tex: "\\int_0^1 x\\,dx", display: true }]);
});
