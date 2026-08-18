const SITE = "https://decaylabs.online";
// Mirrors data/collection.json → storage.imageBaseUrl. Social crawlers fetch this
// URL directly, so it has to be a host that answers fast; the IPFS copy behind
// Qmb5cxL3Qf3vZU7Fk5z9Cg7Vv4AzygWMUY3WEKB6HEsZPd went offline with the old node.
const IMAGE_BASE = "https://ev.decaylabs.online/img";

function subjectId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id >= 1 && id <= 1000 ? id : null;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

export default function handler(request, response) {
  if (request.method && !["GET", "HEAD"].includes(request.method)) {
    response.setHeader("Allow", "GET, HEAD");
    return response.status(405).send("Method Not Allowed");
  }
  const id = subjectId(request.query?.id);
  if (!id) {
    response.statusCode = 302;
    response.setHeader("Location", `${SITE}/collection`);
    return response.end();
  }

  const padded = String(id).padStart(4, "0");
  const subjectUrl = `${SITE}/subject?id=${id}`;
  const imageUrl = `${IMAGE_BASE}/${id}.png`;
  const title = `Subject #${padded} | The Half-Life Archive`;
  const description = `Open Subject #${padded}, one of 1,000 altered witnesses recorded on Base.`;
  const miniapp = JSON.stringify({
    version: "1",
    imageUrl,
    button: {
      title: "Open this Subject",
      action: {
        type: "launch_miniapp",
        name: "Decay Labs",
        url: subjectUrl,
        splashImageUrl: `${SITE}/public/icon-192.png`,
        splashBackgroundColor: "#090a08"
      }
    }
  });

  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");
  response.setHeader("X-Robots-Tag", "noindex, follow");
  return response.status(200).send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(subjectUrl)}"><meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(imageUrl)}"><meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(imageUrl)}"><meta name="fc:miniapp" content='${escapeHtml(miniapp)}'>
<meta name="fc:frame" content='${escapeHtml(miniapp.replace("launch_miniapp", "launch_frame"))}'>
<meta http-equiv="refresh" content="0;url=${escapeHtml(subjectUrl)}"><script>location.replace(${JSON.stringify(subjectUrl)});</script>
</head><body><p>Opening <a href="${escapeHtml(subjectUrl)}">Subject #${padded}</a>…</p></body></html>`);
}
