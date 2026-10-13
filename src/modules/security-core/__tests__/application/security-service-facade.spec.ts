import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  EncryptResult,
  DecryptResult,
} from "../../types/encryption.types.js";

import type {
  HashResult,
  VerifyHashResult,
} from "../../types/hashing.types.js";

import type {
  SignResult,
  VerifySignatureResult,
} from "../../types/signing.types.js";

import type {
  CreateHmacResult,
  VerifyHmacResult,
} from "../../types/hmac.types.js";

import { SecurityCoreError } from "../../errors/security-core.error.js";

import { SecurityServiceEncryptionApi } from "../../application/services/security-service-encryption-api.service.js";

import { SecurityServiceDecryptionApi } from "../../application/services/security-service-decryption-api.service.js";

import { SecurityServiceHashingApi } from "../../application/services/security-service-hashing-api.service.js";

import { SecurityServiceHashVerificationApi } from "../../application/services/security-service-hash-verification-api.service.js";

import { SecurityServiceSigningApi } from "../../application/services/security-service-signing-api.service.js";

import { SecurityServiceSignatureVerificationApi } from "../../application/services/security-service-signature-verification-api.service.js";

import { SecurityServiceHmacApi } from "../../application/services/security-service-hmac-api.service.js";

import { SecurityServiceHmacVerificationApi } from "../../application/services/security-service-hmac-verification-api.service.js";

import { SecurityServiceErrorHandlingService } from "../../application/services/security-service-error-handling.service.js";

import { SecurityServiceFacade } from "../../application/services/security-service.facade.js";

describe("SecurityServiceFacade", () => {
  const encrypt = vi.fn();
  const decrypt = vi.fn();
  const hash = vi.fn();
  const verifyHash = vi.fn();
  const sign = vi.fn();
  const verifySignature = vi.fn();
  const createHmac = vi.fn();
  const verifyHmac = vi.fn();

  let facade: SecurityServiceFacade;

  beforeEach(() => {
    vi.clearAllMocks();

    facade = new SecurityServiceFacade(
      { encrypt } as unknown as SecurityServiceEncryptionApi,
      { decrypt } as unknown as SecurityServiceDecryptionApi,
      { hash } as unknown as SecurityServiceHashingApi,
      { verifyHash } as unknown as SecurityServiceHashVerificationApi,
      { sign } as unknown as SecurityServiceSigningApi,
      { verifySignature } as unknown as SecurityServiceSignatureVerificationApi,
      { createHmac } as unknown as SecurityServiceHmacApi,
      { verifyHmac } as unknown as SecurityServiceHmacVerificationApi,
      new SecurityServiceErrorHandlingService(),
    );
  });

  it("exposes the eight public security operations", () => {
    expect(typeof facade.encrypt).toBe("function");
    expect(typeof facade.decrypt).toBe("function");
    expect(typeof facade.hash).toBe("function");
    expect(typeof facade.verifyHash).toBe("function");
    expect(typeof facade.sign).toBe("function");
    expect(typeof facade.verifySignature).toBe("function");
    expect(typeof facade.createHmac).toBe("function");
    expect(typeof facade.verifyHmac).toBe("function");
  });

  it("delegates encryption and returns its result", async () => {
    const request = { plaintext: "test" };
    const result = { ciphertext: "encrypted-value" };

    encrypt.mockResolvedValue(result);

    await expect(facade.encrypt(request as never)).resolves.toEqual(result);

    expect(encrypt).toHaveBeenCalledWith(request);
  });

  it("delegates decryption and returns its result", async () => {
    const request = { ciphertext: "encrypted-value" };
    const result = { plaintext: "test" };

    decrypt.mockResolvedValue(result);

    await expect(facade.decrypt(request as never)).resolves.toEqual(result);

    expect(decrypt).toHaveBeenCalledWith(request);
  });

  it("delegates hashing and returns its result", async () => {
    const request = { value: "test" };
    const result = { hash: "hashed-value" };

    hash.mockResolvedValue(result);

    await expect(facade.hash(request as never)).resolves.toEqual(result);

    expect(hash).toHaveBeenCalledWith(request);
  });

  it("delegates hash verification and returns its result", async () => {
    const request = { value: "test", hash: "hashed-value" };
    const result = { valid: true };

    verifyHash.mockResolvedValue(result);

    await expect(facade.verifyHash(request as never)).resolves.toEqual(result);

    expect(verifyHash).toHaveBeenCalledWith(request);
  });

  it("delegates signing and returns its result", async () => {
    const request = { payload: "test" };
    const result = { signature: "signature-value" };

    sign.mockResolvedValue(result);

    await expect(facade.sign(request as never)).resolves.toEqual(result);

    expect(sign).toHaveBeenCalledWith(request);
  });

  it("delegates signature verification and returns its result", async () => {
    const request = {
      payload: "test",
      signature: "signature-value",
    };

    const result = { valid: true };

    verifySignature.mockResolvedValue(result);

    await expect(facade.verifySignature(request as never)).resolves.toEqual(
      result,
    );

    expect(verifySignature).toHaveBeenCalledWith(request);
  });

  it("delegates HMAC creation and returns its result", async () => {
    const request = { payload: "test" };
    const result = {
      signature: "hmac-value",
      keyId: "key-1",
      keyVersion: 1,
    };

    createHmac.mockResolvedValue(result);

    await expect(facade.createHmac(request as never)).resolves.toEqual(result);

    expect(createHmac).toHaveBeenCalledWith(request);
  });

  it("delegates HMAC verification and returns its result", async () => {
    const request = {
      payload: "test",
      signature: "hmac-value",
    };

    const result = { valid: true };

    verifyHmac.mockResolvedValue(result);

    await expect(facade.verifyHmac(request as never)).resolves.toEqual(result);

    expect(verifyHmac).toHaveBeenCalledWith(request);
  });

  it("preserves an existing Security Core error", async () => {
    const originalError = new SecurityCoreError("Existing security failure", {
      code: "EXISTING_SECURITY_ERROR",
    });

    encrypt.mockRejectedValue(originalError);

    await expect(facade.encrypt({} as never)).rejects.toBe(originalError);
  });

  it("sanitizes an unexpected error", async () => {
    const secret = "SENSITIVE_SECRET_VALUE";

    encrypt.mockRejectedValue(new Error(`Unexpected failure: ${secret}`));

    let caughtError: unknown;

    try {
      await facade.encrypt({} as never);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(SecurityCoreError);

    const normalizedError = caughtError as SecurityCoreError;

    expect(normalizedError.code).toBe("SECURITY_SERVICE_ERROR");
    expect(normalizedError.message).toBe("Security service operation failed");
    expect(normalizedError.message).not.toContain(secret);
    expect(JSON.stringify(normalizedError)).not.toContain(secret);
  });
});
