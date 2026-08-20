// Shared wallet lookup: the Base App mini app provider first, browser wallet second.
async function loadSdk() {
  try { return (await import("https://esm.sh/@farcaster/miniapp-sdk")).sdk; }
  catch (_) { return null; }
}

export async function getProvider() {
  const sdk = await loadSdk();
  try {
    if (sdk?.isInMiniApp && await sdk.isInMiniApp()) {
      const provider = await sdk.wallet?.getEthereumProvider?.();
      if (provider) return provider;
    }
  } catch (_) {}
  return window.ethereum || null;
}

export async function isInMiniApp() {
  const sdk = await loadSdk();
  try { return Boolean(sdk?.isInMiniApp && await sdk.isInMiniApp()); }
  catch (_) { return false; }
}
