import test from "node:test";
import assert from "node:assert/strict";
import { waitForReceipt } from "../checkout-client.mjs";

/* purchase_success used to fire the moment the wallet returned a hash. A
 * submitted transaction is not a sale — Base can revert it — so that counted
 * revenue that may never have existed. purchase_success now requires a receipt
 * with status 0x1; anything else is a failure. */

function providerReturning(sequence) {
  const queue = [...sequence];
  return { request: async () => (queue.length > 1 ? queue.shift() : queue[0]) };
}

const noSleep = { sleep: async () => {}, intervalMs: 0 };

test("a confirmed receipt records purchase_success", async () => {
  const events = [];
  const result = await waitForReceipt(providerReturning([null, null, { status: "0x1" }]), "0xhash", {
    onEvent: (name, props) => events.push([name, props]), token: 846, eth: 0.005, ...noSleep
  });
  assert.equal(result.confirmed, true);
  assert.deepEqual(events.map(([name]) => name), ["purchase_success"]);
  assert.equal(events[0][1].token, 846);
});

test("a reverted transaction never records a purchase", async () => {
  const events = [];
  const result = await waitForReceipt(providerReturning([{ status: "0x0" }]), "0xhash", {
    onEvent: (name, props) => events.push([name, props]), token: 7, ...noSleep
  });
  assert.equal(result.confirmed, false);
  assert.deepEqual(events.map(([name]) => name), ["transaction_failed"]);
  assert.equal(events[0][1].code, "reverted");
});

test("a receipt that never arrives times out instead of claiming success", async () => {
  const events = [];
  let clock = 0;
  const result = await waitForReceipt(providerReturning([null]), "0xhash", {
    onEvent: (name, props) => events.push([name, props]),
    token: 7, timeoutMs: 50, intervalMs: 10,
    now: () => (clock += 20),
    sleep: async () => {}
  });
  assert.equal(result.confirmed, false);
  assert.deepEqual(events.map(([name]) => name), ["transaction_failed"]);
  assert.equal(events[0][1].code, "receipt_timeout");
});

test("an unreachable node does not fabricate a confirmation", async () => {
  const events = [];
  let clock = 0;
  const provider = { request: async () => { throw new Error("rpc down"); } };
  const result = await waitForReceipt(provider, "0xhash", {
    onEvent: (name) => events.push(name), timeoutMs: 50, intervalMs: 10,
    now: () => (clock += 20), sleep: async () => {}
  });
  assert.equal(result.confirmed, false);
  assert.deepEqual(events, ["transaction_failed"]);
});
