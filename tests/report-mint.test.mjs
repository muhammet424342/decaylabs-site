import test from "node:test";
import assert from "node:assert/strict";
import { BUILDER_SUFFIX } from "../checkout-client.mjs";
import { buildMintCalldata, executeReportMint, isReportLive, readReportState, MINT_SELECTOR } from "../report-mint.mjs";

const CONTRACT = "0x1111111111111111111111111111111111111111";
const WALLET = "0x2222222222222222222222222222222222222222";
const WORD = (value) => `0x${BigInt(value).toString(16).padStart(64, "0")}`;

function stubProvider({ open = 1, reportId = 1, claimed = 0, onSend = () => "0xhash" } = {}) {
  const calls = [];
  return {
    calls,
    async request({ method, params }) {
      calls.push({ method, params });
      if (method === "eth_chainId") return "0x2105";
      if (method === "eth_call") {
        const data = params[0].data;
        if (data.startsWith("0x24bbd049")) return WORD(open);
        if (data.startsWith("0x5b45b63f")) return WORD(reportId);
        if (data.startsWith("0x873f6f9e")) return WORD(claimed);
        throw new Error(`unexpected eth_call ${data}`);
      }
      if (method === "eth_sendTransaction") return onSend(params[0]);
      throw new Error(`unexpected method ${method}`);
    }
  };
}

test("mint calldata carries the selector and the Base builder code", () => {
  const calldata = buildMintCalldata();
  assert.ok(calldata.startsWith(MINT_SELECTOR));
  assert.ok(calldata.endsWith(BUILDER_SUFFIX));
  assert.equal(calldata.length, MINT_SELECTOR.length + BUILDER_SUFFIX.length);
});

test("isReportLive rejects an unset contract", () => {
  assert.equal(isReportLive(""), false);
  assert.equal(isReportLive("0x123"), false);
  assert.equal(isReportLive(CONTRACT), true);
});

test("readReportState decodes the open report and the claim flag", async () => {
  const provider = stubProvider({ open: 1, reportId: 7, claimed: 1 });
  const state = await readReportState(provider, WALLET, CONTRACT);
  assert.deepEqual(state, { open: true, reportId: 7n, claimed: true });
});

test("readReportState skips the claim lookup without a wallet", async () => {
  const provider = stubProvider({ open: 0, reportId: 2 });
  const state = await readReportState(provider, null, CONTRACT);
  assert.equal(state.claimed, false);
  assert.equal(provider.calls.filter((call) => call.method === "eth_call").length, 2);
});

test("a claim sends the tagged calldata to the report contract", async () => {
  let sent = null;
  const provider = stubProvider({ onSend: (tx) => { sent = tx; return "0xdeadbeef"; } });
  const result = await executeReportMint({ provider, wallet: WALLET, contract: CONTRACT, waitForConfirmation: false });

  assert.equal(result.hash, "0xdeadbeef");
  assert.equal(sent.to, CONTRACT);
  assert.equal(sent.from, WALLET);
  assert.equal(sent.data, buildMintCalldata());
  assert.equal(sent.value, undefined, "the claim must stay free");
});

test("a closed report never reaches the wallet", async () => {
  const provider = stubProvider({ open: 0 });
  await assert.rejects(
    () => executeReportMint({ provider, wallet: WALLET, contract: CONTRACT, waitForConfirmation: false }),
    /closed/i
  );
  assert.equal(provider.calls.some((call) => call.method === "eth_sendTransaction"), false);
});

test("a wallet that already claimed is stopped before signing", async () => {
  const provider = stubProvider({ claimed: 1 });
  await assert.rejects(
    () => executeReportMint({ provider, wallet: WALLET, contract: CONTRACT, waitForConfirmation: false }),
    /already holds/i
  );
  assert.equal(provider.calls.some((call) => call.method === "eth_sendTransaction"), false);
});

test("an unconfigured contract is refused", async () => {
  const provider = stubProvider();
  await assert.rejects(
    () => executeReportMint({ provider, wallet: WALLET, contract: "", waitForConfirmation: false }),
    /no field report/i
  );
});
