import { describe, expect, it } from "vitest";

import type {
  EncryptRequest,
  EncryptResult,
  DecryptRequest,
  DecryptResult,
} from "../../types/security-service.types";

import type {
  HashRequest,
  HashResult,
  VerifyHashRequest,
  VerifyHashResult,
} from "../../types/security-service.types.js";

import type {
  SignRequest,
  SignResult,
  VerifySignatureRequest,
  VerifySignatureResult,
} from "../../types/security-service.types.js";

import type {
  CreateHmacRequest,
  CreateHmacResult,
  VerifyHmacRequest,
  VerifyHmacResult,
} from "../../types/security-service.types.js";

describe("SecurityService Types", () => {
  it("should expose encryption request/result types", () => {
    const encryptRequest: Partial<EncryptRequest> = {
      plaintext: "test",
    };

    const encryptResult: Partial<EncryptResult> = {
      ciphertext: "ciphertext",
    };

    const decryptRequest: Partial<DecryptRequest> = {
      ciphertext: "ciphertext",
    };

    const decryptResult: Partial<DecryptResult> = {
      plaintext: "test",
    };

    expect(encryptRequest.plaintext).toBe("test");
    expect(encryptResult.ciphertext).toBe("ciphertext");
    expect(decryptRequest.ciphertext).toBe("ciphertext");
    expect(decryptResult.plaintext).toBe("test");
  });

  it("should expose hashing request/result types", () => {
    const hashRequest: Partial<HashRequest> = {
      value: "test",
    };

    const hashResult: Partial<HashResult> = {
      hash: "hash",
    };

    const verifyRequest: Partial<VerifyHashRequest> = {
      value: "test",
      hash: "hash",
    };

    const verifyResult: Partial<VerifyHashResult> = {
      valid: true,
    };

    expect(hashRequest.value).toBe("test");
    expect(hashResult.hash).toBe("hash");
    expect(verifyRequest.hash).toBe("hash");
    expect(verifyResult.valid).toBe(true);
  });

  it("should expose signing request/result types", () => {
    const signRequest: Partial<SignRequest> = {
      payload: "payload",
    };

    const signResult: Partial<SignResult> = {
      signature: "signature",
    };

    const verifyRequest: Partial<VerifySignatureRequest> = {
      payload: "payload",
      signature: "signature",
    };

    const verifyResult: Partial<VerifySignatureResult> = {
      valid: true,
    };

    expect(signRequest.payload).toBe("payload");
    expect(signResult.signature).toBe("signature");
    expect(verifyRequest.signature).toBe("signature");
    expect(verifyResult.valid).toBe(true);
  });

  it("should expose HMAC request/result types", () => {
    const createRequest: Partial<CreateHmacRequest> = {
      payload: "payload",
    };

    const createResult: Partial<CreateHmacResult> = {
      signature: "signature",
    };

    const verifyRequest: Partial<VerifyHmacRequest> = {
      payload: "payload",
      signature: "signature",
    };

    const verifyResult: Partial<VerifyHmacResult> = {
      valid: true,
    };

    expect(createRequest.payload).toBe("payload");
    expect(createResult.signature).toBe("signature");
    expect(verifyRequest.signature).toBe("signature");
    expect(verifyResult.valid).toBe(true);
  });
});
