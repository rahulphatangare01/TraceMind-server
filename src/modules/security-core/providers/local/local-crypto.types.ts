import type {
  CryptoEncoding,
  EncryptionAlgorithm,
} from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/index.js";

export interface LocalEncryptRequest {
  plaintext: string;

  algorithm: EncryptionAlgorithm;

  context: SecurityContext;

  keyId: string;

  keyVersion: number;

  keyMaterial: Buffer;

  encoding?: CryptoEncoding;
}

export interface LocalDecryptRequest {
  ciphertext: string;

  algorithm: EncryptionAlgorithm;

  encoding: CryptoEncoding;

  iv: string;

  authTag: string;

  keyId: string;

  keyVersion: number;

  context: SecurityContext;

  keyMaterial: Buffer;
}
