import test from "node:test";
import assert from "node:assert/strict";
import { withRetry, UpstreamError, MAX_ATTEMPTS } from "../api/buy.js";

/* The checkout returned an intermittent 500 on roughly one request in three.
 * Healthy OpenSea calls answer in 0.4-1.4s, so a call that reaches the timeout
 * is stuck rather than slow: the fix retries it briefly instead of waiting it
 * out, and a give-up is reported as a named upstream failure, not a bare 500. */

const noSleep = { sleepImpl: async () => {}, baseDelayMs: 0 };
const ok = { status: 200 };

test("a stalled first attempt is retried and the second answer is used", async () => {
  let calls = 0;
  const response = await withRetry("fulfillment_data", async () => {
    calls += 1;
    if (calls === 1) throw new UpstreamError("fulfillment_data", "timeout");
    return ok;
  }, noSleep);
  assert.equal(response.status, 200);
  assert.equal(calls, 2);
});

test("when every attempt stalls it gives up as a named timeout", async () => {
  let calls = 0;
  await assert.rejects(
    withRetry("fulfillment_data", async () => {
      calls += 1;
      throw new UpstreamError("fulfillment_data", "timeout");
    }, noSleep),
    (error) => {
      assert.ok(error instanceof UpstreamError);
      assert.equal(error.label, "fulfillment_data");
      assert.equal(error.kind, "timeout");
      return true;
    }
  );
  assert.equal(calls, MAX_ATTEMPTS, "must stop after the attempt budget");
});

test("a 429 is retried", async () => {
  let calls = 0;
  const response = await withRetry("listing_best", async () => {
    calls += 1;
    return calls === 1 ? { status: 429 } : ok;
  }, noSleep);
  assert.equal(response.status, 200);
  assert.equal(calls, 2);
});

test("a transient 503 is retried", async () => {
  let calls = 0;
  const response = await withRetry("listing_best", async () => {
    calls += 1;
    return calls < 3 ? { status: 503 } : ok;
  }, noSleep);
  assert.equal(response.status, 200);
  assert.equal(calls, 3);
});

for (const status of [400, 401, 403, 404]) {
  test(`a ${status} is an answer, not a hiccup, and is never retried`, async () => {
    let calls = 0;
    const response = await withRetry("listing_best", async () => {
      calls += 1;
      return { status };
    }, noSleep);
    assert.equal(response.status, status);
    assert.equal(calls, 1);
  });
}

test("an authentication UpstreamError is never retried", async () => {
  let calls = 0;
  await assert.rejects(withRetry("auth", async () => {
    calls += 1;
    throw new UpstreamError("auth", "authentication", 401);
  }, noSleep), /auth_authentication/);
  assert.equal(calls, 1);
});

test("retries stop once the request budget is spent", async () => {
  let calls = 0;
  let clock = 0;
  await assert.rejects(withRetry("listing_best", async () => {
    calls += 1;
    throw new UpstreamError("listing_best", "timeout");
  }, { ...noSleep, deadline: 100, now: () => (clock += 60) }));
  assert.ok(calls < MAX_ATTEMPTS, `budget must cut retries short, ran ${calls}`);
});

test("backoff grows between attempts", async () => {
  const waits = [];
  await assert.rejects(withRetry("listing_best", async () => {
    throw new UpstreamError("listing_best", "timeout");
  }, { baseDelayMs: 200, sleepImpl: async (ms) => { waits.push(ms); } }));
  assert.deepEqual(waits, [200, 400]);
});

test("a non-upstream bug is not swallowed by the retry loop", async () => {
  let calls = 0;
  await assert.rejects(withRetry("listing_best", async () => {
    calls += 1;
    throw new TypeError("real bug");
  }, noSleep), TypeError);
  assert.equal(calls, 1);
});
