import { beforeEach, describe, expect, it, vi } from "vitest";

import { SecurityServiceHashingApi } from "../../application/services/security-service-hashing-api.service.js";
import type { CryptoProvider } from "../../application/interfaces/crypto.provider.interface.js";
import type { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";

import { CryptoEncoding, HashAlgorithm } from "../../domain/enums/index.js";

describe("SecurityServiceHashingApi", () => {
  let service: SecurityServiceHashingApi;

  const hashResult = {
    hash: "mock-hash-value",
    algorithm: HashAlgorithm.SHA_256,
    encoding: CryptoEncoding.HEX,
  };

  const cryptoProvider = {
    hash: vi.fn(),
  };

  const validationService = {
    validateHashRequest: vi.fn(),
  };

  beforeEach(() => {
    // vi.clearAllMocks();

    // cryptoProvider.hash.mockResolvedValue(hashResult);
    vi.resetAllMocks();

    cryptoProvider.hash.mockResolvedValue(hashResult);
    service = new SecurityServiceHashingApi(
      cryptoProvider as unknown as CryptoProvider,
      validationService as unknown as SecurityServiceValidationService,
    );
  });

  it("validates the request before hashing", async () => {
    const request = {
      value: "TraceMind hashing test",
      algorithm: HashAlgorithm.SHA_256,
    };

    await service.hash(request);

    expect(validationService.validateHashRequest).toHaveBeenCalledWith(request);
    expect(cryptoProvider.hash).toHaveBeenCalledWith(request);
  });

  it("returns the provider hash result", async () => {
    const request = {
      value: "TraceMind hashing test",
      algorithm: HashAlgorithm.SHA_256,
    };

    await expect(service.hash(request)).resolves.toEqual(hashResult);
  });

  it("supports an explicit encoding", async () => {
    const request = {
      value: "TraceMind hashing test",
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.BASE64,
    };

    await service.hash(request);

    expect(cryptoProvider.hash).toHaveBeenCalledWith(request);
  });

  it("does not call the provider when validation fails", async () => {
    validationService.validateHashRequest.mockImplementation(() => {
      throw new Error("Unsupported hash algorithm.");
    });

    await expect(
      service.hash({
        value: "TraceMind hashing test",
        algorithm: "INVALID" as HashAlgorithm,
      }),
    ).rejects.toThrow("Unsupported hash algorithm.");

    expect(cryptoProvider.hash).not.toHaveBeenCalled();
  });

  it("propagates provider errors", async () => {
    cryptoProvider.hash.mockRejectedValue(new Error("Hash provider failed."));

    await expect(
      service.hash({
        value: "TraceMind hashing test",
        algorithm: HashAlgorithm.SHA_256,
      }),
    ).rejects.toThrow("Hash provider failed.");
  });

  it("does not return the original plaintext as the hash", async () => {
    const value = "TraceMind sensitive value";

    const result = await service.hash({
      value,
      algorithm: HashAlgorithm.SHA_256,
    });

    expect(result.hash).not.toContain(value);
  });
});
