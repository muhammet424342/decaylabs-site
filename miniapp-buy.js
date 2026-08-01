// Decay Labs — standard web app for the Base App: in-app buy (no redirect).
// Viem loads lazily on demand, so a slow/failed CDN never leaves the button dead.

const OPENSEA = "https://opensea.io/collection/decaylabs-395322216";
const BASE_CHAIN_HEX = "0x2105"; // 8453
// ERC-8021 attribution for Decay Labs Builder Code: bc_yb6cmebf
const BUILDER_DATA_SUFFIX = "0x62635f796236636d6562660b0080218021802180218021802180218021";

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

async function loadViemStack() {
  const [viem, chains] = await Promise.all([
    import("https://esm.sh/viem@2.45.0"),
    import("https://esm.sh/viem@2.45.0/chains"),
  ]);
  return { ...viem, base: chains.base };
}

function getProvider() {
  // The Base App exposes a standard EIP-1193 provider in its in-app browser.
  return typeof window !== "undefined" ? window.ethereum || null : null;
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

    const { base, createWalletClient, custom, encodeFunctionData } = await loadViemStack();
    const walletClient = createWalletClient({ chain: base, transport: custom(provider) });
    const accounts = await walletClient.requestAddresses();
    const buyer = accounts && accounts[0];
    if (!buyer) throw new Error("No wallet account");

    await ensureBase(provider);

    status("Finding the cheapest one…");
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
    const hash = await walletClient.sendTransaction({
      account: buyer,
      chain: base,
      to: d.to,
      value: BigInt(d.valueHex),
      data,
      dataSuffix: BUILDER_DATA_SUFFIX,
    });

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
