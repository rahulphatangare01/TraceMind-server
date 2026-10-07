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
 * Phase 9.10
 * Security Service HMAC API
 *
 * Manual verification:
 *
 * 1. Valid HMAC creation
 * 2. HMAC signature is returned
 * 3. Algorithm is correct
 * 4. Encoding is correct
 * 5. Key ID is returned
 * 6. Key version is returned
 * 7. Different payload produces a different HMAC
 * 8. Same payload/context produces the same HMAC with the same key version
 * 9. Invalid context is rejected before provider execution
 * 10. Missing/invalid algorithm is rejected
 */

const validContext: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-phase-9-10",
  projectId: "project-phase-9-10",
  applicationId: "application-phase-9-10",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.HMAC,
};

async function testValidHmacCreation(): Promise<void> {
  console.log("\nTest 1 - Valid HMAC creation");

  const result = await securityCore.securityServiceHmacApi.createHmac({
    payload: "TraceMind Phase 9.10 manual test",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    context: validContext,
  });

  assert.ok(result, "HMAC result should be returned");

  assert.ok(result.signature, "HMAC signature should be returned");

  assert.equal(
    result.algorithm,
    HmacAlgorithm.HMAC_SHA_256,
    "HMAC algorithm should be HMAC_SHA_256",
  );

  assert.equal(
    result.encoding,
    CryptoEncoding.BASE64,
    "HMAC encoding should be BASE64",
  );

  assert.ok(result.keyId, "HMAC key ID should be returned");

  assert.ok(
    result.keyVersion > 0,
    "HMAC key version should be greater than zero",
  );

  console.log("✓ HMAC signature:", result.signature);
  console.log("✓ Algorithm:", result.algorithm);
  console.log("✓ Encoding:", result.encoding);
  console.log("✓ Key ID:", result.keyId);
  console.log("✓ Key version:", result.keyVersion);
}

async function testSameInputProducesSameHmac(): Promise<void> {
  console.log("\nTest 2 - Same input produces the same HMAC");

  const request = {
    payload: "TraceMind deterministic HMAC test",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    context: validContext,
  };

  const first = await securityCore.securityServiceHmacApi.createHmac(request);

  const second = await securityCore.securityServiceHmacApi.createHmac(request);

  assert.equal(
    first.signature,
    second.signature,
    "Same payload and context should produce the same HMAC",
  );

  assert.equal(
    first.keyId,
    second.keyId,
    "Same context should resolve to the same key ID",
  );

  assert.equal(
    first.keyVersion,
    second.keyVersion,
    "Same context should resolve to the same key version",
  );

  console.log("✓ Same HMAC generated for identical input");
  console.log("✓ Key ID is consistent");
  console.log("✓ Key version is consistent");
}

async function testDifferentPayloadProducesDifferentHmac(): Promise<void> {
  console.log("\nTest 3 - Different payload produces a different HMAC");

  const first = await securityCore.securityServiceHmacApi.createHmac({
    payload: "TraceMind payload A",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    context: validContext,
  });

  const second = await securityCore.securityServiceHmacApi.createHmac({
    payload: "TraceMind payload B",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    context: validContext,
  });

  assert.notEqual(
    first.signature,
    second.signature,
    "Different payloads should produce different HMAC values",
  );

  console.log("✓ Different payloads produced different HMAC values");
}

async function testHexEncoding(): Promise<void> {
  console.log("\nTest 4 - HMAC with HEX encoding");

  const result = await securityCore.securityServiceHmacApi.createHmac({
    payload: "TraceMind HEX encoding test",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.HEX,
    context: validContext,
  });

  assert.ok(result.signature, "HEX HMAC signature should be returned");

  assert.equal(
    result.encoding,
    CryptoEncoding.HEX,
    "Returned encoding should be HEX",
  );

  assert.match(
    result.signature,
    /^[0-9a-f]+$/i,
    "HEX HMAC signature should contain only hexadecimal characters",
  );

  console.log("✓ HEX HMAC generated successfully");
  console.log("✓ Signature:", result.signature);
}

async function testInvalidContext(): Promise<void> {
  console.log("\nTest 5 - Invalid security context is rejected");

  const invalidContext: SecurityContext = {
    ...validContext,
    applicationId: "",
  };

  await assert.rejects(
    async () =>
      securityCore.securityServiceHmacApi.createHmac({
        payload: "TraceMind invalid context test",
        algorithm: HmacAlgorithm.HMAC_SHA_256,
        encoding: CryptoEncoding.BASE64,
        context: invalidContext,
      }),
    "Invalid security context should be rejected",
  );

  console.log("✓ Invalid security context was rejected");
}

async function testInvalidAlgorithm(): Promise<void> {
  console.log("\nTest 6 - Invalid HMAC algorithm is rejected");

  const invalidRequest = {
    payload: "TraceMind invalid algorithm test",
    algorithm: "INVALID_HMAC_ALGORITHM",
    encoding: CryptoEncoding.BASE64,
    context: validContext,
  };

  await assert.rejects(
    async () =>
      securityCore.securityServiceHmacApi.createHmac(invalidRequest as never),
    "Invalid HMAC algorithm should be rejected",
  );

  console.log("✓ Invalid HMAC algorithm was rejected");
}

async function testEmptyPayload(): Promise<void> {
  console.log("\nTest 7 - Empty payload is rejected");

  const invalidRequest = {
    payload: "",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    context: validContext,
  };

  await assert.rejects(
    async () => securityCore.securityServiceHmacApi.createHmac(invalidRequest),
    "Empty payload should be rejected",
  );

  console.log("✓ Empty payload was rejected");
}

async function testMissingContext(): Promise<void> {
  console.log("\nTest 8 - Missing security context is rejected");

  const invalidRequest = {
    payload: "TraceMind missing context test",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    context: undefined,
  };

  await assert.rejects(
    async () =>
      securityCore.securityServiceHmacApi.createHmac(invalidRequest as never),
    "Missing security context should be rejected",
  );

  console.log("✓ Missing security context was rejected");
}

async function run(): Promise<void> {
  console.log("==============================================");
  console.log("TraceMind - Phase 9.10 Manual Verification");
  console.log("Security Service HMAC API");
  console.log("==============================================");

  try {
    await testValidHmacCreation();
    await testSameInputProducesSameHmac();
    await testDifferentPayloadProducesDifferentHmac();
    await testHexEncoding();
    await testInvalidContext();
    await testInvalidAlgorithm();
    await testEmptyPayload();
    await testMissingContext();

    console.log("\n==============================================");
    console.log("PHASE 9.10 MANUAL VERIFICATION PASSED");
    console.log("==============================================");
  } catch (error) {
    console.error("\n==============================================");
    console.error("PHASE 9.10 MANUAL VERIFICATION FAILED");
    console.error("==============================================");

    console.error(error);

    process.exitCode = 1;
  }
}

// await run();
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
