import { securityCore } from "../../security-core.container.js";
import { SecurityServiceFacade } from "../../application/services/security-service.facade.js";

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
  printSection("Phase 9.18 - API Contract & Regression Tests");

  // 1. Verify the public facade is wired into the container.
  printSection("1. Public Facade Availability");

  assert(
    securityCore.securityService instanceof SecurityServiceFacade,
    "Public Security Service facade is unavailable or incorrectly wired",
  );

  const service = securityCore.securityService;

  console.log("✓ Public Security Service facade is available");

  // 2. Verify all required public operations.
  printSection("2. Public API Contract");

  const operationNames = [
    "encrypt",
    "decrypt",
    "hash",
    "verifyHash",
    "sign",
    "verifySignature",
    "createHmac",
    "verifyHmac",
  ] as const;

  for (const operationName of operationNames) {
    assert(
      typeof service[operationName] === "function",
      `Public operation '${operationName}' is unavailable`,
    );

    console.log(`✓ ${operationName}() is available`);
  }

  // 3. Verify the existing API instances remain exposed.
  printSection("3. Backward Compatibility");

  const existingApiNames = [
    "securityServiceEncryptionApi",
    "securityServiceDecryptionApi",
    "securityServiceHashingApi",
    "securityServiceHashVerificationApi",
    "securityServiceSigningApi",
    "securityServiceSignatureVerificationApi",
    "securityServiceHmacApi",
    "securityServiceHmacVerificationApi",
  ] as const;

  for (const apiName of existingApiNames) {
    assert(
      securityCore[apiName] !== undefined && securityCore[apiName] !== null,
      `Existing API '${apiName}' is unavailable`,
    );

    console.log(`✓ ${apiName} remains available`);
  }

  // 4. Exercise the public hashing API.
  printSection("4. Hashing Through Public Facade");

  const value = "TraceMind Phase 9.18 regression test";

  const hashResult = await service.hash({
    value,
    algorithm: "SHA-256",
  } as Parameters<typeof service.hash>[0]);

  assert(
    typeof hashResult.hash === "string" && hashResult.hash.length > 0,
    "Public hash operation did not return a hash",
  );

  console.log("✓ Hashing returned a non-empty hash");

  // 5. Verify the original value.
  printSection("5. Positive Hash Verification");

  const validHashResult = await service.verifyHash({
    value,
    hash: hashResult.hash,
    algorithm: "SHA-256",
  } as Parameters<typeof service.verifyHash>[0]);

  assert(
    validHashResult.valid === true,
    "Original value failed hash verification",
  );

  console.log("✓ Original value passed hash verification");

  // 6. Verify a changed value is rejected.
  printSection("6. Negative Hash Verification");

  const invalidHashResult = await service.verifyHash({
    value: `${value}-modified`,
    hash: hashResult.hash,
    algorithm: "SHA-256",
  } as Parameters<typeof service.verifyHash>[0]);

  assert(
    invalidHashResult.valid === false,
    "Modified value incorrectly passed hash verification",
  );

  console.log("✓ Modified value was rejected");

  // 7. Verify the facade sanitizes unexpected errors.
  printSection("7. Error Handling Regression");

  const sensitiveValue = "TRACE_MIND_PHASE_9_18_SECRET";
  let caughtError: unknown;

  try {
    // Intentionally incomplete request to trigger validation.
    await service.encrypt({
      plaintext: sensitiveValue,
    } as Parameters<typeof service.encrypt>[0]);
  } catch (error: unknown) {
    caughtError = error;
  }

  assert(
    caughtError instanceof Error,
    "Invalid encryption request did not produce an Error",
  );

  if (!(caughtError instanceof Error)) {
    throw new Error("Expected an Error instance after validation");
  }

  assert(
    !caughtError.message.includes(sensitiveValue),
    "Sensitive test value leaked through the facade error message",
  );

  console.log("✓ Invalid request was rejected");
  console.log("✓ Error message did not expose the test secret");

  // Final summary.
  printSection("Final Result");

  console.log("✓ Public facade is available");
  console.log("✓ All eight public operations are exposed");
  console.log("✓ Existing API instances remain available");
  console.log("✓ Hashing works through the public facade");
  console.log("✓ Positive hash verification passed");
  console.log("✓ Negative hash verification passed");
  console.log("✓ Error handling regression check passed");

  console.log("");
  console.log("==================================================");
  console.log("PHASE 9.18 MANUAL VERIFICATION PASSED");
  console.log("==================================================");
}

runManualTest().catch((error: unknown) => {
  console.error("Phase 9.18 manual test failed:", error);
  process.exitCode = 1;
});
