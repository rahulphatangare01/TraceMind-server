import type {
  CryptoEncoding,
  EncryptionAlgorithm,
} from "../domain/enums/index.js";

export interface EncryptionEnvelope {
  version: number;

  algorithm: EncryptionAlgorithm;

  encoding: CryptoEncoding;

  keyId: string;

  keyVersion: number;

  iv: string;

  authTag: string;

  ciphertext: string;
}
