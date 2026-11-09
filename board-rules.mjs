// Archive Board kurallari: imzali yerlesim, zincirden sahiplik, fraksiyon bolgeleri.
// Para, havuz, cekilis, token odulu YOK; odul sadece gorunurluk (seviye + liderlik tablosu).
// Tarayici da bu dosyayi (boardMessage, bolgeler) import eder; ethers sadece sunucuda, place() icinde yuklenir.
import { EXPECTED_CONTRACT } from "./checkout-rules.mjs";

export const COLS = 10;
export const ROWS = 10;
export const FACTION_COUNT = 5;
export const ROWS_PER_FACTION = ROWS / FACTION_COUNT;
export const MAX_AGE_MS = 10 * 60 * 1000;
export const DAY_MS = 86400000;
export const BASE_RPC = "https://mainnet.base.org";

// subject-model.js ile ayni kural: faction = factions[(id - 1) % 5]
export const tokenFaction = (tokenId) => (tokenId - 1) % FACTION_COUNT;
export const cellFaction = (cell) => Math.floor(Math.floor(cell / COLS) / ROWS_PER_FACTION);

export function boardMessage({ tokenId, cell, issuedAt }) {
  return `Decay Labs Archive Board\nPlace Subject: ${tokenId}\nCell: ${cell}\nIssued: ${issuedAt}\nNo gas. No payment. No reward pool.`;
}

export async function ownerOfOnChain(tokenId, fetchImpl = fetch) {
  const data = "0x6352211e" + BigInt(tokenId).toString(16).padStart(64, "0");
  const response = await fetchImpl(BASE_RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: EXPECTED_CONTRACT, data }, "latest"] })
  });
  const body = await response.json();
  if (!body.result || body.result.length < 66) return null;
  return "0x" + body.result.slice(-40);
}

// state: { [cell]: { tokenId, owner, placedAt } }. Hata kodu ya da yeni state doner.
export async function place(state, input, { ownerOf, now = Date.now() }) {
  const tokenId = Number(input.tokenId);
  const cell = Number(input.cell);
  const address = String(input.address || "").toLowerCase();
  if (!Number.isInteger(tokenId) || tokenId < 1 || tokenId > 1000) return { error: "invalid_token" };
  if (!Number.isInteger(cell) || cell < 0 || cell >= COLS * ROWS) return { error: "invalid_cell" };
  if (!/^0x[0-9a-f]{40}$/.test(address)) return { error: "invalid_address" };
  if (cellFaction(cell) !== tokenFaction(tokenId)) return { error: "wrong_faction_zone" };

  const issued = Date.parse(input.issuedAt);
  if (!Number.isFinite(issued) || now - issued > MAX_AGE_MS || issued - now > 60000) return { error: "stale_signature" };

  const { verifyMessage } = await import("ethers");
  let signer;
  try { signer = verifyMessage(boardMessage({ tokenId, cell, issuedAt: input.issuedAt }), input.signature).toLowerCase(); }
  catch (_) { return { error: "bad_signature" }; }
  if (signer !== address) return { error: "bad_signature" };

  const owner = String((await ownerOf(tokenId)) || "").toLowerCase();
  if (owner !== address) return { error: "not_owner" };

  const occupant = state[cell];
  if (occupant && occupant.tokenId !== tokenId) return { error: "cell_taken" };
  if (occupant) return { state }; // ayni yere tekrar: seviye sifirlanmaz

  const next = {};
  for (const [key, value] of Object.entries(state)) if (value.tokenId !== tokenId) next[key] = value; // tasima
  next[cell] = { tokenId, owner: address, placedAt: now };
  return { state: next };
}

export const level = (placedAt, now = Date.now()) => 1 + Math.floor(Math.max(0, now - placedAt) / DAY_MS);

export function view(state, now = Date.now()) {
  const cells = Object.entries(state).map(([cell, p]) => ({ cell: Number(cell), ...p, level: level(p.placedAt, now) }));
  const leaderboard = [...cells].sort((a, b) => a.placedAt - b.placedAt).slice(0, 10);
  return { cols: COLS, rows: ROWS, cells, leaderboard };
}
