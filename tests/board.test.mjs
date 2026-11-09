import test from "node:test";
import assert from "node:assert/strict";
import { Wallet } from "ethers";
import { boardMessage, cellFaction, level, place, tokenFaction, view, DAY_MS } from "../board-rules.mjs";

const alice = Wallet.createRandom();
const bob = Wallet.createRandom();
const now = Date.parse("2026-11-09T12:00:00Z");
const issuedAt = new Date(now - 1000).toISOString();
const owners = { 1: alice.address, 6: bob.address, 2: alice.address };
const ownerOf = async (id) => owners[id] || null;

async function signed(wallet, tokenId, cell, at = issuedAt) {
  return { address: wallet.address, tokenId, cell, issuedAt: at, signature: await wallet.signMessage(boardMessage({ tokenId, cell, issuedAt: at })) };
}

test("faction zones match subject-model rule", () => {
  assert.equal(tokenFaction(1), 0); assert.equal(tokenFaction(6), 0); assert.equal(tokenFaction(2), 1);
  assert.equal(cellFaction(0), 0); assert.equal(cellFaction(19), 0); assert.equal(cellFaction(20), 1); assert.equal(cellFaction(99), 4);
});

test("valid signature from owner places the Subject", async () => {
  const result = await place({}, await signed(alice, 1, 5), { ownerOf, now });
  assert.equal(result.error, undefined);
  assert.equal(result.state[5].tokenId, 1);
  assert.equal(result.state[5].owner, alice.address.toLowerCase());
});

test("signature from another wallet is rejected", async () => {
  const input = { ...(await signed(bob, 1, 5)), address: alice.address };
  assert.equal((await place({}, input, { ownerOf, now })).error, "bad_signature");
});

test("tampered cell invalidates the signature", async () => {
  const input = { ...(await signed(alice, 1, 5)), cell: 6 };
  assert.equal((await place({}, input, { ownerOf, now })).error, "bad_signature");
});

test("non-owner token is rejected", async () => {
  assert.equal((await place({}, await signed(bob, 1, 5), { ownerOf, now })).error, "not_owner");
});

test("double placement on the same cell is rejected", async () => {
  const first = await place({}, await signed(alice, 1, 5), { ownerOf, now });
  assert.equal((await place(first.state, await signed(bob, 6, 5), { ownerOf, now })).error, "cell_taken");
});

test("wrong faction zone and stale signature are rejected", async () => {
  assert.equal((await place({}, await signed(alice, 2, 5), { ownerOf, now })).error, "wrong_faction_zone");
  const old = new Date(now - 11 * 60 * 1000).toISOString();
  assert.equal((await place({}, await signed(alice, 1, 5, old), { ownerOf, now })).error, "stale_signature");
});

test("moving a Subject frees its old cell; level grows by days held", async () => {
  const first = await place({}, await signed(alice, 1, 5), { ownerOf, now });
  const moved = await place(first.state, await signed(alice, 1, 7), { ownerOf, now });
  assert.equal(moved.state[5], undefined);
  assert.equal(moved.state[7].tokenId, 1);
  assert.equal(level(now, now + 3 * DAY_MS + 5), 4);
  assert.equal(view(moved.state, now + DAY_MS).leaderboard[0].level, 2);
});
