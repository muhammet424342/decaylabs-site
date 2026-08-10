const SLUG = "decaylabs-archive";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  const empty = { floor: null, volume: null, owners: null, sales: null, source: null, fresh: false };
  const key = process.env.OPENSEA_API_KEY;
  if (!key) return res.status(200).json(empty);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`https://api.opensea.io/api/v2/collections/${SLUG}/stats`, {
      headers: { accept: "application/json", "x-api-key": key },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!response.ok) return res.status(200).json(empty);
    const body = await response.json();
    const total = body.total || {};
    return res.status(200).json({
      floor: Number.isFinite(total.floor_price) ? total.floor_price : null,
      volume: Number.isFinite(total.volume) ? total.volume : null,
      owners: Number.isFinite(total.num_owners) ? total.num_owners : null,
      sales: Number.isFinite(total.sales) ? total.sales : null,
      source: "OpenSea API",
      fresh: true
    });
  } catch (error) {
    console.warn("[stats-api]", error);
    return res.status(200).json(empty);
  }
}
