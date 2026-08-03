import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const API_DIR = fileURLToPath(new URL("../api/", import.meta.url));

/* On 2 Aug 2026 api/buy.js started importing "../checkout-rules.mjs". The file
 * lives outside the function directory, so it was never bundled into the
 * deployed serverless function and every request returned 500
 * FUNCTION_INVOCATION_FAILED — including requests that should have been
 * rejected with a 400. Local runs looked healthy because the real file was on
 * disk. This test fails fast if a handler reaches outside api/ again. */
/* The browser loads /checkout-rules.mjs and the serverless function loads
 * api/checkout-rules.mjs. They are deliberate copies: the browser must not
 * depend on files under /api/ being served statically, and the function must
 * not reach outside its own directory. This test is what keeps them in sync. */
test("browser and function copies of the checkout rules are identical", async () => {
  const [browserCopy, functionCopy] = await Promise.all([
    readFile(new URL("../checkout-rules.mjs", import.meta.url), "utf8"),
    readFile(new URL("../api/checkout-rules.mjs", import.meta.url), "utf8")
  ]);
  assert.equal(
    browserCopy,
    functionCopy,
    "checkout-rules.mjs and api/checkout-rules.mjs drifted — copy one over the other"
  );
});

test("api handlers never import from outside the function directory", async () => {
  const files = (await readdir(API_DIR)).filter((name) => name.endsWith(".js") || name.endsWith(".mjs"));
  assert.ok(files.length > 0, "expected handlers in api/");
  const offenders = [];
  for (const name of files) {
    const source = await readFile(new URL(name, `file://${API_DIR.replace(/\\/g, "/")}`), "utf8");
    for (const match of source.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)) {
      const specifier = match[1];
      if (specifier.startsWith("../")) offenders.push(`${name} -> ${specifier}`);
    }
  }
  assert.deepEqual(offenders, [], `handlers must keep their imports inside api/: ${offenders.join(", ")}`);
});
