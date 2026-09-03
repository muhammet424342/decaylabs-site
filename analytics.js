/* Decay Labs — first-party conversion measurement.
 * No cookies, no wallet addresses, no personal data. Session id is random and
 * lives only in sessionStorage so a single visit can be stitched into a funnel.
 */

// Keeps the .js extension: cleanUrls rewrites static pages, not functions, so
// the deployed route really is /api/ev.js — same as /api/buy.js.
const ENDPOINT = "/api/ev.js";

export const EVENTS = [
  "page_view",
  "collection_view",
  "nft_view",
  "subject_next",
  "subject_match_started",
  "subject_match_completed",
  "subject_match_shared",
  "share_clicked",
  "share_completed",
  "share_cancelled",
  "buy_button_clicked",
  "wallet_connect_started",
  "wallet_connected",
  "wallet_connect_failed",
  "network_switch_requested",
  "network_switch_succeeded",
  "network_switch_failed",
  "purchase_started",
  "purchase_submitted",
  "wallet_rejected",
  "listing_validation_failed",
  "transaction_failed",
  "purchase_success",
  "report_reveal_shown",
  "report_reveal_degraded",
  "report_reveal_closed",
  "report_claim_clicked",
  "report_claim_success",
  "report_claim_failed",
  "opensea_clicked",
  "x_clicked",
  "discord_clicked",
  "services_clicked"
];

const ALLOWED = new Set(EVENTS);
const sent = new Set();

function sessionId() {
  try {
    let id = sessionStorage.getItem("dl_sid");
    if (!id) {
      id = (crypto.randomUUID?.() || String(Math.random()).slice(2)).replace(/-/g, "").slice(0, 16);
      sessionStorage.setItem("dl_sid", id);
    }
    return id;
  } catch (_) {
    return "nostore";
  }
}

/** Strip anything that could be a wallet address or long free text. */
function safeProps(props) {
  const out = {};
  Object.entries(props || {}).slice(0, 8).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    let v = typeof value === "number" || typeof value === "boolean" ? value : String(value).slice(0, 64);
    if (typeof v === "string" && /^0x[a-fA-F0-9]{20,}$/.test(v.trim())) return; // never store addresses
    out[String(key).slice(0, 32)] = v;
  });
  return out;
}

export function track(name, props = {}, { once = false } = {}) {
  if (!ALLOWED.has(name)) {
    console.warn("[analytics] unknown event ignored:", name);
    return false;
  }
  const key = once ? `${name}:${JSON.stringify(props)}` : null;
  if (key) {
    if (sent.has(key)) return false;
    sent.add(key);
  }
  const body = JSON.stringify({
    name,
    sid: sessionId(),
    path: location.pathname + location.search.slice(0, 80),
    ref: document.referrer ? new URL(document.referrer).host.slice(0, 64) : "",
    vw: window.innerWidth,
    mobile: window.matchMedia("(max-width: 760px)").matches,
    ts: Date.now(),
    props: safeProps(props)
  });
  try {
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      if (ok) return true;
    }
  } catch (_) {}
  try {
    fetch(ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true })
      .catch(() => {});
  } catch (_) {}
  return true;
}

/** Outbound link clicks — delegated once, works for links rendered later. */
function initializeOutboundTracking() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    let host = "";
    try { host = new URL(link.href, location.origin).host; } catch (_) { return; }
    if (/opensea\.io$/.test(host)) track("opensea_clicked", { to: link.dataset.evLabel || "link" });
    else if (/(^|\.)x\.com$|(^|\.)twitter\.com$/.test(host)) track("x_clicked", { to: link.dataset.evLabel || "link" });
    else if (/discord\.(gg|com)$/.test(host)) track("discord_clicked", { to: link.dataset.evLabel || "link" });
    else if (link.dataset.evServices !== undefined) track("services_clicked", { to: link.dataset.evLabel || "link" });
  }, { capture: true });
}

/** Page-level auto events. */
export function initializeAnalytics() {
  const path = location.pathname.replace(/\/$/, "") || "/";
  track("page_view", { p: path });
  if (/^\/collection/.test(path)) track("collection_view", {});
  if (/^\/subject/.test(path)) {
    const id = new URLSearchParams(location.search).get("id");
    track("nft_view", { id: id ? Number(id) : 0 });
  }
  initializeOutboundTracking();
}

// Expose for manual/console verification without importing the module.
window.dlTrack = track;
