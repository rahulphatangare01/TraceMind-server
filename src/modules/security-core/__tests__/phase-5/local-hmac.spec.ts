// import { describe, expect, it } from "vitest";

// import {
//   HmacAlgorithm,
//   SecurityScope,
//   DataClassification,
//   SecurityPurpose,
//   CryptoEncoding,
// } from "../../domain/enums/index.js";
// import { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";
// import { LocalHmacKeyProvider } from "../../providers/local/local-hmac-key.provider.js";

// describe("LocalCryptoProvider - HMAC", () => {
//   const hmacKeyProvider = new LocalHmacKeyProvider();

//   const cryptoProvider = new LocalCryptoProvider(undefined, hmacKeyProvider);

//   const context = {
//     scope: SecurityScope.ORGANIZATION,
//     organizationId: "org_test_001",
//     classification: DataClassification.SENSITIVE,
//     purpose: SecurityPurpose.HMAC,
//   };

//   const payload = "TraceMind secure payload";

//   it("1. should create HMAC successfully", async () => {
//     const result = await cryptoProvider.createHmac({
//       payload,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       context,
//     });

//     expect(result.signature).toBeDefined();
//     expect(result.signature.length).toBeGreaterThan(0);

//     expect(result.algorithm).toBe(HmacAlgorithm.HMAC_SHA_256);

//     expect(result.keyId).toBeDefined();
//     expect(result.keyVersion).toBe(1);
//   });

//   it("2. should verify correct payload", async () => {
//     const created = await cryptoProvider.createHmac({
//       payload,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       context,
//     });

//     const result = await cryptoProvider.verifyHmac({
//       payload,
//       signature: created.signature,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       keyId: created.keyId,
//       keyVersion: created.keyVersion,
//       context,
//       encoding: created.encoding,
//     });

//     expect(result.valid).toBe(true);
//   });

//   it("3. should reject wrong payload", async () => {
//     const created = await cryptoProvider.createHmac({
//       payload,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       context,
//     });

//     const result = await cryptoProvider.verifyHmac({
//       payload: "Wrong payload",
//       signature: created.signature,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       keyId: created.keyId,
//       keyVersion: created.keyVersion,
//       context,
//       encoding: created.encoding,
//     });

//     expect(result.valid).toBe(false);
//   });

//   it("4. should reject modified signature", async () => {
//     const created = await cryptoProvider.createHmac({
//       payload,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       context,
//     });

//     const modifiedSignature =
//       created.signature.slice(0, -1) +
//       (created.signature.endsWith("A") ? "B" : "A");

//     const result = await cryptoProvider.verifyHmac({
//       payload,
//       signature: modifiedSignature,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       keyId: created.keyId,
//       keyVersion: created.keyVersion,
//       context,
//       encoding: created.encoding,
//     });

//     expect(result.valid).toBe(false);
//   });

//   it("5. should reject wrong keyId", async () => {
//     const created = await cryptoProvider.createHmac({
//       payload,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       context,
//     });

//     const result = await cryptoProvider.verifyHmac({
//       payload,
//       signature: created.signature,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       keyId: "wrong-key-id",
//       keyVersion: created.keyVersion,
//       context,
//       encoding: created.encoding,
//     });

//     expect(result.valid).toBe(false);
//   });

//   it("6. should reject wrong keyVersion", async () => {
//     const created = await cryptoProvider.createHmac({
//       payload,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       context,
//     });

//     const result = await cryptoProvider.verifyHmac({
//       payload,
//       signature: created.signature,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       keyId: created.keyId,
//       keyVersion: 999,
//       context,
//       encoding: created.encoding,
//     });

//     expect(result.valid).toBe(false);
//   });

//   it("7. should generate same HMAC for same payload and same key", async () => {
//     const first = await cryptoProvider.createHmac({
//       payload,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       context,
//     });

//     const second = await cryptoProvider.createHmac({
//       payload,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       context,
//     });

//     expect(first.signature).toBe(second.signature);
//     expect(first.keyId).toBe(second.keyId);
//     expect(first.keyVersion).toBe(second.keyVersion);
//   });

//   it("8. should generate different HMAC for different payload", async () => {
//     const first = await cryptoProvider.createHmac({
//       payload,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       context,
//     });

//     const second = await cryptoProvider.createHmac({
//       payload: "Different payload",
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       context,
//     });

//     expect(first.signature).not.toBe(second.signature);
//   });

//   it("9. should create and verify HMAC using HEX encoding", async () => {
//     const created = await cryptoProvider.createHmac({
//       payload,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       context,
//       encoding: CryptoEncoding.HEX,
//     });

//     expect(created.encoding).toBe(CryptoEncoding.HEX);

//     expect(created.signature).toMatch(/^[0-9a-f]{64}$/);

//     const result = await cryptoProvider.verifyHmac({
//       payload,
//       signature: created.signature,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       keyId: created.keyId,
//       keyVersion: created.keyVersion,
//       context,
//       encoding: CryptoEncoding.HEX,
//     });

//     expect(result.valid).toBe(true);
//   });

//   it("10. should create and verify HMAC using BASE64 encoding", async () => {
//     const created = await cryptoProvider.createHmac({
//       payload,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       context,
//       encoding: CryptoEncoding.BASE64,
//     });

//     expect(created.encoding).toBe(CryptoEncoding.BASE64);

//     expect(created.signature).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);

//     expect(created.signature.length).toBe(44);

//     const result = await cryptoProvider.verifyHmac({
//       payload,
//       signature: created.signature,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       keyId: created.keyId,
//       keyVersion: created.keyVersion,
//       context,
//       encoding: CryptoEncoding.BASE64,
//     });

//     expect(result.valid).toBe(true);
//   });
// });

import { describe, expect, it } from "vitest";

import {
  CryptoEncoding,
  DataClassification,
  HmacAlgorithm,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";
import { LocalHmacKeyProvider } from "../../providers/local/local-hmac-key.provider.js";

describe("LocalCryptoProvider - HMAC-SHA-256", () => {
  const hmacKeyProvider = new LocalHmacKeyProvider();

  const cryptoProvider = new LocalCryptoProvider(undefined, hmacKeyProvider);

  const context = {
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org_hmac_test_001",
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.HMAC,
  };

  const payload = "TraceMind secure HMAC payload";

  it("1. should create HMAC successfully", async () => {
    const result = await cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
    });

    expect(result).toBeDefined();
    expect(result.signature).toBeDefined();
    expect(result.signature.length).toBeGreaterThan(0);

    expect(result.algorithm).toBe(HmacAlgorithm.HMAC_SHA_256);

    expect(result.keyId).toBeDefined();
    expect(result.keyVersion).toBe(1);
  });

  it("2. should verify correct payload", async () => {
    const created = await cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
    });

    const result = await cryptoProvider.verifyHmac({
      payload,
      signature: created.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: created.keyId,
      keyVersion: created.keyVersion,
      context,
      encoding: created.encoding,
    });

    expect(result.valid).toBe(true);
  });

  it("3. should reject wrong payload", async () => {
    const created = await cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
    });

    const result = await cryptoProvider.verifyHmac({
      payload: "Wrong payload",
      signature: created.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: created.keyId,
      keyVersion: created.keyVersion,
      context,
      encoding: created.encoding,
    });

    expect(result.valid).toBe(false);
  });

  it("4. should reject modified signature", async () => {
    const created = await cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
    });

    const modifiedSignature =
      created.signature.slice(0, -1) +
      (created.signature.endsWith("A") ? "B" : "A");

    const result = await cryptoProvider.verifyHmac({
      payload,
      signature: modifiedSignature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: created.keyId,
      keyVersion: created.keyVersion,
      context,
      encoding: created.encoding,
    });

    expect(result.valid).toBe(false);
  });

  it("5. should reject wrong keyId", async () => {
    const created = await cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
    });

    const result = await cryptoProvider.verifyHmac({
      payload,
      signature: created.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: "wrong-key-id",
      keyVersion: created.keyVersion,
      context,
      encoding: created.encoding,
    });

    expect(result.valid).toBe(false);
  });

  it("6. should reject wrong keyVersion", async () => {
    const created = await cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
    });

    const result = await cryptoProvider.verifyHmac({
      payload,
      signature: created.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: created.keyId,
      keyVersion: 999,
      context,
      encoding: created.encoding,
    });

    expect(result.valid).toBe(false);
  });

  it("7. should generate same HMAC for same payload and same key", async () => {
    const first = await cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
    });

    const second = await cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
    });

    expect(first.signature).toBe(second.signature);

    expect(first.keyId).toBe(second.keyId);

    expect(first.keyVersion).toBe(second.keyVersion);
  });

  it("8. should generate different HMAC for different payload", async () => {
    const first = await cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
    });

    const second = await cryptoProvider.createHmac({
      payload: "Different payload",
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
    });

    expect(first.signature).not.toBe(second.signature);
  });

  it("9. should support HEX encoding", async () => {
    const created = await cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
      encoding: CryptoEncoding.HEX,
    });

    expect(created.encoding).toBe(CryptoEncoding.HEX);

    expect(created.signature).toMatch(/^[0-9a-f]+$/);

    // SHA-256 HMAC = 32 bytes = 64 hex characters.
    expect(created.signature.length).toBe(64);

    const result = await cryptoProvider.verifyHmac({
      payload,
      signature: created.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: created.keyId,
      keyVersion: created.keyVersion,
      context,
      encoding: CryptoEncoding.HEX,
    });

    expect(result.valid).toBe(true);
  });

  it("10. should support BASE64 encoding", async () => {
    const created = await cryptoProvider.createHmac({
      payload,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(created.encoding).toBe(CryptoEncoding.BASE64);

    expect(created.signature).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);

    // SHA-256 HMAC = 32 bytes = 44 Base64 characters.
    expect(created.signature.length).toBe(44);

    const result = await cryptoProvider.verifyHmac({
      payload,
      signature: created.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: created.keyId,
      keyVersion: created.keyVersion,
      context,
      encoding: CryptoEncoding.BASE64,
    });

    expect(result.valid).toBe(true);
  });

  it("11. should reject unsupported HMAC algorithm", async () => {
    await expect(
      cryptoProvider.createHmac({
        payload,
        algorithm: "UNSUPPORTED" as HmacAlgorithm,
        context,
      }),
    ).rejects.toThrow("Unsupported HMAC algorithm");
  });
});
