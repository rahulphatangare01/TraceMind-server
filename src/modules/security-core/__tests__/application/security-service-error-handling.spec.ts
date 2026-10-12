import { describe, expect, it } from "vitest";

import { SecurityCoreError } from "../../errors/security-core.error.js";

import { SecurityServiceValidationError } from "../../errors/security-service-validation.error.js";

import { SecurityContextValidationError } from "../../errors/security-context-validation.error.js";

import { SecurityBoundaryValidationError } from "../../errors/security-boundary-validation.error.js";

import { ProviderError } from "../../errors/provider.error.js";

import { ProviderErrorCode } from "../../types/provider-error.types.js";

import { SecurityServiceErrorHandlingService } from "../../application/services/security-service-error-handling.service.js";

describe("SecurityServiceErrorHandlingService", () => {
  const createService = () => new SecurityServiceErrorHandlingService();

  it("should preserve existing SecurityCoreError instances", () => {
    const service = createService();

    const originalError = new SecurityCoreError("Existing security error", {
      code: "EXISTING_SECURITY_ERROR",
    });

    let thrownError: unknown;

    try {
      service.execute(() => {
        throw originalError;
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBe(originalError);
  });

  it("should preserve SecurityServiceValidationError", () => {
    const service = createService();

    const originalError = new SecurityServiceValidationError(
      "Invalid request",
      {
        code: "SECURITY_SERVICE_VALIDATION_ERROR",
      },
    );

    let thrownError: unknown;

    try {
      service.execute(() => {
        throw originalError;
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBe(originalError);

    expect(thrownError).toBeInstanceOf(SecurityServiceValidationError);
  });

  it("should preserve SecurityContextValidationError", () => {
    const service = createService();

    const originalError = new SecurityContextValidationError([
      "Invalid security context",
    ]);

    let thrownError: unknown;

    try {
      service.execute(() => {
        throw originalError;
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBe(originalError);

    expect(thrownError).toBeInstanceOf(SecurityContextValidationError);
  });

  it("should preserve SecurityBoundaryValidationError", () => {
    const service = createService();

    const originalError = new SecurityBoundaryValidationError([
      "Invalid security boundary",
    ]);

    let thrownError: unknown;

    try {
      service.execute(() => {
        throw originalError;
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBe(originalError);

    expect(thrownError).toBeInstanceOf(SecurityBoundaryValidationError);
  });

  it("should preserve ProviderError classification", () => {
    const service = createService();

    const originalError = new ProviderError(
      "Provider operation failed",
      ProviderErrorCode.PROVIDER_OPERATION_FAILED,
    );

    let thrownError: unknown;

    try {
      service.execute(() => {
        throw originalError;
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBe(originalError);

    expect(thrownError).toBeInstanceOf(ProviderError);

    expect((thrownError as ProviderError).code).toBe(
      ProviderErrorCode.PROVIDER_OPERATION_FAILED,
    );
  });

  it("should sanitize unknown Error instances", () => {
    const service = createService();

    const secret = "SUPER_SECRET_PASSWORD";

    const originalError = new Error(`Database password leaked: ${secret}`);

    let thrownError: unknown;

    try {
      service.execute(() => {
        throw originalError;
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(SecurityCoreError);

    const normalized = thrownError as SecurityCoreError;

    expect(normalized.message).toBe("Security service operation failed");

    expect(normalized.code).toBe("SECURITY_SERVICE_ERROR");

    expect(normalized.message).not.toContain(secret);

    expect(JSON.stringify(normalized)).not.toContain(secret);
  });

  it("should sanitize unknown non-Error values", () => {
    const service = createService();

    const secret = "RAW_KEY_MATERIAL_123";

    let thrownError: unknown;

    try {
      service.execute(() => {
        throw secret;
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(SecurityCoreError);

    const normalized = thrownError as SecurityCoreError;

    expect(normalized.code).toBe("SECURITY_SERVICE_ERROR");

    expect(normalized.message).not.toContain(secret);
  });

  it("should not expose raw key material", () => {
    const service = createService();

    const rawKey = "-----BEGIN PRIVATE KEY-----RAW-KEY-----";

    let thrownError: unknown;

    try {
      service.execute(() => {
        throw new Error(`Private key: ${rawKey}`);
      });
    } catch (error) {
      thrownError = error;
    }

    const normalized = thrownError as SecurityCoreError;

    expect(normalized.message).not.toContain(rawKey);

    expect(JSON.stringify(normalized)).not.toContain(rawKey);
  });

  it("should not expose secrets or credentials", () => {
    const service = createService();

    const sensitiveValues = [
      "password=MySecretPassword",
      "token=super-secret-token",
      "apiKey=super-secret-api-key",
      "clientSecret=super-secret-client-secret",
      "keyMaterial=RAW_KEY_MATERIAL",
    ];

    for (const sensitiveValue of sensitiveValues) {
      let thrownError: unknown;

      try {
        service.execute(() => {
          throw new Error(`Sensitive information: ${sensitiveValue}`);
        });
      } catch (error) {
        thrownError = error;
      }

      const normalized = thrownError as SecurityCoreError;

      expect(normalized.message).not.toContain(sensitiveValue);

      expect(JSON.stringify(normalized)).not.toContain(sensitiveValue);
    }
  });

  it("should preserve the original SecurityCoreError code", () => {
    const service = createService();

    const originalError = new SecurityCoreError("Operation failed", {
      code: "CUSTOM_SECURITY_ERROR",
    });

    let thrownError: unknown;

    try {
      service.execute(() => {
        throw originalError;
      });
    } catch (error) {
      thrownError = error;
    }

    expect((thrownError as SecurityCoreError).code).toBe(
      "CUSTOM_SECURITY_ERROR",
    );
  });

  it("should support successful synchronous operations", () => {
    const service = createService();

    const result = service.execute(() => {
      return "success";
    });

    expect(result).toBe("success");
  });

  it("should support successful asynchronous operations", async () => {
    const service = createService();

    const result = await service.executeAsync(async () => {
      return "async-success";
    });

    expect(result).toBe("async-success");
  });

  it("should sanitize asynchronous unknown errors", async () => {
    const service = createService();

    const secret = "ASYNC_SECRET_VALUE";

    let thrownError: unknown;

    try {
      await service.executeAsync(async () => {
        throw new Error(`Secret value: ${secret}`);
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(SecurityCoreError);

    const normalized = thrownError as SecurityCoreError;

    expect(normalized.code).toBe("SECURITY_SERVICE_ERROR");

    expect(normalized.message).not.toContain(secret);
  });

  it("should preserve ProviderError during asynchronous execution", async () => {
    const service = createService();

    const originalError = new ProviderError(
      "Provider unavailable",
      ProviderErrorCode.PROVIDER_UNAVAILABLE,
    );

    let thrownError: unknown;

    try {
      await service.executeAsync(async () => {
        throw originalError;
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBe(originalError);

    expect(thrownError).toBeInstanceOf(ProviderError);

    expect((thrownError as ProviderError).code).toBe(
      ProviderErrorCode.PROVIDER_UNAVAILABLE,
    );
  });
});
