// Decay Labs — Base App / Farcaster mini app: in-app buy (no OpenSea redirect).
// Robust: the click handler attaches immediately; heavy libs (viem, Farcaster SDK)
// load lazily on demand, so a slow/failed CDN never leaves the button dead.

const OPENSEA = "https://opensea.io/collection/decaylabs-395322216";
const BASE_CHAIN_HEX = "0x2105"; // 8453

const ABI = [{
  type: "function", name: "fulfillBasicOrder_efficient_6GL6yc", stateMutability: "payable",
  inputs: [{ name: "parameters", type: "tuple", components: [
    { name: "considerationToken", type: "address" },
    { name: "considerationIdentifier", type: "uint256" },
    { name: "considerationAmount", type: "uint256" },
    { name: "offerer", type: "address" },
    { name: "zone", type: "address" },
    { name: "offerToken", type: "address" },
    { name: "offerIdentifier", type: "uint256" },
    { name: "offerAmount", type: "uint256" },
    { name: "basicOrderType", type: "uint8" },
    { name: "startTime", type: "uint256" },
    { name: "endTime", type: "uint256" },
    { name: "zoneHash", type: "bytes32" },
    { name: "salt", type: "uint256" },
    { name: "offererConduitKey", type: "bytes32" },
    { name: "fulfillerConduitKey", type: "bytes32" },
    { name: "totalOriginalAdditionalRecipients", type: "uint256" },
    { name: "additionalRecipients", type: "tuple[]", components: [
      { name: "amount", type: "uint256" }, { name: "recipient", type: "address" } ] },
    { name: "signature", type: "bytes" },
  ] }],
  outputs: [{ name: "fulfilled", type: "bool" }],
}];
const UINT = ["considerationIdentifier","considerationAmount","offerIdentifier","offerAmount",
  "basicOrderType","startTime","endTime","salt","totalOriginalAdditionalRecipients"];

const $ = (id) => document.getElementById(id);
const status = (msg, html) => { const el = $("buyStatus"); if (!el) return; if (html) el.innerHTML = html; else el.textContent = msg || ""; };
const setLabel = (t) => { const el = $("buyBtnLabel"); if (el) el.textContent = t; };

async function loadSdk() {
  try { const m = await import("https://esm.sh/@farcaster/miniapp-sdk"); return m.sdk; } catch (_) { return null; }
}
async function loadEncoder() {
  const m = await import("https://esm.sh/viem@2");
  return m.encodeFunctionData;
}

async function isInMiniApp(sdk) {
  try { if (sdk?.isInMiniApp) return await sdk.isInMiniApp(); } catch (_) {}
  // fallback heuristic: mini app clients run inside an iframe / RN webview
  return typeof window !== "undefined" && window.parent !== window;
}

async function getProvider() {
  const sdk = await loadSdk();
  // Only use the Farcaster wallet provider when we are actually inside a mini app,
  // otherwise its RPC bridge doesn't exist and requests throw.
  if (sdk && (await isInMiniApp(sdk))) {
    try {
      if (sdk.wallet?.getEthereumProvider) { const p = await sdk.wallet.getEthereumProvider(); if (p) return p; }
      if (sdk.wallet?.ethProvider) return sdk.wallet.ethProvider;
    } catch (_) {}
  }
  if (typeof window !== "undefined" && window.ethereum) return window.ethereum;
  return null;
}

async function ensureBase(provider) {
  const cid = await provider.request({ method: "eth_chainId" });
  if (parseInt(cid, 16) === 8453) return;
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BASE_CHAIN_HEX }] });
  } catch (e) {
    await provider.request({ method: "wallet_addEthereumChain", params: [{
      chainId: BASE_CHAIN_HEX, chainName: "Base", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: ["https://mainnet.base.org"], blockExplorerUrls: ["https://basescan.org"] }] });
  }
}

async function buy() {
  const btn = $("buyBtn");
  btn.disabled = true;
  try {
    status("Connecting wallet…");
    const provider = await getProvider();
    if (!provider) {
      status("No wallet found — opening OpenSea…");
      window.open(OPENSEA, "_blank", "noopener");
      return;
    }

    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const buyer = accounts && accounts[0];
    if (!buyer) throw new Error("No wallet account");

    await ensureBase(provider);

    status("Finding the cheapest one…");
    const encodeFunctionData = await loadEncoder();
    const r = await fetch(`/api/buy.js?address=${buyer}`, { headers: { accept: "application/json" } });
    const d = await r.json();
    if (!r.ok || d.error) throw new Error(d.error || `api ${r.status}`);

    const p = { ...d.parameters };
    for (const k of UINT) p[k] = BigInt(p[k]);
    p.additionalRecipients = (p.additionalRecipients || []).map((x) => ({ amount: BigInt(x.amount), recipient: x.recipient }));
    let data = encodeFunctionData({ abi: ABI, functionName: "fulfillBasicOrder_efficient_6GL6yc", args: [p] });
    data += (d.calldataSuffix || "").replace(/^0x/, "");

    setLabel(`Buy #${d.tokenId ?? ""} · ${d.priceEth ?? "0.005"} Ξ`);
    status("Confirm the purchase in your wallet…");
    const hash = await provider.request({ method: "eth_sendTransaction",
      params: [{ from: buyer, to: d.to, value: d.valueHex, data }] });

    status(null, `🧟 Purchased! <a href="https://basescan.org/tx/${hash}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">View transaction ↗</a>`);
  } catch (e) {
    const m = String(e && (e.shortMessage || e.message) || e);
    if (/reject|denied|4001/i.test(m)) status("Cancelled.");
    else if (/no_listings/i.test(m)) status("Sold out right now — check back soon.");
    else if (/api |listings_failed|fulfillment_failed|no_transaction|api_key|mint_key|exception/i.test(m)) {
      // The marketplace API is unreachable (expired key, outage, rate limit).
      // Never dead-end the buyer — hand them off to OpenSea instead.
      status(null, `Marketplace busy — <a href="${OPENSEA}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">buy on OpenSea ↗</a>`);
      window.open(OPENSEA, "_blank", "noopener");
    } else status("Couldn't complete: " + m.slice(0, 140));
    console.error("[decaylabs buy]", e);
  } finally {
    const b = $("buyBtn"); if (b) b.disabled = false;
  }
}

// ── Attach handler immediately (no top-level imports that could block this) ──
const btn = $("buyBtn");
if (btn) btn.addEventListener("click", buy);

// Signal readiness to Base App / Farcaster (best-effort, lazy).
(async () => {
  const sdk = await loadSdk();
  try { await sdk?.actions?.ready(); document.documentElement.classList.add("in-miniapp"); } catch (_) {}
})();
