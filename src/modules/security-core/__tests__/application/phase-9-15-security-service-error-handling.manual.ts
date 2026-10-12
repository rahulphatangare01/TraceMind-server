import { SecurityCoreError } from "../../errors/security-core.error.js";

import { SecurityServiceValidationError } from "../../errors/security-service-validation.error.js";

import { SecurityContextValidationError } from "../../errors/security-context-validation.error.js";

import { SecurityBoundaryValidationError } from "../../errors/security-boundary-validation.error.js";

import { ProviderError } from "../../errors/provider.error.js";

import { ProviderErrorCode } from "../../types/provider-error.types.js";

import { SecurityServiceErrorHandlingService } from "../../application/services/security-service-error-handling.service.js";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`Manual verification failed: ${message}`);
  }
};

const printSection = (title: string): void => {
  console.log("");

  console.log("==================================================");

  console.log(title);

  console.log("==================================================");
};

async function runManualTest(): Promise<void> {
  const service = new SecurityServiceErrorHandlingService();

  printSection("Phase 9.15 - Security Service Error Handling");

  // ==================================================
  // 1. Service Availability
  // ==================================================

  printSection("1. Error Handling Service Availability");

  assert(
    service !== undefined,
    "Security Service Error Handling service is unavailable",
  );

  console.log("✓ Security Service Error Handling service is available");

  // ==================================================
  // 2. Existing SecurityCoreError Preservation
  // ==================================================

  //   printSection("2. SecurityCoreError Preservation");

  //   const securityCoreError = new SecurityCoreError("Existing security error", {
  //     code: "MANUAL_SECURITY_CORE_ERROR",
  //   });

  //   const preservedSecurityCoreError = service.execute(() => {
  //     throw securityCoreError;
  //   });

  //   /*
  //    * This line is intentionally unreachable.
  //    *
  //    * The actual verification is performed below
  //    * through the catch block.
  //    */

  //   void preservedSecurityCoreError;

  //   let caughtSecurityCoreError: unknown;

  //   try {
  //     service.execute(() => {
  //       throw securityCoreError;
  //     });
  //   } catch (error) {
  //     caughtSecurityCoreError = error;
  //   }

  //   assert(
  //     caughtSecurityCoreError === securityCoreError,
  //     "Existing SecurityCoreError was not preserved",
  //   );

  //   assert(
  //     caughtSecurityCoreError instanceof SecurityCoreError,
  //     "Existing SecurityCoreError classification was lost",
  //   );

  //   assert(
  //     (caughtSecurityCoreError as SecurityCoreError).code ===
  //       "MANUAL_SECURITY_CORE_ERROR",
  //     "Existing SecurityCoreError code was changed",
  //   );

  //   console.log("✓ Existing SecurityCoreError preserved");

  //   console.log("✓ SecurityCoreError classification preserved");

  //   console.log("✓ SecurityCoreError code preserved");

  // ==================================================
  // 2. Existing SecurityCoreError Preservation
  // ==================================================

  printSection("2. SecurityCoreError Preservation");

  const securityCoreError = new SecurityCoreError("Existing security error", {
    code: "MANUAL_SECURITY_CORE_ERROR",
  });

  let caughtSecurityCoreError: unknown;

  try {
    service.execute(() => {
      throw securityCoreError;
    });
  } catch (error) {
    caughtSecurityCoreError = error;
  }

  assert(
    caughtSecurityCoreError === securityCoreError,
    "Existing SecurityCoreError was not preserved",
  );

  assert(
    caughtSecurityCoreError instanceof SecurityCoreError,
    "Existing SecurityCoreError classification was lost",
  );

  assert(
    (caughtSecurityCoreError as SecurityCoreError).code ===
      "MANUAL_SECURITY_CORE_ERROR",
    "Existing SecurityCoreError code was changed",
  );

  console.log("✓ Existing SecurityCoreError preserved");

  console.log("✓ SecurityCoreError classification preserved");

  console.log("✓ SecurityCoreError code preserved");
  // ==================================================
  // 3. Security Service Validation Error
  // ==================================================

  printSection("3. SecurityServiceValidationError Preservation");

  const validationError = new SecurityServiceValidationError(
    "Manual validation failure",
    {
      code: "MANUAL_VALIDATION_ERROR",
    },
  );

  let caughtValidationError: unknown;

  try {
    service.execute(() => {
      throw validationError;
    });
  } catch (error) {
    caughtValidationError = error;
  }

  assert(
    caughtValidationError === validationError,
    "SecurityServiceValidationError was not preserved",
  );

  assert(
    caughtValidationError instanceof SecurityServiceValidationError,
    "SecurityServiceValidationError classification was lost",
  );

  console.log("✓ SecurityServiceValidationError preserved");

  // ==================================================
  // 4. Security Context Validation Error
  // ==================================================

  printSection("4. SecurityContextValidationError Preservation");

  const contextValidationError = new SecurityContextValidationError([
    "Manual invalid security context",
  ]);

  let caughtContextValidationError: unknown;

  try {
    service.execute(() => {
      throw contextValidationError;
    });
  } catch (error) {
    caughtContextValidationError = error;
  }

  assert(
    caughtContextValidationError === contextValidationError,
    "SecurityContextValidationError was not preserved",
  );

  assert(
    caughtContextValidationError instanceof SecurityContextValidationError,
    "SecurityContextValidationError classification was lost",
  );

  assert(
    (caughtContextValidationError as SecurityContextValidationError).code ===
      "SECURITY_CONTEXT_VALIDATION_ERROR",
    "SecurityContextValidationError code changed",
  );

  console.log("✓ SecurityContextValidationError preserved");

  console.log("✓ Security context error classification preserved");

  // ==================================================
  // 5. Security Boundary Validation Error
  // ==================================================

  printSection("5. SecurityBoundaryValidationError Preservation");

  const boundaryValidationError = new SecurityBoundaryValidationError([
    "Manual invalid security boundary",
  ]);

  let caughtBoundaryValidationError: unknown;

  try {
    service.execute(() => {
      throw boundaryValidationError;
    });
  } catch (error) {
    caughtBoundaryValidationError = error;
  }

  assert(
    caughtBoundaryValidationError === boundaryValidationError,
    "SecurityBoundaryValidationError was not preserved",
  );

  assert(
    caughtBoundaryValidationError instanceof SecurityBoundaryValidationError,
    "SecurityBoundaryValidationError classification was lost",
  );

  assert(
    (caughtBoundaryValidationError as SecurityBoundaryValidationError).code ===
      "SECURITY_BOUNDARY_VALIDATION_ERROR",
    "SecurityBoundaryValidationError code changed",
  );

  console.log("✓ SecurityBoundaryValidationError preserved");

  console.log("✓ Security boundary error classification preserved");

  // ==================================================
  // 6. Provider Error Preservation
  // ==================================================

  printSection("6. ProviderError Preservation");

  const providerError = new ProviderError(
    "Manual provider operation failed",
    ProviderErrorCode.PROVIDER_OPERATION_FAILED,
  );

  let caughtProviderError: unknown;

  try {
    service.execute(() => {
      throw providerError;
    });
  } catch (error) {
    caughtProviderError = error;
  }

  assert(
    caughtProviderError === providerError,
    "ProviderError was not preserved",
  );

  assert(
    caughtProviderError instanceof ProviderError,
    "ProviderError classification was lost",
  );

  assert(
    (caughtProviderError as ProviderError).code ===
      ProviderErrorCode.PROVIDER_OPERATION_FAILED,
    "ProviderError code was changed",
  );

  console.log("✓ ProviderError preserved");

  console.log("✓ ProviderError classification preserved");

  console.log("✓ ProviderError code preserved");

  // ==================================================
  // 7. Unknown Error Sanitization
  // ==================================================

  printSection("7. Unknown Error Sanitization");

  const sensitivePassword = "SUPER_SECRET_PASSWORD_123";

  let caughtUnknownError: unknown;

  try {
    service.execute(() => {
      throw new Error(`Database password: ${sensitivePassword}`);
    });
  } catch (error) {
    caughtUnknownError = error;
  }

  assert(
    caughtUnknownError instanceof SecurityCoreError,
    "Unknown Error was not normalized to SecurityCoreError",
  );

  const normalizedUnknownError = caughtUnknownError as SecurityCoreError;

  assert(
    normalizedUnknownError.message === "Security service operation failed",
    "Unknown error message was not sanitized",
  );

  assert(
    normalizedUnknownError.code === "SECURITY_SERVICE_ERROR",
    "Unknown error code is incorrect",
  );

  assert(
    !normalizedUnknownError.message.includes(sensitivePassword),
    "Sensitive password leaked through normalized error message",
  );

  assert(
    !JSON.stringify(normalizedUnknownError).includes(sensitivePassword),
    "Sensitive password leaked through normalized error object",
  );

  console.log("✓ Unknown Error normalized");

  console.log("✓ Unknown error message sanitized");

  console.log("✓ Sensitive password not exposed");

  // ==================================================
  // 8. Raw Key Material Protection
  // ==================================================

  printSection("8. Raw Key Material Protection");

  const rawKeyMaterial = "RAW_PRIVATE_KEY_MATERIAL_123456";

  let caughtRawKeyError: unknown;

  try {
    service.execute(() => {
      throw new Error(`Private key material: ${rawKeyMaterial}`);
    });
  } catch (error) {
    caughtRawKeyError = error;
  }

  assert(
    caughtRawKeyError instanceof SecurityCoreError,
    "Raw key material error was not normalized",
  );

  const normalizedRawKeyError = caughtRawKeyError as SecurityCoreError;

  assert(
    !normalizedRawKeyError.message.includes(rawKeyMaterial),
    "Raw key material leaked through error message",
  );

  assert(
    !JSON.stringify(normalizedRawKeyError).includes(rawKeyMaterial),
    "Raw key material leaked through normalized error",
  );

  console.log("✓ Raw key material is not exposed");

  console.log("✓ Raw key material is not present in normalized error");

  // ==================================================
  // 9. Credential Protection
  // ==================================================

  printSection("9. Credential and Secret Protection");

  const sensitiveValues = [
    "password=MySecretPassword",
    "token=super-secret-token",
    "apiKey=super-secret-api-key",
    "clientSecret=super-secret-client-secret",
    "keyMaterial=RAW_KEY_MATERIAL",
  ];

  for (const sensitiveValue of sensitiveValues) {
    let caughtSensitiveError: unknown;

    try {
      service.execute(() => {
        throw new Error(`Sensitive information: ${sensitiveValue}`);
      });
    } catch (error) {
      caughtSensitiveError = error;
    }

    assert(
      caughtSensitiveError instanceof SecurityCoreError,
      `Sensitive error was not normalized: ${sensitiveValue}`,
    );

    const normalizedSensitiveError = caughtSensitiveError as SecurityCoreError;

    assert(
      !normalizedSensitiveError.message.includes(sensitiveValue),
      `Sensitive value leaked through error message: ${sensitiveValue}`,
    );

    assert(
      !JSON.stringify(normalizedSensitiveError).includes(sensitiveValue),
      `Sensitive value leaked through normalized error: ${sensitiveValue}`,
    );
  }

  console.log("✓ Password values are protected");

  console.log("✓ Token values are protected");

  console.log("✓ API key values are protected");

  console.log("✓ Client secrets are protected");

  console.log("✓ Raw key material values are protected");

  // ==================================================
  // 10. Unknown Non-Error Value
  // ==================================================

  printSection("10. Unknown Non-Error Value Sanitization");

  const unknownSecretValue = "UNKNOWN_SECRET_VALUE";

  let caughtUnknownValue: unknown;

  try {
    service.execute(() => {
      throw unknownSecretValue;
    });
  } catch (error) {
    caughtUnknownValue = error;
  }

  assert(
    caughtUnknownValue instanceof SecurityCoreError,
    "Unknown non-Error value was not normalized",
  );

  const normalizedUnknownValue = caughtUnknownValue as SecurityCoreError;

  assert(
    normalizedUnknownValue.code === "SECURITY_SERVICE_ERROR",
    "Unknown non-Error value received incorrect error code",
  );

  assert(
    !normalizedUnknownValue.message.includes(unknownSecretValue),
    "Unknown secret value leaked through normalized message",
  );

  console.log("✓ Unknown non-Error value normalized");

  console.log("✓ Unknown secret value not exposed");

  // ==================================================
  // 11. Async Error Sanitization
  // ==================================================

  printSection("11. Asynchronous Error Sanitization");

  const asyncSecret = "ASYNC_SECRET_VALUE_123";

  let caughtAsyncError: unknown;

  try {
    await service.executeAsync(async () => {
      throw new Error(`Async secret: ${asyncSecret}`);
    });
  } catch (error) {
    caughtAsyncError = error;
  }

  assert(
    caughtAsyncError instanceof SecurityCoreError,
    "Async unknown error was not normalized",
  );

  const normalizedAsyncError = caughtAsyncError as SecurityCoreError;

  assert(
    normalizedAsyncError.code === "SECURITY_SERVICE_ERROR",
    "Async unknown error code is incorrect",
  );

  assert(
    normalizedAsyncError.message === "Security service operation failed",
    "Async unknown error message was not sanitized",
  );

  assert(
    !normalizedAsyncError.message.includes(asyncSecret),
    "Async secret leaked through normalized error",
  );

  console.log("✓ Async unknown error normalized");

  console.log("✓ Async error message sanitized");

  console.log("✓ Async secret is not exposed");

  // ==================================================
  // 12. Async Provider Error Preservation
  // ==================================================

  printSection("12. Asynchronous ProviderError Preservation");

  const asyncProviderError = new ProviderError(
    "Async provider unavailable",
    ProviderErrorCode.PROVIDER_UNAVAILABLE,
  );

  let caughtAsyncProviderError: unknown;

  try {
    await service.executeAsync(async () => {
      throw asyncProviderError;
    });
  } catch (error) {
    caughtAsyncProviderError = error;
  }

  assert(
    caughtAsyncProviderError === asyncProviderError,
    "Async ProviderError was not preserved",
  );

  assert(
    caughtAsyncProviderError instanceof ProviderError,
    "Async ProviderError classification was lost",
  );

  assert(
    (caughtAsyncProviderError as ProviderError).code ===
      ProviderErrorCode.PROVIDER_UNAVAILABLE,
    "Async ProviderError code was changed",
  );

  console.log("✓ Async ProviderError preserved");

  console.log("✓ Async ProviderError classification preserved");

  console.log("✓ Async ProviderError code preserved");

  // ==================================================
  // 13. Successful Synchronous Operation
  // ==================================================

  printSection("13. Successful Synchronous Operation");

  const syncResult = service.execute(() => {
    return "security-operation-success";
  });

  assert(
    syncResult === "security-operation-success",
    "Successful synchronous operation returned incorrect result",
  );

  console.log("✓ Successful synchronous operation completed");

  // ==================================================
  // 14. Successful Asynchronous Operation
  // ==================================================

  printSection("14. Successful Asynchronous Operation");

  const asyncResult = await service.executeAsync(async () => {
    return "security-async-operation-success";
  });

  assert(
    asyncResult === "security-async-operation-success",
    "Successful asynchronous operation returned incorrect result",
  );

  console.log("✓ Successful asynchronous operation completed");

  // ==================================================
  // Final Result
  // ==================================================

  console.log("");

  console.log("==================================================");

  console.log("Phase 9.15 manual verification completed");

  console.log("==================================================");

  console.log("✓ Error handling service available");

  console.log("✓ SecurityCoreError preservation works");

  console.log("✓ SecurityServiceValidationError preservation works");

  console.log("✓ SecurityContextValidationError preservation works");

  console.log("✓ SecurityBoundaryValidationError preservation works");

  console.log("✓ ProviderError preservation works");

  console.log("✓ Unknown errors are sanitized");

  console.log("✓ Raw key material is not exposed");

  console.log("✓ Secrets and credentials are not exposed");

  console.log("✓ Unknown non-Error values are sanitized");

  console.log("✓ Async errors are sanitized");

  console.log("✓ Async ProviderError is preserved");

  console.log("✓ Successful synchronous operations work");

  console.log("✓ Successful asynchronous operations work");

  console.log("==================================================");

  console.log("PHASE 9.15 MANUAL VERIFICATION PASSED");

  console.log("==================================================");
}

runManualTest().catch((error) => {
  console.error("Phase 9.15 manual test failed:", error);

  process.exitCode = 1;
});
