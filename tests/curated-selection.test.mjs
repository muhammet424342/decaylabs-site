import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { buildSubjectProfile } from '../subject-model.js';
const root = new URL('../', import.meta.url);
const read = async p => JSON.parse(await readFile(new URL(p, root), 'utf8'));
test('selection references unique valid archive records and local artwork', async () => {
  const [entries, collection, lore] = await Promise.all([read('data/curated.json'), read('data/collection.json'), read('data/lore.json')]);
  assert.equal(entries.length, 24);
  assert.equal(new Set(entries.map(e => e.id)).size, entries.length);
  for (const e of entries) {
    const profile = buildSubjectProfile(e.id, lore, collection);
    const meta = await read(`metadata-v2/${e.id}.json`);
    assert.equal(e.faction, profile.faction.name);
    assert.ok(e.record && e.name);
    assert.equal(e.image, profile.image);
    await access(new URL(e.image.slice(1), root));
    assert.equal(e.recordUrl, `/subject?id=${e.id}`);
    assert.equal(e.openseaUrl, profile.openseaUrl);
    assert.ok(meta.name);
    assert.ok(!('price' in e));
    assert.doesNotMatch(e.name + e.record, /1,000|1000|one thousand|bin par/i);
  }
});
