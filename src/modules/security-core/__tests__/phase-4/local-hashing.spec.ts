import { describe, expect, it } from "vitest";

import { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";

import { CryptoEncoding, HashAlgorithm } from "../../domain/enums/index.js";

describe("LocalCryptoProvider - Hashing", () => {
  const cryptoProvider = new LocalCryptoProvider();

  const value = "Hello TraceMind";

  // --------------------------------------------------
  // 1. Argon2id hashes plaintext
  // --------------------------------------------------

  it("should hash plaintext using Argon2id", async () => {
    const result = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.ARGON2ID,
    });

    expect(result.hash).toBeDefined();
    expect(result.hash.length).toBeGreaterThan(0);
    expect(result.algorithm).toBe(HashAlgorithm.ARGON2ID);
    expect(result.encoding).toBe(CryptoEncoding.UTF8);
  });

  // --------------------------------------------------
  // 2. Argon2id generates different hashes
  // --------------------------------------------------

  it("should generate different hashes for the same value using Argon2id", async () => {
    const result1 = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.ARGON2ID,
    });

    const result2 = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.ARGON2ID,
    });

    expect(result1.hash).not.toBe(result2.hash);
  });

  // --------------------------------------------------
  // 3. Argon2id verifies correct value
  // --------------------------------------------------

  it("should verify the correct value using Argon2id", async () => {
    const hashResult = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.ARGON2ID,
    });

    const verifyResult = await cryptoProvider.verifyHash({
      value,
      hash: hashResult.hash,
      algorithm: HashAlgorithm.ARGON2ID,
    });

    expect(verifyResult.valid).toBe(true);
  });

  // --------------------------------------------------
  // 4. Argon2id rejects incorrect value
  // --------------------------------------------------

  it("should reject an incorrect value using Argon2id", async () => {
    const hashResult = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.ARGON2ID,
    });

    const verifyResult = await cryptoProvider.verifyHash({
      value: "Wrong TraceMind Value",
      hash: hashResult.hash,
      algorithm: HashAlgorithm.ARGON2ID,
    });

    expect(verifyResult.valid).toBe(false);
  });

  // --------------------------------------------------
  // 5. SHA-256 hashes plaintext
  // --------------------------------------------------

  it("should hash plaintext using SHA-256", async () => {
    const result = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.HEX,
    });

    expect(result.hash).toBeDefined();
    expect(result.hash.length).toBe(64);
    expect(result.algorithm).toBe(HashAlgorithm.SHA_256);
    expect(result.encoding).toBe(CryptoEncoding.HEX);
  });

  // --------------------------------------------------
  // 6. SHA-256 verifies correct value
  // --------------------------------------------------

  it("should verify the correct value using SHA-256", async () => {
    const hashResult = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.HEX,
    });

    const verifyResult = await cryptoProvider.verifyHash({
      value,
      hash: hashResult.hash,
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.HEX,
    });

    expect(verifyResult.valid).toBe(true);
  });

  // --------------------------------------------------
  // 7. SHA-256 rejects incorrect value
  // --------------------------------------------------

  it("should reject an incorrect value using SHA-256", async () => {
    const hashResult = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.HEX,
    });

    const verifyResult = await cryptoProvider.verifyHash({
      value: "Wrong TraceMind Value",
      hash: hashResult.hash,
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.HEX,
    });

    expect(verifyResult.valid).toBe(false);
  });

  // --------------------------------------------------
  // 8. SHA-256 HEX encoding
  // --------------------------------------------------

  it("should support SHA-256 HEX encoding", async () => {
    const result = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.HEX,
    });

    expect(result.encoding).toBe(CryptoEncoding.HEX);

    expect(result.hash).toMatch(/^[0-9a-f]{64}$/);
  });

  // --------------------------------------------------
  // 9. SHA-256 BASE64 encoding
  // --------------------------------------------------

  it("should support SHA-256 BASE64 encoding", async () => {
    const result = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.BASE64,
    });

    expect(result.encoding).toBe(CryptoEncoding.BASE64);

    expect(result.hash).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);

    expect(result.hash.length).toBe(44);
  });

  // --------------------------------------------------
  // 10. Invalid/malformed Argon2id hash
  // --------------------------------------------------

  it("should return false for an invalid Argon2id hash", async () => {
    const verifyResult = await cryptoProvider.verifyHash({
      value,
      hash: "invalid-argon2-hash",
      algorithm: HashAlgorithm.ARGON2ID,
    });

    expect(verifyResult.valid).toBe(false);
  });

  // --------------------------------------------------
  // 11. Unsupported algorithm
  // --------------------------------------------------

  it("should reject an unsupported hash algorithm", async () => {
    await expect(
      cryptoProvider.hash({
        value,
        algorithm: "UNSUPPORTED_ALGORITHM" as HashAlgorithm,
      }),
    ).rejects.toThrow("Unsupported hash algorithm");
  });
});
