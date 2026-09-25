import { describe, expect, it } from "vitest";

import {
  CryptoEncoding,
  DataClassification,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
} from "../../../domain/enums/index.js";

import type { SecurityContext } from "../../../domain/models/security-context.js";

import { LocalCryptoProvider } from "../../../providers/local/local-crypto.provider.js";
import { LocalSigningKeyProvider } from "../../../providers/local/local-signing-key.provider.js";

describe("Phase 8.9 - Local Signing Integration", () => {
  const organizationId = "org-phase-8-9";

  const createContext = (): SecurityContext => ({
    scope: SecurityScope.ORGANIZATION,
    organizationId,
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.SIGNING,
  });

  const createCryptoProvider = () => {
    const signingKeyProvider = new LocalSigningKeyProvider();

    const cryptoProvider = new LocalCryptoProvider(signingKeyProvider);

    return {
      signingKeyProvider,
      cryptoProvider,
    };
  };

  it("should generate Ed25519 signature successfully", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const result = await cryptoProvider.sign({
      payload: "TraceMind signing test",
      algorithm: SignatureAlgorithm.ED25519,
      context: createContext(),
      encoding: CryptoEncoding.BASE64,
    });

    expect(result).toBeDefined();
    expect(result.signature).toBeDefined();
    expect(typeof result.signature).toBe("string");
    expect(result.signature.length).toBeGreaterThan(0);
    expect(result.algorithm).toBe(SignatureAlgorithm.ED25519);
    expect(result.encoding).toBe(CryptoEncoding.BASE64);
    expect(result.keyId).toBeDefined();
    expect(result.keyVersion).toBe(1);
  });

  it("should verify a valid Ed25519 signature successfully", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const payload = "TraceMind signing verification";
    const context = createContext();

    const signed = await cryptoProvider.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const verification = await cryptoProvider.verifySignature({
      payload,
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verification.valid).toBe(true);
  });

  it("should reject a signature for a modified payload", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const context = createContext();

    const signed = await cryptoProvider.sign({
      payload: "TraceMind original payload",
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const verification = await cryptoProvider.verifySignature({
      payload: "TraceMind modified payload",
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verification.valid).toBe(false);
  });

  it("should reject a tampered Ed25519 signature", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const payload = "TraceMind signature tamper test";
    const context = createContext();

    const signed = await cryptoProvider.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const signatureBuffer = Buffer.from(signed.signature, "base64");

    signatureBuffer[0] = signatureBuffer[0] ^ 0xff;

    const tamperedSignature = signatureBuffer.toString("base64");

    const verification = await cryptoProvider.verifySignature({
      payload,
      signature: tamperedSignature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verification.valid).toBe(false);
  });

  //   it("should reject a signature with a different security context", async () => {
  //     const { cryptoProvider } = createCryptoProvider();

  //     const context = createContext();

  //     const signed = await cryptoProvider.sign({
  //       payload: "TraceMind context protected signature",
  //       algorithm: SignatureAlgorithm.ED25519,
  //       context,
  //       encoding: CryptoEncoding.BASE64,
  //     });

  //     const wrongContext: SecurityContext = {
  //       ...context,
  //       organizationId: "different-organization",
  //     };

  //     const verification = await cryptoProvider.verifySignature({
  //       payload: "TraceMind context protected signature",
  //       signature: signed.signature,
  //       algorithm: SignatureAlgorithm.ED25519,
  //       keyId: signed.keyId,
  //       keyVersion: signed.keyVersion,
  //       context: wrongContext,
  //       encoding: CryptoEncoding.BASE64,
  //     });

  //     expect(verification.valid).toBe(false);
  //   });

  it("should produce different signatures for different payloads", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const context = createContext();

    const first = await cryptoProvider.sign({
      payload: "TraceMind payload one",
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const second = await cryptoProvider.sign({
      payload: "TraceMind payload two",
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(first.signature).not.toBe(second.signature);
  });

  it("should preserve signing key identity", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const context = createContext();

    const first = await cryptoProvider.sign({
      payload: "TraceMind key identity one",
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const second = await cryptoProvider.sign({
      payload: "TraceMind key identity two",
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(first.keyId).toBe(second.keyId);
    expect(first.keyVersion).toBe(second.keyVersion);
  });

  it("should verify multiple signatures created by the same local key", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const context = createContext();

    const firstPayload = "TraceMind first signed value";
    const secondPayload = "TraceMind second signed value";

    const first = await cryptoProvider.sign({
      payload: firstPayload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const second = await cryptoProvider.sign({
      payload: secondPayload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const firstVerification = await cryptoProvider.verifySignature({
      payload: firstPayload,
      signature: first.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: first.keyId,
      keyVersion: first.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const secondVerification = await cryptoProvider.verifySignature({
      payload: secondPayload,
      signature: second.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: second.keyId,
      keyVersion: second.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(firstVerification.valid).toBe(true);
    expect(secondVerification.valid).toBe(true);
  });

  it("should reject verification with an unknown key ID", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const context = createContext();

    const signed = await cryptoProvider.sign({
      payload: "TraceMind unknown key test",
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const verification = await cryptoProvider.verifySignature({
      payload: "TraceMind unknown key test",
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: "unknown-key-id",
      keyVersion: signed.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verification.valid).toBe(false);
  });

  it("should reject verification with an invalid key version", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const context = createContext();

    const signed = await cryptoProvider.sign({
      payload: "TraceMind invalid version test",
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const verification = await cryptoProvider.verifySignature({
      payload: "TraceMind invalid version test",
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion + 1,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verification.valid).toBe(false);
  });

  it("should preserve Unicode payload signing", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const payload = "TraceMind सुरक्षित 🔐";
    const context = createContext();

    const signed = await cryptoProvider.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const verification = await cryptoProvider.verifySignature({
      payload,
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verification.valid).toBe(true);
  });

  it("should produce the expected Ed25519 signature length", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const result = await cryptoProvider.sign({
      payload: "TraceMind signature length test",
      algorithm: SignatureAlgorithm.ED25519,
      context: createContext(),
      encoding: CryptoEncoding.BASE64,
    });

    const signatureBuffer = Buffer.from(result.signature, "base64");

    expect(signatureBuffer.length).toBe(64);
  });
});
