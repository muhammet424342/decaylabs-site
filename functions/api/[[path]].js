// Cloudflare Pages Functions koprusu: api/*.js Vercel tarzi (req, res) handler'larini
// degistirmeden calistirir. Istemci /api/buy.js?... cagiriyor; ayni yol burada yakalanir.
import buy from "../../api/buy.js";
import collectionStats from "../../api/collection-stats.js";

const HANDLERS = {
  "buy": buy, "buy.js": buy,
  "collection-stats": collectionStats, "collection-stats.js": collectionStats
};

export async function onRequest({ request, env, params }) {
  const handler = HANDLERS[(params.path || []).join("/")];
  if (!handler) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404, headers: { "content-type": "application/json; charset=utf-8" }
    });
  }
  // handler'lar process.env okuyor; Pages ortam degiskenlerini oraya aktar
  globalThis.process = globalThis.process || { env: {} };
  Object.assign(globalThis.process.env, env);

  const url = new URL(request.url);
  const req = { method: request.method, query: Object.fromEntries(url.searchParams), headers: Object.fromEntries(request.headers) };
  return new Promise((resolve) => {
    const headers = new Headers();
    let status = 200;
    const res = {
      setHeader(name, value) { headers.set(name, value); return res; },
      status(code) { status = code; return res; },
      json(body) {
        headers.set("content-type", "application/json; charset=utf-8");
        resolve(new Response(JSON.stringify(body), { status, headers }));
        return res;
      }
    };
    Promise.resolve(handler(req, res)).catch(() => resolve(new Response(JSON.stringify({ error: "internal" }), {
      status: 500, headers: { "content-type": "application/json; charset=utf-8" }
    })));
  });
}
