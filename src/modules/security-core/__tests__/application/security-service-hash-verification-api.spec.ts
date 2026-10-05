import { beforeEach, describe, expect, it, vi } from "vitest";

import { SecurityServiceHashVerificationApi } from "../../application/services/security-service-hash-verification-api.service.js";

import type { CryptoProvider } from "../../application/interfaces/crypto.provider.interface.js";

import type { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";

import { CryptoEncoding, HashAlgorithm } from "../../domain/enums/index.js";

describe("SecurityServiceHashVerificationApi", () => {
  let service: SecurityServiceHashVerificationApi;

  const cryptoProvider = {
    verifyHash: vi.fn(),
  };

  const validationService = {
    validateVerifyHashRequest: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    cryptoProvider.verifyHash.mockResolvedValue({
      valid: true,
    });

    service = new SecurityServiceHashVerificationApi(
      cryptoProvider as unknown as CryptoProvider,
      validationService as unknown as SecurityServiceValidationService,
    );
  });

  it("validates the request before hash verification", async () => {
    const request = {
      value: "TraceMind hash verification test",
      hash: "mock-hash",
      algorithm: HashAlgorithm.SHA_256,
    };

    await service.verifyHash(request);

    expect(validationService.validateVerifyHashRequest).toHaveBeenCalledWith(
      request,
    );

    expect(cryptoProvider.verifyHash).toHaveBeenCalledWith(request);
  });

  it("returns valid true when the provider verifies the hash", async () => {
    const request = {
      value: "TraceMind hash verification test",
      hash: "mock-hash",
      algorithm: HashAlgorithm.SHA_256,
    };

    await expect(service.verifyHash(request)).resolves.toEqual({
      valid: true,
    });
  });

  it("returns valid false when the provider rejects the hash", async () => {
    cryptoProvider.verifyHash.mockResolvedValue({
      valid: false,
    });

    const request = {
      value: "TraceMind invalid value",
      hash: "mock-hash",
      algorithm: HashAlgorithm.SHA_256,
    };

    await expect(service.verifyHash(request)).resolves.toEqual({
      valid: false,
    });
  });

  it("supports explicit encoding", async () => {
    const request = {
      value: "TraceMind hash verification test",
      hash: "mock-hash",
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.BASE64,
    };

    await service.verifyHash(request);

    expect(cryptoProvider.verifyHash).toHaveBeenCalledWith(request);
  });

  it("does not call the provider when validation fails", async () => {
    validationService.validateVerifyHashRequest.mockImplementation(() => {
      throw new Error("Unsupported hash algorithm.");
    });

    await expect(
      service.verifyHash({
        value: "TraceMind invalid algorithm",
        hash: "mock-hash",
        algorithm: "INVALID" as HashAlgorithm,
      }),
    ).rejects.toThrow("Unsupported hash algorithm.");

    expect(cryptoProvider.verifyHash).not.toHaveBeenCalled();
  });

  it("propagates provider errors", async () => {
    cryptoProvider.verifyHash.mockRejectedValue(
      new Error("Hash verification provider failed."),
    );

    const request = {
      value: "TraceMind hash verification test",
      hash: "mock-hash",
      algorithm: HashAlgorithm.SHA_256,
    };

    await expect(service.verifyHash(request)).rejects.toThrow(
      "Hash verification provider failed.",
    );
  });
});
