import { securityCore } from "../../security-core.container.js";

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
  printSection("Phase 9.16 - Security Service Container Wiring");

  printSection("1. Container Availability");

  assert(securityCore !== undefined, "Security Core container is unavailable");

  console.log("✓ Security Core container is available");

  printSection("2. Error Handling Service");

  const errorHandling = securityCore.securityServiceErrorHandling;

  assert(
    errorHandling instanceof SecurityServiceErrorHandlingService,
    "Error handling service is not wired",
  );

  assert(
    errorHandling === securityCore.securityServiceErrorHandling,
    "Container does not preserve the shared service instance",
  );

  console.log("✓ Error handling service is available");
  console.log("✓ Shared service instance is stable");

  printSection("3. Existing Service Dependencies");

  assert(
    securityCore.cryptoProvider !== undefined,
    "Crypto provider is unavailable",
  );

  assert(
    securityCore.encryptionService !== undefined,
    "Encryption service is unavailable",
  );

  assert(
    securityCore.securityServiceValidation !== undefined,
    "Validation service is unavailable",
  );

  console.log("✓ Crypto provider remains available");
  console.log("✓ Encryption service remains available");
  console.log("✓ Validation service remains available");

  printSection("4. Public API Instances");

  const apiNames = [
    "securityServiceEncryptionApi",
    "securityServiceDecryptionApi",
    "securityServiceHashingApi",
    "securityServiceHashVerificationApi",
    "securityServiceSigningApi",
    "securityServiceSignatureVerificationApi",
    "securityServiceHmacApi",
    "securityServiceHmacVerificationApi",
    "securityServiceKeyManagementApi",
    "securityServiceProviderResolution",
  ] as const;

  for (const apiName of apiNames) {
    assert(
      securityCore[apiName] !== undefined,
      `${apiName} is not wired in the container`,
    );

    console.log(`✓ ${apiName} is available`);
  }

  printSection("5. Provider Resolution Dependencies");

  assert(
    securityCore.providerRegistry !== undefined,
    "Provider registry is unavailable",
  );

  assert(
    securityCore.providerResolver !== undefined,
    "Provider resolver is unavailable",
  );

  console.log("✓ Provider registry remains available");
  console.log("✓ Provider resolver remains available");

  printSection("Final Result");

  console.log("PHASE 9.16 MANUAL VERIFICATION PASSED");
}

runManualTest().catch((error: unknown) => {
  console.error("Phase 9.16 manual test failed:", error);

  process.exitCode = 1;
});
