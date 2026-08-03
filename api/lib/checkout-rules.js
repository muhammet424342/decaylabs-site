export const BASE_CHAIN_ID = 8453;
export const EXPECTED_CONTRACT = "0x65F5e8006F4eF730d6984836F606a5C5c516CdC8";
export const ALLOWED_SEAPORT_PROTOCOLS = new Set(["0x0000000000000068f116a894984e2db1123eb395", "0x00000000000001ad428e4906ae43d8f9852d0dd6"]);
export const ALLOWED_TRANSACTION_TARGETS = ALLOWED_SEAPORT_PROTOCOLS;
export const MAX_CHECKOUT_WEI = 250000000000000000n;

export function isAddress(value) { return /^0x[0-9a-fA-F]{40}$/.test(String(value || "")); }
export function normalizeWei(value) { try { const text = String(value ?? ""); if (!/^[0-9]+$/.test(text)) return null; return BigInt(text); } catch (_) { return null; } }
export function isAllowedProtocol(value) { return isAddress(value) && ALLOWED_SEAPORT_PROTOCOLS.has(String(value).toLowerCase()); }
export function normalizeTokenId(value) {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  if (!/^[1-9][0-9]*$/.test(text)) return null;
  const id = Number(text);
  return Number.isSafeInteger(id) && id <= 1000 ? id : null;
}
export function validateCheckoutPayload(data, requestedToken = null, expectedPriceWei = null) {
  if (!data || data.chainId !== BASE_CHAIN_ID) return "chain_mismatch";
  if (data.contract?.toLowerCase() !== EXPECTED_CONTRACT.toLowerCase()) return "invalid_contract";
  if (!isAllowedProtocol(data.protocolAddress) || String(data.protocolAddress).toLowerCase() !== String(data.to || "").toLowerCase()) return "invalid_protocol_target";
  if (requestedToken !== null && Number(data.tokenId) !== requestedToken) return "token_mismatch";
  if (!normalizeTokenId(data.tokenId)) return "invalid_token_id";
  if (!isAddress(data.seller)) return "invalid_seller";
  const price = normalizeWei(data.priceWei); const value = normalizeWei(data.valueWei);
  if (price === null || value === null || price <= 0n || value !== price || price > MAX_CHECKOUT_WEI) return "price_out_of_range";
  if (expectedPriceWei !== null && String(data.priceWei) !== String(expectedPriceWei)) return "price_changed";
  if (!data.listingHash || typeof data.listingHash !== "string") return "invalid_order_hash";
  return null;
}
export function classifyProviderError(error, fallback = "rpc_error") {
  const code = error?.code; const message = String(error?.message || error || "").toLowerCase();
  if (code === 4001 || /user rejected|user denied|rejected|denied|cancelled|canceled/.test(message)) return "user_rejected";
  if (code === -32000 || /insufficient funds|insufficient balance|funds for gas/.test(message)) return "insufficient_funds";
  if (/eth_sendtransaction|transaction failed|submit failed/.test(message)) return "transaction_submit_failed";
  if (/rpc|network|failed to fetch|timeout|disconnect|chain/.test(message)) return "rpc_error";
  return fallback;
}
export function friendlyCheckoutMessage(code) {
  const messages = {
    invalid_address: "Your wallet address is invalid. Reconnect your wallet and try again.",
    chain_mismatch: "Please switch your wallet to Base network to continue.",
    insufficient_funds: "Your wallet does not have enough ETH on Base for this purchase.",
    user_rejected: "Transaction cancelled. Nothing was submitted.",
    chain_switch_failed: "Your wallet could not switch to Base. No transaction was submitted.",
    transaction_submit_failed: "The transaction could not be submitted. No purchase was confirmed.",
    invalid_protocol_target: "The marketplace transaction target failed DecayLabs safety checks.",
    invalid_seller: "The listing seller failed DecayLabs safety checks.",
    invalid_order_hash: "The marketplace order could not be verified.",
    rpc_error: "Base network is not responding right now. Please try again shortly.",
    api_error: "Live listing data is temporarily unavailable. Please try again shortly.",
    invalid_token_id: "That Subject number is invalid.",
    token_not_listed: "That Subject is not currently listed.",
    nft_missing: "That Subject could not be found in the live collection.",
    sold: "That Subject is no longer available.",
    price_changed: "The listing price changed. Refresh and review the new price.",
    invalid_contract: "The listing contract did not match DecayLabs safety checks.",
    invalid_transaction_target: "The transaction target failed DecayLabs safety checks.",
    price_out_of_range: "The live price failed the checkout safety limit.",
    token_mismatch: "The selected Subject changed before checkout. Please refresh.",
    upstream_timeout: "OpenSea did not respond in time. Nothing was charged — please try again.",
    opensea_unavailable: "OpenSea is temporarily unavailable. Nothing was charged — please try again shortly.",
    checkout_unavailable: "In-app checkout is temporarily unavailable."
  };
  return messages[code] || messages.checkout_unavailable;
}
