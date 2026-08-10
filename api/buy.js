import { BASE_CHAIN_ID, EXPECTED_CONTRACT, isAddress, isAllowedProtocol, normalizeTokenId, normalizeWei } from "../checkout-rules.mjs";

const SLUG = "decaylabs-archive";
const CHAIN_ID = BASE_CHAIN_ID;
const OS = "https://api.opensea.io/api/v2";
const DEFAULT_CURATED = Array.from({ length: 24 }, (_, index) => index + 1);
const CONTRACT = EXPECTED_CONTRACT;
let cachedKey = null;

function configuredApiKey() {
  const key = String(process.env.OPENSEA_API_KEY || "").trim();
  if (!key) {
    const error = new Error("opensea_not_configured");
    error.code = "OPENSEA_NOT_CONFIGURED";
    throw error;
  }
  return key;
}

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

function listingDetails(listing) {
  const parameters = listing?.protocol_data?.parameters || {};
  const offer = parameters.offer?.[0] || {};
  return { tokenId: tokenIdFromListing(listing), contract: offer.token || offer.asset_contract?.address || listing?.asset?.contract || "", seller: parameters.offerer || listing?.offerer || listing?.maker?.address || "", protocolAddress: listing?.protocol_address || "", orderHash: listing?.order_hash || "", chain: String(listing?.chain || "").toLowerCase(), priceWei: priceWei(listing) };
}

export function validateListingFulfillment(listing, transaction, fulfillmentBody = {}) {
  const expected = listingDetails(listing);
  const parameters = transaction?.input_data?.parameters || {};
  const fulfillmentChain = fulfillmentBody.chain_id ?? fulfillmentBody.chainId ?? transaction?.chain_id ?? transaction?.chainId;
  if (!expected.orderHash) return "invalid_order_hash";
  if (!["base", "base-mainnet", String(CHAIN_ID)].includes(expected.chain)) return "chain_mismatch";
  if (!isAddress(expected.contract) || expected.contract.toLowerCase() !== CONTRACT.toLowerCase()) return "invalid_contract";
  if (!isAddress(expected.seller)) return "invalid_seller";
  if (!isAllowedProtocol(expected.protocolAddress)) return "invalid_protocol";
  if (fulfillmentChain != null && String(fulfillmentChain) !== String(CHAIN_ID) && String(fulfillmentChain).toLowerCase() !== "base") return "chain_mismatch";
  if (!isAllowedProtocol(transaction?.to) || transaction.to.toLowerCase() !== expected.protocolAddress.toLowerCase()) return "invalid_transaction_target";
  if (String(parameters.offerToken || "").toLowerCase() !== CONTRACT.toLowerCase()) return "invalid_contract";
  if (String(parameters.offerIdentifier) !== expected.tokenId) return "token_mismatch";
  if (String(parameters.offerer || "").toLowerCase() !== expected.seller.toLowerCase()) return "invalid_seller";
  const txValue = normalizeWei(transaction?.value);
  if (txValue === null || txValue !== expected.priceWei) return "price_changed";
  return null;
}

export function selectListing(listings, requestedTokenId, curated = allowedTokenIds()) {
  const requested = requestedTokenId == null ? null : String(requestedTokenId);
  const candidates = listings.filter((listing) => {
    const tokenId = tokenIdFromListing(listing);
    if (!tokenId) return false;
    if (priceWei(listing) <= 0n) return false;
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

function headersFor(key) {
  return { accept: "application/json", "content-type": "application/json", "x-api-key": key };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "https://decaylabs.online");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const buyer = String(req.query.address || "").toLowerCase();
  if (!isAddress(buyer)) return res.status(400).json({ error: "invalid_address" });
  const tokenParam = req.query.tokenId == null || req.query.tokenId === "" ? null : normalizeTokenId(req.query.tokenId);
  if (req.query.tokenId != null && req.query.tokenId !== "" && tokenParam == null) {
    return res.status(400).json({ error: "invalid_token_id" });
  }
  const expectedPriceWei = req.query.expectedPriceWei == null || req.query.expectedPriceWei === "" ? null : normalizeWei(req.query.expectedPriceWei);
  if (req.query.expectedPriceWei != null && req.query.expectedPriceWei !== "" && expectedPriceWei == null) return res.status(400).json({ error: "invalid_expected_price" });

  try {
    let key = cachedKey || configuredApiKey();
    let headers = headersFor(key);
    const call = async (url, init = {}) => {
      let response = await timedFetch(url, { ...init, headers });
      if (response.status === 401 || response.status === 403) {
        const error = new Error("opensea_api_key_rejected");
        error.code = "OPENSEA_API_KEY_REJECTED";
        throw error;
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
    if (expectedPriceWei !== null && priceWei(listing) !== expectedPriceWei) return res.status(409).json({ error: "price_changed" });

    const fulfillment = await call(`${OS}/listings/fulfillment_data`, {
      method: "POST",
      body: JSON.stringify({
        listing: { hash: listing.order_hash, chain: listing.chain, protocol_address: listing.protocol_address },
        fulfiller: { address: buyer }
      })
    });
    if (!fulfillment.ok) return res.status(502).json({ error: "fulfillment_unavailable" });
    const fulfillmentBody = await fulfillment.json();
    const transaction = fulfillmentBody.fulfillment_data?.transaction;
    if (!transaction?.to || !transaction?.input_data?.parameters || transaction.value == null) {
      return res.status(502).json({ error: "invalid_fulfillment" });
    }
    const fulfillmentError = validateListingFulfillment(listing, transaction, fulfillmentBody);
    if (fulfillmentError) return res.status(502).json({ error: fulfillmentError });

    const price = listing.price?.current;
    const decimals = Number(price?.decimals ?? 18);
    const priceEth = price?.value == null ? null : Number(price.value) / (10 ** decimals);
    return res.status(200).json({
      to: transaction.to,
      protocolAddress: listing.protocol_address || "",
      contract: CONTRACT,
      seller: listing.protocol_data?.parameters?.offerer || listing.offerer || listing.maker?.address || "",
     valueHex: transaction.value_hex || `0x${BigInt(transaction.value).toString(16)}`,
     valueWei: String(transaction.value),
      priceWei: String(price?.value ?? ""),
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
