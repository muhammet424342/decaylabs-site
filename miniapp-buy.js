import { executeCheckout, waitForReceipt, CheckoutError } from "./checkout-client.mjs";
import { friendlyCheckoutMessage } from "./checkout-rules.mjs";
import { track } from "/analytics.js";

const OPENSEA_COLLECTION = "https://opensea.io/collection/decaylabs-archive";
const CONTRACT = "0x65F5e8006F4eF730d6984836F606a5C5c516CdC8";
const BASE_CHAIN_ID = 8453;
const BASE_CHAIN_HEX = "0x2105";
const MAX_CHECKOUT_ETH = 0.25;
const BUILDER_SUFFIX = "62635f796236636d6562660b0080218021802180218021802180218021";

const ABI = [{ type: "function", name: "fulfillBasicOrder_efficient_6GL6yc", stateMutability: "payable", inputs: [{ name: "parameters", type: "tuple", components: [
  { name: "considerationToken", type: "address" }, { name: "considerationIdentifier", type: "uint256" }, { name: "considerationAmount", type: "uint256" }, { name: "offerer", type: "address" }, { name: "zone", type: "address" }, { name: "offerToken", type: "address" }, { name: "offerIdentifier", type: "uint256" }, { name: "offerAmount", type: "uint256" }, { name: "basicOrderType", type: "uint8" }, { name: "startTime", type: "uint256" }, { name: "endTime", type: "uint256" }, { name: "zoneHash", type: "bytes32" }, { name: "salt", type: "uint256" }, { name: "offererConduitKey", type: "bytes32" }, { name: "fulfillerConduitKey", type: "bytes32" }, { name: "totalOriginalAdditionalRecipients", type: "uint256" }, { name: "additionalRecipients", type: "tuple[]", components: [{ name: "amount", type: "uint256" }, { name: "recipient", type: "address" }] }, { name: "signature", type: "bytes" }
]}], outputs: [{ name: "fulfilled", type: "bool" }] }];
const UINT_FIELDS = ["considerationIdentifier", "considerationAmount", "offerIdentifier", "offerAmount", "basicOrderType", "startTime", "endTime", "salt", "totalOriginalAdditionalRecipients"];

function status(message, html = false) {
  const element = document.getElementById("buyStatus");
  if (!element) return;
  if (html) element.innerHTML = message; else element.textContent = message || "";
}

async function loadSdk() {
  try { return (await import("https://esm.sh/@farcaster/miniapp-sdk")).sdk; }
  catch (_) { return null; }
}

async function getProvider() {
  const sdk = await loadSdk();
  try {
    if (sdk?.isInMiniApp && await sdk.isInMiniApp()) {
      const provider = await sdk.wallet?.getEthereumProvider?.();
      if (provider) return provider;
    }
  } catch (_) {}
  return window.ethereum || null;
}

async function ensureBase(provider) {
  const chainId = await provider.request({ method: "eth_chainId" });
  if (parseInt(chainId, 16) === BASE_CHAIN_ID) return;
  try { await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BASE_CHAIN_HEX }] }); }
  catch (_) {
    await provider.request({ method: "wallet_addEthereumChain", params: [{ chainId: BASE_CHAIN_HEX, chainName: "Base", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: ["https://mainnet.base.org"], blockExplorerUrls: ["https://basescan.org"] }] });
  }
}

function marketplaceLink(tokenId) {
  return tokenId !== null && tokenId !== undefined ? `https://opensea.io/assets/base/${CONTRACT}/${tokenId}` : OPENSEA_COLLECTION;
}

function subjectNumber(tokenId) {
  return Number(tokenId) + 1;
}

function fallback(message, tokenId) {
  const url = marketplaceLink(tokenId);
  status(`${message} <a href="${url}" target="_blank" rel="noopener noreferrer">Verify on OpenSea &nearr;</a>`, true);
}

async function checkout(button) {
  const requestedToken = button.dataset.buyToken ? Number(button.dataset.buyToken) : null;
  const label = button.querySelector("span") || button;
  const originalLabel = label.textContent;
  let submitted = false;
  button.disabled = true;
  track("buy_button_clicked", { token: requestedToken || 0 });
  try {
    status("Connecting to your wallet...");
    track("wallet_connect_started", { token: requestedToken || 0 });
    const provider = await getProvider();
    if (!provider) {
      track("wallet_connect_failed", { code: "no_provider" });
      return fallback("No compatible wallet was found.", requestedToken);
    }
    let accounts;
    try { accounts = await provider.request({ method: "eth_requestAccounts" }); }
    catch (error) { track("wallet_connect_failed", { code: error?.code === 4001 ? "user_rejected" : "request_failed" }); throw error; }
    const buyer = accounts?.[0];
    if (!buyer) { track("wallet_connect_failed", { code: "no_account" }); throw new Error("no_wallet_account"); }
    track("wallet_connected", { token: requestedToken || 0 });
    const { encodeFunctionData } = await import("https://esm.sh/viem@2.45.0");
    const result = await executeCheckout({ provider, buyer, tokenId: requestedToken, onStatus: status, encodeFunctionData, onEvent: track });
    const token = Number(result.data.tokenId) || 0;
    submitted = true;
    label.textContent = `Subject ${String(subjectNumber(result.data.tokenId)).padStart(4, "0")} / ${result.data.priceEth} ETH`;
    const explorer = `<a href="https://basescan.org/tx/${result.hash}" target="_blank" rel="noopener noreferrer">Verify transaction &nearr;</a>`;
    status(`Purchase submitted. Waiting for Base to confirm... ${explorer}`, true);
    const { confirmed } = await waitForReceipt(provider, result.hash, { onEvent: track, token, eth: result.data.priceEth });
    status(confirmed
      ? `Confirmed on Base. Subject ${String(subjectNumber(result.data.tokenId)).padStart(4, "0")} is yours. ${explorer}`
      : `Submitted, but Base has not confirmed it yet. ${explorer}`, true);
  } catch (error) {
    const code = error?.code || "checkout_unavailable";
    if (["token_not_listed", "no_curated_listings", "sold", "upstream_timeout", "opensea_unavailable", "opensea_api_key_required", "api_error"].includes(code)) fallback(friendlyCheckoutMessage(code), requestedToken);
    else status(friendlyCheckoutMessage(code));
    console.error("[checkout]", { code, message: error?.message });
  } finally {
    button.disabled = false;
    if (!submitted) label.textContent = originalLabel;
  }
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-buy-token], button#buyBtn");
  if (!button) return;
  checkout(button);
});
