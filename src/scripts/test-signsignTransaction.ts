import configs from "dotenv";
import { JsonRpcProvider, Contract } from "ethers";
import { GcpKmsSignerCredentials, TestGcpKmsSigner } from "../index";
import BN from "bn.js";

configs.config();

const provider = new JsonRpcProvider("http://localhost:8545");

const kmsCredentials: GcpKmsSignerCredentials = {
  projectId: process.env.KMS_PROJECT_ID,
  locationId: process.env.KMS_LOCATION_ID,
  keyRingId: process.env.KMS_KEY_RING_ID,
  keyId: process.env.KMS_KEY_ID,
  keyVersion: process.env.KMS_KEY_VERSION,
};

const signer = new TestGcpKmsSigner(kmsCredentials, provider, process.env.TESTER_PRIVATE_KEY);

const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const usdcABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const usdcContract = new Contract(usdcAddress, usdcABI, provider);

async function main(toUserAddress: string, amount: number) {
  const fromUserAddress = await signer.getAddress();
  console.log(`fromUserAddress: ${fromUserAddress}, toUserAddress: ${toUserAddress}`);
  const fromUserBalance1 = await usdcContract.balanceOf(fromUserAddress);
  const toUserBalance1 = await usdcContract.balanceOf(toUserAddress);
  console.log(`fromUserBalance1: ${fromUserBalance1}, toUserBalance1: ${toUserBalance1}`);
  const actualAmount = new BN(amount).mul(new BN(10).pow(new BN(6)));
  console.log(`actualAmount: ${actualAmount}`);
  const tx = await usdcContract.transfer.populateTransaction(toUserAddress, actualAmount.toNumber());
  console.log(`tx: ${JSON.stringify(tx)}`);
  const network = await provider.getNetwork();
  const chainId = network.chainId.toString();
  console.log(`chainId: ${chainId}`);
  tx.chainId = network.chainId;
  tx.gasLimit = await usdcContract.transfer.estimateGas(toUserAddress, actualAmount.toNumber());
  tx.nonce = await provider.getTransactionCount(fromUserAddress);
  const block = await provider.getBlock("latest");
  tx.maxFeePerGas = block.baseFeePerGas;
  const signedTx = await signer.signTransaction(tx);
  console.log(`signedTx: ${signedTx}`);
  const receipt = await provider.broadcastTransaction(signedTx);
  console.log(`receipt: ${receipt.hash}`);
  const fromUserBalance2 = await usdcContract.balanceOf(fromUserAddress);
  const toUserBalance2 = await usdcContract.balanceOf(toUserAddress);
  console.log(`fromUserBalance1: ${fromUserBalance1}, fromUserBalance2: ${fromUserBalance2}`);
  console.log(`toUserBalance1: ${toUserBalance1}, toUserBalance2: ${toUserBalance2}`);
}

main("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 100)
  .then(() => {
    console.log("done");
  })
  .catch((error) => {
    console.error(error);
  });
