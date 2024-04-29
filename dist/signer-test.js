"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TestGcpKmsSigner = void 0;
var _dotenv = _interopRequireDefault(require("dotenv"));
var _bn = _interopRequireDefault(require("bn.js"));
var _ethSigUtil = require("@metamask/eth-sig-util");
var _ethers = require("ethers");
var _ethereumjsUtil = require("ethereumjs-util");
var _gcpKmsUtils = require("./util/gcp-kms-utils");
var _signatureUtils = require("./util/signature-utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
_dotenv.default.config();
class TestGcpKmsSigner extends _ethers.AbstractSigner {
  constructor(kmsCredentials, provider, privateKey) {
    super(provider);
    _defineProperty(this, "kmsCredentials", void 0);
    _defineProperty(this, "ethereumAddress", void 0);
    _defineProperty(this, "privateKey", void 0);
    (0, _ethers.defineProperties)(this, {
      provider: provider || null
    });
    (0, _ethers.defineProperties)(this, {
      kmsCredentials
    });
    this.privateKey = privateKey;
  }
  getAddress() {
    var _this = this;
    return _asyncToGenerator(function* () {
      if (_this.ethereumAddress === undefined) {
        if (_this.privateKey) {
          _this.ethereumAddress = new _ethers.Wallet(_this.privateKey).address;
        } else {
          const key = yield (0, _gcpKmsUtils.getPublicKey)(_this.kmsCredentials);
          _this.ethereumAddress = (0, _gcpKmsUtils.getEthereumAddress)(key);
        }
      }
      return Promise.resolve(_this.ethereumAddress);
    })();
  }
  _signDigest(digestString) {
    var _this2 = this;
    return _asyncToGenerator(function* () {
      const digestBuffer = Buffer.from((0, _ethers.getBytes)(digestString));
      let sig = {
        r: new _bn.default(0),
        s: new _bn.default(0)
      };
      if (_this2.privateKey) {
        const _SigningKey$sign = new _ethers.SigningKey(_this2.privateKey).sign(digestBuffer),
          r = _SigningKey$sign.r,
          s = _SigningKey$sign.s,
          v = _SigningKey$sign.v;
        sig.r = new _bn.default((0, _ethers.getBytes)(r, "hex"));
        sig.s = new _bn.default((0, _ethers.getBytes)(s, "hex"));
      } else {
        sig = yield (0, _gcpKmsUtils.requestKmsSignature)(digestBuffer, _this2.kmsCredentials);
      }
      const ethAddr = yield _this2.getAddress();
      const _determineCorrectV = (0, _gcpKmsUtils.determineCorrectV)(digestBuffer, sig.r, sig.s, ethAddr),
        v = _determineCorrectV.v;
      return _ethers.Signature.from({
        v,
        r: `0x${sig.r.toString("hex")}`,
        s: `0x${sig.s.toString("hex")}`
      }).serialized;
    })();
  }
  signMessage(message) {
    var _this3 = this;
    return _asyncToGenerator(function* () {
      return _this3._signDigest((0, _ethers.hashMessage)(message));
    })();
  }

  /**
   * Original implementation takes into account the private key, but here we use the private
   * key from the GCP KMS, so we don't need to provide the PK as signature option.
   * Source code: https://github.com/MetaMask/eth-sig-util/blob/main/src/sign-typed-data.ts#L510
   * .
   * Sign typed data according to EIP-712. The signing differs based upon the `version`.
   *
   * V1 is based upon [an early version of EIP-712](https://github.com/ethereum/EIPs/pull/712/commits/21abe254fe0452d8583d5b132b1d7be87c0439ca)
   * that lacked some later security improvements, and should generally be neglected in favor of
   * later versions.
   *
   * V3 is based on [EIP-712](https://eips.ethereum.org/EIPS/eip-712), except that arrays and
   * recursive data structures are not supported.
   *
   * V4 is based on [EIP-712](https://eips.ethereum.org/EIPS/eip-712), and includes full support of
   * arrays and recursive data structures.
   *
   * @param options - The signing options.
   * @param options.data - The typed data to sign.
   * @param options.version - The signing version to use.
   * @returns The '0x'-prefixed hex encoded signature.
   */
  signTypedData({
    data,
    version
  }) {
    var _this4 = this;
    return _asyncToGenerator(function* () {
      (0, _signatureUtils.validateVersion)(version);
      if (data === null || data === undefined) {
        throw new Error("Missing data parameter");
      }
      let messageSignature;
      if (version === _ethSigUtil.SignTypedDataVersion.V1) {
        messageSignature = _this4._signDigest((0, _ethSigUtil.typedSignatureHash)(data));
      } else {
        const eip712Hash = _ethSigUtil.TypedDataUtils.eip712Hash(data, version);
        messageSignature = _this4._signDigest((0, _ethereumjsUtil.bufferToHex)(eip712Hash));
      }
      return messageSignature;
    })();
  }
  signTransaction(transaction) {
    var _this5 = this;
    return _asyncToGenerator(function* () {
      const trans = _ethers.Transaction.from(transaction);
      const serializedTx = trans.unsignedSerialized;
      const transactionSignature = yield _this5._signDigest((0, _ethers.keccak256)(serializedTx));
      trans.signature = _ethers.Signature.from(transactionSignature);
      return trans.serialized;
    })();
  }
  connect(provider) {
    return new TestGcpKmsSigner(this.kmsCredentials, provider);
  }
}
exports.TestGcpKmsSigner = TestGcpKmsSigner;