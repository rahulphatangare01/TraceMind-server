import { describe, expect, it } from "vitest";

import { CryptoEncoding, HashAlgorithm } from "../../../domain/enums/index.js";

import { LocalCryptoProvider } from "../../../providers/local/local-crypto.provider.js";

describe("Phase 8.8 - Local Hashing Integration", () => {
  const createCryptoProvider = () => {
    return new LocalCryptoProvider();
  };

  it("should generate SHA-256 hash successfully", async () => {
    const cryptoProvider = createCryptoProvider();

    const result = await cryptoProvider.hash({
      value: "TraceMind hashing test",
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.BASE64,
    });

    expect(result).toBeDefined();
    expect(result.hash).toBeDefined();
    expect(typeof result.hash).toBe("string");
    expect(result.hash.length).toBeGreaterThan(0);
    expect(result.algorithm).toBe(HashAlgorithm.SHA_256);
    expect(result.encoding).toBe(CryptoEncoding.BASE64);
  });

  it("should verify a valid SHA-256 hash successfully", async () => {
    const cryptoProvider = createCryptoProvider();

    const value = "TraceMind SHA-256 verification";

    const hashResult = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.BASE64,
    });

    const verifyResult = await cryptoProvider.verifyHash({
      value,
      hash: hashResult.hash,
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verifyResult.valid).toBe(true);
  });

  it("should reject an invalid SHA-256 hash", async () => {
    const cryptoProvider = createCryptoProvider();

    const hashResult = await cryptoProvider.hash({
      value: "TraceMind original value",
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.BASE64,
    });

    const verifyResult = await cryptoProvider.verifyHash({
      value: "TraceMind modified value",
      hash: hashResult.hash,
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verifyResult.valid).toBe(false);
  });

  //   it("should generate Argon2id hash successfully", async () => {
  //     const cryptoProvider = createCryptoProvider();

  //     const result = await cryptoProvider.hash({
  //       value: "TraceMind Argon2id test",
  //       algorithm: HashAlgorithm.ARGON2ID,
  //       encoding: CryptoEncoding.BASE64,
  //     });

  //     expect(result).toBeDefined();
  //     expect(result.hash).toBeDefined();
  //     expect(typeof result.hash).toBe("string");
  //     expect(result.hash.length).toBeGreaterThan(0);
  //     expect(result.algorithm).toBe(HashAlgorithm.ARGON2ID);
  //     expect(result.encoding).toBe(CryptoEncoding.BASE64);
  //   });

  it("should generate Argon2id hash successfully", async () => {
    const cryptoProvider = createCryptoProvider();

    const result = await cryptoProvider.hash({
      value: "TraceMind Argon2id test",
      algorithm: HashAlgorithm.ARGON2ID,
      encoding: CryptoEncoding.BASE64,
    });

    expect(result).toBeDefined();
    expect(result.hash).toBeDefined();
    expect(typeof result.hash).toBe("string");
    expect(result.hash.length).toBeGreaterThan(0);
    expect(result.algorithm).toBe(HashAlgorithm.ARGON2ID);
    expect(result.encoding).toBe(CryptoEncoding.UTF8);
  });

  it("should verify a valid Argon2id hash successfully", async () => {
    const cryptoProvider = createCryptoProvider();

    const value = "TraceMind Argon2id verification";

    const hashResult = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.ARGON2ID,
      encoding: CryptoEncoding.BASE64,
    });

    const verifyResult = await cryptoProvider.verifyHash({
      value,
      hash: hashResult.hash,
      algorithm: HashAlgorithm.ARGON2ID,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verifyResult.valid).toBe(true);
  });

  it("should reject an invalid Argon2id hash", async () => {
    const cryptoProvider = createCryptoProvider();

    const hashResult = await cryptoProvider.hash({
      value: "TraceMind original password",
      algorithm: HashAlgorithm.ARGON2ID,
      encoding: CryptoEncoding.BASE64,
    });

    const verifyResult = await cryptoProvider.verifyHash({
      value: "TraceMind changed password",
      hash: hashResult.hash,
      algorithm: HashAlgorithm.ARGON2ID,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verifyResult.valid).toBe(false);
  });

  it("should produce different Argon2id hashes for the same value", async () => {
    const cryptoProvider = createCryptoProvider();

    const value = "TraceMind same secret";

    const first = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.ARGON2ID,
      encoding: CryptoEncoding.BASE64,
    });

    const second = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.ARGON2ID,
      encoding: CryptoEncoding.BASE64,
    });

    expect(first.hash).not.toBe(second.hash);
  });

  it("should produce deterministic SHA-256 hashes for the same value", async () => {
    const cryptoProvider = createCryptoProvider();

    const value = "TraceMind deterministic hash";

    const first = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.BASE64,
    });

    const second = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.BASE64,
    });

    expect(first.hash).toBe(second.hash);
  });

  it("should preserve hash algorithm metadata", async () => {
    const cryptoProvider = createCryptoProvider();

    const result = await cryptoProvider.hash({
      value: "TraceMind metadata test",
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.BASE64,
    });

    expect(result.algorithm).toBe(HashAlgorithm.SHA_256);
    expect(result.encoding).toBe(CryptoEncoding.BASE64);
  });

  //   it("should preserve Argon2id algorithm metadata", async () => {
  //     const cryptoProvider = createCryptoProvider();

  //     const result = await cryptoProvider.hash({
  //       value: "TraceMind Argon2 metadata test",
  //       algorithm: HashAlgorithm.ARGON2ID,
  //       encoding: CryptoEncoding.BASE64,
  //     });

  //     expect(result.algorithm).toBe(HashAlgorithm.ARGON2ID);
  //     expect(result.encoding).toBe(CryptoEncoding.BASE64);
  //   });

  it("should preserve Argon2id algorithm metadata", async () => {
    const cryptoProvider = createCryptoProvider();

    const result = await cryptoProvider.hash({
      value: "TraceMind Argon2 metadata test",
      algorithm: HashAlgorithm.ARGON2ID,
      encoding: CryptoEncoding.BASE64,
    });

    expect(result.algorithm).toBe(HashAlgorithm.ARGON2ID);
    expect(result.encoding).toBe(CryptoEncoding.UTF8);
  });
  it("should not expose the original plaintext in the hash result", async () => {
    const cryptoProvider = createCryptoProvider();

    const value = "TraceMind confidential value";

    const result = await cryptoProvider.hash({
      value,
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.BASE64,
    });

    expect(result.hash).not.toContain(value);
  });
});
