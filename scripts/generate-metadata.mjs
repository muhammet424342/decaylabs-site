import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSubjectProfile } from "../subject-model.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.resolve(root, process.argv[2] || "metadata-v2");
const [lore, collection] = await Promise.all([
  readFile(path.join(root, "data", "lore.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "data", "collection.json"), "utf8").then(JSON.parse)
]);

await mkdir(output, { recursive: true });
for (let id = 1; id <= collection.supply; id += 1) {
  const profile = buildSubjectProfile(id, lore, collection);
  const chapter = lore.arcs.flatMap((arc) => arc.chapters).find((item) => item.id === profile.chapter);
  const metadata = {
    name: `Decay Labs Subject #${profile.paddedId}`,
    description: `Subject ${profile.paddedId} is a hand-illustrated witness from The Half-Life Archive. Assigned to ${profile.faction.name}; archive condition: ${profile.condition}. Narrative classifications do not represent financial rarity or guaranteed utility.`,
    image: `ipfs://${collection.storage.imageCid}/${id}.png`,
    external_url: `https://decaylabs.online/subject?id=${id}`,
    attributes: [
      { trait_type: "Narrative Faction", value: profile.faction.name },
      { trait_type: "Archive Chapter", value: String(profile.chapter).padStart(3, "0") },
      { trait_type: "Chapter Record", value: chapter.title },
      { trait_type: "Signal", value: profile.signal },
      { trait_type: "Collection Status", value: "Genesis Archive" },
      { trait_type: "Media Storage", value: "IPFS" }
    ]
  };
  await writeFile(path.join(output, `${id}.json`), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
}

const contractMetadata = {
  name: "Decay Labs",
  description: "One thousand hand-illustrated undead witnesses created on Base. Enter The Half-Life Archive, verify ownership onchain, and collect through an in-app Seaport checkout.",
  image: "https://decaylabs.online/public/og-v2.png",
  external_link: "https://decaylabs.online",
  seller_fee_basis_points: 1000,
  fee_recipient: collection.founderWallet
};
await writeFile(path.join(output, "contract.json"), `${JSON.stringify(contractMetadata, null, 2)}\n`, "utf8");
console.log(`Generated ${collection.supply} token files and contract.json in ${output}`);
