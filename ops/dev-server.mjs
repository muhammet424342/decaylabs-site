/* Local Vercel-alike dev server: static files with cleanUrls + /api/* handlers.
 * Used to verify analytics events before deploying. Not part of the deployment.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = Number(process.env.PORT || 4321);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
  ".webmanifest": "application/manifest+json", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8"
};

async function exists(path) {
  try { return (await stat(path)).isFile(); } catch (_) { return false; }
}

function jsonResponse(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.setHeader("content-type", "application/json"); res.end(JSON.stringify(body)); return res; };
  return res;
}

const server = createServer(async (req, res) => {
  jsonResponse(res);
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "").replace(/\\/g, "/");
  if (!path.startsWith("/")) path = "/" + path;

  // Mirrors vercel.json: only api/*.js are functions, everything else is static.
  if (path.startsWith("/api/") && /\.js$/.test(path)) {
    const name = path.replace("/api/", "").replace(/\.js$/, "");
    try {
      const mod = await import(new URL(`../api/${name}.js`, import.meta.url).href + `?t=${Date.now()}`);
      req.query = Object.fromEntries(url.searchParams);
      return void (await mod.default(req, res));
    } catch (error) {
      console.error("[api]", name, error.message);
      return void res.status(500).json({ error: "handler_failed", detail: error.message });
    }
  }

  let file = join(ROOT, path);
  if (path === "/" || path.endsWith("/")) file = join(ROOT, path, "index.html");
  if (!extname(file) && !(await exists(file))) {
    if (await exists(file + ".html")) file += ".html";           // cleanUrls
    else file = join(ROOT, "404.html");
  }
  if (!(await exists(file))) file = join(ROOT, "404.html");

  try {
    const body = await readFile(file);
    res.setHeader("content-type", TYPES[extname(file)] || "application/octet-stream");
    res.setHeader("cache-control", "no-store");
    res.end(body);
  } catch (_) {
    res.statusCode = 404;
    res.end("not found");
  }
});

server.listen(PORT, () => console.log(`dev server on http://localhost:${PORT}`));
