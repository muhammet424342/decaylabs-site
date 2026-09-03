// Must stay a ".js" file under api/lib/: @vercel/node compiles this handler to
// CommonJS, and require() of a .mjs ES module throws ERR_REQUIRE_ESM at boot —
// that is what returned 500 for every checkout request from 2 Aug onwards.
// api/lib/ is outside the "api/*.js" function glob, so it is bundled as a
// dependency rather than deployed as its own endpoint.
import { BASE_CHAIN_ID, EXPECTED_CONTRACT, isAddress, isAllowedProtocol, normalizeTokenId, normalizeWei } from "./lib/checkout-rules.js";

const SLUG = "decaylabs-archive";
const CHAIN_ID = BASE_CHAIN_ID;
const OS = "https://api.opensea.io/api/v2";
const DEFAULT_CURATED = Array.from({ length: 24 }, (_, index) => index);
const CONTRACT = EXPECTED_CONTRACT;
function log(level, message, details = {}) {
  const writer = level === "error" ? console.error : level === "warning" ? console.warn : console.log;
  writer(JSON.stringify({ level, message, route: "/api/buy.js", ...details }));
}

function allowedTokenIds() {
  const raw = String(process.env.CURATED_TOKEN_IDS || "").trim();
  if (!raw) return new Set(DEFAULT_CURATED.map(String));
  const parsed = raw.split(",").map((item) => Number(item.trim())).filter((id) => Number.isInteger(id) && id >= 0 && id < 1000);
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

/* `curated` narrows the generic (no token requested) case to a shortlist.
 * Pass null to consider every listing, which is what the collection-wide floor
 * needs: the shortlist can sell out while hundreds of Subjects are still for
 * sale, and it can also sit above the real floor once prices stop being uniform. */
export function selectListing(listings, requestedTokenId, curated = allowedTokenIds()) {
  const requested = requestedTokenId == null ? null : String(requestedTokenId);
  const candidates = listings.filter((listing) => {
    const tokenId = tokenIdFromListing(listing);
    if (!tokenId) return false;
    if (priceWei(listing) <= 0n) return false;
    if (requested) return tokenId === requested;
    return curated ? curated.has(tokenId) : true;
  });
  candidates.sort((a, b) => priceWei(a) < priceWei(b) ? -1 : priceWei(a) > priceWei(b) ? 1 : 0);
  return candidates[0] || null;
}

/* Healthy OpenSea calls answer in 0.4-1.4s. A call that reaches several seconds
 * is not slow, it is stuck, so each attempt is cut short and retried rather than
 * waited out. REQUEST_BUDGET_MS keeps the whole handler inside the platform's
 * execution limit so a stall always returns a described error, never a bare 500. */
export const ATTEMPT_TIMEOUT_MS = 3500;
export const REQUEST_BUDGET_MS = 8500;
export const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export class UpstreamError extends Error {
  constructor(label, kind, status = 0) {
    super(`${label}_${kind}`);
    this.label = label;
    this.kind = kind;
    this.status = status;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function timedFetch(url, init = {}, { label = "opensea", timeoutMs = ATTEMPT_TIMEOUT_MS, fetchImpl = fetch } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } catch (error) {
    const kind = error?.name === "AbortError" ? "timeout" : "network_error";
    console.error(`[buy-api] upstream ${label} ${kind} after ${timeoutMs}ms`);
    throw new UpstreamError(label, kind);
  } finally {
    clearTimeout(timer);
  }
}

/* Retries only what is worth retrying: a stall, a network drop, a 429 or a
 * transient 5xx. A 400/401/403/404 is an answer, not a hiccup, and is returned
 * to the caller untouched. */
export async function withRetry(label, run, { attempts = MAX_ATTEMPTS, baseDelayMs = 200, deadline = Infinity, now = () => Date.now(), sleepImpl = sleep } = {}) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (now() >= deadline) break;
    try {
      const response = await run(attempt);
      if (RETRYABLE_STATUS.has(response?.status) && attempt < attempts) {
        console.error(`[buy-api] upstream ${label} status ${response.status}, attempt ${attempt}/${attempts}`);
        lastError = new UpstreamError(label, "status", response.status);
        await sleepImpl(baseDelayMs * 2 ** (attempt - 1));
        continue;
      }
      return response;
    } catch (error) {
      if (!(error instanceof UpstreamError)) throw error;
      if (error.kind === "authentication") throw error;
      lastError = error;
      if (attempt >= attempts) break;
      console.error(`[buy-api] upstream ${label} ${error.kind}, retry ${attempt}/${attempts - 1}`);
      await sleepImpl(baseDelayMs * 2 ** (attempt - 1));
    }
  }
  throw lastError || new UpstreamError(label, "timeout");
}

function headersFor(key) {
  return { accept: "application/json", "content-type": "application/json", "x-api-key": key };
}

export default async function handler(req, res) {
  const startedAt = Date.now();
  const requestId = String(req.headers?.["x-vercel-id"] || "").slice(0, 80);
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

  if (!process.env.OPENSEA_API_KEY) {
    log("warning", "checkout_api_key_missing", { requestId, ms: Date.now() - startedAt });
    return res.status(503).json({ error: "opensea_api_key_required" });
  }

  const deadline = Date.now() + REQUEST_BUDGET_MS;
  try {
    const key = process.env.OPENSEA_API_KEY;
    let headers = headersFor(key);
    const call = (url, init = {}, label = "listings") => withRetry(label, async () => {
      const remaining = deadline - Date.now();
      const timeoutMs = Math.max(500, Math.min(ATTEMPT_TIMEOUT_MS, remaining));
      let response = await timedFetch(url, { ...init, headers }, { label, timeoutMs });
      if (response.status === 401 || response.status === 403) throw new UpstreamError(label, "authentication", response.status);
      return response;
    }, { deadline });

    let cursor = "";
    let listing = null;

    /* A named token still has to be asked for directly: the collection feed is
     * ordered by price, so any particular Subject routinely sits past the pages
     * we scan, and hunting for it there ran past the fetch timeout.
     * (This used to be true of the generic case too, back when every Subject
     * carried the same price and "sorted by price" meant "arbitrary order".) */
    const bestFor = async (id) => {
      const response = await call(`${OS}/listings/collection/${SLUG}/nfts/${id}/best`, {}, "listing_best");
      if (!response.ok) return null;
      const body = await response.json().catch(() => null);
      const candidate = body && (Array.isArray(body.listings) ? body.listings[0] : body.order_hash ? body : null);
      if (!candidate || tokenIdFromListing(candidate) !== String(id) || priceWei(candidate) <= 0n) return null;
      return candidate;
    };

    /* The floor: one page of the collection feed, which OpenSea returns sorted
     * by price. This is the whole answer for the generic case now that Subjects
     * carry different prices — the first page holds the genuine cheapest. */
    const cheapestListed = async () => {
      const url = new URL(`${OS}/listings/collection/${SLUG}/best`);
      url.searchParams.set("limit", "100");
      const response = await call(url.toString(), {}, "listing_feed");
      if (!response.ok) return null;
      const body = await response.json().catch(() => null);
      return selectListing(body?.listings || [], null, null);
    };

    if (tokenParam != null) {
      listing = await bestFor(tokenParam);
    } else {
      /* Sell the real floor, not a fixed shortlist. Two things broke while the
       * shortlist was the only source: checkout would 404 the moment those few
       * tokens sold even though hundreds were still listed, and after any
       * reprice it quoted a number the buyer could beat on OpenSea directly. */
      listing = await cheapestListed();
    }

    if (!listing && tokenParam == null) {
      /* Feed unavailable. Naming a few tokens directly is what worked while
       * every Subject carried the same price, so it stays as the fallback. */
      const curated = [...allowedTokenIds()].slice(0, 3);
      const settled = await Promise.allSettled(curated.map((id) => bestFor(id)));
      const found = settled.filter((entry) => entry.status === "fulfilled" && entry.value).map((entry) => entry.value);
      if (!found.length && settled.every((entry) => entry.status === "rejected")) {
        throw settled[0].reason;
      }
      found.sort((a, b) => (priceWei(a) < priceWei(b) ? -1 : priceWei(a) > priceWei(b) ? 1 : 0));
      listing = found[0] || null;
    }

    for (let page = 0; page < 2 && !listing && Date.now() < deadline; page += 1) {
      const url = new URL(`${OS}/listings/collection/${SLUG}/best`);
      url.searchParams.set("limit", "100");
      if (cursor) url.searchParams.set("next", cursor);
      const response = await call(url.toString(), {}, "listing_feed");
      if (!response.ok) return res.status(502).json({ error: "listings_unavailable" });
      const body = await response.json();
      listing = selectListing(body.listings || [], tokenParam, null);
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
    }, "fulfillment_data");
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
    log("info", "checkout_quote_ready", { requestId, tokenId, ms: Date.now() - startedAt });
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
    if (error instanceof UpstreamError) {
      /* Name the request that failed and answer with something the client can
       * act on. A stall used to surface as a bare 500 checkout_unavailable,
       * which told neither the buyer nor us anything. */
      log("error", "checkout_upstream_failed", { requestId, upstream: error.label, kind: error.kind, status: error.status || 0, ms: Date.now() - startedAt });
      const timedOut = error.kind === "timeout";
      return res.status(timedOut ? 504 : 502).json({
        error: timedOut ? "upstream_timeout" : "opensea_unavailable",
        upstream: error.label
      });
    }
    log("error", "checkout_failed", { requestId, error: error instanceof Error ? error.message : String(error), ms: Date.now() - startedAt });
    return res.status(500).json({ error: "checkout_unavailable" });
  }
}
