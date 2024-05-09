"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.determineCorrectV = determineCorrectV;
exports.findEthereumSig = findEthereumSig;
exports.getEthereumAddress = getEthereumAddress;
exports.getPublicKey = void 0;
exports.requestKmsSignature = requestKmsSignature;
exports.sign = sign;
var _ethers = require("ethers");
var _kms = require("@google-cloud/kms");
var asn1 = _interopRequireWildcard(require("asn1.js"));
var _bn = _interopRequireDefault(require("bn.js"));
var _keyEncoder = _interopRequireDefault(require("key-encoder"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
const keyEncoder = new _keyEncoder.default("secp256k1");

/* this asn1.js library has some funky things going on */
/* eslint-disable func-names */
const EcdsaSigAsnParse = asn1.define("EcdsaSig", function () {
  // parsing this according to https://tools.ietf.org/html/rfc3279#section-2.2.3
  this.seq().obj(this.key("r").int(), this.key("s").int());
});
const EcdsaPubKey = asn1.define("EcdsaPubKey", function () {
  // parsing this according to https://tools.ietf.org/html/rfc5480#section-2
  this.seq().obj(this.key("algo").seq().obj(this.key("a").objid(), this.key("b").objid()), this.key("pubKey").bitstr());
});
/* eslint-enable func-names */

function getClientCredentials() {
  return process.env.GOOGLE_APPLICATION_CREDENTIAL_EMAIL && process.env.GOOGLE_APPLICATION_CREDENTIAL_PRIVATE_KEY ? {
    credentials: {
      client_email: process.env.GOOGLE_APPLICATION_CREDENTIAL_EMAIL,
      private_key: process.env.GOOGLE_APPLICATION_CREDENTIAL_PRIVATE_KEY.replace(/\\n/gm, "\n")
    }
  } : {};
}
function sign(_x, _x2) {
  return _sign.apply(this, arguments);
}
function _sign() {
  _sign = _asyncToGenerator(function* (digest, kmsCredentials) {
    const kms = new _kms.KeyManagementServiceClient(getClientCredentials());
    const versionName = kms.cryptoKeyVersionPath(kmsCredentials.projectId, kmsCredentials.locationId, kmsCredentials.keyRingId, kmsCredentials.keyId, kmsCredentials.keyVersion);
    const _yield$kms$asymmetric = yield kms.asymmetricSign({
        name: versionName,
        digest: {
          sha256: digest
        }
      }),
      _yield$kms$asymmetric2 = _slicedToArray(_yield$kms$asymmetric, 1),
      asymmetricSignResponse = _yield$kms$asymmetric2[0];
    return asymmetricSignResponse;
  });
  return _sign.apply(this, arguments);
}
const getPublicKey = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (kmsCredentials) {
    const kms = new _kms.KeyManagementServiceClient(getClientCredentials());
    const versionName = kms.cryptoKeyVersionPath(kmsCredentials.projectId, kmsCredentials.locationId, kmsCredentials.keyRingId, kmsCredentials.keyId, kmsCredentials.keyVersion);
    const _yield$kms$getPublicK = yield kms.getPublicKey({
        name: versionName
      }),
      _yield$kms$getPublicK2 = _slicedToArray(_yield$kms$getPublicK, 1),
      publicKey = _yield$kms$getPublicK2[0];
    if (!publicKey || !publicKey.pem) throw new Error(`Can not find key: ${kmsCredentials.keyId}`);

    // GCP KMS returns the public key in pem format,
    // so we need to encode it to der format, and return the hex buffer.
    const der = keyEncoder.encodePublic(publicKey.pem, "pem", "der");
    return Buffer.from(der, "hex");
  });
  return function getPublicKey(_x3) {
    return _ref.apply(this, arguments);
  };
}();
exports.getPublicKey = getPublicKey;
function getEthereumAddress(publicKey) {
  // The public key here is a hex der ASN1 encoded in a format according to
  // https://tools.ietf.org/html/rfc5480#section-2
  // I used https://lapo.it/asn1js to figure out how to parse this
  // and defined the schema in the EcdsaPubKey object.
  const res = EcdsaPubKey.decode(publicKey, "der");
  const pubKeyBuffer = res.pubKey.data;

  // The raw format public key starts with a `04` prefix that needs to be removed
  // more info: https://www.oreilly.com/library/view/mastering-ethereum/9781491971932/ch04.html
  // const pubStr = publicKey.toString();
  const pubFormatted = pubKeyBuffer.slice(1, pubKeyBuffer.length);

  // keccak256 hash of publicKey
  const address = (0, _ethers.keccak256)(pubFormatted);
  // take last 20 bytes as ethereum address
  const EthAddr = `0x${address.slice(-40)}`;
  return EthAddr;
}
function findEthereumSig(signature) {
  const decoded = EcdsaSigAsnParse.decode(signature, "der");
  const r = decoded.r,
    s = decoded.s;
  const secp256k1N = new _bn.default("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 16); // max value on the curve
  const secp256k1halfN = secp256k1N.div(new _bn.default(2)); // half of the curve
  // Because of EIP-2 not all elliptic curve signatures are accepted
  // the value of s needs to be SMALLER than half of the curve
  // i.e. we need to flip s if it's greater than half of the curve
  // if s is less than half of the curve, we're on the "good" side of the curve, we can just return
  return {
    r,
    s: s.gt(secp256k1halfN) ? secp256k1N.sub(s) : s
  };
}
function requestKmsSignature(_x4, _x5) {
  return _requestKmsSignature.apply(this, arguments);
}
function _requestKmsSignature() {
  _requestKmsSignature = _asyncToGenerator(function* (plaintext, kmsCredentials) {
    const response = yield sign(plaintext, kmsCredentials);
    if (!response || !response.signature) {
      throw new Error(`GCP KMS call failed`);
    }
    return findEthereumSig(response.signature);
  });
  return _requestKmsSignature.apply(this, arguments);
}
function recoverPubKeyFromSig(msg, r, s, v) {
  return (0, _ethers.recoverAddress)(`0x${msg.toString("hex")}`, {
    r: `0x${r.toString("hex")}`,
    s: `0x${s.toString("hex")}`,
    v
  });
}
function determineCorrectV(msg, r, s, expectedEthAddr) {
  // This is the wrapper function to find the right v value
  // There are two matching signatures on the elliptic curve
  // we need to find the one that matches to our public key
  // it can be v = 27 or v = 28
  let v = 27;
  let pubKey = recoverPubKeyFromSig(msg, r, s, v);
  if (pubKey.toLowerCase() !== expectedEthAddr.toLowerCase()) {
    // if the pub key for v = 27 does not match
    // it has to be v = 28
    v = 28;
    pubKey = recoverPubKeyFromSig(msg, r, s, v);
  }
  return {
    pubKey,
    v
  };
}