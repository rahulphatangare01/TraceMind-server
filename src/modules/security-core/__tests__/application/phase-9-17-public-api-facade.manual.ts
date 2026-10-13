import { securityCore } from "../../security-core.container.js";

import { SecurityCoreError } from "../../errors/security-core.error.js";

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
  printSection("Phase 9.17 - Public API Facade");

  // --------------------------------------------------
  // 1. Facade Availability
  // --------------------------------------------------

  printSection("1. Public API Facade Availability");

  assert(securityCore !== undefined, "Security Core container is unavailable");

  assert(
    securityCore.securityService instanceof SecurityServiceFacade,
    "Public Security Service facade is unavailable or incorrectly wired",
  );

  const service = securityCore.securityService;

  console.log("✓ Security Core container is available");
  console.log("✓ Public Security Service facade is available");

  // --------------------------------------------------
  // 2. Public Operation Availability
  // --------------------------------------------------

  printSection("2. Public Operation Availability");

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

  // --------------------------------------------------
  // 3. Container Compatibility
  // --------------------------------------------------

  printSection("3. Existing API Compatibility");

  assert(
    securityCore.securityServiceEncryptionApi !== undefined,
    "Encryption API is unavailable",
  );

  assert(
    securityCore.securityServiceDecryptionApi !== undefined,
    "Decryption API is unavailable",
  );

  assert(
    securityCore.securityServiceHashingApi !== undefined,
    "Hashing API is unavailable",
  );

  assert(
    securityCore.securityServiceHashVerificationApi !== undefined,
    "Hash verification API is unavailable",
  );

  assert(
    securityCore.securityServiceSigningApi !== undefined,
    "Signing API is unavailable",
  );

  assert(
    securityCore.securityServiceSignatureVerificationApi !== undefined,
    "Signature verification API is unavailable",
  );

  assert(
    securityCore.securityServiceHmacApi !== undefined,
    "HMAC API is unavailable",
  );

  assert(
    securityCore.securityServiceHmacVerificationApi !== undefined,
    "HMAC verification API is unavailable",
  );

  console.log("✓ Existing API instances remain available");

  // --------------------------------------------------
  // 4. Hashing Through the Public Facade
  // --------------------------------------------------

  printSection("4. Hashing Through the Public Facade");

  const hashInput = "TraceMind Phase 9.17 public facade manual test";

  const hashResult = await service.hash({
    value: hashInput,
    algorithm: "SHA-256",
  } as Parameters<typeof service.hash>[0]);

  assert(
    hashResult !== undefined && hashResult !== null,
    "Hash operation returned no result",
  );

  assert(
    typeof hashResult.hash === "string" && hashResult.hash.length > 0,
    "Hash operation did not return a hash",
  );

  console.log("✓ Hash operation completed through the facade");

  // --------------------------------------------------
  // 5. Hash Verification Through the Public Facade
  // --------------------------------------------------

  printSection("5. Hash Verification Through the Public Facade");

  const hashVerification = await service.verifyHash({
    value: hashInput,
    hash: hashResult.hash,
    algorithm: "SHA-256",
  } as Parameters<typeof service.verifyHash>[0]);

  assert(
    hashVerification.valid === true,
    "Hash verification failed for the original value",
  );

  console.log("✓ Hash verification completed through the facade");

  // --------------------------------------------------
  // 6. Incorrect Value Must Not Verify
  // --------------------------------------------------

  printSection("6. Negative Hash Verification");

  const negativeVerification = await service.verifyHash({
    value: `${hashInput}-modified`,
    hash: hashResult.hash,
    algorithm: "SHA-256",
  } as Parameters<typeof service.verifyHash>[0]);

  assert(
    negativeVerification.valid === false,
    "Modified input incorrectly passed hash verification",
  );

  console.log("✓ Modified input was rejected");

  // --------------------------------------------------
  // 7. Unknown Error Sanitization
  // --------------------------------------------------

  //   printSection("7. Error Sanitization");

  //   const sensitiveValue = "TRACE_MIND_MANUAL_SECRET_9271";

  //   let caughtError: unknown;

  //   try {
  //     await service.encrypt({
  //       plaintext: sensitiveValue,
  //     } as Parameters<typeof service.encrypt>[0]);
  //   } catch (error) {
  //     caughtError = error;
  //   }

  // //   assert(
  // //     caughtError instanceof Error,
  // //     "Invalid encryption request did not produce an error",
  // //   );

  // //   assert(
  // //     !caughtError.message.includes(sensitiveValue),
  // //     "Sensitive test value leaked through the facade error message",
  // //   );
  // assert(
  //   caughtError instanceof Error,
  //   "Invalid encryption request did not produce an Error",
  // );

  // assert(
  //   !caughtError.message.includes(sensitiveValue),
  //   "Sensitive test value leaked through the facade error message",
  // );

  //   if (caughtError instanceof SecurityCoreError) {
  //     assert(caughtError.code !== "", "Security Core error code is empty");
  //   }

  //   console.log("✓ Invalid operation was rejected");
  //   console.log("✓ Sensitive test value was not exposed");

  printSection("7. Error Sanitization");

  const sensitiveValue = "TRACE_MIND_MANUAL_SECRET_9271";

  let caughtError: unknown;

  try {
    await service.encrypt({
      plaintext: sensitiveValue,
    } as Parameters<typeof service.encrypt>[0]);
  } catch (error: unknown) {
    caughtError = error;
  }

  if (!(caughtError instanceof Error)) {
    throw new Error(
      "Manual verification failed: Invalid encryption request did not produce an Error",
    );
  }

  assert(
    !caughtError.message.includes(sensitiveValue),
    "Sensitive test value leaked through the facade error message",
  );

  if (caughtError instanceof SecurityCoreError) {
    assert(caughtError.code !== "", "Security Core error code is empty");
  }

  console.log("✓ Invalid operation was rejected");
  console.log("✓ Sensitive test value was not exposed");
  // --------------------------------------------------
  // Final Result
  // --------------------------------------------------

  printSection("Final Result");

  console.log("✓ Public facade is wired in the container");
  console.log("✓ All eight public operations are available");
  console.log("✓ Existing API instances remain available");
  console.log("✓ Hashing works through the facade");
  console.log("✓ Hash verification works through the facade");
  console.log("✓ Negative hash verification works");
  console.log("✓ Error handling does not expose the test secret");

  console.log("");
  console.log("==================================================");
  console.log("PHASE 9.17 MANUAL VERIFICATION PASSED");
  console.log("==================================================");
}

runManualTest().catch((error: unknown) => {
  console.error("Phase 9.17 manual test failed:", error);

  process.exitCode = 1;
});
