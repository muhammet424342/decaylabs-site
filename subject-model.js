const MEMORY_OBJECTS = [
  "a train ticket stamped after the city closed",
  "a child's drawing of the red moon",
  "a key that opens a room missing from every map",
  "a voicemail recorded in their own future voice",
  "a photograph where one face keeps changing",
  "a glass vial labelled DO NOT REMEMBER",
  "a rusted badge from the Clean Directorate",
  "a bone compass that points below Vanta",
  "a radio tuned to a year that has not happened",
  "a receipt for a memory they never sold"
];

const CONDITIONS = [
  "stable, memory drift detected",
  "awake, identity signature incomplete",
  "mobile, signal contamination rising",
  "contained, external witness required",
  "active, archive conflict unresolved",
  "missing, ownership record intact",
  "responsive, chronology unstable",
  "quarantined, transmission continues",
  "unverified, duplicate past detected",
  "observed, future record present"
];

const CALLSIGNS = [
  "Nail", "Cinder", "Moth", "Ledger", "Sable", "Static", "Morrow", "Vellum", "Ash", "Hush",
  "Rook", "Glassjaw", "Spore", "Cipher", "Warden", "Knell", "Rivet", "Bloom", "Grave", "Signal"
];

function hashNumber(value) {
  let n = Number(value) || 1;
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return (n ^ (n >>> 16)) >>> 0;
}

export function padSubject(id) {
  return String(id).padStart(4, "0");
}

export function validSubjectId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id >= 1 && id <= 1000;
}

export function buildSubjectProfile(id, lore, collection) {
  if (!validSubjectId(id)) throw new RangeError("Subject ID must be between 1 and 1000.");
  const seed = hashNumber(id);
  const faction = lore.factions[(id - 1) % lore.factions.length];
  const memory = MEMORY_OBJECTS[seed % MEMORY_OBJECTS.length];
  const condition = CONDITIONS[(seed >>> 4) % CONDITIONS.length];
  const callsign = CALLSIGNS[(seed >>> 8) % CALLSIGNS.length];
  const chapter = ((id - 1) % 100) + 1;
  const localImage = collection.curatedTokenIds.includes(id) || (collection.showcaseTokenIds || []).includes(id);
  // imageBaseUrl exists because the pinned copy behind imageCid went offline with the
  // old IPFS node; a plain HTTPS mirror keeps the artwork visible. Drop it from
  // collection.json and the IPFS gateway takes over again.
  const remoteImage = collection.storage.imageBaseUrl
    ? `${collection.storage.imageBaseUrl}/${id}.webp`
    : `https://ipfs.io/ipfs/${collection.storage.imageCid}/${id}.png`;
  const image = localImage ? `/public/nft-${id}.png` : remoteImage;

  const tokenId = id - 1;
  return {
    id,
    tokenId,
    paddedId: padSubject(id),
    name: `${callsign}-${padSubject(id)}`,
    faction,
    chapter,
    memory,
    condition,
    signal: `VANTA/${faction.id.toUpperCase()}/${padSubject(id)}`,
    image,
    localImage,
    openseaUrl: `https://opensea.io/assets/base/${collection.contract}/${tokenId}`,
    basescanUrl: `${collection.basescanUrl}?a=${id}`
  };
}
