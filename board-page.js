import { COLS, ROWS, boardMessage, cellFaction, tokenFaction } from "/board-rules.mjs";
import { padSubject, validSubjectId } from "/subject-model.js";

const grid = document.querySelector("[data-board-grid]");
const legend = document.querySelector("[data-board-legend]");
const leaders = document.querySelector("[data-board-leaders]");
const message = document.querySelector("[data-board-message]");
const persist = document.querySelector("[data-board-persist]");
const form = document.querySelector("[data-board-form]");
const connectButton = document.querySelector("[data-connect]");
let factions = [];
let account = null;
let busy = false;

const say = (text) => { message.textContent = text; };
const ERRORS = {
  wrong_faction_zone: "That cell belongs to another faction. Use your Subject's own zone.",
  not_owner: "This wallet does not hold that Subject on Base.",
  cell_taken: "Another Subject already holds that cell.",
  bad_signature: "Signature did not match the connected wallet.",
  stale_signature: "Signature expired. Try again."
};

function render(data) {
  const byCell = new Map(data.cells.map((c) => [c.cell, c]));
  const fragment = document.createDocumentFragment();
  for (let cell = 0; cell < COLS * ROWS; cell++) {
    const faction = factions[cellFaction(cell)];
    const held = byCell.get(cell);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "board-cell";
    button.dataset.cell = cell;
    button.style.setProperty("--faction", faction.accent);
    button.textContent = held ? `${padSubject(held.tokenId)} · Lv${held.level}` : "";
    button.setAttribute("aria-label", held ? `${faction.name} cell ${cell}: Subject ${held.tokenId}, level ${held.level}` : `${faction.name} cell ${cell}, empty`);
    if (held) button.classList.add("is-held");
    fragment.append(button);
  }
  grid.replaceChildren(fragment);
  leaders.replaceChildren(...data.leaderboard.map((p) => {
    const li = document.createElement("li");
    li.textContent = `Subject ${padSubject(p.tokenId)} (${factions[tokenFaction(p.tokenId)].name}): Lv${p.level}, ${p.owner.slice(0, 6)}…${p.owner.slice(-4)}`;
    return li;
  }));
  if (!data.leaderboard.length) leaders.innerHTML = "<li>No Subjects placed yet.</li>";
  persist.textContent = data.persistent ? "" : "Preview mode: placements are not stored permanently yet.";
}

async function refresh() {
  const response = await fetch("/api/board");
  if (!response.ok) throw new Error("Board unavailable");
  render(await response.json());
}

async function connect() {
  if (!window.ethereum) { say("No wallet found. Open this page in a wallet browser or install a wallet extension."); return null; }
  [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
  connectButton.textContent = `${account.slice(0, 6)}…${account.slice(-4)}`;
  return account;
}

grid.addEventListener("click", async (event) => {
  const target = event.target.closest(".board-cell");
  if (!target || busy) return;
  const tokenId = Number(form.tokenId.value);
  const cell = Number(target.dataset.cell);
  if (!validSubjectId(tokenId)) { say("Enter a Subject number between 1 and 1000 first."); return; }
  if (cellFaction(cell) !== tokenFaction(tokenId)) { say(`Subject ${tokenId} belongs to ${factions[tokenFaction(tokenId)].name}. Pick a cell in that zone.`); return; }
  busy = true;
  try {
    if (!account && !(await connect())) return;
    const issuedAt = new Date().toISOString();
    const signature = await window.ethereum.request({ method: "personal_sign", params: [boardMessage({ tokenId, cell, issuedAt }), account] });
    say("Checking ownership on Base…");
    const response = await fetch("/api/board", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ address: account, tokenId, cell, issuedAt, signature }) });
    const body = await response.json();
    if (!response.ok) { say(ERRORS[body.error] || "Placement failed. Try again."); return; }
    render({ ...body, persistent: true });
    say(`Subject ${tokenId} now holds cell ${cell}.`);
  } catch (error) {
    say(error?.code === 4001 ? "Signature cancelled." : "Something went wrong. Try again.");
  } finally {
    busy = false;
  }
});

connectButton.addEventListener("click", () => connect().catch(() => say("Wallet connection was cancelled.")));

(async () => {
  try {
    const lore = await (await fetch("/data/lore.json")).json();
    factions = lore.factions;
    legend.replaceChildren(...factions.map((f) => {
      const span = document.createElement("span");
      span.style.setProperty("--faction", f.accent);
      span.textContent = f.name;
      return span;
    }));
    await refresh();
  } catch (_) {
    say("The board could not be loaded right now.");
  }
})();
