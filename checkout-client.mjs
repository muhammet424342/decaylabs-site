import { BASE_CHAIN_ID, EXPECTED_CONTRACT, friendlyCheckoutMessage, validateCheckoutPayload, classifyProviderError } from "./checkout-rules.mjs";

export const BASE_CHAIN_HEX = "0x2105";
export const OPENSEA_COLLECTION = "https://opensea.io/collection/decaylabs-395322216";
export const MAX_CHECKOUT_ETH = 0.25;
export const BUILDER_SUFFIX = "62635f796236636d6562660b0080218021802180218021802180218021";
export const ABI = [{ type: "function", name: "fulfillBasicOrder_efficient_6GL6yc", stateMutability: "payable", inputs: [{ name: "parameters", type: "tuple", components: [
  { name: "considerationToken", type: "address" }, { name: "considerationIdentifier", type: "uint256" }, { name: "considerationAmount", type: "uint256" }, { name: "offerer", type: "address" }, { name: "zone", type: "address" }, { name: "offerToken", type: "address" }, { name: "offerIdentifier", type: "uint256" }, { name: "offerAmount", type: "uint256" }, { name: "basicOrderType", type: "uint8" }, { name: "startTime", type: "uint256" }, { name: "endTime", type: "uint256" }, { name: "zoneHash", type: "bytes32" }, { name: "salt", type: "uint256" }, { name: "offererConduitKey", type: "bytes32" }, { name: "fulfillerConduitKey", type: "bytes32" }, { name: "totalOriginalAdditionalRecipients", type: "uint256" }, { name: "additionalRecipients", type: "tuple[]", components: [{ name: "amount", type: "uint256" }, { name: "recipient", type: "address" }] }, { name: "signature", type: "bytes" }
]}], outputs: [{ name: "fulfilled", type: "bool" }] }];
const UINT_FIELDS = ["considerationIdentifier", "considerationAmount", "offerIdentifier", "offerAmount", "basicOrderType", "startTime", "endTime", "salt", "totalOriginalAdditionalRecipients"];

export class CheckoutError extends Error { constructor(code, message = friendlyCheckoutMessage(code)) { super(message); this.code = code; } }

export async function ensureBase(provider, onEvent = () => {}) {
  try {
    const chainId = await provider.request({ method: "eth_chainId" });
    if (parseInt(chainId, 16) === BASE_CHAIN_ID) return;
    onEvent("network_switch_requested", { from: parseInt(chainId, 16) });
    try { await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BASE_CHAIN_HEX }] }); }
    catch (_) { await provider.request({ method: "wallet_addEthereumChain", params: [{ chainId: BASE_CHAIN_HEX, chainName: "Base", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: ["https://mainnet.base.org"], blockExplorerUrls: ["https://basescan.org"] }] }); }
    const after = await provider.request({ method: "eth_chainId" });
    if (parseInt(after, 16) !== BASE_CHAIN_ID) throw new CheckoutError("chain_switch_failed");
    onEvent("network_switch_succeeded", {});
  } catch (error) {
    onEvent("network_switch_failed", { code: error?.code || "chain_switch_failed" });
    if (error instanceof CheckoutError) throw error;
    throw new CheckoutError("chain_switch_failed");
  }
}

async function quote(fetchImpl, buyer, tokenId, expectedPriceWei = null) {
  const query = new URLSearchParams({ address: buyer });
  if (tokenId !== null) query.set("tokenId", String(tokenId));
  if (expectedPriceWei !== null) query.set("expectedPriceWei", String(expectedPriceWei));
  let response;
  try { response = await fetchImpl(`/api/buy.js?${query}`, { headers: { accept: "application/json" } }); }
  catch (_) { throw new CheckoutError("rpc_error"); }
  let data;
  try { data = await response.json(); } catch (_) { throw new CheckoutError("api_error"); }
  if (!response.ok || data.error) {
    const code = ["token_not_listed", "no_curated_listings", "price_changed", "invalid_token_id", "invalid_address"].includes(data.error) ? data.error : "api_error";
    throw new CheckoutError(code);
  }
  return data;
}

export function buildCalldata(data, encodeFunctionData) {
  const parameters = { ...data.parameters };
  UINT_FIELDS.forEach((key) => { parameters[key] = BigInt(parameters[key]); });
  parameters.additionalRecipients = (parameters.additionalRecipients || []).map((recipient) => ({ amount: BigInt(recipient.amount), recipient: recipient.recipient }));
  let calldata = encodeFunctionData({ abi: ABI, functionName: "fulfillBasicOrder_efficient_6GL6yc", args: [parameters] });
  calldata += String(data.calldataSuffix || "").replace(/^0x/, "");
  calldata += BUILDER_SUFFIX;
  return calldata;
}

export async function executeCheckout({ provider, buyer, tokenId = null, fetchImpl = fetch, encodeFunctionData, onStatus = () => {}, onEvent = () => {} }) {
  if (!provider) throw new CheckoutError("rpc_error", "No compatible wallet was found.");
  await ensureBase(provider, onEvent);
  onStatus("Checking the live listing...");
  const first = await quote(fetchImpl, buyer, tokenId);
  const refreshed = await quote(fetchImpl, buyer, tokenId, first.valueWei);
  const validation = validateCheckoutPayload(refreshed, tokenId, first.priceWei);
  if (validation) { onEvent("listing_validation_failed", { code: validation, token: tokenId || 0 }); throw new CheckoutError(validation); }
  if (refreshed.contract.toLowerCase() !== EXPECTED_CONTRACT.toLowerCase()) {
    onEvent("listing_validation_failed", { code: "invalid_contract", token: tokenId || 0 });
    throw new CheckoutError("invalid_contract");
  }
  const calldata = buildCalldata(refreshed, encodeFunctionData);
  onStatus(`Confirm Subject ${String(refreshed.tokenId).padStart(4, "0")} for ${refreshed.priceEth} ETH in your wallet.`);
  onEvent("purchase_started", { token: Number(refreshed.tokenId) || 0, eth: refreshed.priceEth });
  let hash;
  try { hash = await provider.request({ method: "eth_sendTransaction", params: [{ from: buyer, to: refreshed.to, value: refreshed.valueHex, data: calldata }] }); }
  catch (error) {
    const code = classifyProviderError(error, "transaction_submit_failed");
    onEvent(code === "user_rejected" ? "wallet_rejected" : "transaction_failed", { code });
    throw new CheckoutError(code);
  }
  if (!hash || typeof hash !== "string") { onEvent("transaction_failed", { code: "no_hash" }); throw new CheckoutError("transaction_submit_failed"); }
  return { hash, data: refreshed, calldata };
}
