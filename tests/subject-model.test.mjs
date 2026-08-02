import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildSubjectProfile, padSubject, validSubjectId } from "../subject-model.js";

const [lore, collection] = await Promise.all([
  readFile(new URL("../data/lore.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/collection.json", import.meta.url), "utf8").then(JSON.parse)
]);

test("validates the complete collection range", () => {
  assert.equal(validSubjectId(1), true);
  assert.equal(validSubjectId(1000), true);
  assert.equal(validSubjectId(0), false);
  assert.equal(validSubjectId(1001), false);
  assert.equal(validSubjectId(1.5), false);
});

test("builds stable, narrative-only Subject records", () => {
  const first = buildSubjectProfile(404, lore, collection);
  const second = buildSubjectProfile(404, lore, collection);
  assert.deepEqual(first, second);
  assert.equal(first.paddedId, "0404");
  assert.equal(first.chapter, 4);
  assert.match(first.openseaUrl, /\/404$/);
  assert.ok(lore.factions.some((faction) => faction.id === first.faction.id));
});

test("pads Subject numbers consistently", () => {
  assert.equal(padSubject(7), "0007");
  assert.equal(padSubject(1000), "1000");
});
