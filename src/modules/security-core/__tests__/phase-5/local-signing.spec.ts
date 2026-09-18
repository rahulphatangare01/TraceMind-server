import { describe, expect, it } from "vitest";

import {
  CryptoEncoding,
  DataClassification,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
} from "../../domain/enums/index.js";

import { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";
import { LocalSigningKeyProvider } from "../../providers/local/local-signing-key.provider.js";

describe("LocalCryptoProvider - Ed25519 Signing", () => {
  const signingKeyProvider = new LocalSigningKeyProvider();

  const cryptoProvider = new LocalCryptoProvider(signingKeyProvider);

  const context = {
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org_signing_test_001",
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.SIGNING,
  };

  const payload = "TraceMind secure signing payload";

  it("1. should sign payload successfully", async () => {
    const result = await cryptoProvider.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
    });

    expect(result).toBeDefined();
    expect(result.signature).toBeDefined();
    expect(result.signature.length).toBeGreaterThan(0);
  });

  it("2. should generate a signature", async () => {
    const result = await cryptoProvider.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
    });

    expect(typeof result.signature).toBe("string");
    expect(result.signature.length).toBeGreaterThan(0);

    expect(result.algorithm).toBe(SignatureAlgorithm.ED25519);

    expect(result.keyId).toBeDefined();
    expect(result.keyVersion).toBe(1);
  });

  it("3. should verify correct payload successfully", async () => {
    const signed = await cryptoProvider.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
    });

    const result = await cryptoProvider.verifySignature({
      payload,
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion,
      context,
      encoding: signed.encoding,
    });

    expect(result.valid).toBe(true);
  });

  it("4. should reject wrong payload", async () => {
    const signed = await cryptoProvider.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
    });

    const result = await cryptoProvider.verifySignature({
      payload: "Wrong payload",
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion,
      context,
      encoding: signed.encoding,
    });

    expect(result.valid).toBe(false);
  });

  //   it("5. should reject modified signature", async () => {
  //     const signed = await cryptoProvider.sign({
  //       payload,
  //       algorithm: SignatureAlgorithm.ED25519,
  //       context,
  //     });

  //     const modifiedSignature =
  //       signed.signature.slice(0, -1) +
  //       (signed.signature.endsWith("A") ? "B" : "A");

  //     const result = await cryptoProvider.verifySignature({
  //       payload,
  //       signature: modifiedSignature,
  //       algorithm: SignatureAlgorithm.ED25519,
  //       keyId: signed.keyId,
  //       keyVersion: signed.keyVersion,
  //       context,
  //       encoding: signed.encoding,
  //     });

  //     expect(result.valid).toBe(false);
  //   });

  it("5. should reject modified signature", async () => {
    const signed = await cryptoProvider.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
    });

    const signatureBytes = Buffer.from(signed.signature, "base64");

    // Modify one actual signature byte
    signatureBytes[0] ^= 0xff;

    const modifiedSignature = signatureBytes.toString("base64");

    const result = await cryptoProvider.verifySignature({
      payload,
      signature: modifiedSignature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(result.valid).toBe(false);
  });
  it("6. should reject wrong keyId", async () => {
    const signed = await cryptoProvider.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
    });

    const result = await cryptoProvider.verifySignature({
      payload,
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: "wrong-key-id",
      keyVersion: signed.keyVersion,
      context,
      encoding: signed.encoding,
    });

    expect(result.valid).toBe(false);
  });

  it("7. should reject wrong keyVersion", async () => {
    const signed = await cryptoProvider.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
    });

    const result = await cryptoProvider.verifySignature({
      payload,
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signed.keyId,
      keyVersion: 999,
      context,
      encoding: signed.encoding,
    });

    expect(result.valid).toBe(false);
  });

  it("8. should generate a valid signature for the same payload", async () => {
    const signed = await cryptoProvider.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
    });

    const result = await cryptoProvider.verifySignature({
      payload,
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion,
      context,
      encoding: signed.encoding,
    });

    expect(result.valid).toBe(true);
  });

  it("9. should support HEX encoding", async () => {
    const signed = await cryptoProvider.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.HEX,
    });

    expect(signed.encoding).toBe(CryptoEncoding.HEX);

    expect(signed.signature).toMatch(/^[0-9a-f]+$/);

    // Ed25519 signature = 64 bytes = 128 hex characters.
    expect(signed.signature.length).toBe(128);

    const result = await cryptoProvider.verifySignature({
      payload,
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion,
      context,
      encoding: CryptoEncoding.HEX,
    });

    expect(result.valid).toBe(true);
  });

  it("10. should support BASE64 encoding", async () => {
    const signed = await cryptoProvider.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(signed.encoding).toBe(CryptoEncoding.BASE64);

    expect(signed.signature).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);

    // Ed25519 signature = 64 bytes = 88 Base64 characters.
    expect(signed.signature.length).toBe(88);

    const result = await cryptoProvider.verifySignature({
      payload,
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(result.valid).toBe(true);
  });

  it("11. should reject unsupported signature algorithm", async () => {
    await expect(
      cryptoProvider.sign({
        payload,
        algorithm: "UNSUPPORTED" as SignatureAlgorithm,
        context,
      }),
    ).rejects.toThrow("Unsupported signature algorithm");
  });
});
