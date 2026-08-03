import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

/* The browser posted events to "/api/ev" while the deployed function is served
 * at "/api/ev.js" — cleanUrls rewrites static pages, not functions. Every event
 * was silently dropped in preview even though the collector itself was healthy.
 * Client-side endpoints must therefore name the file exactly. */
test("client api calls use the deployed function path, extension included", async () => {
  const sources = ["analytics.js", "checkout-client.mjs", "miniapp-buy.js"];
  const offenders = [];
  for (const name of sources) {
    const source = await readFile(new URL(`../${name}`, import.meta.url), "utf8");
    for (const match of source.matchAll(/["'`](\/api\/[a-zA-Z0-9_-]+)(\?[^"'`]*)?["'`]/g)) {
      if (!match[1].endsWith(".js")) offenders.push(`${name} -> ${match[1]}`);
    }
  }
  assert.deepEqual(offenders, [], `api paths must include .js: ${offenders.join(", ")}`);
});

test("every event the client can send is accepted by the collector", async () => {
  const [client, collector] = await Promise.all([
    readFile(new URL("../analytics.js", import.meta.url), "utf8"),
    readFile(new URL("../api/ev.js", import.meta.url), "utf8")
  ]);
  const names = (block) => new Set([...block.matchAll(/^\s*"([a-z_]+)",?$/gm)].map((m) => m[1]));
  const clientEvents = names(client.slice(client.indexOf("export const EVENTS")));
  const collectorEvents = names(collector.slice(collector.indexOf("const ALLOWED")));
  assert.ok(clientEvents.size >= 15, `expected the client event list, found ${clientEvents.size}`);
  const missing = [...clientEvents].filter((name) => !collectorEvents.has(name));
  assert.deepEqual(missing, [], `collector would reject: ${missing.join(", ")}`);
});

test("api directory exposes only the endpoints the client calls", async () => {
  const files = (await readdir(new URL("../api/", import.meta.url))).filter((name) => name.endsWith(".js"));
  assert.ok(files.includes("ev.js"), "collector must stay at api/ev.js");
  assert.ok(files.includes("buy.js"), "checkout must stay at api/buy.js");
});
