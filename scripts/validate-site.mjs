import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "lore.html", "collection.html", "subject.html", "find-your-subject.html", "trust.html", "faq.html", "links.html", "404.html"];
const scripts = ["app.js", "lore-page.js", "collection-page.js", "subject-page.js", "subject-model.js", "subject-match.js", "find-your-subject.js", "miniapp-buy.js", "api/buy.js", "api/collection-stats.js", "api/subject-share.js"];
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

const farcaster = JSON.parse(await readFile(path.join(root, ".well-known", "farcaster.json"), "utf8"));
const miniapp = farcaster.miniapp;
if (!farcaster.accountAssociation?.header || !farcaster.accountAssociation?.payload || !farcaster.accountAssociation?.signature) {
  failures.push("Farcaster manifest is missing its signed account association");
}
for (const field of ["version", "name", "homeUrl", "iconUrl", "splashImageUrl", "splashBackgroundColor", "subtitle", "description", "primaryCategory", "heroImageUrl", "tagline", "ogTitle", "ogDescription", "ogImageUrl", "canonicalDomain"]) {
  if (!miniapp?.[field]) failures.push(`Farcaster manifest is missing miniapp.${field}`);
}
if (miniapp?.tagline?.length > 30) failures.push("Farcaster tagline must be 30 characters or fewer");
if (miniapp?.canonicalDomain !== "decaylabs.online") failures.push("Farcaster canonicalDomain must be decaylabs.online");
if (!miniapp?.requiredChains?.includes("eip155:8453")) failures.push("Farcaster manifest must declare Base (eip155:8453)");
if (!miniapp?.iconUrl?.endsWith("/x-avatar.png")) failures.push("Farcaster discovery icon must use the 1024x1024 PNG asset");

const avatar = await readFile(path.join(root, "public", "x-avatar.png"));
if (avatar.length < 24 || avatar.toString("ascii", 1, 4) !== "PNG") failures.push("Farcaster discovery icon must be a PNG");
else {
  const width = avatar.readUInt32BE(16);
  const height = avatar.readUInt32BE(20);
  if (width !== 1024 || height !== 1024) failures.push(`Farcaster discovery icon must be 1024x1024, found ${width}x${height}`);
}

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
