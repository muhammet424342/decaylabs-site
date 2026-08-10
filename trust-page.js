const title = document.querySelector("[data-stats-title]");
const copy = document.querySelector("[data-stats-copy]");
const time = document.querySelector("[data-stats-time]");

function formatEth(value) {
  return `${new Intl.NumberFormat("en", { maximumFractionDigits: 4 }).format(value)} ETH`;
}

async function loadStats() {
  try {
    const response = await fetch("/api/collection-stats.js", { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error("Marketplace API unavailable");
    const data = await response.json();
    const facts = [];
    if (Number.isFinite(data.floor)) facts.push(`floor ${formatEth(data.floor)}`);
    if (Number.isFinite(data.owners)) facts.push(`${Number(data.owners).toLocaleString()} onchain owner${data.owners === 1 ? "" : "s"}`);
    if (Number.isFinite(data.sales)) facts.push(`${Number(data.sales).toLocaleString()} recorded sale${data.sales === 1 ? "" : "s"}`);
    if (!facts.length) throw new Error("No fresh marketplace values returned");
    title.textContent = "Current marketplace snapshot";
    copy.textContent = facts.join(" / ") + ". Values are informational and can change after this page loads.";
    time.textContent = `Retrieved ${new Date().toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}.`;
  } catch (error) {
    title.textContent = "No fresh marketplace snapshot";
    copy.innerHTML = 'The API did not return current values, so this page is intentionally showing none. <a class="verified-link" href="https://opensea.io/collection/decaylabs-archive" target="_blank" rel="noopener noreferrer">Inspect OpenSea directly &nearr;</a>';
    time.textContent = "Missing data is not replaced with a marketing estimate.";
    console.warn("[stats]", error);
  }
}

loadStats();
