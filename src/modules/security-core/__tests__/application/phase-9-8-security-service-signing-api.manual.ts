import { securityCore } from "../../security-core.container.js";

import {
  CryptoEncoding,
  DataClassification,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
} from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/security-context.js";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async (): Promise<void> => {
  console.log("==============================================");
  console.log("TraceMind Security Core - Phase 9.8");
  console.log("Security Service Signing API");
  console.log("==============================================");

  const context: SecurityContext = {
    scope: SecurityScope.APPLICATION,
    organizationId: "org-phase-9-8",
    projectId: "project-phase-9-8",
    applicationId: "application-phase-9-8",
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.SIGNING,
  };

  const payload = "TraceMind Phase 9.8 signing verification";

  // --------------------------------------------------
  // TEST 1
  // Ed25519 signing
  // --------------------------------------------------

  console.log("\n[TEST 1] Ed25519 signing");

  const result = await securityCore.securityServiceSigningApi.sign({
    payload,
    algorithm: SignatureAlgorithm.ED25519,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  assert(Boolean(result.signature), "Signature was not generated.");

  assert(
    result.algorithm === SignatureAlgorithm.ED25519,
    "Signature algorithm metadata mismatch.",
  );

  assert(
    result.encoding === CryptoEncoding.BASE64,
    "Signature encoding metadata mismatch.",
  );

  assert(Boolean(result.keyId), "Signing key ID is missing.");

  assert(
    Number.isInteger(result.keyVersion) && result.keyVersion > 0,
    "Signing key version is invalid.",
  );

  console.log("PASS: Ed25519 signature generated.");

  // --------------------------------------------------
  // TEST 2
  // Signature is not plaintext
  // --------------------------------------------------

  console.log("\n[TEST 2] Signature does not expose payload");

  assert(
    !result.signature.includes(payload),
    "Signature must not contain the original payload.",
  );

  console.log("PASS: Payload is not exposed.");

  // --------------------------------------------------
  // TEST 3
  // Same payload produces valid signatures
  // --------------------------------------------------

  console.log("\n[TEST 3] Repeated signing");

  const secondResult = await securityCore.securityServiceSigningApi.sign({
    payload,
    algorithm: SignatureAlgorithm.ED25519,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  assert(
    Boolean(secondResult.signature),
    "Second signature was not generated.",
  );

  assert(
    secondResult.algorithm === SignatureAlgorithm.ED25519,
    "Second signature algorithm mismatch.",
  );

  console.log("PASS: Repeated signing works.");

  // --------------------------------------------------
  // TEST 4
  // Different payload
  // --------------------------------------------------

  console.log("\n[TEST 4] Different payload");

  const differentPayloadResult =
    await securityCore.securityServiceSigningApi.sign({
      payload: "Different TraceMind payload",
      algorithm: SignatureAlgorithm.ED25519,
      context,
      encoding: CryptoEncoding.BASE64,
    });

  assert(
    Boolean(differentPayloadResult.signature),
    "Signature for different payload was not generated.",
  );

  assert(
    differentPayloadResult.signature !== result.signature,
    "Different payload unexpectedly produced the same signature.",
  );

  console.log("PASS: Different payload produces a different signature.");

  // --------------------------------------------------
  // TEST 5
  // Invalid algorithm
  // --------------------------------------------------

  console.log("\n[TEST 5] Invalid signature algorithm");

  let invalidAlgorithmRejected = false;

  try {
    await securityCore.securityServiceSigningApi.sign({
      payload,
      algorithm: "INVALID" as SignatureAlgorithm,
      context,
    });
  } catch {
    invalidAlgorithmRejected = true;
  }

  assert(
    invalidAlgorithmRejected,
    "Invalid signature algorithm was not rejected.",
  );

  console.log("PASS: Invalid signature algorithm rejected.");

  // --------------------------------------------------
  // TEST 6
  // Invalid context
  // --------------------------------------------------

  console.log("\n[TEST 6] Invalid security context");

  let invalidContextRejected = false;

  try {
    await securityCore.securityServiceSigningApi.sign({
      payload,
      algorithm: SignatureAlgorithm.ED25519,
      context: {
        scope: SecurityScope.APPLICATION,
        organizationId: "org-phase-9-8",
        projectId: "project-phase-9-8",
        // applicationId intentionally missing
        classification: DataClassification.SENSITIVE,
        purpose: SecurityPurpose.SIGNING,
      } as SecurityContext,
    });
  } catch {
    invalidContextRejected = true;
  }

  assert(invalidContextRejected, "Invalid security context was not rejected.");

  console.log("PASS: Invalid security context rejected.");

  console.log("\n==============================================");
  console.log("Phase 9.8 manual verification completed.");
  console.log("==============================================");
};

run().catch((error: unknown) => {
  console.error("\nPhase 9.8 manual verification failed:", error);
  process.exitCode = 1;
});
