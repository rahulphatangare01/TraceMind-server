// import { beforeEach, describe, expect, it, vi } from "vitest";
// import { SecurityServiceSigningApi } from "../../application/services/security-service-signing-api.service.js";
// import type { CryptoProvider } from "../../application/interfaces/crypto.provider.interface.js";
// import type { SignRequest } from "../../types/signing.types.js";
// import type { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";
// import {
//   CryptoEncoding,
//   DataClassification,
//   SecurityPurpose,
//   SecurityScope,
//   SignatureAlgorithm,
// } from "../../domain/enums/index.js";

// describe("SecurityServiceSigningApi", () => {
//   let service: SecurityServiceSigningApi;

//   const cryptoProvider = {
//     sign: vi.fn(),
//   };

//   const validationService = {
//     validateSignRequest: vi.fn(),
//   };

//   beforeEach(() => {
//     vi.resetAllMocks();

//     cryptoProvider.sign.mockResolvedValue({
//       signature: "mock-signature",
//       algorithm: SignatureAlgorithm.ED25519,
//       encoding: CryptoEncoding.BASE64,
//       keyId: "mock-key-id",
//       keyVersion: 1,
//     });

//     service = new SecurityServiceSigningApi(
//       cryptoProvider as unknown as CryptoProvider,
//       validationService as unknown as SecurityServiceValidationService,
//     );
//   });

//   it("validates the request before signing", async () => {
//     const request: SignRequest = {
//       payload: "TraceMind signing test",
//       algorithm: SignatureAlgorithm.ED25519,
//       encoding: CryptoEncoding.BASE64,
//       context: {
//         scope: SecurityScope.APPLICATION,
//         organizationId: "org-test",
//         projectId: "project-test",
//         applicationId: "application-test",
//         classification: DataClassification.SENSITIVE,
//         purpose: SecurityPurpose.SIGNING,
//       },
//     };
//     await service.sign(request);

//     expect(validationService.validateSignRequest).toHaveBeenCalledWith(request);

//     expect(cryptoProvider.sign).toHaveBeenCalledWith(request);
//   });
//   it("returns the provider signing result", async () => {
//     const request: SignRequest = {
//       payload: "TraceMind signing test",
//       algorithm: SignatureAlgorithm.ED25519,
//       context: {
//         scope: SecurityScope.APPLICATION,
//         organizationId: "org-test",
//         projectId: "project-test",
//         applicationId: "application-test",
//         classification: DataClassification.SENSITIVE,
//         purpose: SecurityPurpose.SIGNING,
//       },
//     };

//     await expect(service.sign(request)).resolves.toEqual({
//       signature: "mock-signature",
//       algorithm: SignatureAlgorithm.ED25519,
//       encoding: CryptoEncoding.BASE64,
//       keyId: "mock-key-id",
//       keyVersion: 1,
//     });
//   });

//   it("returns the provider signing result", async () => {
//     const request: SignRequest = {
//       payload: "TraceMind signing test",
//       algorithm: SignatureAlgorithm.ED25519,
//       context: {
//         scope: SecurityScope.APPLICATION,
//         organizationId: "org-test",
//         projectId: "project-test",
//         applicationId: "application-test",
//         classification: DataClassification.SENSITIVE,
//         purpose: SecurityPurpose.SIGNING,
//       },
//     };

//     await expect(service.sign(request)).resolves.toEqual({
//       signature: "mock-signature",
//       algorithm: SignatureAlgorithm.ED25519,
//       encoding: CryptoEncoding.BASE64,
//       keyId: "mock-key-id",
//       keyVersion: 1,
//     });
//   });
//   it("does not call the provider when validation fails", async () => {
//     validationService.validateSignRequest.mockImplementation(() => {
//       throw new Error("Unsupported signature algorithm.");
//     });

//     await expect(
//       service.sign({
//         payload: "TraceMind signing test",
//         algorithm: "INVALID" as SignatureAlgorithm,
//         context: {
//           scope: SecurityScope.APPLICATION,
//           organizationId: "org-test",
//           projectId: "project-test",
//           applicationId: "application-test",
//           classification: DataClassification.SENSITIVE,
//           purpose: SecurityPurpose.SIGNING,
//         },
//       }),
//     ).rejects.toThrow("Unsupported signature algorithm.");

//     expect(cryptoProvider.sign).not.toHaveBeenCalled();
//   });

//   it("propagates provider errors", async () => {
//     cryptoProvider.sign.mockRejectedValue(
//       new Error("Signing provider failed."),
//     );

//     const request: SignRequest = {
//       payload: "TraceMind signing test",
//       algorithm: SignatureAlgorithm.ED25519,
//       context: {
//         scope: SecurityScope.APPLICATION,
//         organizationId: "org-test",
//         projectId: "project-test",
//         applicationId: "application-test",
//         classification: DataClassification.SENSITIVE,
//         purpose: SecurityPurpose.SIGNING,
//       },
//     };

//     await expect(service.sign(request)).rejects.toThrow(
//       "Signing provider failed.",
//     );
//   });

//   it("does not return the original payload as the signature", async () => {
//     const payload = "TraceMind sensitive signing payload";

//     const result = await service.sign({
//       payload,
//       algorithm: SignatureAlgorithm.ED25519,
//       context: {
//         scope: SecurityScope.APPLICATION,
//         organizationId: "org-test",
//         projectId: "project-test",
//         applicationId: "application-test",
//         classification: DataClassification.SENSITIVE,
//         purpose: SecurityPurpose.SIGNING,
//       },
//     });

//     expect(result.signature).not.toContain(payload);
//   });
// });

import { beforeEach, describe, expect, it, vi } from "vitest";
import { SecurityServiceSigningApi } from "../../application/services/security-service-signing-api.service.js";
import type { CryptoProvider } from "../../application/interfaces/crypto.provider.interface.js";
import type { SignRequest } from "../../types/signing.types.js";
import type { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";
import {
  CryptoEncoding,
  DataClassification,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
} from "../../domain/enums/index.js";

describe("SecurityServiceSigningApi", () => {
  let service: SecurityServiceSigningApi;

  const cryptoProvider = {
    sign: vi.fn(),
  };

  const validationService = {
    validateSignRequest: vi.fn(),
  };

  const createRequest = (
    overrides: Partial<SignRequest> = {},
  ): SignRequest => ({
    payload: "TraceMind signing test",
    algorithm: SignatureAlgorithm.ED25519,
    encoding: CryptoEncoding.BASE64,
    context: {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-test",
      projectId: "project-test",
      applicationId: "application-test",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.SIGNING,
    },
    ...overrides,
  });

  const providerResult = {
    signature: "mock-signature",
    algorithm: SignatureAlgorithm.ED25519,
    encoding: CryptoEncoding.BASE64,
    keyId: "mock-key-id",
    keyVersion: 1,
  };

  beforeEach(() => {
    vi.resetAllMocks();

    validationService.validateSignRequest.mockImplementation(
      (request: SignRequest) => ({
        ...request.context,
        organizationId: request.context.organizationId?.trim(),
        projectId: request.context.projectId?.trim(),
        applicationId: request.context.applicationId?.trim(),
      }),
    );

    cryptoProvider.sign.mockResolvedValue(providerResult);

    service = new SecurityServiceSigningApi(
      cryptoProvider as unknown as CryptoProvider,
      validationService as unknown as SecurityServiceValidationService,
    );
  });

  it("validates the request before signing", async () => {
    const request = createRequest();

    await service.sign(request);

    expect(validationService.validateSignRequest).toHaveBeenCalledWith(request);

    expect(cryptoProvider.sign).toHaveBeenCalledWith({
      ...request,
      context: {
        ...request.context,
        organizationId: request.context.organizationId?.trim(),
        projectId: request.context.projectId?.trim(),
        applicationId: request.context.applicationId?.trim(),
      },
    });
  });

  it("returns the provider signing result", async () => {
    const request = createRequest();

    await expect(service.sign(request)).resolves.toEqual(providerResult);
  });

  it("supports explicit signature encoding", async () => {
    const request = createRequest({
      encoding: CryptoEncoding.HEX,
    });

    const hexProviderResult = {
      ...providerResult,
      encoding: CryptoEncoding.HEX,
    };

    cryptoProvider.sign.mockResolvedValue(hexProviderResult);

    await expect(service.sign(request)).resolves.toEqual(hexProviderResult);

    expect(cryptoProvider.sign).toHaveBeenCalledWith({
      ...request,
      context: {
        ...request.context,
        organizationId: request.context.organizationId?.trim(),
        projectId: request.context.projectId?.trim(),
        applicationId: request.context.applicationId?.trim(),
      },
    });
  });

  it("does not call the provider when validation fails", async () => {
    validationService.validateSignRequest.mockImplementation(() => {
      throw new Error("Unsupported signature algorithm.");
    });

    await expect(
      service.sign(
        createRequest({
          algorithm: "INVALID" as SignatureAlgorithm,
        }),
      ),
    ).rejects.toThrow("Unsupported signature algorithm.");

    expect(cryptoProvider.sign).not.toHaveBeenCalled();
  });

  it("propagates provider errors", async () => {
    cryptoProvider.sign.mockRejectedValue(
      new Error("Signing provider failed."),
    );

    await expect(service.sign(createRequest())).rejects.toThrow(
      "Signing provider failed.",
    );
  });

  it("does not return the original payload as the signature", async () => {
    const payload = "TraceMind sensitive signing payload";

    const result = await service.sign(createRequest({ payload }));

    expect(result.signature).not.toContain(payload);
  });
});
