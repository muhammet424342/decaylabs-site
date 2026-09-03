import { track } from "/analytics.js";
import { buildSubjectProfile } from "/subject-model.js";
import { decodeMatchAnswers, encodeMatchAnswers, matchSubjectId } from "/subject-match.js";

const form = document.querySelector("[data-subject-match]");
const result = document.querySelector("[data-match-result]");
let lore;
let collection;

function selectedAnswers() {
  const data = new FormData(form);
  return ["identity", "evidence", "response"].map((name) => Number(data.get(name)));
}

function resultMarkup(profile) {
  return `<div class="match-result__art" style="--faction:${profile.faction.accent}">
    <span class="subject-card__index">SUBJECT / ${profile.paddedId}</span>
    <img src="${profile.image}" alt="Decay Labs Subject ${profile.paddedId}" width="620" height="620">
  </div>
  <div class="match-result__copy">
    <p class="kicker">MATCH RECOVERED / ${profile.signal}</p>
    <h2>${profile.name}</h2>
    <span class="record-faction" style="color:${profile.faction.accent}">${profile.faction.name}</span>
    <p><strong>${profile.faction.motto}</strong> Your choices point to a witness who carries ${profile.memory}. Current condition: ${profile.condition}.</p>
    <p class="match-explanation">This is a deterministic archive match, not a rarity score or financial recommendation. The same choices always recover the same Subject.</p>
    <div class="record-actions">
      <button class="button button--primary" type="button" id="buyBtn" data-buy-token="${profile.tokenId}">
        <span id="buyBtnLabel">Collect Subject #${profile.paddedId} — 0.005 ETH</span>
      </button>
      <a class="button button--secondary" href="/subject?id=${profile.id}&utm_source=site&utm_campaign=find_your_subject&utm_content=${profile.id}">Open the full record</a>
      <button class="button button--quiet" type="button" data-share-match>Share this match</button>
      <button class="button button--quiet" type="button" data-retry-match>Try another path</button>
    </div>
    <p class="transaction-status" id="buyStatus" role="status" aria-live="polite"></p>
    <p class="search-message" role="status" data-match-status></p>
  </div>`;
}

async function share(profile) {
  const status = result.querySelector("[data-match-status]");
  const shareUrl = `https://decaylabs.online/api/subject-share.js?id=${profile.id}&utm_source=farcaster&utm_campaign=find_your_subject&utm_content=${profile.id}`;
  const text = `The archive matched me with Subject #${profile.paddedId} — ${profile.faction.name}. Which record would find you?`;
  track("subject_match_shared", { id: profile.id, faction: profile.faction.id });
  try {
    const { sdk } = await import("https://esm.sh/@farcaster/miniapp-sdk");
    if (sdk?.isInMiniApp && await sdk.isInMiniApp()) {
      const cast = await sdk.actions.composeCast({ text, embeds: [shareUrl] });
      status.textContent = cast?.cast ? "Match shared to Farcaster." : "Share cancelled.";
      return;
    }
  } catch (_) {}
  try {
    if (navigator.share) await navigator.share({ title: `Subject #${profile.paddedId} | Decay Labs`, text, url: shareUrl });
    else {
      await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
      status.textContent = "Share text copied.";
    }
  } catch (_) { status.textContent = "Share cancelled."; }
}

function renderMatch(answers, source = "quiz") {
  const id = matchSubjectId(answers);
  const profile = buildSubjectProfile(id, lore, collection);
  result.innerHTML = resultMarkup(profile);
  result.hidden = false;
  form.hidden = true;
  const encoded = encodeMatchAnswers(answers);
  history.replaceState(null, "", `/find-your-subject?path=${encoded}`);
  track("subject_match_completed", { id, faction: profile.faction.id, source });
  result.querySelector("[data-share-match]").addEventListener("click", () => share(profile));
  result.querySelector("[data-retry-match]").addEventListener("click", () => {
    result.hidden = true;
    form.hidden = false;
    history.replaceState(null, "", "/find-your-subject");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function initialize() {
  const [loreResponse, collectionResponse] = await Promise.all([fetch("/data/lore.json"), fetch("/data/collection.json")]);
  if (!loreResponse.ok || !collectionResponse.ok) throw new Error("Archive data unavailable");
  [lore, collection] = await Promise.all([loreResponse.json(), collectionResponse.json()]);
  const saved = decodeMatchAnswers(new URLSearchParams(location.search).get("path"));
  if (saved) renderMatch(saved, "shared_url");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const answers = selectedAnswers();
  if (answers.some((answer) => !Number.isInteger(answer))) return;
  track("subject_match_started", {});
  renderMatch(answers);
});

initialize().catch(() => {
  form.querySelector("[data-match-error]").textContent = "The matching index is temporarily unavailable. You can still explore the full archive.";
});
