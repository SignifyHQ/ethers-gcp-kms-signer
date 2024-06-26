/// <reference types="node" />
import BN from "bn.js";
import { GcpKmsSignerCredentials } from "../signer";
export declare function sign(digest: Buffer, kmsCredentials: GcpKmsSignerCredentials): Promise<import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IAsymmetricSignResponse>;
export declare const getPublicKey: (kmsCredentials: GcpKmsSignerCredentials) => Promise<Buffer>;
export declare function getEthereumAddress(publicKey: Buffer): string;
export declare function findEthereumSig(signature: Buffer): {
    r: BN;
    s: BN;
};
export declare function requestKmsSignature(plaintext: Buffer, kmsCredentials: GcpKmsSignerCredentials): Promise<{
    r: BN;
    s: BN;
}>;
export declare function determineCorrectV(msg: Buffer, r: BN, s: BN, expectedEthAddr: string): {
    pubKey: string;
    v: number;
};
