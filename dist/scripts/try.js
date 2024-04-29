"use strict";

var _ethers = require("ethers");
var _keyEncoder = _interopRequireDefault(require("key-encoder"));
var _gcpKmsUtils = require("../util/gcp-kms-utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const keyEncoder = new _keyEncoder.default("secp256k1");
const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const signingKey = new _ethers.SigningKey(privateKey);
console.log(`compressed public key: ${signingKey.compressedPublicKey}`);
console.log(`uncompressed public key: ${signingKey.publicKey}`);
console.log(`private key: ${signingKey.privateKey}`);
const der = keyEncoder.encodePublic(signingKey.publicKey, "pem", "der");
console.log(`der: ${der}`);
console.log(`address: ${(0, _gcpKmsUtils.getEthereumAddress)(Buffer.from(der, "hex"))}`);
const types = {
  EIP712Domain: [{
    name: "name",
    type: "string"
  }, {
    name: "version",
    type: "string"
  }, {
    name: "chainId",
    type: "uint"
  }, {
    name: "verifyingContract",
    type: "address"
  }, {
    name: "salt",
    type: "bytes32"
  }],
  Withdraw: [{
    name: "user",
    type: "address"
  }, {
    name: "collateral",
    type: "address"
  }, {
    name: "asset",
    type: "address"
  }, {
    name: "amount",
    type: "uint"
  }, {
    name: "recipient",
    type: "address"
  }, {
    name: "nonce",
    type: "uint"
  }, {
    name: "expiresAt",
    type: "uint"
  }]
};
const instance = {
  types,
  primaryType: "Withdraw",
  domain: {
    name: "Test",
    version: "1",
    chainId: 1,
    verifyingContract: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    salt: Buffer.from("0x1234567890123456789012345678901234567890123456789012345678901234")
  },
  message: {
    user: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    collateral: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    asset: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    amount: 1000,
    recipient: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    nonce: 1,
    expiresAt: 1
  }
};
console.log(`types: ${JSON.stringify(types)}`);
console.log(`instance: ${JSON.stringify(instance)}`);