import { BUILDER_SUFFIX, CheckoutError, ensureBase, waitForReceipt } from "./checkout-client.mjs";

export const BASE_RPC_URL = "https://mainnet.base.org";

// 24 Aug 2026: a single RPC meant one network hiccup silently removed the claim
// offer from the page (reveal() swallowed the error). Reads now fall through a
// list, so a rate-limited or unreachable endpoint no longer hides the card.
export const BASE_RPC_URLS = [
  BASE_RPC_URL,
  "https://base.llamarpc.com",
  "https://base-rpc.publicnode.com",
  "https://1rpc.io/base"
];

// Vanta Field Reports — free open edition, one claim per wallet per report.
// Deploy with `npm run contract:deploy`, then paste the address here.
export const REPORT_CONTRACT = "0x894b1d8d5a4c7869ddc2553fcfabeb03e3c0e081";

export const MINT_SELECTOR = "0x1249c58b"; // mint()
export const ACTIVE_REPORT_SELECTOR = "0x5b45b63f"; // activeReport()
export const MINT_OPEN_SELECTOR = "0x24bbd049"; // mintOpen()
export const HAS_CLAIMED_SELECTOR = "0x873f6f9e"; // hasClaimed(uint256,address)

export function isReportLive(contract = REPORT_CONTRACT) {
  return /^0x[0-9a-fA-F]{40}$/.test(String(contract || ""));
}

/// Every archive transaction carries the Base builder code, same as checkout.
export function buildMintCalldata() {
  return MINT_SELECTOR + BUILDER_SUFFIX;
}

function encodeUint(value) {
  return BigInt(value).toString(16).padStart(64, "0");
}

function encodeAddress(value) {
  return String(value).replace(/^0x/, "").toLowerCase().padStart(64, "0");
}

/// Reads work without a wallet too, so the page can show the claim state on first paint.
async function call(provider, contract, data, fetchImpl = fetch) {
  if (provider) return provider.request({ method: "eth_call", params: [{ to: contract, data }, "latest"] });
  let lastError = null;
  for (const url of BASE_RPC_URLS) {
    try {
      const response = await fetchImpl(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: contract, data }, "latest"] })
      });
      const body = await response.json();
      if (body.error) { lastError = new CheckoutError("rpc_error", body.error.message || "Base RPC call failed."); continue; }
      return body.result;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new CheckoutError("rpc_error", "Base RPC call failed.");
}

/// Reads the contract so the UI can say "already claimed" before asking for a signature.
export async function readReportState(provider, wallet, contract = REPORT_CONTRACT) {
  const [openRaw, reportRaw] = await Promise.all([
    call(provider, contract, MINT_OPEN_SELECTOR),
    call(provider, contract, ACTIVE_REPORT_SELECTOR)
  ]);
  const reportId = BigInt(reportRaw || "0x0");
  const open = BigInt(openRaw || "0x0") === 1n;
  let claimed = false;
  if (wallet) {
    const claimedRaw = await call(provider, contract, HAS_CLAIMED_SELECTOR + encodeUint(reportId) + encodeAddress(wallet));
    claimed = BigInt(claimedRaw || "0x0") === 1n;
  }
  return { open, reportId, claimed };
}

export async function executeReportMint({
  provider,
  wallet,
  contract = REPORT_CONTRACT,
  onStatus = () => {},
  onEvent = () => {},
  waitForConfirmation = true
}) {
  if (!provider) throw new CheckoutError("rpc_error", "No compatible wallet was found.");
  if (!isReportLive(contract)) throw new CheckoutError("api_error", "No field report is live yet.");

  await ensureBase(provider, onEvent);

  const state = await readReportState(provider, wallet, contract);
  if (!state.open) throw new CheckoutError("api_error", "This field report is closed.");
  if (state.claimed) throw new CheckoutError("api_error", "This wallet already holds the current report.");

  onStatus("Confirm the free claim in your wallet — gas only.");
  let hash;
  try {
    hash = await provider.request({
      method: "eth_sendTransaction",
      params: [{ from: wallet, to: contract, data: buildMintCalldata() }]
    });
  } catch (error) {
    throw new CheckoutError("transaction_submit_failed", error?.message || "The claim was not submitted.");
  }
  if (!hash || typeof hash !== "string") throw new CheckoutError("transaction_submit_failed");

  onEvent("report_mint_submitted", { hash, reportId: String(state.reportId) });
  if (waitForConfirmation) {
    await waitForReceipt(provider, hash, { onEvent });
  }
  return { hash, reportId: state.reportId };
}
