const OPENSEA_COLLECTION = "https://opensea.io/collection/decaylabs-395322216";
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
  return tokenId ? `https://opensea.io/assets/base/${CONTRACT}/${tokenId}` : OPENSEA_COLLECTION;
}

function fallback(message, tokenId) {
  const url = marketplaceLink(tokenId);
  status(`${message} <a href="${url}" target="_blank" rel="noopener noreferrer">Verify on OpenSea &nearr;</a>`, true);
}

async function checkout(button) {
  const requestedToken = button.dataset.buyToken ? Number(button.dataset.buyToken) : null;
  const label = button.querySelector("span") || button;
  const originalLabel = label.textContent;
  button.disabled = true;
  try {
    status("Connecting to your wallet...");
    const provider = await getProvider();
    if (!provider) return fallback("No compatible wallet was found.", requestedToken);
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const buyer = accounts?.[0];
    if (!buyer) throw new Error("no_wallet_account");
    await ensureBase(provider);

    status(requestedToken ? `Checking the live listing for Subject ${String(requestedToken).padStart(4, "0")}...` : "Checking the current Archive selection...");
    const query = new URLSearchParams({ address: buyer });
    if (requestedToken) query.set("tokenId", String(requestedToken));
    const response = await fetch(`/api/buy.js?${query}`, { headers: { accept: "application/json" } });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || `checkout_${response.status}`);
    if (data.chainId !== BASE_CHAIN_ID) throw new Error("chain_mismatch");
    if (requestedToken && Number(data.tokenId) !== requestedToken) throw new Error("token_mismatch");
    if (!/^0x[0-9a-fA-F]{40}$/.test(data.to || "")) throw new Error("invalid_transaction_target");
    if (!Number.isFinite(data.priceEth) || data.priceEth <= 0 || data.priceEth > MAX_CHECKOUT_ETH) throw new Error("price_out_of_range");

    const { encodeFunctionData } = await import("https://esm.sh/viem@2.45.0");
    const parameters = { ...data.parameters };
    UINT_FIELDS.forEach((key) => { parameters[key] = BigInt(parameters[key]); });
    parameters.additionalRecipients = (parameters.additionalRecipients || []).map((recipient) => ({ amount: BigInt(recipient.amount), recipient: recipient.recipient }));
    let calldata = encodeFunctionData({ abi: ABI, functionName: "fulfillBasicOrder_efficient_6GL6yc", args: [parameters] });
    calldata += String(data.calldataSuffix || "").replace(/^0x/, "");
    calldata += BUILDER_SUFFIX;

    label.textContent = `Subject ${String(data.tokenId).padStart(4, "0")} / ${data.priceEth} ETH`;
    status(`Confirm Subject ${String(data.tokenId).padStart(4, "0")} for ${data.priceEth} ETH in your wallet.`);
    const hash = await provider.request({ method: "eth_sendTransaction", params: [{ from: buyer, to: data.to, value: data.valueHex, data: calldata }] });
    status(`Purchase submitted. <a href="https://basescan.org/tx/${hash}" target="_blank" rel="noopener noreferrer">Verify transaction &nearr;</a>`, true);
  } catch (error) {
    const message = String(error?.message || error);
    if (/reject|denied|4001/i.test(message)) status("Transaction cancelled. Nothing was submitted.");
    else if (/token_not_listed|no_curated_listings/i.test(message)) fallback("That Subject is not currently listed.", requestedToken);
    else if (/price_out_of_range/i.test(message)) fallback("The live price failed the checkout safety limit.", requestedToken);
    else fallback("In-app checkout is temporarily unavailable.", requestedToken);
    console.error("[checkout]", error);
  } finally {
    button.disabled = false;
    if (!/Purchase submitted/.test(document.getElementById("buyStatus")?.textContent || "")) label.textContent = originalLabel;
  }
}

const buttons = Array.from(new Set([...document.querySelectorAll("[data-buy-token]"), document.getElementById("buyBtn")].filter(Boolean)));
buttons.forEach((button) => button.addEventListener("click", () => checkout(button)));
