"use strict";

var _dotenv = _interopRequireDefault(require("dotenv"));
var _ethers = require("ethers");
var _index = require("../index");
var _bn = _interopRequireDefault(require("bn.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
_dotenv.default.config();
const provider = new _ethers.JsonRpcProvider("http://localhost:8545");
const kmsCredentials = {
  projectId: process.env.KMS_PROJECT_ID,
  locationId: process.env.KMS_LOCATION_ID,
  keyRingId: process.env.KMS_KEY_RING_ID,
  keyId: process.env.KMS_KEY_ID,
  keyVersion: process.env.KMS_KEY_VERSION
};
const signer = new _index.TestGcpKmsSigner(kmsCredentials, provider, process.env.TESTER_PRIVATE_KEY);
const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const usdcABI = [{
  inputs: [{
    internalType: "address",
    name: "spender",
    type: "address"
  }, {
    internalType: "uint256",
    name: "value",
    type: "uint256"
  }],
  name: "approve",
  outputs: [{
    internalType: "bool",
    name: "",
    type: "bool"
  }],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "to",
    type: "address"
  }, {
    internalType: "uint256",
    name: "value",
    type: "uint256"
  }],
  name: "transfer",
  outputs: [{
    internalType: "bool",
    name: "",
    type: "bool"
  }],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "account",
    type: "address"
  }],
  name: "balanceOf",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}];
const usdcContract = new _ethers.Contract(usdcAddress, usdcABI, provider);
function main(_x, _x2) {
  return _main.apply(this, arguments);
}
function _main() {
  _main = _asyncToGenerator(function* (toUserAddress, amount) {
    const fromUserAddress = yield signer.getAddress();
    console.log(`fromUserAddress: ${fromUserAddress}, toUserAddress: ${toUserAddress}`);
    const fromUserBalance1 = yield usdcContract.balanceOf(fromUserAddress);
    const toUserBalance1 = yield usdcContract.balanceOf(toUserAddress);
    console.log(`fromUserBalance1: ${fromUserBalance1}, toUserBalance1: ${toUserBalance1}`);
    const actualAmount = new _bn.default(amount).mul(new _bn.default(10).pow(new _bn.default(6)));
    console.log(`actualAmount: ${actualAmount}`);
    const tx = yield usdcContract.transfer.populateTransaction(toUserAddress, actualAmount.toNumber());
    console.log(`tx: ${JSON.stringify(tx)}`);
    const network = yield provider.getNetwork();
    const chainId = network.chainId.toString();
    console.log(`chainId: ${chainId}`);
    tx.chainId = network.chainId;
    tx.gasLimit = yield usdcContract.transfer.estimateGas(toUserAddress, actualAmount.toNumber());
    tx.nonce = yield provider.getTransactionCount(fromUserAddress);
    const block = yield provider.getBlock("latest");
    tx.maxFeePerGas = block.baseFeePerGas;
    const signedTx = yield signer.signTransaction(tx);
    console.log(`signedTx: ${signedTx}`);
    const receipt = yield provider.broadcastTransaction(signedTx);
    console.log(`receipt: ${receipt.hash}`);
    const fromUserBalance2 = yield usdcContract.balanceOf(fromUserAddress);
    const toUserBalance2 = yield usdcContract.balanceOf(toUserAddress);
    console.log(`fromUserBalance1: ${fromUserBalance1}, fromUserBalance2: ${fromUserBalance2}`);
    console.log(`toUserBalance1: ${toUserBalance1}, toUserBalance2: ${toUserBalance2}`);
  });
  return _main.apply(this, arguments);
}
main("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 100).then(() => {
  console.log("done");
}).catch(error => {
  console.error(error);
});