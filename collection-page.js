import { buildSubjectProfile, validSubjectId } from "/subject-model.js";

const grid = document.querySelector("[data-collection-grid]");
const filters = document.querySelector("[data-faction-filters]");
const search = document.querySelector("[data-subject-search]");
const message = document.querySelector("[data-search-message]");
let profiles = [];

function card(profile) {
  const article = document.createElement("article");
  article.className = "subject-card";
  article.dataset.faction = profile.faction.id;
  article.style.setProperty("--faction", profile.faction.accent);
  article.innerHTML = `
    <div class="subject-card__media"><span class="subject-card__index">SUBJECT / ${profile.paddedId}</span><img src="${profile.image}" alt="Decay Labs Subject ${profile.paddedId}" width="520" height="520" loading="lazy"></div>
    <div class="subject-card__body"><span class="subject-card__faction">${profile.faction.name}</span><h3>${profile.name}</h3><p>Archive chapter: ${profile.record}.</p><div class="subject-card__links"><a href="/subject?id=${profile.id}">Open record</a><a href="${profile.openseaUrl}" target="_blank" rel="noopener noreferrer">View on OpenSea &nearr;</a></div></div>`;
  return article;
}

function render(selected = "all") {
  const fragment = document.createDocumentFragment();
  profiles.filter((profile) => selected === "all" || profile.faction.id === selected).forEach((profile) => fragment.append(card(profile)));
  grid.replaceChildren(fragment);
}

async function initialize() {
  try {
    const [loreResponse, collectionResponse, selectionResponse] = await Promise.all([fetch("/data/lore.json"), fetch("/data/collection.json"), fetch("/data/curated.json")]);
    if (!loreResponse.ok || !collectionResponse.ok || !selectionResponse.ok) throw new Error("Collection data unavailable");
    const [lore, collection, selection] = await Promise.all([loreResponse.json(), collectionResponse.json(), selectionResponse.json()]);
    profiles = selection.map((entry) => {
      const profile = buildSubjectProfile(entry.id, lore, collection);
      if (entry.faction !== profile.faction.name) throw new Error("Selection faction mismatch");
      return { ...profile, name: entry.name, record: entry.record, image: entry.image, openseaUrl: entry.openseaUrl };
    });
    const options = [{ id: "all", name: "All records" }, ...lore.factions];
    options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `filter-button${index === 0 ? " is-active" : ""}`;
      button.dataset.factionFilter = option.id;
      button.textContent = option.name;
      filters.append(button);
    });
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-faction-filter]");
      if (!button) return;
      filters.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
      render(button.dataset.factionFilter);
    });
    render();
  } catch (error) {
    grid.innerHTML = '<p class="warning-box"><strong>Archive unavailable.</strong> Use the official OpenSea and BaseScan links to verify the collection.</p>';
    console.error("[collection]", error);
  }
}

search.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = Number(new FormData(search).get("subject"));
  if (!validSubjectId(id)) {
    message.textContent = "Enter a valid Subject record number.";
    return;
  }
  message.textContent = "Opening record...";
  location.href = `/subject?id=${id}`;
});

initialize();
