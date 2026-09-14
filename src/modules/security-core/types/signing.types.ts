import type {
  CryptoEncoding,
  SignatureAlgorithm,
} from "../domain/enums/index.js";
import type { SecurityContext } from "../domain/models/security-context.js";

export interface SignRequest {
  payload: string;
  algorithm: SignatureAlgorithm;
  context: SecurityContext;
  encoding?: CryptoEncoding;
}

// Result

export interface SignResult {
  signature: string;
  algorithm: SignatureAlgorithm;
  encoding: CryptoEncoding;

  keyId: string;
  keyVersion: number;
}

// Verification
export interface VerifySignatureRequest {
  payload: string;
  signature: string;

  algorithm: SignatureAlgorithm;

  keyId: string;
  keyVersion: number;

  context: SecurityContext;

  encoding?: CryptoEncoding;
}

// Result
export interface VerifySignatureResult {
  valid: boolean;
}
