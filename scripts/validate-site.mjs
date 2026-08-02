import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "lore.html", "collection.html", "subject.html", "trust.html", "faq.html", "links.html", "404.html"];
const scripts = ["app.js", "lore-page.js", "collection-page.js", "subject-page.js", "subject-model.js", "miniapp-buy.js", "api/buy.js", "api/collection-stats.js"];
const banned = [/minted out/i, /trending survivors/i, /web scraping for hire/i, /trait family/i, /design based on a template/i];

const failures = [];
for (const file of [...pages, ...scripts, "styles.css", "manifest.webmanifest", "robots.txt", "sitemap.xml"]) {
  try { await access(path.join(root, file)); }
  catch (_) { failures.push(`Missing required file: ${file}`); }
}

for (const page of pages) {
  const html = await readFile(path.join(root, page), "utf8");
  if (!/<html lang="en">/i.test(html)) failures.push(`${page}: missing lang=en`);
  if (!/<meta name="viewport"/i.test(html)) failures.push(`${page}: missing viewport`);
  if (!/skip-link/.test(html) && page !== "404.html") failures.push(`${page}: missing skip link`);
  for (const rule of banned) if (rule.test(html)) failures.push(`${page}: banned copy matches ${rule}`);
}

const lore = JSON.parse(await readFile(path.join(root, "data", "lore.json"), "utf8"));
const chapters = lore.arcs.flatMap((arc) => arc.chapters);
if (lore.arcs.length !== 10) failures.push(`Lore must contain 10 arcs, found ${lore.arcs.length}`);
if (chapters.length !== 100) failures.push(`Lore must contain 100 chapters, found ${chapters.length}`);
if (new Set(chapters.map((chapter) => chapter.id)).size !== 100) failures.push("Lore chapter IDs must be unique");
if (lore.factions.length !== 5) failures.push(`Lore must contain 5 factions, found ${lore.factions.length}`);

const collection = JSON.parse(await readFile(path.join(root, "data", "collection.json"), "utf8"));
if (collection.supply !== 1000) failures.push("Collection supply must be 1000");
if (!/^0x[0-9a-fA-F]{40}$/.test(collection.contract)) failures.push("Collection contract address is invalid");

try {
  const metadataFiles = await readdir(path.join(root, "metadata-v2"));
  const tokenFiles = metadataFiles.filter((file) => /^\d+\.json$/.test(file));
  if (tokenFiles.length !== 1000) failures.push(`metadata-v2 must contain 1000 token JSON files, found ${tokenFiles.length}`);
} catch (_) {
  failures.push("metadata-v2 has not been generated");
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("Decay Labs validation passed: pages, truth copy, lore, contract and metadata are complete.");
