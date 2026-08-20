/* Conversion event collector.
 * Writes one structured JSON line per event to the function log (readable in the
 * Vercel dashboard) and optionally mirrors it to EVENT_WEBHOOK_URL.
 * Stores no cookies, no IP, no wallet addresses.
 */

const ALLOWED = new Set([
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
  "report_claim_clicked",
  "report_claim_success",
  "report_claim_failed",
  "opensea_clicked",
  "x_clicked",
  "discord_clicked",
  "services_clicked"
]);

const MAX_BODY = 2048;
const ADDRESS = /^0x[a-fA-F0-9]{20,}$/;

function readBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  return new Promise((resolve) => {
    let raw = "";
    let tooBig = false;
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > MAX_BODY) { tooBig = true; req.destroy(); }
    });
    req.on("end", () => {
      if (tooBig) return resolve(null);
      try { resolve(JSON.parse(raw || "{}")); } catch (_) { resolve(null); }
    });
    req.on("error", () => resolve(null));
  });
}

function sanitize(props) {
  const out = {};
  Object.entries(props || {}).slice(0, 8).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    const v = typeof value === "number" || typeof value === "boolean" ? value : String(value).slice(0, 64);
    if (typeof v === "string" && ADDRESS.test(v.trim())) return;
    out[String(key).slice(0, 32)] = v;
  });
  return out;
}

export function normalizeEvent(payload) {
  if (!payload || typeof payload !== "object") return null;
  const name = String(payload.name || "");
  if (!ALLOWED.has(name)) return null;
  return {
    t: new Date().toISOString(),
    ev: name,
    sid: String(payload.sid || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 16),
    path: String(payload.path || "").slice(0, 120),
    ref: String(payload.ref || "").slice(0, 64),
    vw: Number.isFinite(Number(payload.vw)) ? Number(payload.vw) : 0,
    mobile: Boolean(payload.mobile),
    props: sanitize(payload.props)
  };
}

export default async function handler(req, res) {
  const startedAt = Date.now();
  const requestId = String(req.headers?.["x-vercel-id"] || "").slice(0, 80);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "https://decaylabs.online");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const origin = String(req.headers?.origin || "");
  if (origin && origin !== "https://decaylabs.online") return res.status(403).json({ error: "origin_not_allowed" });
  if (!String(req.headers?.["content-type"] || "").toLowerCase().startsWith("application/json")) {
    return res.status(415).json({ error: "json_required" });
  }

  const event = normalizeEvent(await readBody(req));
  if (!event) return res.status(400).json({ error: "invalid_event" });

  console.log(JSON.stringify({ level: "info", message: "conversion_event", route: "/api/ev.js", requestId, ms: Date.now() - startedAt, event }));

  const webhook = process.env.EVENT_WEBHOOK_URL;
  if (webhook) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(event),
        signal: controller.signal
      });
    } catch (error) {
      console.warn(JSON.stringify({ level: "warning", message: "event_webhook_failed", route: "/api/ev.js", requestId, error: error?.name === "AbortError" ? "timeout" : "network_error" }));
      // Measurement must never break the page.
    } finally { clearTimeout(timer); }
  }
  return res.status(204).end();
}
