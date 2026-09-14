import type { CryptoEncoding, HmacAlgorithm } from "../domain/enums/index.js";
import type { SecurityContext } from "../domain/models/security-context.js";

export interface CreateHmacRequest {
  payload: string;
  algorithm: HmacAlgorithm;
  context: SecurityContext;
  encoding?: CryptoEncoding;
}

// Result
export interface CreateHmacResult {
  signature: string;
  algorithm: HmacAlgorithm;
  encoding: CryptoEncoding;

  keyId: string;
  keyVersion: number;
}

// Verification

export interface VerifyHmacRequest {
  payload: string;
  signature: string;

  algorithm: HmacAlgorithm;

  keyId: string;
  keyVersion: number;

  context: SecurityContext;

  encoding?: CryptoEncoding;
}

// Result

export interface VerifyHmacResult {
  valid: boolean;
}
