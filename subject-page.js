import { buildSubjectProfile, validSubjectId } from "/subject-model.js";
import { track } from "/analytics.js";

const id = Number(new URLSearchParams(location.search).get("id"));
const record = document.querySelector("[data-subject-record]");

function openSubject(nextId, method) {
  track("subject_next", { from: id, to: nextId, method });
  location.href = `/subject?id=${nextId}`;
}

async function shareSubject(profile, chapter) {
  const status = document.getElementById("shareStatus");
  const shareUrl = `https://decaylabs.online/api/subject-share.js?id=${profile.id}&utm_source=farcaster&utm_campaign=subject_share&utm_content=${profile.id}`;
  const text = `Subject #${profile.paddedId} carries a record from ${chapter.title}. I opened it in The Half-Life Archive.`;
  track("share_clicked", { id: profile.id });
  try {
    const { sdk } = await import("https://esm.sh/@farcaster/miniapp-sdk");
    if (sdk?.isInMiniApp && await sdk.isInMiniApp()) {
      const result = await sdk.actions.composeCast({ text, embeds: [shareUrl] });
      if (result?.cast) {
        track("share_completed", { id: profile.id, client: "farcaster" });
        status.textContent = "Subject shared to Farcaster.";
      } else {
        track("share_cancelled", { id: profile.id, client: "farcaster" });
        status.textContent = "Share cancelled.";
      }
      return;
    }
  } catch (_) {
    // Normal browsers continue to the native share sheet or clipboard.
  }
  try {
    if (navigator.share) {
      await navigator.share({ title: `Subject #${profile.paddedId} | Decay Labs`, text, url: shareUrl });
      track("share_completed", { id: profile.id, client: "native" });
      status.textContent = "Share sheet opened.";
    } else {
      await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
      track("share_completed", { id: profile.id, client: "clipboard" });
      status.textContent = "Subject link copied. You can edit the text before casting.";
    }
  } catch (_) {
    track("share_cancelled", { id: profile.id, client: "native" });
    status.textContent = "Share cancelled.";
  }
}

async function initialize() {
  if (!validSubjectId(id)) {
    record.innerHTML = '<div class="warning-box"><strong>Record not found.</strong> Subject IDs run from 1 to 1000. <a class="verified-link" href="/collection">Return to the archive</a>.</div>';
    document.title = "Record Not Found | Decay Labs";
    return;
  }
  try {
    const [loreResponse, collectionResponse] = await Promise.all([fetch("/data/lore.json"), fetch("/data/collection.json")]);
    if (!loreResponse.ok || !collectionResponse.ok) throw new Error("Subject data unavailable");
    const [lore, collection] = await Promise.all([loreResponse.json(), collectionResponse.json()]);
    const profile = buildSubjectProfile(id, lore, collection);
    const arc = lore.arcs[Math.floor((profile.chapter - 1) / 10)];
    const chapter = arc.chapters[(profile.chapter - 1) % 10];
    document.title = `Subject ${profile.paddedId} | Decay Labs`;
    document.querySelector('meta[name="description"]').content = `Subject ${profile.paddedId}, ${profile.name}, belongs to the ${profile.faction.name} faction in the Decay Labs archive.`;
    document.querySelector("[data-crumb]").textContent = profile.paddedId;
    const image = document.querySelector("[data-subject-image]");
    image.src = profile.image;
    image.alt = `Decay Labs Subject ${profile.paddedId}`;
    image.addEventListener("error", () => { image.src = "/public/brand-mark.svg"; image.style.padding = "28%"; }, { once: true });
    document.querySelector("[data-record-id]").textContent = `SUBJECT / ${profile.paddedId} / ${profile.signal}`;
    document.querySelector("[data-record-name]").textContent = profile.name;
    const faction = document.querySelector("[data-record-faction]");
    faction.textContent = profile.faction.name;
    faction.style.color = profile.faction.accent;
    document.querySelector("[data-record-lede]").textContent = profile.faction.description;
    document.querySelector("[data-record-memory]").textContent = `Archive recovery lists ${profile.memory}. Its owner and origin remain disputed.`;
    document.querySelector("[data-record-condition]").textContent = profile.condition;
    document.querySelector("[data-record-chapter]").innerHTML = `Linked to Chapter ${String(profile.chapter).padStart(3, "0")}, <a class="verified-link" href="/lore">${chapter.title}</a>: ${chapter.hook}`;
    document.querySelector("[data-opensea]").href = profile.openseaUrl;
    document.querySelector("[data-basescan]").href = collection.basescanUrl;
    const buy = document.querySelector("[data-buy-token]");
    buy.dataset.buyToken = String(profile.tokenId);
    document.querySelector("[data-previous-subject]").addEventListener("click", () => openSubject(id === 1 ? 1000 : id - 1, "previous"));
    document.querySelector("[data-next-subject]").addEventListener("click", () => openSubject(id === 1000 ? 1 : id + 1, "next"));
    document.querySelector("[data-random-subject]").addEventListener("click", () => {
      let nextId = id;
      while (nextId === id) nextId = Math.floor(Math.random() * 1000) + 1;
      openSubject(nextId, "random");
    });
    document.querySelector("[data-share-subject]").addEventListener("click", () => shareSubject(profile, chapter));
  } catch (error) {
    record.innerHTML = '<div class="warning-box"><strong>Signal interrupted.</strong> Verify this token using the official contract link.</div>';
    console.error("[subject]", error);
  }
}

initialize();
