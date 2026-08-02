const factionGrid = document.querySelector("[data-faction-grid]");
const arcList = document.querySelector("[data-arc-list]");
const filters = document.querySelector("[data-arc-filters]");

function factionCard(faction) {
  const article = document.createElement("article");
  article.style.borderColor = `${faction.accent}55`;
  article.innerHTML = `<span class="status-pill" style="color:${faction.accent};border-color:${faction.accent}77">${faction.name}</span><h3>${faction.motto}</h3><p>${faction.description}</p>`;
  return article;
}

function arcCard(arc, open = false) {
  const details = document.createElement("details");
  details.className = "arc";
  details.dataset.arc = String(arc.id);
  details.open = open;
  details.innerHTML = `
    <summary><span>ARC ${String(arc.id).padStart(2, "0")}</span><h2>${arc.title}</h2><b>${arc.range}</b></summary>
    <div class="chapter-list">
      ${arc.chapters.map((chapter) => `
        <article class="chapter-row">
          <span>${String(chapter.id).padStart(3, "0")}</span>
          <div><h3>${chapter.title}</h3><p>${chapter.hook}</p>${chapter.checkpoint ? '<span class="checkpoint">Canon checkpoint</span>' : ""}</div>
        </article>`).join("")}
    </div>`;
  return details;
}

async function initialize() {
  try {
    const response = await fetch("/data/lore.json");
    if (!response.ok) throw new Error("Archive data unavailable");
    const lore = await response.json();

    const factionFragment = document.createDocumentFragment();
    lore.factions.forEach((faction) => factionFragment.append(factionCard(faction)));
    factionGrid.replaceChildren(factionFragment);

    const all = document.createElement("button");
    all.type = "button";
    all.className = "filter-button is-active";
    all.dataset.arcFilter = "all";
    all.textContent = "All arcs";
    filters.append(all);
    lore.arcs.forEach((arc) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-button";
      button.dataset.arcFilter = String(arc.id);
      button.textContent = `${String(arc.id).padStart(2, "0")} ${arc.title}`;
      filters.append(button);
    });

    const arcFragment = document.createDocumentFragment();
    lore.arcs.forEach((arc, index) => arcFragment.append(arcCard(arc, index === 0)));
    arcList.replaceChildren(arcFragment);

    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-arc-filter]");
      if (!button) return;
      const selected = button.dataset.arcFilter;
      filters.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
      arcList.querySelectorAll("[data-arc]").forEach((arc) => {
        const visible = selected === "all" || arc.dataset.arc === selected;
        arc.hidden = !visible;
        if (selected !== "all" && visible) arc.open = true;
      });
    });
  } catch (error) {
    arcList.innerHTML = '<p class="warning-box"><strong>Signal interrupted.</strong> The local archive could not be loaded.</p>';
    console.error("[lore]", error);
  }
}

initialize();
