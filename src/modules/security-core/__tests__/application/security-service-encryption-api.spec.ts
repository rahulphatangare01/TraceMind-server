import { beforeEach, describe, expect, it, vi } from "vitest";

import { SecurityServiceEncryptionApi } from "../../application/services/security-service-encryption-api.service.js";
import type { EncryptionService } from "../../application/services/encryption.service.js";
import type { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";
import type { EncryptRequest } from "../../types/encryption.types.js";

describe("SecurityServiceEncryptionApi", () => {
  let encryptionService: {
    encrypt: ReturnType<typeof vi.fn>;
  };

  let validationService: {
    validateEncryptRequest: ReturnType<typeof vi.fn>;
  };

  let service: SecurityServiceEncryptionApi;

  const request = {
    plaintext: "sensitive-value",
    keyId: "test-key",
    context: {} as EncryptRequest["context"],
  } satisfies EncryptRequest;

  const envelope = {
    version: 1,
    algorithm: "AES-256-GCM",
    encoding: "BASE64",
    keyId: "test-key",
    keyVersion: 2,
    iv: "test-iv",
    authTag: "test-auth-tag",
    ciphertext: "encrypted-value",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    encryptionService = {
      encrypt: vi.fn().mockResolvedValue(JSON.stringify(envelope)),
    };

    validationService = {
      validateEncryptRequest: vi.fn(),
    };

    service = new SecurityServiceEncryptionApi(
      encryptionService as unknown as EncryptionService,
      validationService as unknown as SecurityServiceValidationService,
    );
  });

  it("should validate request and return structured encryption result", async () => {
    const result = await service.encrypt(request);

    expect(validationService.validateEncryptRequest).toHaveBeenCalledWith(
      request,
    );

    expect(encryptionService.encrypt).toHaveBeenCalledWith(
      request.plaintext,
      request.context,
      request.keyId,
    );

    expect(result).toEqual({
      ciphertext: "encrypted-value",
      algorithm: "AES-256-GCM",
      encoding: "BASE64",
      iv: "test-iv",
      authTag: "test-auth-tag",
      keyId: "test-key",
      keyVersion: 2,
    });
  });

  it("should not call encryption when request validation fails", async () => {
    const validationError = new Error("Invalid encryption request");

    validationService.validateEncryptRequest.mockImplementation(() => {
      throw validationError;
    });

    await expect(service.encrypt(request)).rejects.toThrow(
      "Invalid encryption request",
    );

    expect(encryptionService.encrypt).not.toHaveBeenCalled();
  });

  it("should propagate encryption service errors", async () => {
    encryptionService.encrypt.mockRejectedValue(new Error("Encryption failed"));

    await expect(service.encrypt(request)).rejects.toThrow("Encryption failed");

    expect(validationService.validateEncryptRequest).toHaveBeenCalledWith(
      request,
    );
  });

  it("should reject an invalid serialized encryption envelope", async () => {
    encryptionService.encrypt.mockResolvedValue("not-valid-json");

    await expect(service.encrypt(request)).rejects.toThrow();
  });
});
