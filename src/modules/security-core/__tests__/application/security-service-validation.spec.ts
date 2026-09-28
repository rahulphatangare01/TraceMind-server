import { describe, expect, it, vi, beforeEach } from "vitest";

// import { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";

import { SecurityServiceValidationError } from "../../errors/security-service-validation.error.js";

import { SecurityContextValidator } from "../../application/services/security-context-validator.service.js";

import { SecurityBoundaryValidator } from "../../application/services/security-boundary-validator.service.js";
import { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";
import {
  SecurityScope,
  DataClassification,
  SecurityPurpose,
} from "../../domain/enums";

import { HashAlgorithm } from "../../domain/enums";

import { SignatureAlgorithm } from "../../domain/enums";

import { HmacAlgorithm } from "../../domain/enums";

describe("SecurityServiceValidationService", () => {
  let service: SecurityServiceValidationService;

  const validContext = {
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-001",
    classification: DataClassification.CONFIDENTIAL,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  };

  beforeEach(() => {
    /*
     * These mocks isolate SecurityServiceValidationService.
     *
     * The actual Phase 6 validators should be tested separately.
     * If your service constructor accepts different dependencies,
     * update only this setup to match its constructor.
     */
    const contextValidator = {
      validate: vi.fn(),
    };

    const boundaryValidator = {
      validate: vi.fn(),
    };

    service = new SecurityServiceValidationService(
      contextValidator as unknown as SecurityContextValidator,
      boundaryValidator as unknown as SecurityBoundaryValidator,
    );
  });

  describe("encrypt request validation", () => {
    it("accepts a valid encryption request", () => {
      expect(() =>
        service.validateEncryptRequest({
          plaintext: "sensitive-value",
          context: validContext,
          keyId: "key-001",
        }),
      ).not.toThrow();
    });

    it("rejects a missing request", () => {
      expect(() => service.validateEncryptRequest(undefined)).toThrow(
        SecurityServiceValidationError,
      );
    });

    it("rejects an empty plaintext", () => {
      expect(() =>
        service.validateEncryptRequest({
          plaintext: "",
          context: validContext,
          keyId: "key-001",
        }),
      ).toThrow(SecurityServiceValidationError);
    });

    it("rejects a missing key ID", () => {
      expect(() =>
        service.validateEncryptRequest({
          plaintext: "sensitive-value",
          context: validContext,
          keyId: "",
        }),
      ).toThrow(SecurityServiceValidationError);
    });

    it("rejects a missing context", () => {
      expect(() =>
        service.validateEncryptRequest({
          plaintext: "sensitive-value",
          context: undefined,
          keyId: "key-001",
        }),
      ).toThrow(SecurityServiceValidationError);
    });
  });

  describe("decrypt request validation", () => {
    it("accepts a valid decryption request", () => {
      expect(() =>
        service.validateDecryptRequest({
          encrypted: "encrypted-payload",
          context: validContext,
          keyId: "key-001",
        }),
      ).not.toThrow();
    });

    it("rejects an empty encrypted value", () => {
      expect(() =>
        service.validateDecryptRequest({
          encrypted: "",
          context: validContext,
          keyId: "key-001",
        }),
      ).toThrow(SecurityServiceValidationError);
    });

    it("rejects a missing key ID", () => {
      expect(() =>
        service.validateDecryptRequest({
          encrypted: "encrypted-payload",
          context: validContext,
          keyId: "",
        }),
      ).toThrow(SecurityServiceValidationError);
    });
  });

  describe("hash request validation", () => {
    it("accepts a valid hash request", () => {
      expect(() =>
        service.validateHashRequest({
          value: "password-value",
          algorithm: HashAlgorithm.ARGON2ID,
        }),
      ).not.toThrow();
    });

    it("rejects an empty value", () => {
      expect(() =>
        service.validateHashRequest({
          value: "",
          algorithm: HashAlgorithm.ARGON2ID,
        }),
      ).toThrow(SecurityServiceValidationError);
    });

    it("rejects a missing algorithm", () => {
      expect(() =>
        service.validateHashRequest({
          value: "password-value",
          algorithm: undefined,
        }),
      ).toThrow(SecurityServiceValidationError);
    });
  });

  describe("hash verification request validation", () => {
    it("accepts a valid hash verification request", () => {
      expect(() =>
        service.validateVerifyHashRequest({
          value: "password-value",
          hash: "stored-hash",
          algorithm: HashAlgorithm.ARGON2ID,
        }),
      ).not.toThrow();
    });

    it("rejects an empty hash", () => {
      expect(() =>
        service.validateVerifyHashRequest({
          value: "password-value",
          hash: "",
          algorithm: HashAlgorithm.ARGON2ID,
        }),
      ).toThrow(SecurityServiceValidationError);
    });

    it("rejects a missing value", () => {
      expect(() =>
        service.validateVerifyHashRequest({
          value: "",
          hash: "stored-hash",
          algorithm: HashAlgorithm.ARGON2ID,
        }),
      ).toThrow(SecurityServiceValidationError);
    });
  });

  describe("sign request validation", () => {
    it("accepts a valid signing request", () => {
      expect(() =>
        service.validateSignRequest({
          payload: "payload-to-sign",
          algorithm: SignatureAlgorithm.ED25519,
          context: validContext,
        }),
      ).not.toThrow();
    });

    it("rejects an empty payload", () => {
      expect(() =>
        service.validateSignRequest({
          payload: "",
          algorithm: SignatureAlgorithm.ED25519,
          context: validContext,
        }),
      ).toThrow(SecurityServiceValidationError);
    });

    it("rejects a missing context", () => {
      expect(() =>
        service.validateSignRequest({
          payload: "payload-to-sign",
          algorithm: SignatureAlgorithm.ED25519,
          context: undefined,
        }),
      ).toThrow(SecurityServiceValidationError);
    });
  });

  describe("signature verification request validation", () => {
    it("accepts a valid signature verification request", () => {
      expect(() =>
        service.validateVerifySignatureRequest({
          payload: "payload-to-verify",
          signature: "signature-value",
          algorithm: SignatureAlgorithm.ED25519,
          keyId: "signing-key-001",
          keyVersion: 1,
          context: validContext,
        }),
      ).not.toThrow();
    });

    it("rejects an empty signature", () => {
      expect(() =>
        service.validateVerifySignatureRequest({
          payload: "payload-to-verify",
          signature: "",
          algorithm: SignatureAlgorithm.ED25519,
          keyId: "signing-key-001",
          keyVersion: 1,
          context: validContext,
        }),
      ).toThrow(SecurityServiceValidationError);
    });

    it("rejects a missing key ID", () => {
      expect(() =>
        service.validateVerifySignatureRequest({
          payload: "payload-to-verify",
          signature: "signature-value",
          algorithm: SignatureAlgorithm.ED25519,
          keyId: "",
          keyVersion: 1,
          context: validContext,
        }),
      ).toThrow(SecurityServiceValidationError);
    });

    it("rejects a non-positive key version", () => {
      expect(() =>
        service.validateVerifySignatureRequest({
          payload: "payload-to-verify",
          signature: "signature-value",
          algorithm: SignatureAlgorithm.ED25519,
          keyId: "signing-key-001",
          keyVersion: 0,
          context: validContext,
        }),
      ).toThrow(SecurityServiceValidationError);
    });
  });

  describe("HMAC creation request validation", () => {
    it("accepts a valid HMAC request", () => {
      expect(() =>
        service.validateCreateHmacRequest({
          payload: "payload-to-authenticate",
          algorithm: HmacAlgorithm.HMAC_SHA_256,
          context: validContext,
        }),
      ).not.toThrow();
    });

    it("rejects an empty payload", () => {
      expect(() =>
        service.validateCreateHmacRequest({
          payload: "",
          algorithm: HmacAlgorithm.HMAC_SHA_256,
          context: validContext,
        }),
      ).toThrow(SecurityServiceValidationError);
    });
  });

  describe("HMAC verification request validation", () => {
    it("accepts a valid HMAC verification request", () => {
      expect(() =>
        service.validateVerifyHmacRequest({
          payload: "payload-to-verify",
          signature: "hmac-value",
          algorithm: HmacAlgorithm.HMAC_SHA_256,
          keyId: "hmac-key-001",
          keyVersion: 1,
          context: validContext,
        }),
      ).not.toThrow();
    });

    it("rejects an empty signature", () => {
      expect(() =>
        service.validateVerifyHmacRequest({
          payload: "payload-to-verify",
          signature: "",
          algorithm: HmacAlgorithm.HMAC_SHA_256,
          keyId: "hmac-key-001",
          keyVersion: 1,
          context: validContext,
        }),
      ).toThrow(SecurityServiceValidationError);
    });

    it("rejects a non-positive key version", () => {
      expect(() =>
        service.validateVerifyHmacRequest({
          payload: "payload-to-verify",
          signature: "hmac-value",
          algorithm: HmacAlgorithm.HMAC_SHA_256,
          keyId: "hmac-key-001",
          keyVersion: -1,
          context: validContext,
        }),
      ).toThrow(SecurityServiceValidationError);
    });
  });
});
