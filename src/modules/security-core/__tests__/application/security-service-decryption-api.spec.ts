import { beforeEach, describe, expect, it, vi } from "vitest";

import { SecurityServiceDecryptionApi } from "../../application/services/security-service-decryption-api.service.js";
import type { EncryptionService } from "../../application/services/encryption.service.js";
import type { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";

import {
  CryptoEncoding,
  EncryptionAlgorithm,
  SecurityPurpose,
  SecurityScope,
  DataClassification,
} from "../../domain/enums/index.js";

import type { DecryptRequest } from "../../types/encryption.types.js";
import { parseEncryptionEnvelope } from "../../utils/encryption-envelope.util.js";

describe("SecurityServiceDecryptionApi", () => {
  let encryptionService: {
    decrypt: ReturnType<typeof vi.fn>;
  };

  let validationService: {
    validateDecryptRequest: ReturnType<typeof vi.fn>;
  };

  let service: SecurityServiceDecryptionApi;

  const request: DecryptRequest = {
    ciphertext: "encrypted-value",
    algorithm: EncryptionAlgorithm.AES_256_GCM,
    encoding: CryptoEncoding.BASE64,
    iv: "test-iv",
    authTag: "test-auth-tag",
    keyId: "test-key",
    keyVersion: 2,
    context: {
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-test",
      classification: DataClassification.CONFIDENTIAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    encryptionService = {
      decrypt: vi.fn().mockResolvedValue("decrypted-plaintext"),
    };

    validationService = {
      validateDecryptRequest: vi.fn(),
    };

    service = new SecurityServiceDecryptionApi(
      encryptionService as unknown as EncryptionService,
      validationService as unknown as SecurityServiceValidationService,
    );
  });

  it("validates request and returns decrypted plaintext", async () => {
    const result = await service.decrypt(request);

    expect(validationService.validateDecryptRequest).toHaveBeenCalledWith(
      request,
    );

    expect(encryptionService.decrypt).toHaveBeenCalledTimes(1);

    const [serializedEnvelope, context] = encryptionService.decrypt.mock
      .calls[0] as [string, unknown];

    expect(parseEncryptionEnvelope(serializedEnvelope)).toEqual({
      version: 1,
      ciphertext: request.ciphertext,
      algorithm: request.algorithm,
      encoding: request.encoding,
      iv: request.iv,
      authTag: request.authTag,
      keyId: request.keyId,
      keyVersion: request.keyVersion,
    });

    expect(context).toBe(request.context);
    expect(result).toEqual({ plaintext: "decrypted-plaintext" });
  });

  it("does not call decryption when validation fails", async () => {
    validationService.validateDecryptRequest.mockImplementation(() => {
      throw new Error("Invalid decryption request");
    });

    await expect(service.decrypt(request)).rejects.toThrow(
      "Invalid decryption request",
    );

    expect(encryptionService.decrypt).not.toHaveBeenCalled();
  });

  it("propagates decryption errors", async () => {
    encryptionService.decrypt.mockRejectedValue(new Error("Decryption failed"));

    await expect(service.decrypt(request)).rejects.toThrow("Decryption failed");

    expect(validationService.validateDecryptRequest).toHaveBeenCalledWith(
      request,
    );
  });

  it("rejects an invalid envelope before calling the decryption service", async () => {
    const invalidRequest = {
      ...request,
      keyVersion: 0,
    } as DecryptRequest;

    await expect(service.decrypt(invalidRequest)).rejects.toThrow();

    // Request validation should reject the invalid key version.
    expect(validationService.validateDecryptRequest).toHaveBeenCalledWith(
      invalidRequest,
    );

    expect(encryptionService.decrypt).not.toHaveBeenCalled();
  });
});
