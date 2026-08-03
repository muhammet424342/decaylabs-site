import test from "node:test";
import assert from "node:assert/strict";
import { parseEvents, buildFunnel, render } from "../ops/funnel.mjs";

const line = (event) => `01:23:45.67  host.vercel.app  info  DL_EVENT ${JSON.stringify(event)}`;

test("reads DL_EVENT lines out of surrounding log noise", () => {
  const events = parseEvents([
    "Fetching logs...",
    line({ ev: "page_view", sid: "a" }),
    "01:23:46.00  host.vercel.app  info   λ GET /api/buy.js",
    line({ ev: "buy_button_clicked", sid: "a", props: { token: 7 } }),
    "DL_EVENT {truncated"
  ]);
  assert.equal(events.length, 2);
  assert.equal(events[1].props.token, 7);
});

test("counts sessions per step, not repeated clicks", () => {
  const funnel = buildFunnel(parseEvents([
    line({ ev: "page_view", sid: "a" }),
    line({ ev: "buy_button_clicked", sid: "a" }),
    line({ ev: "buy_button_clicked", sid: "a" }),
    line({ ev: "buy_button_clicked", sid: "a" }),
    line({ ev: "page_view", sid: "b" })
  ]));
  assert.equal(funnel.sessions, 2);
  assert.equal(funnel.steps.find((s) => s.key === "visit").count, 2);
  assert.equal(funnel.steps.find((s) => s.key === "buy").count, 1);
});

test("a submitted transaction is not counted as a confirmed one", () => {
  const funnel = buildFunnel(parseEvents([
    line({ ev: "page_view", sid: "a" }),
    line({ ev: "purchase_submitted", sid: "a", props: { token: 7 } })
  ]));
  assert.equal(funnel.steps.find((s) => s.key === "submitted").count, 1);
  assert.equal(funnel.steps.find((s) => s.key === "confirmed").count, 0);
});

test("groups drop-off reasons by code", () => {
  const funnel = buildFunnel(parseEvents([
    line({ ev: "wallet_connect_failed", sid: "a", props: { code: "no_provider" } }),
    line({ ev: "wallet_connect_failed", sid: "b", props: { code: "no_provider" } }),
    line({ ev: "transaction_failed", sid: "c", props: { code: "reverted" } })
  ]));
  assert.deepEqual(funnel.dropOffs[0], ["wallet_connect_failed:no_provider", 2]);
});

test("renders without dividing by zero on an empty log", () => {
  const output = render(buildFunnel([]));
  assert.match(output, /Sessions: 0/);
  assert.match(output, /No DL_EVENT lines found/);
  assert.doesNotMatch(output, /NaN/);
});
