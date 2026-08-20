// Compiles contracts/VantaFieldReports.sol into contracts/out/ with solc.
// Usage: npm run contract:build
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = "contracts/VantaFieldReports.sol";
const CONTRACT = "VantaFieldReports";

function findImport(path) {
  const candidate = path.startsWith("@") ? join(root, "node_modules", path) : join(root, path);
  try {
    return { contents: readFileSync(candidate, "utf8") };
  } catch (error) {
    return { error: `not found: ${path} (${error.code})` };
  }
}

const input = {
  language: "Solidity",
  sources: { [SOURCE]: { content: readFileSync(join(root, SOURCE), "utf8") } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "cancun",
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] } }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImport }));
const errors = (output.errors || []).filter((entry) => entry.severity === "error");
if (errors.length) {
  errors.forEach((entry) => console.error(entry.formattedMessage));
  process.exit(1);
}
(output.errors || []).forEach((entry) => console.warn(entry.formattedMessage.trim()));

const compiled = output.contracts[SOURCE][CONTRACT];
const artifact = {
  contract: CONTRACT,
  compiler: solc.version(),
  abi: compiled.abi,
  bytecode: `0x${compiled.evm.bytecode.object}`,
  deployedBytecode: `0x${compiled.evm.deployedBytecode.object}`
};

mkdirSync(join(root, "contracts/out"), { recursive: true });
writeFileSync(join(root, "contracts/out", `${CONTRACT}.json`), `${JSON.stringify(artifact, null, 2)}\n`);

const deploySize = compiled.evm.deployedBytecode.object.length / 2;
console.log(`${CONTRACT} compiled with ${artifact.compiler}`);
console.log(`deployed size: ${deploySize} bytes (limit 24576)`);
