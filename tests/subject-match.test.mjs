import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { decodeMatchAnswers, encodeMatchAnswers, matchFactionId, matchSubjectId } from "../subject-match.js";

test("matching is deterministic and stays inside the selected faction", () => {
  const answers = [3, 1, 4];
  const id = matchSubjectId(answers);
  assert.equal(id, matchSubjectId(answers));
  assert.ok(id >= 1 && id <= 1000);
  assert.equal((id - 1) % 5, 3);
  assert.equal(matchFactionId(answers), "staticborn");
});

test("match paths round-trip and reject malformed values", () => {
  assert.deepEqual(decodeMatchAnswers(encodeMatchAnswers([0, 2, 4])), [0, 2, 4]);
  assert.equal(decodeMatchAnswers("9-2-4"), null);
  assert.equal(decodeMatchAnswers("1-2"), null);
});

test("match result offers an in-app collect using the 0-based token id", async () => {
  const source = await readFile(new URL("../find-your-subject.js", import.meta.url), "utf8");
  assert.match(source, /data-buy-token="\$\{profile\.tokenId\}"/);
  assert.match(source, /Collect Subject/);
  const page = await readFile(new URL("../find-your-subject.html", import.meta.url), "utf8");
  assert.match(page, /miniapp-buy\.js/);
});
