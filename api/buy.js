// Vercel serverless — returns the buy transaction for the cheapest DecayLabs listing.
// GET /api/buy?address=0x<buyer>
// Keeps the OpenSea API key server-side. The front-end encodes + sends the tx via the
// user's connected wallet (Base App / Farcaster mini app), so users never leave to opensea.io.

const SLUG = "decaylabs-395322216";
const OS = "https://api.opensea.io/api/v2";

// Agent keys expire after 30 days. Instead of failing when OPENSEA_API_KEY goes
// stale, mint a fresh keyless one on the fly and keep it for this instance's life.
let cachedKey = null;

async function mintKey() {
  // Key minting is itself rate limited, so give it a couple of spaced attempts.
  let last = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 1500 * attempt));
    const r = await fetch(`${OS}/auth/keys`, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: "{}",
    });
    if (r.ok) {
      const k = (await r.json()).api_key;
      if (k) {
        cachedKey = k;
        return k;
      }
    }
    last = r.status;
  }
  throw new Error("mint_key_failed_" + last);
}

const headersFor = (key) => ({
  accept: "application/json",
  "content-type": "application/json",
  "x-api-key": key,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  const buyer = String(req.query.address || "").toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(buyer)) {
    return res.status(400).json({ error: "invalid_address" });
  }

  try {
    let key = cachedKey || process.env.OPENSEA_API_KEY || (await mintKey());
    let H = headersFor(key);

    // Runs the request; on an auth failure mints a fresh key and retries once.
    const call = async (url, init) => {
      let r = await fetch(url, { ...init, headers: H });
      if (r.status === 401 || r.status === 403) {
        H = headersFor(await mintKey());
        r = await fetch(url, { ...init, headers: H });
      }
      return r;
    };

    // 1) cheapest active listing
    const lr = await call(`${OS}/listings/collection/${SLUG}/best?limit=1`);
    if (!lr.ok) return res.status(502).json({ error: "listings_failed", status: lr.status });
    const L = (await lr.json()).listings?.[0];
    if (!L) return res.status(404).json({ error: "no_listings" });

    // 2) fulfillment data (the actual on-chain buy transaction)
    const body = {
      listing: { hash: L.order_hash, chain: L.chain, protocol_address: L.protocol_address },
      fulfiller: { address: buyer },
    };
    const fr = await call(`${OS}/listings/fulfillment_data`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!fr.ok) return res.status(502).json({ error: "fulfillment_failed", status: fr.status });
    const tx = (await fr.json()).fulfillment_data?.transaction;
    if (!tx) return res.status(502).json({ error: "no_transaction" });

    const price = L.price?.current;
    const tokenId =
      L.protocol_data?.parameters?.offer?.[0]?.identifierOrCriteria ?? null;

    return res.status(200).json({
      to: tx.to,
      valueHex: tx.value_hex || "0x" + BigInt(tx.value).toString(16),
      valueWei: String(tx.value),
      fn: tx.function,
      parameters: tx.input_data.parameters,
      calldataSuffix: tx.calldata_suffix || "",
      priceEth: price ? Number(price.value) / 10 ** (price.decimals || 18) : null,
      currency: price?.currency || "ETH",
      tokenId,
      chainId: 8453,
    });
  } catch (e) {
    return res.status(500).json({ error: "exception", detail: String(e && e.message || e) });
  }
}
