// Stable Vercel route for Decay Labs collection statistics.
const SLUG = "decaylabs-395322216";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  const fallback = {
    floor: 0.005,
    volume: null,
    owners: null,
    sales: null,
    change7d: null,
    fallback: true,
  };

  const key = process.env.OPENSEA_API_KEY;
  if (!key) return res.status(200).json(fallback);

  try {
    const response = await fetch(`https://api.opensea.io/api/v2/collections/${SLUG}/stats`, {
      headers: { accept: "application/json", "x-api-key": key },
    });
    if (!response.ok) return res.status(200).json(fallback);

    const body = await response.json();
    const total = body.total || {};
    const sevenDay = (body.intervals || []).find((item) => item.interval === "seven_day") || {};
    return res.status(200).json({
      floor: total.floor_price ?? 0.005,
      volume: total.volume ?? null,
      owners: total.num_owners ?? null,
      sales: total.sales ?? null,
      change7d: typeof sevenDay.volume_change === "number" ? sevenDay.volume_change : null,
      fallback: false,
    });
  } catch (_) {
    return res.status(200).json(fallback);
  }
}
