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

test("generic checkout selects the cheapest curated token only", () => {
  const picked = selectListing([listing(999, 1n), listing(8, 3n), listing(7, 5n)], null, new Set(["7", "8"]));
  assert.equal(tokenIdFromListing(picked), "8");
});
