import { describe, expect, it } from "vitest";

import { securityCore } from "../../security-core.container.js";

import { SecurityServiceErrorHandlingService } from "../../application/services/security-service-error-handling.service.js";

describe("Security Core container wiring", () => {
  it("exposes the shared error-handling service", () => {
    expect(securityCore.securityServiceErrorHandling).toBeInstanceOf(
      SecurityServiceErrorHandlingService,
    );
  });

  it("returns the same error-handling service instance", () => {
    expect(securityCore.securityServiceErrorHandling).toBe(
      securityCore.securityServiceErrorHandling,
    );
  });

  it("preserves the existing crypto provider", () => {
    expect(securityCore.cryptoProvider).toBeDefined();
  });

  it("preserves the existing encryption service", () => {
    expect(securityCore.encryptionService).toBeDefined();
  });

  it("preserves the existing validation service", () => {
    expect(securityCore.securityServiceValidation).toBeDefined();
  });

  it("preserves the encryption and decryption APIs", () => {
    expect(securityCore.securityServiceEncryptionApi).toBeDefined();

    expect(securityCore.securityServiceDecryptionApi).toBeDefined();
  });

  it("preserves the hashing APIs", () => {
    expect(securityCore.securityServiceHashingApi).toBeDefined();

    expect(securityCore.securityServiceHashVerificationApi).toBeDefined();
  });

  it("preserves the signing APIs", () => {
    expect(securityCore.securityServiceSigningApi).toBeDefined();

    expect(securityCore.securityServiceSignatureVerificationApi).toBeDefined();
  });

  it("preserves the HMAC APIs", () => {
    expect(securityCore.securityServiceHmacApi).toBeDefined();

    expect(securityCore.securityServiceHmacVerificationApi).toBeDefined();
  });

  it("preserves key management wiring", () => {
    expect(securityCore.securityServiceKeyManagementApi).toBeDefined();
  });

  it("preserves provider resolution wiring", () => {
    expect(securityCore.providerRegistry).toBeDefined();

    expect(securityCore.providerResolver).toBeDefined();

    expect(securityCore.securityServiceProviderResolution).toBeDefined();
  });
});
