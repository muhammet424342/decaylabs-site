import { executeReportMint, isReportLive, readReportState, REPORT_CONTRACT } from "./report-mint.mjs";
import { getProvider } from "./wallet-provider.mjs";
import { track } from "/analytics.js";

const block = document.getElementById("reportClaim");
const button = document.getElementById("reportBtn");
const label = document.getElementById("reportBtnLabel");

function status(message, html = false) {
  const element = document.getElementById("reportStatus");
  if (!element) return;
  if (html) element.innerHTML = message; else element.textContent = message || "";
}

function reportName(reportId) {
  return `Field Report ${String(reportId).padStart(3, "0")}`;
}

function basescanLink(hash) {
  return `https://basescan.org/tx/${hash}`;
}

async function claim() {
  if (!button || !label) return;
  const originalLabel = label.textContent;
  button.disabled = true;
  track("report_claim_clicked");

  try {
    const provider = await getProvider();
    if (!provider) {
      status("Open this page in the Base app or a Base-ready wallet to claim.");
      return;
    }

    let accounts;
    try { accounts = await provider.request({ method: "eth_requestAccounts" }); }
    catch (_) { status("Wallet connection was declined."); return; }
    const wallet = accounts?.[0];
    if (!wallet) { status("No wallet address was returned."); return; }

    label.textContent = "Claiming...";
    const { hash, reportId } = await executeReportMint({
      provider,
      wallet,
      onStatus: (message) => status(message)
    });

    track("report_claim_success", { report: String(reportId) });
    status(`${reportName(reportId)} is yours. <a href="${basescanLink(hash)}" target="_blank" rel="noopener noreferrer">View the transaction</a>`, true);
    label.textContent = "Claimed";
  } catch (error) {
    const code = error?.code || "transaction_failed";
    track("report_claim_failed", { code: String(code) });
    status(error?.message || "The claim did not go through.");
    console.error("[report]", { code, message: error?.message });
    label.textContent = originalLabel;
  } finally {
    if (label.textContent !== "Claimed") button.disabled = false;
  }
}

// The block stays hidden until a report is actually deployed and open.
async function reveal() {
  if (!block || !button || !label) return;
  if (!isReportLive()) return;

  let state;
  try {
    state = await readReportState(null, null, REPORT_CONTRACT);
  } catch (error) {
    // 24 Aug 2026: this used to `return`, which quietly deleted the claim offer
    // from the page whenever a read failed. The visitor saw nothing, we logged
    // nothing, and "0 claims" looked like nobody wanted it. A failed read is not
    // proof the report is closed, so show the card and let the claim attempt
    // surface a real error instead of hiding the door.
    track("report_reveal_degraded", { code: String(error?.code || "rpc_unreachable") });
    label.textContent = "Claim the open Field Report — free";
    status("Could not verify the report state just now — you can still try to claim.");
    block.hidden = false;
    button.addEventListener("click", claim);
    return;
  }

  if (!state.open) { track("report_reveal_closed"); return; }

  label.textContent = `Claim ${reportName(state.reportId)} — free`;
  block.hidden = false;
  track("report_reveal_shown", { report: String(state.reportId) });
  button.addEventListener("click", claim);
}

reveal();
