import { describe, expect, it, vi } from "vitest";

import {
  CryptoEncoding,
  DataClassification,
  HmacAlgorithm,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
} from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/security-context.js";

import { SecurityContextValidationError } from "../../errors/security-context-validation.error.js";

import type { CryptoProvider } from "../../application/interfaces/crypto.provider.interface.js";

import { SecurityServiceSigningApi } from "../../application/services/security-service-signing-api.service.js";
import { SecurityServiceSignatureVerificationApi } from "../../application/services/security-service-signature-verification-api.service.js";
import { SecurityServiceHmacApi } from "../../application/services/security-service-hmac-api.service.js";
import { SecurityServiceHmacVerificationApi } from "../../application/services/security-service-hmac-verification-api.service.js";
import { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";
import { SecurityContextValidator } from "../../application/services/security-context-validator.service.js";
import { SecurityBoundaryValidator } from "../../application/services/security-boundary-validator.service.js";

describe("Phase 9.13 - Security Context Integration", () => {
  const contextValidator = new SecurityContextValidator();
  const boundaryValidator = new SecurityBoundaryValidator();

  const validationService = new SecurityServiceValidationService(
    contextValidator,
    boundaryValidator,
  );

  const validContext: SecurityContext = {
    scope: SecurityScope.APPLICATION,
    organizationId: "org-001",
    projectId: "project-001",
    applicationId: "application-001",
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  };

  it("should return a validated and normalized encryption context", () => {
    const context = validationService.validateEncryptRequest({
      plaintext: "TraceMind secret",
      keyId: "key-001",
      context: {
        ...validContext,
        organizationId: "  org-001  ",
        projectId: " project-001",
        applicationId: "application-001 ",
      },
    });

    expect(context).toEqual(validContext);
  });

  it("should reject an invalid security context", () => {
    expect(() =>
      validationService.validateEncryptRequest({
        plaintext: "TraceMind secret",
        keyId: "key-001",
        context: {
          scope: SecurityScope.APPLICATION,
          projectId: "project-001",
          applicationId: "application-001",
          classification: DataClassification.SENSITIVE,
          purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
        },
      }),
    ).toThrow(SecurityContextValidationError);
  });

  it("should pass the validated context to the signing provider", async () => {
    const signMock = vi.fn().mockResolvedValue({
      signature: "signature",
      algorithm: SignatureAlgorithm.ED25519,
      encoding: "BASE64",
      keyId: "key-001",
      keyVersion: 1,
    });

    const cryptoProvider = {
      sign: signMock,
    } as unknown as CryptoProvider;

    const service = new SecurityServiceSigningApi(
      cryptoProvider,
      validationService,
    );

    await service.sign({
      payload: "TraceMind signing payload",
      algorithm: SignatureAlgorithm.ED25519,
      //   encoding: "BASE64",
      encoding: CryptoEncoding.BASE64,
      context: {
        ...validContext,
        organizationId: "  org-001  ",
      },
    });

    expect(signMock).toHaveBeenCalledWith(
      expect.objectContaining({
        context: validContext,
      }),
    );
  });

  it("should reject signing before calling the provider when context is invalid", async () => {
    const signMock = vi.fn();

    const cryptoProvider = {
      sign: signMock,
    } as unknown as CryptoProvider;

    const service = new SecurityServiceSigningApi(
      cryptoProvider,
      validationService,
    );

    await expect(
      service.sign({
        payload: "TraceMind signing payload",
        algorithm: SignatureAlgorithm.ED25519,
        context: {
          scope: SecurityScope.APPLICATION,
          projectId: "project-001",
          applicationId: "application-001",
          classification: DataClassification.SENSITIVE,
          purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
        } as SecurityContext,
      }),
    ).rejects.toThrow(SecurityContextValidationError);

    expect(signMock).not.toHaveBeenCalled();
  });

  it("should pass the validated context to signature verification", async () => {
    const verifySignatureMock = vi.fn().mockResolvedValue({
      valid: true,
    });

    const cryptoProvider = {
      verifySignature: verifySignatureMock,
    } as unknown as CryptoProvider;

    const service = new SecurityServiceSignatureVerificationApi(
      cryptoProvider,
      validationService,
    );

    await service.verifySignature({
      payload: "TraceMind verification payload",
      signature: "signature",
      algorithm: SignatureAlgorithm.ED25519,
      keyId: "key-001",
      keyVersion: 1,
      context: {
        ...validContext,
        projectId: " project-001 ",
      },
    });

    expect(verifySignatureMock).toHaveBeenCalledWith(
      expect.objectContaining({
        context: validContext,
      }),
    );
  });

  it("should pass the validated context to HMAC creation", async () => {
    const createHmacMock = vi.fn().mockResolvedValue({
      signature: "hmac",
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      encoding: "BASE64",
      keyId: "key-001",
      keyVersion: 1,
    });

    const cryptoProvider = {
      createHmac: createHmacMock,
    } as unknown as CryptoProvider;

    const service = new SecurityServiceHmacApi(
      cryptoProvider,
      validationService,
    );

    await service.createHmac({
      payload: "TraceMind HMAC payload",
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context: {
        ...validContext,
        applicationId: " application-001 ",
      },
    });

    expect(createHmacMock).toHaveBeenCalledWith(
      expect.objectContaining({
        context: validContext,
      }),
    );
  });

  it("should pass the validated context to HMAC verification", async () => {
    const verifyHmacMock = vi.fn().mockResolvedValue({
      valid: true,
    });

    const cryptoProvider = {
      verifyHmac: verifyHmacMock,
    } as unknown as CryptoProvider;

    const service = new SecurityServiceHmacVerificationApi(
      cryptoProvider,
      validationService,
    );

    await service.verifyHmac({
      payload: "TraceMind HMAC verification payload",
      signature: "signature",
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: "key-001",
      keyVersion: 1,
      context: {
        ...validContext,
        organizationId: " org-001 ",
      },
    });

    expect(verifyHmacMock).toHaveBeenCalledWith(
      expect.objectContaining({
        context: validContext,
      }),
    );
  });
});
