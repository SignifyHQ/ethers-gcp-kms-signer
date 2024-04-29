"use strict";

var _ethers = require("ethers");
const types = {
  Pay: [{
    name: "user",
    type: "address"
  }, {
    name: "collateral",
    type: "address"
  }, {
    name: "assets",
    type: "address[]"
  }, {
    name: "amounts",
    type: "uint256[]"
  }, {
    name: "nonce",
    type: "uint256"
  }, {
    name: "expiresAt",
    type: "uint256"
  }]
};
const data = {
  user: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  collateral: "0x4731290cbA8C605727f235EFF4dD91dF6833CE74",
  asset: ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
  amount: [100000000],
  nonce: 0,
  expiresAt: 1713928396288
};
const typedDataEncoder = _ethers.TypedDataEncoder.from(types);
const payData = typedDataEncoder.encodeData("Pay", data);
const PAY = "Pay(address user,address collateral,address[] assets,uint256[] amounts,uint256 nonce,uint256 expiresAt)";
const typeHash = (0, _ethers.keccak256)(Buffer.from(PAY));
const payData2 = typeHash + payData.slice(66);
const messageHash = (0, _ethers.keccak256)(payData);
const messageHash2 = (0, _ethers.keccak256)(payData2);
console.log(`payData: ${payData}`);
console.log(`messageHash: ${messageHash}`);
console.log(`payData2: ${payData2}`);
console.log(`messageHash2: ${messageHash2}`);