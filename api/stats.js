// Vercel serverless function — proxies OpenSea collection stats so the API key stays secret.
// Set OPENSEA_API_KEY in your Vercel project env vars (Settings → Environment Variables).
// Local (python http.server) has no /api — the front-end falls back to known-real values.

const SLUG = "decaylabs-395322216";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  const fallback = { floor: 0.005, volume: null, owners: null, sales: null, change7d: null, fallback: true };

  const key = process.env.OPENSEA_API_KEY;
  if (!key) return res.status(200).json(fallback);

  try {
    const r = await fetch(`https://api.opensea.io/api/v2/collections/${SLUG}/stats`, {
      headers: { accept: "application/json", "x-api-key": key },
    });
    if (!r.ok) return res.status(200).json(fallback);
    const d = await r.json();
    const t = d.total || {};
    const seven = (d.intervals || []).find((i) => i.interval === "seven_day") || {};
    return res.status(200).json({
      floor: t.floor_price ?? 0.005,
      volume: t.volume ?? null,
      owners: t.num_owners ?? null,
      sales: t.sales ?? null,
      change7d: typeof seven.volume_change === "number" ? seven.volume_change : null,
      fallback: false,
    });
  } catch (e) {
    return res.status(200).json(fallback);
  }
}
