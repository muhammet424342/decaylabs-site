/* Live collection floor.
 *
 * The hero used to hard-code "0.005 ETH". That number stopped being true the
 * moment any Subject was relisted below it, and the trust page — which already
 * reads /api/collection-stats.js — then disagreed with the front page.
 *
 * This writes the real floor into any [data-live-floor] element. The element's
 * existing text stays as the fallback: if the API is down, returns no floor, or
 * the key has expired, nothing is touched and the page keeps the last honest
 * static number rather than rendering "null ETH" or an empty gap.
 *
 * Deliberately NOT wired to the checkout button. api/buy.js sells from a
 * curated token set, so the price the wallet asks for is not necessarily the
 * collection floor. miniapp-buy.js already rewrites that label with the real
 * listing price once the listing is fetched.
 */
const targets = document.querySelectorAll("[data-live-floor]");

function formatEth(value) {
  return `${new Intl.NumberFormat("en", { maximumFractionDigits: 4 }).format(value)} ETH`;
}

async function loadFloor() {
  if (!targets.length) return;
  try {
    const response = await fetch("/api/collection-stats.js", { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error("stats unavailable");
    const data = await response.json();
    if (!Number.isFinite(data.floor) || data.floor <= 0) throw new Error("no floor returned");
    const text = formatEth(data.floor);
    targets.forEach((node) => {
      node.textContent = text;
      node.setAttribute("title", `Live floor from ${data.source || "the marketplace"}. Can change after this page loads.`);
    });
  } catch (error) {
    console.warn("[floor] keeping static value:", error?.message || error);
  }
}

loadFloor();
