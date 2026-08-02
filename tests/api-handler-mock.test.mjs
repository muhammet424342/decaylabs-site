import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/buy.js";
import { ALLOWED_SEAPORT_PROTOCOLS, EXPECTED_CONTRACT } from "../checkout-rules.mjs";

const protocol = [...ALLOWED_SEAPORT_PROTOCOLS][0];
const seller = "0x2222222222222222222222222222222222222222";
const value = "1000000000000000";

test("API handler returns only a cross-validated mock fulfillment", async () => {
  const originalFetch = globalThis.fetch;
  process.env.OPENSEA_API_KEY = "mock-key";
  const listing = { order_hash: "0xorder-7", chain: "base", protocol_address: protocol, price: { current: { value, decimals: 18, currency: "ETH" } }, protocol_data: { parameters: { offerer: seller, offer: [{ token: EXPECTED_CONTRACT, identifierOrCriteria: "7" }] } } };
  const transaction = { to: protocol, value, value_hex: "0x38d7ea4c68000", input_data: { parameters: { offerToken: EXPECTED_CONTRACT, offerIdentifier: "7", offerer: seller } } };
  globalThis.fetch = async (url) => String(url).includes("fulfillment_data") ? new Response(JSON.stringify({ fulfillment_data: { transaction }, chain_id: 8453 }), { status: 200 }) : new Response(JSON.stringify({ listings: [listing] }), { status: 200 });
  const out = { statusCode: 0, body: null, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.statusCode = n; return this; }, json(v) { this.body = v; } };
  try { await handler({ method: "GET", query: { address: "0x1111111111111111111111111111111111111111", tokenId: "7" } }, out); } finally { globalThis.fetch = originalFetch; }
  assert.equal(out.statusCode, 200);
  assert.equal(out.body.contract, EXPECTED_CONTRACT);
  assert.equal(out.body.protocolAddress, protocol);
  assert.equal(out.body.seller, seller);
  assert.equal(out.body.priceWei, value);
});
