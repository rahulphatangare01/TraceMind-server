import type { CryptoEncoding, HashAlgorithm } from "../domain/enums/index.js";

export interface HashRequest {
  value: string;
  algorithm: HashAlgorithm;
  encoding?: CryptoEncoding;
}

//  Result

export interface HashResult {
  hash: string;
  algorithm: HashAlgorithm;
  encoding: CryptoEncoding;
}

// Verification
export interface VerifyHashRequest {
  value: string;
  hash: string;
  algorithm: HashAlgorithm;
  encoding?: CryptoEncoding;
}

// Result

export interface VerifyHashResult {
  valid: boolean;
}
