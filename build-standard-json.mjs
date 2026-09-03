// BaseScan "Standard JSON Input" doğrulaması için girdi üretir.
// Kullanım: node build-standard-json.mjs
// Ayarlar scripts/compile-contract.mjs ile birebir aynı olmalı, yoksa doğrulama tutmaz.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve, sep } from "node:path";

const root = process.cwd();
const ENTRY = "contracts/VantaFieldReports.sol";
const sources = {};

function resolvePath(p, fromDir) {
  return p.startsWith("@") ? join(root, "node_modules", p) : resolve(fromDir, p);
}

function keyFor(abs) {
  let rel = abs.startsWith(root) ? abs.slice(root.length + 1) : abs;
  rel = rel.split(sep).join("/");
  return rel.startsWith("node_modules/") ? rel.slice("node_modules/".length) : rel;
}

function add(abs) {
  const key = keyFor(abs);
  if (sources[key]) return;
  const content = readFileSync(abs, "utf8");
  sources[key] = { content };
  const re = /import\s+(?:\{[^}]*\}\s+from\s+)?["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(content))) add(resolvePath(m[1], dirname(abs)));
}

add(join(root, ENTRY));

const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "cancun",
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] } }
  }
};

writeFileSync(join(root, "vanta-standard-json.json"), JSON.stringify(input), "utf8");
console.log("kaynak dosya sayisi:", Object.keys(sources).length);
for (const k of Object.keys(sources)) console.log("  -", k);
