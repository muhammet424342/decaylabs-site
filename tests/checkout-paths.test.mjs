import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/buy.js";
import { ALLOWED_SEAPORT_PROTOCOLS, EXPECTED_CONTRACT } from "../checkout-rules.mjs";

/* Covers both ways a visitor reaches checkout — the hero button with no token
 * id, and a Subject page asking for one specific token — plus what each does
 * when OpenSea stalls. No wallet, no signature, no transaction: every OpenSea
 * response here is a local mock. */

const protocol = [...ALLOWED_SEAPORT_PROTOCOLS][0];
const seller = "0x2222222222222222222222222222222222222222";
const buyer = "0x1111111111111111111111111111111111111111";
const value = "5000000000000000";

const listingFor = (tokenId) => ({
  order_hash: `0xorder-${tokenId}`, chain: "base", protocol_address: protocol,
  price: { current: { value, decimals: 18, currency: "ETH" } },
  protocol_data: { parameters: { offerer: seller, offer: [{ token: EXPECTED_CONTRACT, identifierOrCriteria: String(tokenId) }] } }
});
const transactionFor = (tokenId) => ({
  to: protocol, value, value_hex: "0x11c37937e08000",
  input_data: { parameters: { offerToken: EXPECTED_CONTRACT, offerIdentifier: String(tokenId), offerer: seller } }
});

function recorder() {
  return { statusCode: 0, body: null, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.statusCode = n; return this; }, json(v) { this.body = v; return this; }, end() { return this; } };
}

async function run(query, fetchImpl) {
  const originalFetch = globalThis.fetch;
  process.env.OPENSEA_API_KEY = "mock-key";
  globalThis.fetch = fetchImpl;
  const res = recorder();
  try { await handler({ method: "GET", query }, res); } finally { globalThis.fetch = originalFetch; }
  return res;
}

/** Fails the first `stalls` calls whose url matches, then answers normally. */
function mockOpenSea({ tokenId, stallOn = null, stalls = 0 }) {
  let stalled = 0;
  return async (url) => {
    const target = String(url);
    if (stallOn && target.includes(stallOn) && stalled < stalls) {
      stalled += 1;
      const error = new Error("aborted");
      error.name = "AbortError";
      throw error;
    }
    if (target.includes("fulfillment_data")) {
      return new Response(JSON.stringify({ fulfillment_data: { transaction: transactionFor(tokenId) }, chain_id: 8453 }), { status: 200 });
    }
    return new Response(JSON.stringify({ listings: [listingFor(tokenId)] }), { status: 200 });
  };
}

test("the generic hero path returns a quote without a token id", async () => {
  const res = await run({ address: buyer }, mockOpenSea({ tokenId: 1 }));
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.contract, EXPECTED_CONTRACT);
  assert.equal(res.body.priceWei, value);
});

test("a Subject page asking for #846 gets #846 back", async () => {
  const res = await run({ address: buyer, tokenId: "846" }, mockOpenSea({ tokenId: 846 }));
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.tokenId, "846");
  assert.equal(res.body.protocolAddress, protocol);
});

test("#846 still succeeds when the fulfillment call stalls once", async () => {
  const res = await run({ address: buyer, tokenId: "846" }, mockOpenSea({ tokenId: 846, stallOn: "fulfillment_data", stalls: 1 }));
  assert.equal(res.statusCode, 200, JSON.stringify(res.body));
  assert.equal(res.body.tokenId, "846");
});

test("#846 still succeeds when the listing lookup stalls once", async () => {
  const res = await run({ address: buyer, tokenId: "846" }, mockOpenSea({ tokenId: 846, stallOn: "/best", stalls: 1 }));
  assert.equal(res.statusCode, 200, JSON.stringify(res.body));
});

test("a fulfillment that never answers returns 504 upstream_timeout, not 500", async () => {
  const res = await run({ address: buyer, tokenId: "846" }, mockOpenSea({ tokenId: 846, stallOn: "fulfillment_data", stalls: 99 }));
  assert.equal(res.statusCode, 504);
  assert.equal(res.body.error, "upstream_timeout");
  assert.equal(res.body.upstream, "fulfillment_data");
});

test("a listing lookup that never answers names the request it gave up on", async () => {
  const res = await run({ address: buyer, tokenId: "846" }, mockOpenSea({ tokenId: 846, stallOn: "/best", stalls: 99 }));
  assert.equal(res.statusCode, 504);
  assert.equal(res.body.error, "upstream_timeout");
  assert.equal(res.body.upstream, "listing_best");
});

test("a listing for the wrong token is never substituted", async () => {
  const res = await run({ address: buyer, tokenId: "846" }, mockOpenSea({ tokenId: 12 }));
  assert.notEqual(res.statusCode, 200);
  assert.ok(["token_not_listed", "token_mismatch"].includes(res.body.error), res.body.error);
});
