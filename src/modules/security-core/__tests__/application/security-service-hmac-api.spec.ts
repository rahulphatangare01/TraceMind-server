// import { beforeEach, describe, expect, it, vi } from "vitest";

// import {
//   HmacAlgorithm,
//   CryptoEncoding,
//   SecurityScope,
//   SecurityPurpose,
//   DataClassification,
// } from "../../domain/enums/index.js";

// import type {
//   CreateHmacRequest,
//   CreateHmacResult,
// } from "../../types/hmac.types.js";

// import type { CryptoProvider } from "../../application/interfaces/crypto.provider.interface.js";

// import { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";

// import { SecurityServiceHmacApi } from "../../application/services/security-service-hmac-api.service.js";

// describe("SecurityServiceHmacApi", () => {
//   const createHmacMock =
//     vi.fn<(request: CreateHmacRequest) => Promise<CreateHmacResult>>();

//   const validateCreateHmacRequestMock =
//     vi.fn<(request: CreateHmacRequest) => void>();

//   const cryptoProvider = {
//     encrypt: vi.fn(),
//     decrypt: vi.fn(),
//     hash: vi.fn(),
//     verifyHash: vi.fn(),
//     sign: vi.fn(),
//     verifySignature: vi.fn(),
//     createHmac: createHmacMock,
//     verifyHmac: vi.fn(),
//   } as unknown as CryptoProvider;

//   const validationService = {
//     validateCreateHmacRequest: validateCreateHmacRequestMock,
//   } as unknown as SecurityServiceValidationService;

//   const service = new SecurityServiceHmacApi(cryptoProvider, validationService);

//   const request: CreateHmacRequest = {
//     payload: "TraceMind HMAC API test",
//     algorithm: HmacAlgorithm.HMAC_SHA_256,
//     encoding: CryptoEncoding.BASE64,
//     context: {
//       scope: SecurityScope.APPLICATION,
//       organizationId: "org-test",
//       projectId: "project-test",
//       applicationId: "application-test",
//       classification: DataClassification.SENSITIVE,
//       purpose: SecurityPurpose.SIGNING,
//     },
//   };

//   beforeEach(() => {
//     vi.resetAllMocks();
//   });

//   it("validates the request before HMAC creation", async () => {
//     const providerResult: CreateHmacResult = {
//       signature: "mock-hmac",
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       encoding: CryptoEncoding.BASE64,
//       keyId: "mock-key-id",
//       keyVersion: 1,
//     };

//     createHmacMock.mockResolvedValue(providerResult);

//     await service.createHmac(request);

//     expect(validateCreateHmacRequestMock).toHaveBeenCalledWith(request);
//     expect(createHmacMock).toHaveBeenCalledWith(request);
//   });

//   it("returns the provider HMAC result", async () => {
//     const providerResult: CreateHmacResult = {
//       signature: "mock-hmac",
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       encoding: CryptoEncoding.BASE64,
//       keyId: "mock-key-id",
//       keyVersion: 1,
//     };

//     createHmacMock.mockResolvedValue(providerResult);

//     const result = await service.createHmac(request);

//     expect(result).toEqual(providerResult);
//   });

//   it("supports explicit HMAC encoding", async () => {
//     const encodedRequest: CreateHmacRequest = {
//       ...request,
//       encoding: CryptoEncoding.HEX,
//     };

//     const providerResult: CreateHmacResult = {
//       signature: "mock-hmac-hex",
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       encoding: CryptoEncoding.HEX,
//       keyId: "mock-key-id",
//       keyVersion: 1,
//     };

//     createHmacMock.mockResolvedValue(providerResult);

//     const result = await service.createHmac(encodedRequest);

//     expect(result.encoding).toBe(CryptoEncoding.HEX);
//     expect(createHmacMock).toHaveBeenCalledWith(encodedRequest);
//   });

//   it("does not call the provider when validation fails", async () => {
//     validateCreateHmacRequestMock.mockImplementation(() => {
//       throw new Error("Invalid HMAC creation request");
//     });

//     await expect(service.createHmac(request)).rejects.toThrow(
//       "Invalid HMAC creation request",
//     );

//     expect(createHmacMock).not.toHaveBeenCalled();
//   });

//   it("propagates provider errors", async () => {
//     createHmacMock.mockRejectedValue(
//       new Error("Provider HMAC creation failure"),
//     );

//     await expect(service.createHmac(request)).rejects.toThrow(
//       "Provider HMAC creation failure",
//     );
//   });
// });

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  HmacAlgorithm,
  CryptoEncoding,
  SecurityScope,
  SecurityPurpose,
  DataClassification,
} from "../../domain/enums/index.js";

import type {
  CreateHmacRequest,
  CreateHmacResult,
} from "../../types/hmac.types.js";

import type { CryptoProvider } from "../../application/interfaces/crypto.provider.interface.js";

import { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";

import { SecurityServiceHmacApi } from "../../application/services/security-service-hmac-api.service.js";

describe("SecurityServiceHmacApi", () => {
  const createHmacMock =
    vi.fn<(request: CreateHmacRequest) => Promise<CreateHmacResult>>();

  const validateCreateHmacRequestMock =
    vi.fn<(request: CreateHmacRequest) => CreateHmacRequest["context"]>();

  const cryptoProvider = {
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    hash: vi.fn(),
    verifyHash: vi.fn(),
    sign: vi.fn(),
    verifySignature: vi.fn(),
    createHmac: createHmacMock,
    verifyHmac: vi.fn(),
  } as unknown as CryptoProvider;

  const validationService = {
    validateCreateHmacRequest: validateCreateHmacRequestMock,
  } as unknown as SecurityServiceValidationService;

  const service = new SecurityServiceHmacApi(cryptoProvider, validationService);

  const request: CreateHmacRequest = {
    payload: "TraceMind HMAC API test",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    context: {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-test",
      projectId: "project-test",
      applicationId: "application-test",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.SIGNING,
    },
  };

  const providerResult: CreateHmacResult = {
    signature: "mock-hmac",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    keyId: "mock-key-id",
    keyVersion: 1,
  };

  beforeEach(() => {
    vi.resetAllMocks();

    validateCreateHmacRequestMock.mockReturnValue({
      ...request.context,
      organizationId: request.context.organizationId?.trim(),
      projectId: request.context.projectId?.trim(),
      applicationId: request.context.applicationId?.trim(),
    });
  });

  it("validates the request before HMAC creation", async () => {
    createHmacMock.mockResolvedValue(providerResult);

    await service.createHmac(request);

    expect(validateCreateHmacRequestMock).toHaveBeenCalledWith(request);

    expect(createHmacMock).toHaveBeenCalledWith({
      ...request,
      context: {
        ...request.context,
        organizationId: request.context.organizationId?.trim(),
        projectId: request.context.projectId?.trim(),
        applicationId: request.context.applicationId?.trim(),
      },
    });
  });

  it("returns the provider HMAC result", async () => {
    createHmacMock.mockResolvedValue(providerResult);

    const result = await service.createHmac(request);

    expect(result).toEqual(providerResult);
  });

  it("supports explicit HMAC encoding", async () => {
    const encodedRequest: CreateHmacRequest = {
      ...request,
      encoding: CryptoEncoding.HEX,
    };

    const encodedProviderResult: CreateHmacResult = {
      ...providerResult,
      signature: "mock-hmac-hex",
      encoding: CryptoEncoding.HEX,
    };

    createHmacMock.mockResolvedValue(encodedProviderResult);

    const result = await service.createHmac(encodedRequest);

    expect(result.encoding).toBe(CryptoEncoding.HEX);

    expect(createHmacMock).toHaveBeenCalledWith({
      ...encodedRequest,
      context: {
        ...encodedRequest.context,
        organizationId: encodedRequest.context.organizationId?.trim(),
        projectId: encodedRequest.context.projectId?.trim(),
        applicationId: encodedRequest.context.applicationId?.trim(),
      },
    });
  });

  it("does not call the provider when validation fails", async () => {
    validateCreateHmacRequestMock.mockImplementation(() => {
      throw new Error("Invalid HMAC creation request");
    });

    await expect(service.createHmac(request)).rejects.toThrow(
      "Invalid HMAC creation request",
    );

    expect(createHmacMock).not.toHaveBeenCalled();
  });

  it("propagates provider errors", async () => {
    createHmacMock.mockRejectedValue(
      new Error("Provider HMAC creation failure"),
    );

    await expect(service.createHmac(request)).rejects.toThrow(
      "Provider HMAC creation failure",
    );
  });
});
