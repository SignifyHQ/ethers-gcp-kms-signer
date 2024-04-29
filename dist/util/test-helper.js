"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wallet = exports.signingKey = void 0;
var _dotenv = _interopRequireDefault(require("dotenv"));
var _ethers = require("ethers");
var _bn = require("bn.js");
var _gcpKmsUtils = require("./gcp-kms-utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
_dotenv.default.config();
const useAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const privateKey = process.env.TESTER_PRIVATE_KEY;
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
console.log(`privateKey: ${privateKey}`);
const signingKey = new _ethers.SigningKey(privateKey);
exports.signingKey = signingKey;
const usdcContract = new _ethers.Contract(usdcAddress, usdcABI);
const wallet = new _ethers.Wallet(privateKey);
exports.wallet = wallet;
console.log(`signer address: ${wallet.address}`);
function main() {
  return _main.apply(this, arguments);
}
function _main() {
  _main = _asyncToGenerator(function* () {
    const tx = yield usdcContract.approve.populateTransaction(useAddress, 1000);
    const signedTx = yield wallet.signTransaction(tx);
    console.log(`signedTx: ${signedTx}`);
    const _Transaction$from$sig = _ethers.Transaction.from(signedTx).signature,
      v = _Transaction$from$sig.v,
      r = _Transaction$from$sig.r,
      s = _Transaction$from$sig.s;
    console.log(`v: ${v}`);
    console.log(`r: ${r}`);
    console.log(`s: ${s}`);
  });
  return _main.apply(this, arguments);
}
function main2() {
  return _main2.apply(this, arguments);
}
function _main2() {
  _main2 = _asyncToGenerator(function* () {
    const tx = yield usdcContract.transfer.populateTransaction(useAddress, 1000000000);
    const unsignedTx = _ethers.Transaction.from(tx).unsignedSerialized;
    console.log(`unsignedTx: ${unsignedTx}`);
    const digest = (0, _ethers.keccak256)(unsignedTx);
    const _signingKey$sign = signingKey.sign(digest),
      v = _signingKey$sign.v,
      r = _signingKey$sign.r,
      s = _signingKey$sign.s;
    console.log(`v: ${v}`);
    console.log(`r: ${r}`);
    console.log(`s: ${s}`);
    const digestBuffer = Buffer.from((0, _ethers.getBytes)(digest));
    const _determineCorrectV = (0, _gcpKmsUtils.determineCorrectV)(digestBuffer, new _bn.BN((0, _ethers.getBytes)(r)), new _bn.BN((0, _ethers.getBytes)(s)), wallet.address),
      v1 = _determineCorrectV.v;
    console.log(`v1: ${v1}`);
    // console.log(`r1: 0x${new BN(getBytes(r)).toString("hex")}`);
    // console.log(`s1: 0x${new BN(getBytes(s)).toString("hex")}`);
  });
  return _main2.apply(this, arguments);
}
function verifyIssue() {
  return _verifyIssue.apply(this, arguments);
}
function _verifyIssue() {
  _verifyIssue = _asyncToGenerator(function* () {
    const provider = new _ethers.JsonRpcProvider("http://localhost:8545");
    const wallet1 = new _ethers.Wallet(privateKey, provider);
    const contract = new _ethers.Contract(usdcAddress, usdcABI, wallet1);
    const txData = yield contract.approve.populateTransaction(useAddress, 1000);
    const transaction = _ethers.Transaction.from(txData);
    console.log(`transaction: ${JSON.stringify(transaction)}`);
    const temp = transaction;
    const trans = (0, _ethers.resolveProperties)(temp);
    console.log(`trans: ${JSON.stringify(trans)}`);
  });
  return _verifyIssue.apply(this, arguments);
}
verifyIssue().then(() => {
  console.log("done");
}).catch(error => {
  console.error(error);
});