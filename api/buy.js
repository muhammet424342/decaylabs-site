const SLUG = "decaylabs-395322216";
const CHAIN_ID = 8453;
const OS = "https://api.opensea.io/api/v2";
const DEFAULT_CURATED = Array.from({ length: 24 }, (_, index) => index + 1);
let cachedKey = null;

function allowedTokenIds() {
  const raw = String(process.env.CURATED_TOKEN_IDS || "").trim();
  if (!raw) return new Set(DEFAULT_CURATED.map(String));
  const parsed = raw.split(",").map((item) => Number(item.trim())).filter((id) => Number.isInteger(id) && id >= 1 && id <= 1000);
  return new Set((parsed.length ? parsed : DEFAULT_CURATED).map(String));
}
export function tokenIdFromListing(listing) {
  return String(listing?.protocol_data?.parameters?.offer?.[0]?.identifierOrCriteria ?? "");
}

function priceWei(listing) {
  try { return BigInt(listing?.price?.current?.value ?? 0); } catch (_) { return 0n; }
}

export function selectListing(listings, requestedTokenId, curated = allowedTokenIds()) {
  const requested = requestedTokenId == null ? null : String(requestedTokenId);
  const candidates = listings.filter((listing) => {
    const tokenId = tokenIdFromListing(listing);
    if (!tokenId) return false;
    return requested ? tokenId === requested : curated.has(tokenId);
  });
  candidates.sort((a, b) => priceWei(a) < priceWei(b) ? -1 : priceWei(a) > priceWei(b) ? 1 : 0);
  return candidates[0] || null;
}

async function timedFetch(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try { return await fetch(url, { ...init, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

async function mintKey() {
  const response = await timedFetch(`${OS}/auth/keys`, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: "{}"
  });
  if (!response.ok) throw new Error(`api_key_unavailable_${response.status}`);
  const key = (await response.json()).api_key;
  if (!key) throw new Error("api_key_missing");
  cachedKey = key;
  return key;
}

function headersFor(key) {
  return { accept: "application/json", "content-type": "application/json", "x-api-key": key };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const buyer = String(req.query.address || "").toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(buyer)) return res.status(400).json({ error: "invalid_address" });
  const tokenParam = req.query.tokenId == null || req.query.tokenId === "" ? null : Number(req.query.tokenId);
  if (tokenParam != null && (!Number.isInteger(tokenParam) || tokenParam < 1 || tokenParam > 1000)) {
    return res.status(400).json({ error: "invalid_token_id" });
  }

  try {
    let key = cachedKey || process.env.OPENSEA_API_KEY || await mintKey();
    let headers = headersFor(key);
    const call = async (url, init = {}) => {
      let response = await timedFetch(url, { ...init, headers });
      if (response.status === 401 || response.status === 403) {
        key = await mintKey();
        headers = headersFor(key);
        response = await timedFetch(url, { ...init, headers });
      }
      return response;
    };

    let cursor = "";
    let listing = null;
    for (let page = 0; page < 5 && !listing; page += 1) {
      const url = new URL(`${OS}/listings/collection/${SLUG}/best`);
      url.searchParams.set("limit", "100");
      if (cursor) url.searchParams.set("next", cursor);
      const response = await call(url.toString());
      if (!response.ok) return res.status(502).json({ error: "listings_unavailable" });
      const body = await response.json();
      listing = selectListing(body.listings || [], tokenParam);
      cursor = body.next || "";
      if (!cursor) break;
    }
    if (!listing) return res.status(404).json({ error: tokenParam ? "token_not_listed" : "no_curated_listings" });

    const tokenId = tokenIdFromListing(listing);
    if (tokenParam != null && tokenId !== String(tokenParam)) return res.status(409).json({ error: "token_mismatch" });

    const fulfillment = await call(`${OS}/listings/fulfillment_data`, {
      method: "POST",
      body: JSON.stringify({
        listing: { hash: listing.order_hash, chain: listing.chain, protocol_address: listing.protocol_address },
        fulfiller: { address: buyer }
      })
    });
    if (!fulfillment.ok) return res.status(502).json({ error: "fulfillment_unavailable" });
    const transaction = (await fulfillment.json()).fulfillment_data?.transaction;
    if (!transaction?.to || !transaction?.input_data?.parameters || transaction.value == null) {
      return res.status(502).json({ error: "invalid_fulfillment" });
    }

    const price = listing.price?.current;
    const decimals = Number(price?.decimals ?? 18);
    const priceEth = price?.value == null ? null : Number(price.value) / (10 ** decimals);
    return res.status(200).json({
      to: transaction.to,
      valueHex: transaction.value_hex || `0x${BigInt(transaction.value).toString(16)}`,
      valueWei: String(transaction.value),
      parameters: transaction.input_data.parameters,
      calldataSuffix: transaction.calldata_suffix || "",
      priceEth,
      currency: price?.currency || "ETH",
      tokenId,
      chainId: CHAIN_ID,
      listingHash: listing.order_hash
    });
  } catch (error) {
    console.error("[buy-api]", error);
    return res.status(500).json({ error: "checkout_unavailable" });
  }
}
