import test from "node:test";
import assert from "node:assert/strict";
import { executeCheckout } from "../checkout-client.mjs";
import { ALLOWED_SEAPORT_PROTOCOLS, EXPECTED_CONTRACT } from "../checkout-rules.mjs";

const protocol = [...ALLOWED_SEAPORT_PROTOCOLS][0];
const seller = "0x2222222222222222222222222222222222222222";
const buyer = "0x1111111111111111111111111111111111111111";
const response = (data) => ({ ok: true, async json() { return data; } });

test("stops before submission when refreshed price changes", async () => {
  const first = { to: protocol, protocolAddress: protocol, contract: EXPECTED_CONTRACT, seller, valueHex: "0x38d7ea4c68000", valueWei: "1000000000000000", priceWei: "1000000000000000", priceEth: 0.001, tokenId: "7", chainId: 8453, listingHash: "0xorder-7" };
  const changed = { ...first, valueWei: "2000000000000000", priceWei: "2000000000000000", valueHex: "0x71afd498d0000" };
  let calls = 0;
  const provider = { async request({ method }) { if (method === "eth_chainId") return "0x2105"; throw new Error("should not submit"); } };
  await assert.rejects(() => executeCheckout({ provider, buyer, tokenId: 7, fetchImpl: async () => response(++calls === 1 ? first : changed), encodeFunctionData: () => "0xencoded" }), (error) => error.code === "price_changed");
  assert.equal(calls, 2);
});
