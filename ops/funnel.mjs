#!/usr/bin/env node
/* Turn DL_EVENT log lines into a conversion funnel.
 *
 *   npx vercel logs https://decaylabs.online | node ops/funnel.mjs
 *   node ops/funnel.mjs events.log
 *
 * Counts unique sessions per step, not raw events, so one visitor clicking buy
 * three times is still one visitor who reached the buy step.
 */
import { createInterface } from "node:readline";
import { createReadStream } from "node:fs";

export const STEPS = [
  { key: "visit", label: "Visit", events: ["page_view"] },
  { key: "nft", label: "Looked at a Subject", events: ["nft_view", "collection_view"] },
  { key: "buy", label: "Clicked buy", events: ["buy_button_clicked"] },
  { key: "wallet", label: "Connected a wallet", events: ["wallet_connected"] },
  { key: "started", label: "Reached the wallet prompt", events: ["purchase_started"] },
  { key: "submitted", label: "Submitted a transaction", events: ["purchase_submitted"] },
  { key: "confirmed", label: "Confirmed on Base", events: ["purchase_success"] }
];

const DROP_OFFS = [
  "wallet_connect_failed", "wallet_rejected", "network_switch_failed",
  "listing_validation_failed", "transaction_failed"
];

export function parseEvents(lines) {
  const events = [];
  for (const line of lines) {
    const at = line.indexOf("DL_EVENT ");
    if (at === -1) continue;
    const brace = line.indexOf("{", at);
    if (brace === -1) continue;
    try { events.push(JSON.parse(line.slice(brace))); } catch (_) { /* truncated line */ }
  }
  return events;
}

export function buildFunnel(events) {
  const sessions = new Map();
  const reasons = new Map();
  const outbound = new Map();
  for (const event of events) {
    const sid = event.sid || "unknown";
    if (!sessions.has(sid)) sessions.set(sid, new Set());
    sessions.get(sid).add(event.ev);
    if (DROP_OFFS.includes(event.ev)) {
      const code = `${event.ev}:${event.props?.code ?? "?"}`;
      reasons.set(code, (reasons.get(code) || 0) + 1);
    }
    if (["opensea_clicked", "x_clicked", "discord_clicked", "services_clicked"].includes(event.ev)) {
      outbound.set(event.ev, (outbound.get(event.ev) || 0) + 1);
    }
  }
  const reached = STEPS.map((step) => ({
    ...step,
    count: [...sessions.values()].filter((seen) => step.events.some((name) => seen.has(name))).length
  }));
  return {
    events: events.length,
    sessions: sessions.size,
    steps: reached,
    dropOffs: [...reasons.entries()].sort((a, b) => b[1] - a[1]),
    outbound: [...outbound.entries()].sort((a, b) => b[1] - a[1])
  };
}

export function render(funnel) {
  const top = funnel.steps[0]?.count || 0;
  const lines = [
    `Sessions: ${funnel.sessions}   Events: ${funnel.events}`,
    ""
  ];
  let previous = null;
  for (const step of funnel.steps) {
    const ofTop = top ? ((step.count / top) * 100).toFixed(1) : "0.0";
    const fromPrev = previous === null || previous === 0 ? "" : `  (${((step.count / previous) * 100).toFixed(0)}% of previous)`;
    const bar = "█".repeat(top ? Math.round((step.count / top) * 24) : 0).padEnd(24, "·");
    lines.push(`${step.label.padEnd(28)} ${bar} ${String(step.count).padStart(5)}  ${ofTop.padStart(5)}%${fromPrev}`);
    previous = step.count;
  }
  if (funnel.dropOffs.length) {
    lines.push("", "Drop-off reasons:");
    for (const [code, count] of funnel.dropOffs) lines.push(`  ${String(count).padStart(4)}  ${code}`);
  }
  if (funnel.outbound.length) {
    lines.push("", "Outbound clicks:");
    for (const [name, count] of funnel.outbound) lines.push(`  ${String(count).padStart(4)}  ${name}`);
  }
  if (!funnel.sessions) {
    lines.push("", "No DL_EVENT lines found. Pipe `vercel logs <url>` in, or pass a log file.");
  }
  return lines.join("\n");
}

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (invokedDirectly) {
  const file = process.argv[2];
  const input = createInterface({ input: file ? createReadStream(file) : process.stdin, crlfDelay: Infinity });
  const lines = [];
  for await (const line of input) lines.push(line);
  console.log(render(buildFunnel(parseEvents(lines))));
}
