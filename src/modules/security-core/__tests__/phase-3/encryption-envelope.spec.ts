import { describe, expect, it } from "vitest";

import {
  parseEncryptionEnvelope,
  serializeEncryptionEnvelope,
} from "../../utils/encryption-envelope.util.js";

import {
  CryptoEncoding,
  EncryptionAlgorithm,
} from "../../domain/enums/index.js";

describe("Phase 3 - Encryption Envelope", () => {
  const envelope = {
    version: 1,

    algorithm: EncryptionAlgorithm.AES_256_GCM,

    encoding: CryptoEncoding.BASE64,

    keyId: "key_phase3_test",

    keyVersion: 1,

    iv: "AAAAAAAAAAAAAAAA",

    authTag: "AAAAAAAAAAAAAAAAAAAAAA==",

    ciphertext: "VGhpcyBpcyBhIHRlc3Q=",
  };

  it("should serialize an encryption envelope", () => {
    const serialized = serializeEncryptionEnvelope(envelope);

    expect(typeof serialized).toBe("string");

    const parsed = JSON.parse(serialized);

    expect(parsed).toEqual(envelope);
  });

  it("should deserialize a valid encryption envelope", () => {
    const serialized = JSON.stringify(envelope);

    const result = parseEncryptionEnvelope(serialized);

    expect(result).toEqual(envelope);
  });

  it("should reject malformed JSON", () => {
    expect(() => parseEncryptionEnvelope("invalid-json")).toThrow();
  });

  it("should reject an invalid envelope", () => {
    expect(() =>
      parseEncryptionEnvelope(
        JSON.stringify({
          version: 1,
        }),
      ),
    ).toThrow();
  });

  it("should reject unsupported envelope version", () => {
    expect(() =>
      parseEncryptionEnvelope(
        JSON.stringify({
          ...envelope,
          version: 999,
        }),
      ),
    ).toThrow();
  });
});
