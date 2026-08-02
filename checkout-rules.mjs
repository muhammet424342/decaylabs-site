export const BASE_CHAIN_ID = 8453;
export const MAX_CHECKOUT_WEI = 250000000000000000n;

export function isAddress(value) { return /^0x[0-9a-fA-F]{40}$/.test(String(value || "")); }
export function normalizeTokenId(value) {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  if (!/^[1-9][0-9]*$/.test(text)) return null;
  const id = Number(text);
  return Number.isSafeInteger(id) && id <= 1000 ? id : null;
}
export function validateCheckoutPayload(data, requestedToken = null, contract = null) {
  if (!data || data.chainId !== BASE_CHAIN_ID) return "chain_mismatch";
  if (requestedToken !== null && Number(data.tokenId) !== requestedToken) return "token_mismatch";
  if (!isAddress(data.to)) return "invalid_transaction_target";
  if (contract && data.contract && String(data.contract).toLowerCase() !== contract.toLowerCase()) return "invalid_contract";
  if (!Number.isFinite(Number(data.priceEth)) || Number(data.priceEth) <= 0 || BigInt(data.valueWei || 0) <= 0n || BigInt(data.valueWei || 0) > MAX_CHECKOUT_WEI) return "price_out_of_range";
  return null;
}
export function friendlyCheckoutMessage(code) {
  const messages = {
    invalid_address: "Your wallet address is invalid. Reconnect your wallet and try again.",
    chain_mismatch: "Please switch your wallet to Base network to continue.",
    insufficient_funds: "Your wallet does not have enough ETH on Base for this purchase.",
    user_rejected: "Transaction cancelled. Nothing was submitted.",
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
    checkout_unavailable: "In-app checkout is temporarily unavailable."
  };
  return messages[code] || messages.checkout_unavailable;
}
