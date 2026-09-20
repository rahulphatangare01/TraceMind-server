import type {
  CryptoEncoding,
  EncryptionAlgorithm,
} from "../domain/enums/index.js";
import type { SecurityContext } from "../domain/models/security-context.js";

export interface EncryptRequest {
  plaintext: string;
  algorithm: EncryptionAlgorithm;
  context: SecurityContext;
  encoding?: CryptoEncoding;
  keyId?: string;
  keyVersion: number;
}

export interface EncryptResult {
  ciphertext: string;
  algorithm: EncryptionAlgorithm;
  encoding: CryptoEncoding;
  iv: string;
  authTag: string;
  keyId: string;
  keyVersion: number;
}

export interface DecryptRequest {
  // ciphertext: string;

  // algorithm: EncryptionAlgorithm;

  // encoding?: CryptoEncoding;

  // iv: string;
  // authTag: string;

  // keyId: string;
  // keyVersion: number;

  // context: SecurityContext;
  ciphertext: string;
  algorithm: EncryptionAlgorithm;
  encoding?: CryptoEncoding;
  iv: string;
  authTag: string;
  keyId: string;
  keyVersion: number;
  context: SecurityContext;
}
export interface DecryptResult {
  plaintext: string;
}

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
