// import { beforeEach, describe, expect, it, vi } from "vitest";
// import {
//   CryptoEncoding,
//   DataClassification,
//   SecurityPurpose,
//   SecurityScope,
//   SignatureAlgorithm,
// } from "../../domain/enums/index.js";
// import type {
//   VerifySignatureRequest,
//   VerifySignatureResult,
// } from "../../types/signing.types.js";
// import { SecurityServiceSignatureVerificationApi } from "../../application/services/security-service-signature-verification-api.service.js";
// import { CryptoProvider } from "../../application/interfaces/crypto.provider.interface.js";
// import { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";

// describe("SecurityServiceSignatureVerificationApi", () => {

//   const verifySignatureMock =
//     vi.fn<
//       (request: VerifySignatureRequest) => Promise<VerifySignatureResult>
//     >();
//   const validateVerifySignatureRequestMock =
//     vi.fn<(request: VerifySignatureRequest) => void>();

//   const cryptoProvider = {
//     encrypt: vi.fn(),
//     decrypt: vi.fn(),
//     hash: vi.fn(),
//     verifyHash: vi.fn(),
//     sign: vi.fn(),
//     verifySignature: verifySignatureMock,
//     hmac: vi.fn(),
//     verifyHmac: vi.fn(),
//   } as unknown as CryptoProvider;

//   const validationService = {
//     validateVerifySignatureRequest: validateVerifySignatureRequestMock,
//   } as unknown as SecurityServiceValidationService;

//   const service = new SecurityServiceSignatureVerificationApi(
//     cryptoProvider,
//     validationService,
//   );

//   const request: VerifySignatureRequest = {
//     payload: "TraceMind signature verification test",
//     signature: "mock-signature",
//     algorithm: SignatureAlgorithm.ED25519,
//     encoding: CryptoEncoding.BASE64,
//     keyId: "mock-key-id",
//     keyVersion: 1,
//     context: {
//       scope: SecurityScope.APPLICATION,
//       organizationId: "org-test",
//       projectId: "project-test",
//       applicationId: "application-test",
//       classification: DataClassification.SENSITIVE,
//       purpose: SecurityPurpose.SIGNING,
//     },
//   };

//   const providerResult: VerifySignatureResult = {
//     valid: true,
//   };

//   beforeEach(() => {
//     vi.resetAllMocks();

//     verifySignatureMock.mockResolvedValue(providerResult);
//   });

//   it("validates the request before verification", async () => {
//     await service.verifySignature(request);

//     expect(
//       validationService.validateVerifySignatureRequest,
//     ).toHaveBeenCalledWith(request);

//     expect(cryptoProvider.verifySignature).toHaveBeenCalledWith({
//       ...request,
//       context: {
//         ...request.context,
//         organizationId: request.context.organizationId?.trim(),
//         projectId: request.context.projectId?.trim(),
//         applicationId: request.context.applicationId?.trim(),
//       },
//     });
//   });

//   it("returns the provider verification result", async () => {
//     await expect(service.verifySignature(request)).resolves.toEqual({
//       valid: true,
//     });
//   });

//   it("returns false when the provider reports an invalid signature", async () => {

//     verifySignatureMock.mockResolvedValue({ valid: false });
//     await expect(service.verifySignature(request)).resolves.toEqual({
//       valid: false,
//     });
//   });

//   it("supports explicit signature encoding", async () => {
//     await service.verifySignature({
//       ...request,
//       encoding: CryptoEncoding.BASE64,
//     });

//     expect(cryptoProvider.verifySignature).toHaveBeenCalledWith({
//       ...request,
//       encoding: CryptoEncoding.BASE64,
//     });
//   });

//   it("does not call the provider when validation fails", async () => {
//     validateVerifySignatureRequestMock.mockImplementation(() => {
//       throw new Error("Invalid signature verification request");
//     });

//     await expect(service.verifySignature(request)).rejects.toThrow(
//       "Invalid signature verification request",
//     );

//     expect(validateVerifySignatureRequestMock).toHaveBeenCalledWith(request);
//     expect(verifySignatureMock).not.toHaveBeenCalled();
//   });

//   it("propagates provider errors", async () => {
//     verifySignatureMock.mockRejectedValue(
//       new Error("Provider verification failure"),
//     );

//     await expect(service.verifySignature(request)).rejects.toThrow(
//       "Provider verification failure",
//     );
//   });
// });

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CryptoEncoding,
  DataClassification,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
} from "../../domain/enums/index.js";
import type {
  VerifySignatureRequest,
  VerifySignatureResult,
} from "../../types/signing.types.js";
import { SecurityServiceSignatureVerificationApi } from "../../application/services/security-service-signature-verification-api.service.js";
import { CryptoProvider } from "../../application/interfaces/crypto.provider.interface.js";
import { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";

describe("SecurityServiceSignatureVerificationApi", () => {
  const verifySignatureMock =
    vi.fn<
      (request: VerifySignatureRequest) => Promise<VerifySignatureResult>
    >();

  // Validation returns the normalized SecurityContext.
  const validateVerifySignatureRequestMock =
    vi.fn<
      (request: VerifySignatureRequest) => VerifySignatureRequest["context"]
    >();

  const cryptoProvider = {
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    hash: vi.fn(),
    verifyHash: vi.fn(),
    sign: vi.fn(),
    verifySignature: verifySignatureMock,
    hmac: vi.fn(),
    verifyHmac: vi.fn(),
  } as unknown as CryptoProvider;

  const validationService = {
    validateVerifySignatureRequest: validateVerifySignatureRequestMock,
  } as unknown as SecurityServiceValidationService;

  const service = new SecurityServiceSignatureVerificationApi(
    cryptoProvider,
    validationService,
  );

  const request: VerifySignatureRequest = {
    payload: "TraceMind signature verification test",
    signature: "mock-signature",
    algorithm: SignatureAlgorithm.ED25519,
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
    },
  };

  const providerResult: VerifySignatureResult = {
    valid: true,
  };

  beforeEach(() => {
    vi.resetAllMocks();

    validateVerifySignatureRequestMock.mockReturnValue({
      ...request.context,
      organizationId: request.context.organizationId?.trim(),
      projectId: request.context.projectId?.trim(),
      applicationId: request.context.applicationId?.trim(),
    });

    verifySignatureMock.mockResolvedValue(providerResult);
  });

  it("validates the request before verification", async () => {
    await service.verifySignature(request);

    expect(validateVerifySignatureRequestMock).toHaveBeenCalledWith(request);

    expect(cryptoProvider.verifySignature).toHaveBeenCalledWith({
      ...request,
      context: {
        ...request.context,
        organizationId: request.context.organizationId?.trim(),
        projectId: request.context.projectId?.trim(),
        applicationId: request.context.applicationId?.trim(),
      },
    });
  });

  it("returns the provider verification result", async () => {
    await expect(service.verifySignature(request)).resolves.toEqual({
      valid: true,
    });
  });

  it("returns false when the provider reports an invalid signature", async () => {
    verifySignatureMock.mockResolvedValue({ valid: false });

    await expect(service.verifySignature(request)).resolves.toEqual({
      valid: false,
    });
  });

  it("supports explicit signature encoding", async () => {
    await service.verifySignature({
      ...request,
      encoding: CryptoEncoding.BASE64,
    });

    expect(cryptoProvider.verifySignature).toHaveBeenCalledWith({
      ...request,
      encoding: CryptoEncoding.BASE64,
      context: {
        ...request.context,
        organizationId: request.context.organizationId?.trim(),
        projectId: request.context.projectId?.trim(),
        applicationId: request.context.applicationId?.trim(),
      },
    });
  });

  it("does not call the provider when validation fails", async () => {
    validateVerifySignatureRequestMock.mockImplementation(() => {
      throw new Error("Invalid signature verification request");
    });

    await expect(service.verifySignature(request)).rejects.toThrow(
      "Invalid signature verification request",
    );

    expect(validateVerifySignatureRequestMock).toHaveBeenCalledWith(request);
    expect(verifySignatureMock).not.toHaveBeenCalled();
  });

  it("propagates provider errors", async () => {
    verifySignatureMock.mockRejectedValue(
      new Error("Provider verification failure"),
    );

    await expect(service.verifySignature(request)).rejects.toThrow(
      "Provider verification failure",
    );
  });
});
