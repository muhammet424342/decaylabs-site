import { buildSubjectProfile } from "/subject-model.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

async function loadJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Could not load ${url}`);
  return response.json();
}

function initializeNavigation() {
  const header = $("[data-header]");
  const toggle = $("[data-nav-toggle]");
  const nav = $("[data-nav]");
  if (header) {
    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }
  if (!toggle || !nav) return;
  const close = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function initializeCopyButtons() {
  $$('[data-copy]').forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy;
      const label = $("b", button);
      try {
        await navigator.clipboard.writeText(value);
        if (label) label.textContent = "Copied";
      } catch (_) {
        if (label) label.textContent = "Copy failed";
      }
      window.setTimeout(() => { if (label) label.textContent = "Copy"; }, 1600);
    });
  });
}

function subjectCard(profile) {
  const article = document.createElement("article");
  article.className = "subject-card";
  article.style.setProperty("--faction", profile.faction.accent);
  article.innerHTML = `
    <div class="subject-card__media">
      <span class="subject-card__index">SUBJECT / ${profile.paddedId}</span>
      <img src="${profile.image}" alt="Decay Labs Subject ${profile.paddedId}" width="520" height="520" loading="lazy">
    </div>
    <div class="subject-card__body">
      <span class="subject-card__faction">${profile.faction.name}</span>
      <h3>${profile.name}</h3>
      <p>Carries ${profile.memory}.</p>
      <div class="subject-card__links">
        <a href="/subject?id=${profile.id}">Open record</a>
        <a href="${profile.openseaUrl}" target="_blank" rel="noopener noreferrer" aria-label="Verify Subject ${profile.paddedId} on OpenSea">Verify &nearr;</a>
      </div>
    </div>`;
  const image = $("img", article);
  image.addEventListener("error", () => {
    image.src = "/public/brand-mark.svg";
    image.alt = `Image unavailable for Subject ${profile.paddedId}`;
    image.style.padding = "28%";
  }, { once: true });
  return article;
}

async function renderHomeSubjects() {
  const grid = $("[data-subject-grid]");
  if (!grid) return;
  try {
    const [lore, collection] = await Promise.all([
      loadJson("/data/lore.json"),
      loadJson("/data/collection.json")
    ]);
    const featured = [7, 13, 4, 21, 9, 18, 2, 24];
    const fragment = document.createDocumentFragment();
    featured.map((id) => buildSubjectProfile(id, lore, collection)).forEach((profile) => {
      fragment.append(subjectCard(profile));
    });
    grid.replaceChildren(fragment);
  } catch (error) {
    grid.innerHTML = '<p class="warning-box"><strong>Archive unavailable.</strong> Verify the collection through the official links below.</p>';
    console.error("[subjects]", error);
  }
}

async function initializeMiniApp() {
  try {
    const module = await import("https://esm.sh/@farcaster/miniapp-sdk");
    await module.sdk?.actions?.ready?.();
    document.documentElement.classList.add("miniapp-ready");
  } catch (_) {
    // Normal browsers do not need the host SDK.
  }
}

initializeNavigation();
initializeCopyButtons();
renderHomeSubjects();
initializeMiniApp();
$$('[data-year]').forEach((element) => { element.textContent = String(new Date().getFullYear()); });
