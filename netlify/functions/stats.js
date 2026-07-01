// Netlify serverless function — proxies OpenSea collection stats (keeps the API key secret).
// Set OPENSEA_API_KEY in Netlify: Site settings → Environment variables.
// Without a key it returns known-real fallback values (site never breaks).

const SLUG = "decaylabs-395322216";

exports.handler = async () => {
  const headers = { "content-type": "application/json", "cache-control": "public, max-age=300" };
  const fallback = { floor: 0.005, volume: null, owners: null, sales: null, change7d: null, fallback: true };

  const key = process.env.OPENSEA_API_KEY;
  if (!key) return { statusCode: 200, headers, body: JSON.stringify(fallback) };

  try {
    const r = await fetch(`https://api.opensea.io/api/v2/collections/${SLUG}/stats`, {
      headers: { accept: "application/json", "x-api-key": key },
    });
    if (!r.ok) return { statusCode: 200, headers, body: JSON.stringify(fallback) };
    const d = await r.json();
    const t = d.total || {};
    const seven = (d.intervals || []).find((i) => i.interval === "seven_day") || {};
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        floor: t.floor_price ?? 0.005,
        volume: t.volume ?? null,
        owners: t.num_owners ?? null,
        sales: t.sales ?? null,
        change7d: typeof seven.volume_change === "number" ? seven.volume_change : null,
        fallback: false,
      }),
    };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify(fallback) };
  }
};
