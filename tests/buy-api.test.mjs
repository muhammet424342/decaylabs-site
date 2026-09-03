import test from "node:test";
import assert from "node:assert/strict";
import { selectListing, tokenIdFromListing } from "../api/buy.js";

function listing(tokenId, value) {
  return {
    price: { current: { value: String(value), decimals: 18, currency: "ETH" } },
    protocol_data: { parameters: { offer: [{ identifierOrCriteria: String(tokenId) }] } }
  };
}

test("extracts token IDs from Seaport listings", () => {
  assert.equal(tokenIdFromListing(listing(7, 5n)), "7");
  assert.equal(tokenIdFromListing({}), "");
});

test("selects the requested token, not a different cheap token", () => {
  const picked = selectListing([listing(8, 1n), listing(7, 5n)], 7, new Set(["7", "8"]));
  assert.equal(tokenIdFromListing(picked), "7");
});

test("generic checkout honours a shortlist when one is given", () => {
  const picked = selectListing([listing(999, 1n), listing(8, 3n), listing(7, 5n)], null, new Set(["7", "8"]));
  assert.equal(tokenIdFromListing(picked), "8");
});

test("generic checkout sells the collection floor when no shortlist is given", () => {
  const picked = selectListing([listing(999, 1n), listing(8, 3n), listing(7, 5n)], null, null);
  assert.equal(tokenIdFromListing(picked), "999");
});

test("a requested token wins over a cheaper one even with no shortlist", () => {
  const picked = selectListing([listing(999, 1n), listing(7, 5n)], 7, null);
  assert.equal(tokenIdFromListing(picked), "7");
});

test("listings with no price are never selected", () => {
  const picked = selectListing([listing(999, 0n), listing(8, 3n)], null, null);
  assert.equal(tokenIdFromListing(picked), "8");
});
