import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

/* On 2 Aug 2026 api/buy.js started importing "../checkout-rules.mjs" and every
 * request to the deployed function returned 500 FUNCTION_INVOCATION_FAILED —
 * including requests that should have been rejected with a 400. The Vercel log
 * gave the real reason:
 *
 *   ERR_REQUIRE_ESM: require() of ES Module /var/task/api/checkout-rules.mjs
 *   from /var/task/api/buy.js not supported
 *
 * @vercel/node compiles handlers to CommonJS, so a handler can never require a
 * .mjs file. Local runs never caught it because Node loaded both as ESM.
 * The shared rules now live at api/lib/checkout-rules.js (a .js file, outside
 * the "api/*.js" function glob so it is bundled rather than deployed as an
 * endpoint), with a byte-identical copy at the repo root for the browser. */

const API_DIR = new URL("../api/", import.meta.url);

test("api handlers never import a .mjs module", async () => {
  const files = (await readdir(API_DIR)).filter((name) => name.endsWith(".js"));
  assert.ok(files.length > 0, "expected handlers in api/");
  const offenders = [];
  for (const name of files) {
    const source = await readFile(new URL(name, API_DIR), "utf8");
    for (const match of source.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)) {
      if (match[1].endsWith(".mjs")) offenders.push(`${name} -> ${match[1]}`);
    }
  }
  assert.deepEqual(offenders, [], `handlers are CommonJS at runtime and cannot require ESM: ${offenders.join(", ")}`);
});

test("browser and function copies of the checkout rules are identical", async () => {
  const [browserCopy, functionCopy] = await Promise.all([
    readFile(new URL("../checkout-rules.mjs", import.meta.url), "utf8"),
    readFile(new URL("../api/lib/checkout-rules.js", import.meta.url), "utf8")
  ]);
  assert.equal(
    browserCopy,
    functionCopy,
    "checkout-rules.mjs and api/lib/checkout-rules.js drifted — copy one over the other"
  );
});
