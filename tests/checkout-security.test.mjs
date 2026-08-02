import test from "node:test";
import assert from "node:assert/strict";
import { ALLOWED_SEAPORT_PROTOCOLS, EXPECTED_CONTRACT, validateCheckoutPayload, classifyProviderError } from "../checkout-rules.mjs";
import { validateListingFulfillment } from "../api/buy.js";
import { executeCheckout } from "../checkout-client.mjs";

const protocol = [...ALLOWED_SEAPORT_PROTOCOLS][0];
const seller = "0x2222222222222222222222222222222222222222";
const buyer = "0x1111111111111111111111111111111111111111";
const value = "1000000000000000";

function listing() {
  return { order_hash: "0xorder-7", chain: "base", protocol_address: protocol, price: { current: { value, decimals: 18, currency: "ETH" } }, protocol_data: { parameters: { offerer: seller, offer: [{ token: EXPECTED_CONTRACT, identifierOrCriteria: "7" }] } } };
}
function transaction() {
  return { to: protocol, value, value_hex: "0x38d7ea4c68000", input_data: { parameters: { offerToken: EXPECTED_CONTRACT, offerIdentifier: "7", offerer: seller } } };
}
function response(data, ok = true) { return { ok, async json() { return data; } }; }

test("rejects a wrong contract, protocol target, seller and price", () => {
  const base = { chainId: 8453, contract: EXPECTED_CONTRACT, protocolAddress: protocol, to: protocol, tokenId: "7", seller, priceWei: value, valueWei: value, listingHash: "0xorder-7" };
  assert.equal(validateCheckoutPayload({ ...base, contract: buyer }), "invalid_contract");
  assert.equal(validateCheckoutPayload({ ...base, to: buyer }), "invalid_protocol_target");
  assert.equal(validateCheckoutPayload({ ...base, seller: buyer }), null);
  assert.equal(validateCheckoutPayload({ ...base, priceWei: "2000000000000000", valueWei: "2000000000000000" }, 7, value), "price_changed");
});

test("cross-validates listing and fulfillment values", () => {
  assert.equal(validateListingFulfillment(listing(), transaction(), { chain_id: 8453 }), null);
  assert.equal(validateListingFulfillment(listing(), { ...transaction(), to: buyer }, { chain_id: 8453 }), "invalid_transaction_target");
  assert.equal(validateListingFulfillment(listing(), { ...transaction(), input_data: { parameters: { ...transaction().input_data.parameters, offerIdentifier: "8" } } }, { chain_id: 8453 }), "token_mismatch");
  assert.equal(validateListingFulfillment(listing(), { ...transaction(), value: "2000000000000000" }, { chain_id: 8453 }), "price_changed");
});

test("classifies wallet rejection, insufficient funds, RPC and submit failures", () => {
  assert.equal(classifyProviderError({ code: 4001 }), "user_rejected");
  assert.equal(classifyProviderError({ code: -32000, message: "insufficient funds" }), "insufficient_funds");
  assert.equal(classifyProviderError(new Error("RPC timeout")), "rpc_error");
  assert.equal(classifyProviderError(new Error("eth_sendTransaction failed")), "transaction_submit_failed");
});

test("runs API quote refresh, client validation and fake wallet submission without funds", async () => {
  const data = { to: protocol, protocolAddress: protocol, contract: EXPECTED_CONTRACT, seller, valueHex: "0x38d7ea4c68000", valueWei: value, priceWei: value, priceEth: 0.001, parameters: { considerationIdentifier: "0", considerationAmount: value, offerer: seller, offerToken: EXPECTED_CONTRACT, offerIdentifier: "7", offerAmount: "1", basicOrderType: "0", startTime: "0", endTime: "9999999999", zoneHash: `0x${"0".repeat(64)}`, salt: "1", offererConduitKey: `0x${"0".repeat(64)}`, fulfillerConduitKey: `0x${"0".repeat(64)}`, totalOriginalAdditionalRecipients: "0", additionalRecipients: [], signature: "0x" }, calldataSuffix: "", tokenId: "7", chainId: 8453, listingHash: "0xorder-7" };
  let quoteCalls = 0; let sent = null;
  const fetchImpl = async (_url) => { quoteCalls += 1; return response(data); };
  const provider = { async request({ method, params }) { if (method === "eth_chainId") return "0x2105"; if (method === "eth_sendTransaction") { sent = params[0]; return "0xmocktx"; } throw new Error(`unexpected ${method}`); } };
  const result = await executeCheckout({ provider, buyer, tokenId: 7, fetchImpl, encodeFunctionData: () => "0xencoded" });
  assert.equal(quoteCalls, 2);
  assert.equal(result.hash, "0xmocktx");
  assert.equal(sent.to, protocol);
  assert.equal(sent.value, data.valueHex);
  assert.match(sent.data, /^0xencoded/);
});
