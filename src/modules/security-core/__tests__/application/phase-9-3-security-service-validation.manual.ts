import assert from "node:assert/strict";

// import { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";

import { SecurityServiceValidationError } from "../../errors";

import { SecurityContextValidator } from "../../application/services/security-context-validator.service.js";

import { SecurityBoundaryValidator } from "../../application/services/security-boundary-validator.service.js";

import {
  SecurityScope,
  DataClassification,
  SecurityPurpose,
} from "../../domain/enums";

import { HashAlgorithm } from "../../domain/enums";
import { SignatureAlgorithm } from "../../domain/enums";
import { HmacAlgorithm } from "../../domain/enums";
// import { SecurityServiceValidationServiceImpl } from "../../application/services/security-service-validation.service.js";
import { SecurityServiceValidationService } from "../../application/services/security-service-validation.service.js";
const validContext = {
  scope: SecurityScope.ORGANIZATION,
  organizationId: "org-001",
  classification: DataClassification.CONFIDENTIAL,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

const contextValidator = {
  validate: () => undefined,
};

const boundaryValidator = {
  validate: () => undefined,
};

const service = new SecurityServiceValidationService(
  contextValidator as unknown as SecurityContextValidator,
  boundaryValidator as unknown as SecurityBoundaryValidator,
);

let passed = 0;
let failed = 0;

function runTest(name: string, test: () => void): void {
  try {
    test();
    passed += 1;
    console.log(`PASS: ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL: ${name}`);
    console.error(error);
  }
}

function expectValidationError(callback: () => void, testName: string): void {
  assert.throws(callback, SecurityServiceValidationError, testName);
}

/*
 * Encryption
 */
runTest("valid encryption request", () => {
  assert.doesNotThrow(() =>
    service.validateEncryptRequest({
      plaintext: "sensitive-value",
      context: validContext,
      keyId: "key-001",
    }),
  );
});

runTest("encryption rejects empty plaintext", () => {
  expectValidationError(
    () =>
      service.validateEncryptRequest({
        plaintext: "",
        context: validContext,
        keyId: "key-001",
      }),
    "Empty plaintext should be rejected",
  );
});

runTest("encryption rejects missing key ID", () => {
  expectValidationError(
    () =>
      service.validateEncryptRequest({
        plaintext: "sensitive-value",
        context: validContext,
        keyId: "",
      }),
    "Missing key ID should be rejected",
  );
});

/*
 * Decryption
 */
runTest("valid decryption request", () => {
  assert.doesNotThrow(() =>
    service.validateDecryptRequest({
      encrypted: "encrypted-payload",
      context: validContext,
      keyId: "key-001",
    }),
  );
});

runTest("decryption rejects empty encrypted payload", () => {
  expectValidationError(
    () =>
      service.validateDecryptRequest({
        encrypted: "",
        context: validContext,
        keyId: "key-001",
      }),
    "Empty encrypted payload should be rejected",
  );
});

/*
 * Hashing
 */
runTest("valid hash request", () => {
  assert.doesNotThrow(() =>
    service.validateHashRequest({
      value: "password-value",
      algorithm: HashAlgorithm.ARGON2ID,
    }),
  );
});

runTest("hash rejects empty value", () => {
  expectValidationError(
    () =>
      service.validateHashRequest({
        value: "",
        algorithm: HashAlgorithm.ARGON2ID,
      }),
    "Empty hash value should be rejected",
  );
});

/*
 * Hash verification
 */
runTest("valid hash verification request", () => {
  assert.doesNotThrow(() =>
    service.validateVerifyHashRequest({
      value: "password-value",
      hash: "stored-hash",
      algorithm: HashAlgorithm.ARGON2ID,
    }),
  );
});

runTest("hash verification rejects empty hash", () => {
  expectValidationError(
    () =>
      service.validateVerifyHashRequest({
        value: "password-value",
        hash: "",
        algorithm: HashAlgorithm.ARGON2ID,
      }),
    "Empty hash should be rejected",
  );
});

/*
 * Signing
 */
runTest("valid signing request", () => {
  assert.doesNotThrow(() =>
    service.validateSignRequest({
      payload: "payload-to-sign",
      algorithm: SignatureAlgorithm.ED25519,
      context: validContext,
    }),
  );
});

runTest("signing rejects empty payload", () => {
  expectValidationError(
    () =>
      service.validateSignRequest({
        payload: "",
        algorithm: SignatureAlgorithm.ED25519,
        context: validContext,
      }),
    "Empty signing payload should be rejected",
  );
});

/*
 * Signature verification
 */
runTest("valid signature verification request", () => {
  assert.doesNotThrow(() =>
    service.validateVerifySignatureRequest({
      payload: "payload-to-verify",
      signature: "signature-value",
      algorithm: SignatureAlgorithm.ED25519,
      keyId: "signing-key-001",
      keyVersion: 1,
      context: validContext,
    }),
  );
});

runTest("signature verification rejects invalid key version", () => {
  expectValidationError(
    () =>
      service.validateVerifySignatureRequest({
        payload: "payload-to-verify",
        signature: "signature-value",
        algorithm: SignatureAlgorithm.ED25519,
        keyId: "signing-key-001",
        keyVersion: 0,
        context: validContext,
      }),
    "Zero key version should be rejected",
  );
});

/*
 * HMAC creation
 */
runTest("valid HMAC creation request", () => {
  assert.doesNotThrow(() =>
    service.validateCreateHmacRequest({
      payload: "payload-to-authenticate",
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      context: validContext,
    }),
  );
});

runTest("HMAC creation rejects empty payload", () => {
  expectValidationError(
    () =>
      service.validateCreateHmacRequest({
        payload: "",
        algorithm: HmacAlgorithm.HMAC_SHA_256,
        context: validContext,
      }),
    "Empty HMAC payload should be rejected",
  );
});

/*
 * HMAC verification
 */
runTest("valid HMAC verification request", () => {
  assert.doesNotThrow(() =>
    service.validateVerifyHmacRequest({
      payload: "payload-to-verify",
      signature: "hmac-value",
      algorithm: HmacAlgorithm.HMAC_SHA_256,
      keyId: "hmac-key-001",
      keyVersion: 1,
      context: validContext,
    }),
  );
});

runTest("HMAC verification rejects invalid key version", () => {
  expectValidationError(
    () =>
      service.validateVerifyHmacRequest({
        payload: "payload-to-verify",
        signature: "hmac-value",
        algorithm: HmacAlgorithm.HMAC_SHA_256,
        keyId: "hmac-key-001",
        keyVersion: -1,
        context: validContext,
      }),
    "Negative key version should be rejected",
  );
});

console.log("\nPhase 9.3 Manual Test Summary");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  throw new Error("Phase 9.3 manual validation tests failed.");
}
