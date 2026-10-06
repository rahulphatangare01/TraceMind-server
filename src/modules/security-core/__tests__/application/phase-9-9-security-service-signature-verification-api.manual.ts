import { securityCore } from "../../security-core.container.js";

import {
  CryptoEncoding,
  DataClassification,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
} from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/security-context.js";

const context: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-phase-9-9",
  projectId: "project-phase-9-9",
  applicationId: "application-phase-9-9",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.SIGNING,
};

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  console.log("\n========================================");
  console.log("Phase 9.9 - Signature Verification API");
  console.log("========================================\n");

  // ============================================================
  // 1. Generate signature through Security Service Signing API
  // ============================================================

  console.log("1. Creating signature...");

  const signed = await securityCore.securityServiceSigningApi.sign({
    payload: "TraceMind Phase 9.9 verification test",
    algorithm: SignatureAlgorithm.ED25519,
    encoding: CryptoEncoding.BASE64,
    context,
  });

  assert(signed.signature.length > 0, "Signature was not generated");

  assert(signed.keyId.length > 0, "Signing key ID was not returned");

  assert(signed.keyVersion > 0, "Signing key version is invalid");

  console.log("✓ Signature generated");

  // ============================================================
  // 2. Verify valid signature
  // ============================================================

  console.log("\n2. Verifying valid signature...");

  const validResult =
    await securityCore.securityServiceSignatureVerificationApi.verifySignature({
      payload: "TraceMind Phase 9.9 verification test",
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      encoding: signed.encoding,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion,
      context,
    });

  assert(validResult.valid === true, "Valid signature verification failed");

  console.log("✓ Valid signature verified");

  // ============================================================
  // 3. Verify modified payload
  // ============================================================

  console.log("\n3. Verifying modified payload...");

  const modifiedPayloadResult =
    await securityCore.securityServiceSignatureVerificationApi.verifySignature({
      payload: "TraceMind Phase 9.9 MODIFIED payload",
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      encoding: signed.encoding,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion,
      context,
    });

  assert(
    modifiedPayloadResult.valid === false,
    "Modified payload was incorrectly accepted",
  );

  console.log("✓ Modified payload rejected");

  // ============================================================
  // 4. Verify modified signature
  // ============================================================

  console.log("\n4. Verifying modified signature...");

  const modifiedSignature = `${signed.signature.slice(0, -2)}AA`;

  const modifiedSignatureResult =
    await securityCore.securityServiceSignatureVerificationApi.verifySignature({
      payload: "TraceMind Phase 9.9 verification test",
      signature: modifiedSignature,
      algorithm: SignatureAlgorithm.ED25519,
      encoding: signed.encoding,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion,
      context,
    });

  assert(
    modifiedSignatureResult.valid === false,
    "Modified signature was incorrectly accepted",
  );

  console.log("✓ Modified signature rejected");

  // ============================================================
  // 5. Verify invalid key version
  // ============================================================

  console.log("\n5. Verifying invalid key version...");

  const invalidKeyVersionResult =
    await securityCore.securityServiceSignatureVerificationApi.verifySignature({
      payload: "TraceMind Phase 9.9 verification test",
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      encoding: signed.encoding,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion + 999,
      context,
    });

  assert(
    invalidKeyVersionResult.valid === false,
    "Invalid key version was incorrectly accepted",
  );

  console.log("✓ Invalid key version rejected");

  // ============================================================
  // 6. Invalid context must be rejected
  // ============================================================

  console.log("\n6. Testing invalid security context...");

  await assertRejects(
    () =>
      securityCore.securityServiceSignatureVerificationApi.verifySignature({
        payload: "TraceMind Phase 9.9 verification test",
        signature: signed.signature,
        algorithm: SignatureAlgorithm.ED25519,
        encoding: signed.encoding,
        keyId: signed.keyId,
        keyVersion: signed.keyVersion,
        context: {
          ...context,
          applicationId: "",
        },
      }),
    "Invalid security context was accepted",
  );

  console.log("✓ Invalid security context rejected");

  console.log("\n========================================");
  console.log("✓ Phase 9.9 Manual Verification Passed");
  console.log("========================================\n");
}

async function assertRejects(
  operation: () => Promise<unknown>,
  message: string,
): Promise<void> {
  try {
    await operation();
  } catch {
    return;
  }

  throw new Error(message);
}

main().catch((error) => {
  console.error("\n✗ Phase 9.9 Manual Verification Failed\n");
  console.error(error);
  process.exit(1);
});
