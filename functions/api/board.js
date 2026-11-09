// /api/board — Archive Board. [[path]].js'ten once eslesir (daha ozel rota).
// Depo: Pages KV baglamasi BOARD (README). Baglama yoksa bellek ici yedek: kalici DEGIL.
import { ownerOfOnChain, place, view } from "../../board-rules.mjs";

const KEY = "placements";
let memory = {}; // ponytail: KV yoksa izolat omru kadar yasar; uretimde BOARD baglanmali

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" }
});

async function load(env) {
  if (!env.BOARD) return memory;
  return (await env.BOARD.get(KEY, "json")) || {};
}

async function save(env, state) {
  // ponytail: tek anahtar, es zamanli yazmada son yazan kazanir; trafik artarsa D1 + UNIQUE(cell)
  if (!env.BOARD) { memory = state; return; }
  await env.BOARD.put(KEY, JSON.stringify(state));
}

export async function onRequestGet({ env }) {
  return json({ ...view(await load(env)), persistent: Boolean(env.BOARD) });
}

export async function onRequestPost({ request, env }) {
  let input;
  try { input = await request.json(); } catch (_) { return json({ error: "invalid_json" }, 400); }
  try {
    const result = await place(await load(env), input, { ownerOf: (id) => ownerOfOnChain(id) });
    if (result.error) return json({ error: result.error }, result.error === "cell_taken" ? 409 : result.error === "not_owner" || result.error === "bad_signature" ? 403 : 400);
    await save(env, result.state);
    return json({ ok: true, ...view(result.state) });
  } catch (_) {
    return json({ error: "internal" }, 500);
  }
}
