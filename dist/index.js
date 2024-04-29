"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _signer = require("./signer");
Object.keys(_signer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _signer[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _signer[key];
    }
  });
});
var _signerTest = require("./signer-test");
Object.keys(_signerTest).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _signerTest[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _signerTest[key];
    }
  });
});