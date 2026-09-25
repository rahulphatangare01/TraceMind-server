import { describe, expect, it } from "vitest";

import {
  CryptoEncoding,
  DataClassification,
  HmacAlgorithm,
  SecurityPurpose,
  SecurityScope,
} from "../../../domain/enums/index.js";

import type { SecurityContext } from "../../../domain/models/security-context.js";

import { LocalCryptoProvider } from "../../../providers/local/local-crypto.provider.js";
import { LocalHmacKeyProvider } from "../../../providers/local/local-hmac-key.provider.js";

describe("Phase 8.10 - Local HMAC Integration", () => {
  const organizationId = "org-phase-8-10";

  const createContext = (): SecurityContext => ({
    scope: SecurityScope.ORGANIZATION,
    organizationId,
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.HMAC,
  });

  const createCryptoProvider = () => {
    const hmacKeyProvider = new LocalHmacKeyProvider();

    const cryptoProvider = new LocalCryptoProvider(undefined, hmacKeyProvider);

    return {
      hmacKeyProvider,
      cryptoProvider,
    };
  };

  it("should generate HMAC-SHA-256 successfully", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const result = await cryptoProvider.createHmac({
      payload: "TraceMind HMAC test",
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context: createContext(),
      encoding: CryptoEncoding.BASE64,
    });

    expect(result).toBeDefined();
    expect(result.signature).toBeDefined();
    expect(typeof result.signature).toBe("string");
    expect(result.signature.length).toBeGreaterThan(0);
    expect(result.algorithm).toBe(HmacAlgorithm.HMAC_SHA_256);
    expect(result.encoding).toBe(CryptoEncoding.BASE64);
    expect(result.keyId).toBeDefined();
    expect(result.keyVersion).toBe(1);
  });

  it("should verify a valid HMAC successfully", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const payload = "TraceMind HMAC verification";
    const context = createContext();

    const result = await cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const verification = await cryptoProvider.verifyHmac({
      payload,
      signature: result.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: result.keyId,
      keyVersion: result.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verification.valid).toBe(true);
  });

  it("should reject HMAC verification for a modified payload", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const context = createContext();

    const result = await cryptoProvider.createHmac({
      payload: "TraceMind original payload",
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const verification = await cryptoProvider.verifyHmac({
      payload: "TraceMind modified payload",
      signature: result.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: result.keyId,
      keyVersion: result.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verification.valid).toBe(false);
  });

  it("should reject a tampered HMAC", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const payload = "TraceMind HMAC tamper test";
    const context = createContext();

    const result = await cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const signatureBuffer = Buffer.from(result.signature, "base64");

    signatureBuffer[0] = signatureBuffer[0] ^ 0xff;

    const tamperedSignature = signatureBuffer.toString("base64");

    const verification = await cryptoProvider.verifyHmac({
      payload,
      signature: tamperedSignature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: result.keyId,
      keyVersion: result.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verification.valid).toBe(false);
  });

  it("should preserve HMAC key identity", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const context = createContext();

    const first = await cryptoProvider.createHmac({
      payload: "TraceMind first HMAC",
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const second = await cryptoProvider.createHmac({
      payload: "TraceMind second HMAC",
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(first.keyId).toBe(second.keyId);
    expect(first.keyVersion).toBe(second.keyVersion);
  });

  it("should verify multiple HMACs created by the same local key", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const context = createContext();

    const firstPayload = "TraceMind first HMAC value";
    const secondPayload = "TraceMind second HMAC value";

    const first = await cryptoProvider.createHmac({
      payload: firstPayload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const second = await cryptoProvider.createHmac({
      payload: secondPayload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const firstVerification = await cryptoProvider.verifyHmac({
      payload: firstPayload,
      signature: first.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: first.keyId,
      keyVersion: first.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const secondVerification = await cryptoProvider.verifyHmac({
      payload: secondPayload,
      signature: second.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
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

    const result = await cryptoProvider.createHmac({
      payload: "TraceMind unknown key test",
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const verification = await cryptoProvider.verifyHmac({
      payload: "TraceMind unknown key test",
      signature: result.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: "unknown-key-id",
      keyVersion: result.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verification.valid).toBe(false);
  });

  it("should reject verification with an invalid key version", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const context = createContext();

    const result = await cryptoProvider.createHmac({
      payload: "TraceMind invalid version test",
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const verification = await cryptoProvider.verifyHmac({
      payload: "TraceMind invalid version test",
      signature: result.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: result.keyId,
      keyVersion: result.keyVersion + 1,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verification.valid).toBe(false);
  });

  it("should preserve Unicode payload", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const payload = "TraceMind सुरक्षित 🔐";
    const context = createContext();

    const result = await cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    const verification = await cryptoProvider.verifyHmac({
      payload,
      signature: result.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: result.keyId,
      keyVersion: result.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(verification.valid).toBe(true);
  });

  it("should produce the expected HMAC-SHA-256 length", async () => {
    const { cryptoProvider } = createCryptoProvider();

    const result = await cryptoProvider.createHmac({
      payload: "TraceMind HMAC length test",
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context: createContext(),
      encoding: CryptoEncoding.BASE64,
    });

    const signatureBuffer = Buffer.from(result.signature, "base64");

    expect(signatureBuffer.length).toBe(32);
  });
});
