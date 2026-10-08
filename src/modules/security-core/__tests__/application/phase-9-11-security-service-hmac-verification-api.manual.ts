import assert from "node:assert/strict";

import {
  CryptoEncoding,
  DataClassification,
  HmacAlgorithm,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/security-context.js";

import { securityCore } from "../../security-core.container.js";

/**
 * ============================================================================
 * Phase 9.11
 * Security Service HMAC Verification API
 * ============================================================================
 *
 * Manual verification covers:
 *
 * 1. Valid HMAC verification
 * 2. Valid HMAC returns true
 * 3. Generated HMAC can be verified through the public Security Service API
 * 4. Different payload returns false
 * 5. Modified signature returns false
 * 6. Invalid key version returns false
 * 7. Invalid security context is rejected
 * 8. Invalid HMAC algorithm is rejected
 * 9. Empty signature is rejected
 * 10. Missing key ID is rejected
 *
 * IMPORTANT:
 *
 * This test intentionally uses:
 *
 * securityCore.securityServiceHmacApi
 *
 * for HMAC creation and:
 *
 * securityCore.securityServiceHmacVerificationApi
 *
 * for HMAC verification.
 *
 * It should NOT call cryptoProvider.verifyHmac() directly.
 * ============================================================================
 */

const validContext: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-phase-9-11",
  projectId: "project-phase-9-11",
  applicationId: "application-phase-9-11",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.HMAC,
};

/**
 * ============================================================================
 * Test 1
 * Valid HMAC verification
 * ============================================================================
 */
async function testValidHmacVerification(): Promise<void> {
  console.log("\nTest 1 - Valid HMAC verification");

  const payload = "TraceMind Phase 9.11 verification test";

  const hmac = await securityCore.securityServiceHmacApi.createHmac({
    payload,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    context: validContext,
  });

  assert.ok(hmac.signature, "HMAC signature should be generated");

  const verification =
    await securityCore.securityServiceHmacVerificationApi.verifyHmac({
      payload,
      signature: hmac.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      encoding: CryptoEncoding.BASE64,
      keyId: hmac.keyId,
      keyVersion: hmac.keyVersion,
      context: validContext,
    });

  assert.equal(verification.valid, true, "Valid HMAC should return valid=true");

  console.log("✓ HMAC was generated successfully");
  console.log("✓ HMAC verification returned true");
  console.log("✓ Key ID:", hmac.keyId);
  console.log("✓ Key version:", hmac.keyVersion);
}

/**
 * ============================================================================
 * Test 2
 * Same payload + same HMAC should verify successfully
 * ============================================================================
 */
async function testRepeatedVerification(): Promise<void> {
  console.log("\nTest 2 - Repeated verification of the same HMAC");

  const payload = "TraceMind repeated HMAC verification";

  const hmac = await securityCore.securityServiceHmacApi.createHmac({
    payload,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    context: validContext,
  });

  const firstVerification =
    await securityCore.securityServiceHmacVerificationApi.verifyHmac({
      payload,
      signature: hmac.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      encoding: CryptoEncoding.BASE64,
      keyId: hmac.keyId,
      keyVersion: hmac.keyVersion,
      context: validContext,
    });

  const secondVerification =
    await securityCore.securityServiceHmacVerificationApi.verifyHmac({
      payload,
      signature: hmac.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      encoding: CryptoEncoding.BASE64,
      keyId: hmac.keyId,
      keyVersion: hmac.keyVersion,
      context: validContext,
    });

  assert.equal(
    firstVerification.valid,
    true,
    "First HMAC verification should succeed",
  );

  assert.equal(
    secondVerification.valid,
    true,
    "Second HMAC verification should succeed",
  );

  console.log("✓ First verification succeeded");
  console.log("✓ Second verification succeeded");
  console.log("✓ HMAC verification is repeatable");
}

/**
 * ============================================================================
 * Test 3
 * Different payload must fail verification
 * ============================================================================
 */
async function testDifferentPayloadFails(): Promise<void> {
  console.log("\nTest 3 - Different payload fails HMAC verification");

  const originalPayload = "TraceMind original payload";
  const modifiedPayload = "TraceMind modified payload";

  const hmac = await securityCore.securityServiceHmacApi.createHmac({
    payload: originalPayload,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    context: validContext,
  });

  const verification =
    await securityCore.securityServiceHmacVerificationApi.verifyHmac({
      payload: modifiedPayload,
      signature: hmac.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      encoding: CryptoEncoding.BASE64,
      keyId: hmac.keyId,
      keyVersion: hmac.keyVersion,
      context: validContext,
    });

  assert.equal(
    verification.valid,
    false,
    "Modified payload should fail HMAC verification",
  );

  console.log("✓ Original payload HMAC generated");
  console.log("✓ Modified payload was rejected");
}

/**
 * ============================================================================
 * Test 4
 * Modified signature must fail verification
 * ============================================================================
 */
async function testModifiedSignatureFails(): Promise<void> {
  console.log("\nTest 4 - Modified signature fails HMAC verification");

  const payload = "TraceMind signature tampering test";

  const hmac = await securityCore.securityServiceHmacApi.createHmac({
    payload,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    context: validContext,
  });

  const modifiedSignature = `${hmac.signature}tampered`;

  const verification =
    await securityCore.securityServiceHmacVerificationApi.verifyHmac({
      payload,
      signature: modifiedSignature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      encoding: CryptoEncoding.BASE64,
      keyId: hmac.keyId,
      keyVersion: hmac.keyVersion,
      context: validContext,
    });

  assert.equal(
    verification.valid,
    false,
    "Modified signature should fail HMAC verification",
  );

  console.log("✓ Original HMAC generated");
  console.log("✓ Modified signature was rejected");
}

/**
 * ============================================================================
 * Test 5
 * Invalid key version should not verify
 * ============================================================================
 */
async function testInvalidKeyVersionFails(): Promise<void> {
  console.log("\nTest 5 - Invalid key version fails HMAC verification");

  const payload = "TraceMind invalid key version test";

  const hmac = await securityCore.securityServiceHmacApi.createHmac({
    payload,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    context: validContext,
  });

  const invalidKeyVersion = hmac.keyVersion + 999;

  const verification =
    await securityCore.securityServiceHmacVerificationApi.verifyHmac({
      payload,
      signature: hmac.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      encoding: CryptoEncoding.BASE64,
      keyId: hmac.keyId,
      keyVersion: invalidKeyVersion,
      context: validContext,
    });

  assert.equal(
    verification.valid,
    false,
    "Invalid key version should not verify successfully",
  );

  console.log("✓ Original key version:", hmac.keyVersion);
  console.log("✓ Invalid key version:", invalidKeyVersion);
  console.log("✓ Invalid key version was rejected");
}

/**
 * ============================================================================
 * Test 6
 * Invalid security context should be rejected
 * ============================================================================
 */
async function testInvalidContext(): Promise<void> {
  console.log("\nTest 6 - Invalid security context is rejected");

  const payload = "TraceMind invalid context test";

  const hmac = await securityCore.securityServiceHmacApi.createHmac({
    payload,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    context: validContext,
  });

  const invalidContext: SecurityContext = {
    ...validContext,
    applicationId: "",
  };

  await assert.rejects(
    async () =>
      securityCore.securityServiceHmacVerificationApi.verifyHmac({
        payload,
        signature: hmac.signature,
        algorithm: HmacAlgorithm.HMAC_SHA_256,
        encoding: CryptoEncoding.BASE64,
        keyId: hmac.keyId,
        keyVersion: hmac.keyVersion,
        context: invalidContext,
      }),
    "Invalid security context should be rejected",
  );

  console.log("✓ Invalid security context was rejected");
}

/**
 * ============================================================================
 * Test 7
 * Invalid HMAC algorithm should be rejected
 * ============================================================================
 */
async function testInvalidAlgorithm(): Promise<void> {
  console.log("\nTest 7 - Invalid HMAC algorithm is rejected");

  const invalidRequest = {
    payload: "TraceMind invalid algorithm test",
    signature: "invalid-signature",
    algorithm: "INVALID_HMAC_ALGORITHM",
    encoding: CryptoEncoding.BASE64,
    keyId: "mock-key-id",
    keyVersion: 1,
    context: validContext,
  };

  await assert.rejects(
    async () =>
      securityCore.securityServiceHmacVerificationApi.verifyHmac(
        invalidRequest as never,
      ),
    "Invalid HMAC algorithm should be rejected",
  );

  console.log("✓ Invalid HMAC algorithm was rejected");
}

/**
 * ============================================================================
 * Test 8
 * Empty signature should be rejected
 * ============================================================================
 */
async function testEmptySignature(): Promise<void> {
  console.log("\nTest 8 - Empty signature is rejected");

  const invalidRequest = {
    payload: "TraceMind empty signature test",
    signature: "",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    keyId: "mock-key-id",
    keyVersion: 1,
    context: validContext,
  };

  await assert.rejects(
    async () =>
      securityCore.securityServiceHmacVerificationApi.verifyHmac(
        invalidRequest as never,
      ),
    "Empty signature should be rejected",
  );

  console.log("✓ Empty signature was rejected");
}

/**
 * ============================================================================
 * Test 9
 * Missing key ID should be rejected
 * ============================================================================
 */
async function testMissingKeyId(): Promise<void> {
  console.log("\nTest 9 - Missing key ID is rejected");

  const invalidRequest = {
    payload: "TraceMind missing key ID test",
    signature: "mock-signature",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    keyVersion: 1,
    context: validContext,
  };

  await assert.rejects(
    async () =>
      securityCore.securityServiceHmacVerificationApi.verifyHmac(
        invalidRequest as never,
      ),
    "Missing key ID should be rejected",
  );

  console.log("✓ Missing key ID was rejected");
}

/**
 * ============================================================================
 * Test 10
 * HEX encoding verification
 * ============================================================================
 */
async function testHexEncoding(): Promise<void> {
  console.log("\nTest 10 - HMAC verification with HEX encoding");

  const payload = "TraceMind HEX HMAC verification";

  const hmac = await securityCore.securityServiceHmacApi.createHmac({
    payload,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.HEX,
    context: validContext,
  });

  assert.match(
    hmac.signature,
    /^[0-9a-f]+$/i,
    "Generated HEX HMAC should contain only hexadecimal characters",
  );

  const verification =
    await securityCore.securityServiceHmacVerificationApi.verifyHmac({
      payload,
      signature: hmac.signature,
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      encoding: CryptoEncoding.HEX,
      keyId: hmac.keyId,
      keyVersion: hmac.keyVersion,
      context: validContext,
    });

  assert.equal(
    verification.valid,
    true,
    "Valid HEX HMAC should verify successfully",
  );

  console.log("✓ HEX HMAC generated");
  console.log("✓ HEX HMAC verified successfully");
}

/**
 * ============================================================================
 * Main runner
 * ============================================================================
 */
async function run(): Promise<void> {
  console.log("");
  console.log("==================================================");
  console.log("TraceMind - Phase 9.11 Manual Verification");
  console.log("Security Service HMAC Verification API");
  console.log("==================================================");

  try {
    await testValidHmacVerification();

    await testRepeatedVerification();

    await testDifferentPayloadFails();

    await testModifiedSignatureFails();

    await testInvalidKeyVersionFails();

    await testInvalidContext();

    await testInvalidAlgorithm();

    await testEmptySignature();

    await testMissingKeyId();

    await testHexEncoding();

    console.log("");
    console.log("==================================================");
    console.log("PHASE 9.11 MANUAL VERIFICATION PASSED");
    console.log("==================================================");
  } catch (error) {
    console.error("");
    console.error("==================================================");
    console.error("PHASE 9.11 MANUAL VERIFICATION FAILED");
    console.error("==================================================");

    console.error(error);

    process.exitCode = 1;
  }
}

/**
 * Do not use top-level await because the manual test may be
 * interpreted as CommonJS by the current TypeScript configuration.
 */
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
