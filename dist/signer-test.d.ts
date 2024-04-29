import { MessageTypes, SignTypedDataVersion, TypedDataV1, TypedMessage } from "@metamask/eth-sig-util";
import { Provider, AbstractSigner, TransactionRequest } from "ethers";
interface GcpKmsSignerCredentials {
    projectId: string;
    locationId: string;
    keyRingId: string;
    keyId: string;
    keyVersion: string;
}
export declare class TestGcpKmsSigner extends AbstractSigner {
    kmsCredentials: GcpKmsSignerCredentials;
    ethereumAddress: string;
    privateKey?: string;
    constructor(kmsCredentials: GcpKmsSignerCredentials, provider?: Provider, privateKey?: string);
    getAddress(): Promise<string>;
    _signDigest(digestString: string): Promise<string>;
    signMessage(message: string | Uint8Array): Promise<string>;
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
    signTypedData<V extends SignTypedDataVersion, T extends MessageTypes>({ data, version, }: {
        data: V extends "V1" ? TypedDataV1 : TypedMessage<T>;
        version: V;
    }): Promise<string>;
    signTransaction(transaction: TransactionRequest): Promise<string>;
    connect(provider: Provider): TestGcpKmsSigner;
}
export {};
