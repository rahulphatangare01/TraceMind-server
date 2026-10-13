import { describe, expect, it } from "vitest";

import {
  CryptoEncoding,
  DataClassification,
  EncryptionAlgorithm,
  HmacAlgorithm,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
} from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/security-context.js";

import { SecurityBoundaryValidator } from "../../application/services/security-boundary-validator.service.js";
import { SecurityContextValidator } from "../../application/services/security-context-validator.service.js";
import { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";

import { SecurityBoundaryValidationError } from "../../errors/security-boundary-validation.error.js";

describe("Phase 9.19 - Security Boundary Review", () => {
  const boundaryValidator = new SecurityBoundaryValidator();
  const contextValidator = new SecurityContextValidator();

  const serviceValidation = new SecurityServiceValidationService(
    contextValidator,
    boundaryValidator,
  );

  const validBase = {
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  };

  const validOrganizationContext: SecurityContext = {
    ...validBase,
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-123",
  };

  const invalidOrganizationContext = {
    ...validBase,
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-123",
    projectId: "project-123",
  };

  describe("1. Scope hierarchy enforcement", () => {
    it("accepts PLATFORM without tenant identifiers", () => {
      const result = boundaryValidator.validate({
        ...validBase,
        scope: SecurityScope.PLATFORM,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("accepts a valid ORGANIZATION boundary", () => {
      const result = boundaryValidator.validate(validOrganizationContext);

      expect(result.valid).toBe(true);
    });

    it("accepts a valid PROJECT boundary", () => {
      const result = boundaryValidator.validate({
        ...validBase,
        scope: SecurityScope.PROJECT,
        organizationId: "org-123",
        projectId: "project-123",
      });

      expect(result.valid).toBe(true);
    });

    it("accepts a valid APPLICATION boundary", () => {
      const result = boundaryValidator.validate({
        ...validBase,
        scope: SecurityScope.APPLICATION,
        organizationId: "org-123",
        projectId: "project-123",
        applicationId: "app-123",
      });

      expect(result.valid).toBe(true);
    });

    it("accepts a valid ENVIRONMENT boundary", () => {
      const result = boundaryValidator.validate({
        ...validBase,
        scope: SecurityScope.ENVIRONMENT,
        organizationId: "org-123",
        projectId: "project-123",
        applicationId: "app-123",
        environmentId: "env-123",
      });

      expect(result.valid).toBe(true);
    });

    it("accepts FIELD as a reserved scope without tenant identifiers", () => {
      const result = boundaryValidator.validate({
        ...validBase,
        scope: SecurityScope.FIELD,
      });

      expect(result.valid).toBe(true);
    });
  });

  describe("2. Cross-boundary identifier rejection", () => {
    const invalidContexts: Array<{
      name: string;
      context: SecurityContext;
    }> = [
      {
        name: "PLATFORM containing organizationId",
        context: {
          ...validBase,
          scope: SecurityScope.PLATFORM,
          organizationId: "org-123",
        },
      },
      {
        name: "ORGANIZATION containing projectId",
        context: invalidOrganizationContext as SecurityContext,
      },
      {
        name: "PROJECT missing organizationId",
        context: {
          ...validBase,
          scope: SecurityScope.PROJECT,
          projectId: "project-123",
        },
      },
      {
        name: "PROJECT containing applicationId",
        context: {
          ...validBase,
          scope: SecurityScope.PROJECT,
          organizationId: "org-123",
          projectId: "project-123",
          applicationId: "app-123",
        },
      },
      {
        name: "APPLICATION missing projectId",
        context: {
          ...validBase,
          scope: SecurityScope.APPLICATION,
          organizationId: "org-123",
          applicationId: "app-123",
        },
      },
      {
        name: "APPLICATION containing environmentId",
        context: {
          ...validBase,
          scope: SecurityScope.APPLICATION,
          organizationId: "org-123",
          projectId: "project-123",
          applicationId: "app-123",
          environmentId: "env-123",
        },
      },
      {
        name: "ENVIRONMENT missing applicationId",
        context: {
          ...validBase,
          scope: SecurityScope.ENVIRONMENT,
          organizationId: "org-123",
          projectId: "project-123",
          environmentId: "env-123",
        },
      },
      {
        name: "ENVIRONMENT missing environmentId",
        context: {
          ...validBase,
          scope: SecurityScope.ENVIRONMENT,
          organizationId: "org-123",
          projectId: "project-123",
          applicationId: "app-123",
        },
      },
      {
        name: "FIELD containing organizationId",
        context: {
          ...validBase,
          scope: SecurityScope.FIELD,
          organizationId: "org-123",
        },
      },
    ];

    it.each(invalidContexts)("rejects $name", ({ context }) => {
      expect(() => boundaryValidator.validate(context)).toThrow(
        SecurityBoundaryValidationError,
      );
    });
  });

  describe("3. Normalization and immutability", () => {
    it("normalizes hierarchy identifiers before returning the context", () => {
      const context: SecurityContext = {
        ...validBase,
        scope: SecurityScope.APPLICATION,
        organizationId: "  org-123  ",
        projectId: " project-123 ",
        applicationId: " app-123 ",
      };

      const result = boundaryValidator.validate(context);

      expect(result.valid).toBe(true);
      expect(result.context.organizationId).toBe("org-123");
      expect(result.context.projectId).toBe("project-123");
      expect(result.context.applicationId).toBe("app-123");
    });

    it("does not mutate the original context during normalization", () => {
      const context: SecurityContext = {
        ...validBase,
        scope: SecurityScope.APPLICATION,
        organizationId: "  org-123  ",
        projectId: " project-123 ",
        applicationId: " app-123 ",
      };

      const originalContext = { ...context };

      boundaryValidator.validate(context);

      expect(context).toEqual(originalContext);
    });

    it("rejects a whitespace-only required identifier", () => {
      const context: SecurityContext = {
        ...validBase,
        scope: SecurityScope.ORGANIZATION,
        organizationId: "   ",
      };

      expect(() => boundaryValidator.validate(context)).toThrow(
        SecurityBoundaryValidationError,
      );
    });
  });

  describe("4. Public request validation boundary integration", () => {
    const invalidContext = invalidOrganizationContext;

    it("rejects invalid boundaries in encryption requests", () => {
      expect(() =>
        serviceValidation.validateEncryptRequest({
          plaintext: "test",
          keyId: "key-123",
          context: invalidContext,
        }),
      ).toThrow();
    });

    it("rejects invalid boundaries in decryption requests", () => {
      expect(() =>
        serviceValidation.validateDecryptRequest({
          ciphertext: "ciphertext",
          iv: "initialization-vector",
          authTag: "authentication-tag",
          keyId: "key-123",
          keyVersion: 1,
          algorithm: EncryptionAlgorithm.AES_256_GCM,
          encoding: CryptoEncoding.BASE64,
          context: invalidContext,
        }),
      ).toThrow();
    });

    it("rejects invalid boundaries in signing requests", () => {
      expect(() =>
        serviceValidation.validateSignRequest({
          payload: "payload",
          algorithm: SignatureAlgorithm.ED25519,
          context: invalidContext,
        }),
      ).toThrow();
    });

    it("rejects invalid boundaries in signature verification requests", () => {
      expect(() =>
        serviceValidation.validateVerifySignatureRequest({
          payload: "payload",
          signature: "signature",
          algorithm: SignatureAlgorithm.ED25519,
          keyId: "signing-key-123",
          keyVersion: 1,
          context: invalidContext,
        }),
      ).toThrow();
    });

    it("rejects invalid boundaries in HMAC creation requests", () => {
      expect(() =>
        serviceValidation.validateCreateHmacRequest({
          payload: "payload",
          algorithm: HmacAlgorithm.HMAC_SHA_256,
          context: invalidContext,
        }),
      ).toThrow();
    });

    it("rejects invalid boundaries in HMAC verification requests", () => {
      expect(() =>
        serviceValidation.validateVerifyHmacRequest({
          payload: "payload",
          signature: "hmac-signature",
          algorithm: HmacAlgorithm.HMAC_SHA_256,
          keyId: "hmac-key-123",
          keyVersion: 1,
          context: invalidContext,
        }),
      ).toThrow();
    });
  });
});
