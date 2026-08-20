// Deploys VantaFieldReports to Base and opens a report for claiming.
//
//   node scripts/deploy-contract.mjs deploy                 # estimate only
//   node scripts/deploy-contract.mjs deploy --confirm       # broadcast
//   node scripts/deploy-contract.mjs open <address> 1 --confirm
//
// Reads DEPLOYER_PRIVATE_KEY from the environment; it is never written to disk or logged.
// OWNER_ADDRESS (optional) receives ownership, otherwise the deployer keeps it.
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, formatEther, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifact = JSON.parse(readFileSync(join(root, "contracts/out/VantaFieldReports.json"), "utf8"));
const BASE_URI = "https://decaylabs.online/report/";
const RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";

const [command, ...rest] = process.argv.slice(2);
const args = rest.filter((value) => !value.startsWith("--"));
const confirm = rest.includes("--confirm");

function account() {
  const key = process.env.DEPLOYER_PRIVATE_KEY;
  if (!key) {
    console.error("DEPLOYER_PRIVATE_KEY is not set. Export it in the shell that runs this script.");
    process.exit(1);
  }
  return privateKeyToAccount(key.startsWith("0x") ? key : `0x${key}`);
}

const publicClient = createPublicClient({ chain: base, transport: http(RPC_URL) });

async function report(label, gas) {
  const gasPrice = await publicClient.getGasPrice();
  const cost = gas * gasPrice;
  console.log(`${label}: ~${gas} gas @ ${gasPrice} wei = ~${formatEther(cost)} ETH`);
}

async function deploy() {
  const deployer = account();
  const owner = process.env.OWNER_ADDRESS || deployer.address;
  const balance = await publicClient.getBalance({ address: deployer.address });
  console.log(`deployer: ${deployer.address} (${formatEther(balance)} ETH on Base)`);
  console.log(`owner:    ${owner}`);
  console.log(`baseUri:  ${BASE_URI}`);

  const gas = await publicClient.estimateContractGas({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [owner, BASE_URI],
    account: deployer
  });
  await report("deploy", gas);

  if (!confirm) {
    console.log("\nEstimate only. Re-run with --confirm to broadcast.");
    return;
  }

  const wallet = createWalletClient({ account: deployer, chain: base, transport: http(RPC_URL) });
  const hash = await wallet.deployContract({ abi: artifact.abi, bytecode: artifact.bytecode, args: [owner, BASE_URI] });
  console.log(`tx: https://basescan.org/tx/${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    console.error("deployment reverted");
    process.exit(1);
  }
  console.log(`contract: ${receipt.contractAddress}`);

  const onchain = await publicClient.getBytecode({ address: receipt.contractAddress });
  console.log(`bytecode matches artifact: ${onchain === artifact.deployedBytecode}`);
  console.log(`\nNext: paste the address into report-mint.mjs (REPORT_CONTRACT), then run:`);
  console.log(`  node scripts/deploy-contract.mjs open ${receipt.contractAddress} 1 --confirm`);
}

async function open() {
  const [address, reportId] = args;
  if (!address || reportId === undefined) {
    console.error("usage: node scripts/deploy-contract.mjs open <address> <reportId> [--confirm]");
    process.exit(1);
  }
  const owner = account();
  const call = { address, abi: artifact.abi, functionName: "openReport", args: [BigInt(reportId)], account: owner };

  const gas = await publicClient.estimateContractGas(call);
  await report(`openReport(${reportId})`, gas);
  if (!confirm) {
    console.log("\nEstimate only. Re-run with --confirm to broadcast.");
    return;
  }

  const wallet = createWalletClient({ account: owner, chain: base, transport: http(RPC_URL) });
  const hash = await wallet.writeContract(call);
  console.log(`tx: https://basescan.org/tx/${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`status: ${receipt.status}`);
}

if (command === "deploy") await deploy();
else if (command === "open") await open();
else {
  console.error("usage: node scripts/deploy-contract.mjs <deploy|open> [args] [--confirm]");
  process.exit(1);
}
