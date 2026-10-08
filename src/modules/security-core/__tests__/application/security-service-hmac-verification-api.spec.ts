import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CryptoEncoding,
  DataClassification,
  HmacAlgorithm,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import type {
  VerifyHmacRequest,
  VerifyHmacResult,
} from "../../types/hmac.types.js";

import type { CryptoProvider } from "../../application/interfaces/crypto.provider.interface.js";

import { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";

import { SecurityServiceHmacVerificationApi } from "../../application/services/security-service-hmac-verification-api.service.js";

describe("SecurityServiceHmacVerificationApi", () => {
  const verifyHmacMock =
    vi.fn<(request: VerifyHmacRequest) => Promise<VerifyHmacResult>>();

  const validateVerifyHmacRequestMock =
    vi.fn<(request: VerifyHmacRequest) => void>();

  const cryptoProvider = {
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    hash: vi.fn(),
    verifyHash: vi.fn(),
    sign: vi.fn(),
    verifySignature: vi.fn(),
    createHmac: vi.fn(),
    verifyHmac: verifyHmacMock,
  } as unknown as CryptoProvider;

  const validationService = {
    validateVerifyHmacRequest: validateVerifyHmacRequestMock,
  } as unknown as SecurityServiceValidationService;

  const service = new SecurityServiceHmacVerificationApi(
    cryptoProvider,
    validationService,
  );

  const request: VerifyHmacRequest = {
    payload: "TraceMind HMAC verification API test",
    signature: "mock-hmac-signature",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    keyId: "mock-key-id",
    keyVersion: 1,
    context: {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-test",
      projectId: "project-test",
      applicationId: "application-test",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.SIGNING,
      //   classification: "SENSITIVE",
      //   purpose: "HMAC",
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("validates the request before HMAC verification", async () => {
    const providerResult: VerifyHmacResult = {
      valid: true,
    };

    verifyHmacMock.mockResolvedValue(providerResult);

    await service.verifyHmac(request);

    expect(validateVerifyHmacRequestMock).toHaveBeenCalledWith(request);
    expect(verifyHmacMock).toHaveBeenCalledWith(request);
  });

  it("returns the provider verification result", async () => {
    const providerResult: VerifyHmacResult = {
      valid: true,
    };

    verifyHmacMock.mockResolvedValue(providerResult);

    const result = await service.verifyHmac(request);

    expect(result).toEqual(providerResult);
  });

  it("returns false when the provider reports an invalid HMAC", async () => {
    const providerResult: VerifyHmacResult = {
      valid: false,
    };

    verifyHmacMock.mockResolvedValue(providerResult);

    const result = await service.verifyHmac(request);

    expect(result.valid).toBe(false);
  });

  it("does not call the provider when validation fails", async () => {
    validateVerifyHmacRequestMock.mockImplementation(() => {
      throw new Error("Invalid HMAC verification request");
    });

    await expect(service.verifyHmac(request)).rejects.toThrow(
      "Invalid HMAC verification request",
    );

    expect(verifyHmacMock).not.toHaveBeenCalled();
  });

  it("propagates provider errors", async () => {
    verifyHmacMock.mockRejectedValue(
      new Error("Provider HMAC verification failure"),
    );

    await expect(service.verifyHmac(request)).rejects.toThrow(
      "Provider HMAC verification failure",
    );
  });
});
