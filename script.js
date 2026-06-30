/* ════════ Decay Labs — marketplace UI ════════ */
(() => {
const FAMILIES = ["Genesis", "Survivor", "Mutant", "Toxic", "Undead"];
const img = (n) => `public/nft-${n}.png`;

/* ---- Trending cards ---- */
const TRENDING = [
  { n: 1, fam: "Survivor", rarity: "Legendary", price: "0.012", vol: "2.4" },
  { n: 2, fam: "Mutant",   rarity: "Epic",      price: "0.008", vol: "1.7" },
  { n: 3, fam: "Toxic",    rarity: "Rare",      price: "0.006", vol: "0.9" },
  { n: 4, fam: "Genesis",  rarity: "Legendary", price: "0.015", vol: "3.1" },
  { n: 5, fam: "Undead",   rarity: "Epic",      price: "0.009", vol: "1.2" },
  { n: 6, fam: "Survivor", rarity: "Rare",      price: "0.005", vol: "0.7" },
  { n: 7, fam: "Mutant",   rarity: "Epic",      price: "0.010", vol: "1.5" },
  { n: 8, fam: "Toxic",    rarity: "Rare",      price: "0.006", vol: "0.8" },
];

const cardGrid = document.getElementById("cardGrid");
if (cardGrid) {
  cardGrid.innerHTML = TRENDING.map((t, i) => {
    const id = "Decay #" + String(t.n).padStart(3, "0");
    return `
    <article class="card reveal d${(i % 4) + 1}" data-tilt data-tilt-max="10">
      <div class="card-media">
        <span class="card-fam">${t.fam}</span>
        <img src="${img(t.n)}" alt="${id}" loading="lazy" />
      </div>
      <div class="card-body">
        <div class="card-name">${id}</div>
        <div class="card-meta">
          <div class="floor"><span>Floor</span><b><span class="jsFloor">0.005</span> Ξ</b></div>
          <a class="card-view" href="https://opensea.io/collection/decaylabs-395322216" target="_blank" rel="noopener">View ↗</a>
        </div>
      </div>
      <span class="glare"></span>
    </article>`;
  }).join("");
}

/* ---- Trait families ---- */
const FAMILY_IMG = { Genesis: 4, Survivor: 1, Mutant: 7, Toxic: 3, Undead: 5 };
const familyGrid = document.getElementById("familyGrid");
if (familyGrid) {
  familyGrid.innerHTML = FAMILIES.map((f, i) => `
    <div class="family reveal d${(i % 4) + 1}">
      <img src="${img(FAMILY_IMG[f])}" alt="${f} family" loading="lazy" />
      <div class="family-label"><b>${f}</b><i>Trait family</i></div>
    </div>`).join("");
}

/* ---- Live collection stats (real data via /api/stats serverless proxy) ---- */
async function fetchStats() {
  let data = { floor: 0.005, volume: null, owners: null, change7d: null, fallback: true };
  try {
    const r = await fetch("/api/stats", { headers: { accept: "application/json" } });
    if (r.ok) data = await r.json();
  } catch (e) { /* offline / local static server → keep fallback */ }

  const eth = (v) => (v == null ? null : (Math.round(v * 1000) / 1000).toString());
  const floorStr = data.floor != null ? eth(data.floor) : "0.005";
  document.querySelectorAll(".jsFloor").forEach((el) => { el.textContent = floorStr; });

  if (data.owners != null) {
    const o = document.getElementById("hsOwners"), ol = document.getElementById("hsOwnersLbl");
    if (o) { o.textContent = Number(data.owners).toLocaleString(); ol.textContent = "Owners"; }
  }

  const live = document.getElementById("collLive");
  if (live) {
    const parts = [`Floor ${floorStr} Ξ`];
    if (data.owners != null) parts.push(`${Number(data.owners).toLocaleString()} owners`);
    if (data.volume != null) parts.push(`${eth(data.volume)} Ξ volume`);
    live.textContent = parts.join("  ·  ");
  }
}
fetchStats();

/* ---- Sticky nav background on scroll ---- */
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---- Mobile menu ---- */
const burger = document.getElementById("navBurger");
const navLinks = document.getElementById("navLinks");
if (burger && navLinks) {
  burger.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => navLinks.classList.remove("open"))
  );
}

/* ---- Chain chip ---- */
const chainChip = document.getElementById("chainChip");
if (chainChip) {
  chainChip.addEventListener("click", () =>
    alert("Decay Labs lives on Base — an Ethereum L2. Switch your wallet network to Base.")
  );
}

/* ---- Copy contract address ---- */
const CONTRACT = "0x65F5e8006F4eF730d6984836F606a5C5c516CdC8";
const chip = document.getElementById("contractChip");
if (chip) {
  const copyEl = chip.querySelector(".cc-copy");
  chip.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT);
      chip.classList.add("copied");
      copyEl.textContent = "Copied!";
      setTimeout(() => { chip.classList.remove("copied"); copyEl.textContent = "Copy"; }, 1600);
    } catch (e) { /* clipboard blocked */ }
  });
}

/* ---- 3D tilt (mouse) ---- */
const reduceMotion = matchMedia("(prefers-reduced-motion:reduce)").matches;
const finePointer = matchMedia("(pointer:fine)").matches;
function initTilt(el) {
  if (reduceMotion || !finePointer) return;
  const max = parseFloat(el.dataset.tiltMax || "12");
  const glare = el.querySelector(".glare");
  let raf = 0;
  el.addEventListener("mousemove", (e) => {
    const b = el.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width;
    const py = (e.clientY - b.top) / b.height;
    const rx = (0.5 - py) * max * 2;
    const ry = (px - 0.5) * max * 2;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      el.style.transition = "transform 0s";
      el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.03)`;
      if (glare) {
        glare.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        glare.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
      }
    });
  });
  el.addEventListener("mouseleave", () => {
    cancelAnimationFrame(raf);
    el.style.transition = "transform .5s cubic-bezier(.2,.7,.2,1)";
    el.style.transform = "";
  });
}
document.querySelectorAll("[data-tilt]").forEach(initTilt);

/* ---- Scroll reveal ---- */
document.querySelectorAll(".section-head, .cta-inner").forEach((el) => el.classList.add("reveal"));
const revealEls = Array.from(document.querySelectorAll(".reveal"));
if (reduceMotion) {
  revealEls.forEach((el) => el.classList.add("in"));
} else {
  let ticking = false;
  const checkReveal = () => {
    ticking = false;
    const trigger = window.innerHeight * 0.9;
    for (let i = revealEls.length - 1; i >= 0; i--) {
      if (revealEls[i].getBoundingClientRect().top < trigger) {
        revealEls[i].classList.add("in");
        revealEls.splice(i, 1);
      }
    }
  };
  const onReveal = () => { if (!ticking) { ticking = true; requestAnimationFrame(checkReveal); } };
  window.addEventListener("scroll", onReveal, { passive: true });
  window.addEventListener("resize", onReveal, { passive: true });
  checkReveal();
}
})();
