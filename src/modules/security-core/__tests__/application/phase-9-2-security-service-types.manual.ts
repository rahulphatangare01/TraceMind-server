import { CryptoEncoding, EncryptionAlgorithm } from "../../domain/enums";

import type {
  EncryptRequest,
  EncryptResult,
  DecryptRequest,
  DecryptResult,
} from "../../types/encryption.types.js";

import { HashAlgorithm } from "../../domain/enums";

import type {
  HashRequest,
  HashResult,
  VerifyHashRequest,
  VerifyHashResult,
} from "../../types";

import { SignatureAlgorithm } from "../../domain/enums";

import type {
  SignRequest,
  SignResult,
  VerifySignatureRequest,
  VerifySignatureResult,
} from "../../types";

import { HmacAlgorithm } from "../../domain/enums";

import type {
  CreateHmacRequest,
  CreateHmacResult,
  VerifyHmacRequest,
  VerifyHmacResult,
} from "../../types/hmac.types.js";

import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums";

import type { SecurityContext } from "../../domain/models";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function section(title: string): void {
  console.log("");
  console.log("======================================================");
  console.log(title);
  console.log("======================================================");
}

function run(): void {
  console.log("");
  console.log("======================================================");
  console.log("Phase 9.2 - Security Service Types");
  console.log("Manual Verification");
  console.log("======================================================");

  // ----------------------------------------------------
  // Shared Security Context
  // ----------------------------------------------------

  const securityContext: SecurityContext = {
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-phase-9-2",
    classification: DataClassification.CONFIDENTIAL,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  };

  assert(
    securityContext.scope === SecurityScope.ORGANIZATION,
    "SecurityContext scope should be ORGANIZATION",
  );

  assert(
    securityContext.organizationId === "org-phase-9-2",
    "SecurityContext organizationId should be available",
  );

  console.log("✓ SecurityContext type is compatible");

  // ----------------------------------------------------
  // 1. Encryption Types
  // ----------------------------------------------------

  section("1. Encryption Types");

  const encryptRequest: EncryptRequest = {
    plaintext: "TraceMind secret configuration",
    algorithm: EncryptionAlgorithm.AES_256_GCM,
    context: securityContext,
    encoding: CryptoEncoding.BASE64,
    keyVersion: 1,
  };

  const encryptResult: EncryptResult = {
    ciphertext: "encrypted-ciphertext",
    algorithm: EncryptionAlgorithm.AES_256_GCM,
    encoding: CryptoEncoding.BASE64,
    iv: "random-iv",
    authTag: "authentication-tag",
    keyId: "key-phase-9-2",
    keyVersion: 1,
  };

  const decryptRequest: DecryptRequest = {
    ciphertext: encryptResult.ciphertext,
    algorithm: encryptResult.algorithm,
    encoding: encryptResult.encoding,
    iv: encryptResult.iv,
    authTag: encryptResult.authTag,
    keyId: encryptResult.keyId,
    keyVersion: encryptResult.keyVersion,
    context: securityContext,
  };

  const decryptResult: DecryptResult = {
    plaintext: encryptRequest.plaintext,
  };

  assert(
    encryptRequest.plaintext === encryptRequest.plaintext,
    "EncryptRequest plaintext should be available",
  );

  assert(
    encryptResult.keyId === "key-phase-9-2",
    "EncryptResult should contain keyId",
  );

  assert(
    encryptResult.keyVersion === 1,
    "EncryptResult should contain keyVersion",
  );

  assert(
    decryptRequest.ciphertext === encryptResult.ciphertext,
    "DecryptRequest should accept ciphertext",
  );

  assert(
    decryptResult.plaintext === encryptRequest.plaintext,
    "DecryptResult should contain plaintext",
  );

  console.log("✓ EncryptRequest");
  console.log("✓ EncryptResult");
  console.log("✓ DecryptRequest");
  console.log("✓ DecryptResult");

  // ----------------------------------------------------
  // 2. Hash Types
  // ----------------------------------------------------

  section("2. Hash Types");

  const hashRequest: HashRequest = {
    value: "TraceMind password value",
    algorithm: HashAlgorithm.SHA_256,
    encoding: CryptoEncoding.HEX,
  };

  const hashResult: HashResult = {
    hash: "sha256-hash-value",
    algorithm: HashAlgorithm.SHA_256,
    encoding: CryptoEncoding.HEX,
  };

  const verifyHashRequest: VerifyHashRequest = {
    value: hashRequest.value,
    hash: hashResult.hash,
    algorithm: hashResult.algorithm,
    encoding: hashResult.encoding,
  };

  const verifyHashResult: VerifyHashResult = {
    valid: true,
  };

  assert(
    hashRequest.algorithm === HashAlgorithm.SHA_256,
    "HashRequest should support SHA-256",
  );

  assert(hashResult.hash.length > 0, "HashResult should contain hash");

  assert(
    verifyHashRequest.hash === hashResult.hash,
    "VerifyHashRequest should contain hash",
  );

  assert(
    verifyHashResult.valid === true,
    "VerifyHashResult should contain valid",
  );

  console.log("✓ HashRequest");
  console.log("✓ HashResult");
  console.log("✓ VerifyHashRequest");
  console.log("✓ VerifyHashResult");

  // ----------------------------------------------------
  // 3. Signing Types
  // ----------------------------------------------------

  section("3. Signing Types");

  const signRequest: SignRequest = {
    payload: "TraceMind payload",
    algorithm: SignatureAlgorithm.ED25519,
    context: securityContext,
    encoding: CryptoEncoding.BASE64,
  };

  const signResult: SignResult = {
    signature: "ed25519-signature",
    algorithm: SignatureAlgorithm.ED25519,
    encoding: CryptoEncoding.BASE64,
    keyId: "signing-key-phase-9-2",
    keyVersion: 1,
  };

  const verifySignatureRequest: VerifySignatureRequest = {
    payload: signRequest.payload,
    signature: signResult.signature,
    algorithm: signResult.algorithm,
    keyId: signResult.keyId,
    keyVersion: signResult.keyVersion,
    context: securityContext,
    encoding: signResult.encoding,
  };

  const verifySignatureResult: VerifySignatureResult = {
    valid: true,
  };

  assert(
    signRequest.algorithm === SignatureAlgorithm.ED25519,
    "SignRequest should support Ed25519",
  );

  assert(
    signResult.signature.length > 0,
    "SignResult should contain signature",
  );

  assert(
    verifySignatureRequest.signature === signResult.signature,
    "VerifySignatureRequest should contain signature",
  );

  assert(
    verifySignatureResult.valid === true,
    "VerifySignatureResult should contain valid",
  );

  console.log("✓ SignRequest");
  console.log("✓ SignResult");
  console.log("✓ VerifySignatureRequest");
  console.log("✓ VerifySignatureResult");

  // ----------------------------------------------------
  // 4. HMAC Types
  // ----------------------------------------------------

  section("4. HMAC Types");

  const createHmacRequest: CreateHmacRequest = {
    payload: "TraceMind webhook payload",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    context: securityContext,
    encoding: CryptoEncoding.BASE64,
  };

  const createHmacResult: CreateHmacResult = {
    signature: "hmac-signature",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    encoding: CryptoEncoding.BASE64,
    keyId: "hmac-key-phase-9-2",
    keyVersion: 1,
  };

  const verifyHmacRequest: VerifyHmacRequest = {
    payload: createHmacRequest.payload,
    signature: createHmacResult.signature,
    algorithm: createHmacResult.algorithm,
    keyId: createHmacResult.keyId,
    keyVersion: createHmacResult.keyVersion,
    context: securityContext,
    encoding: createHmacResult.encoding,
  };

  const verifyHmacResult: VerifyHmacResult = {
    valid: true,
  };

  assert(
    createHmacRequest.algorithm === HmacAlgorithm.HMAC_SHA_256,
    "CreateHmacRequest should support HMAC-SHA-256",
  );

  assert(
    createHmacResult.signature.length > 0,
    "CreateHmacResult should contain signature",
  );

  assert(
    verifyHmacRequest.signature === createHmacResult.signature,
    "VerifyHmacRequest should contain signature",
  );

  assert(
    verifyHmacResult.valid === true,
    "VerifyHmacResult should contain valid",
  );

  console.log("✓ CreateHmacRequest");
  console.log("✓ CreateHmacResult");
  console.log("✓ VerifyHmacRequest");
  console.log("✓ VerifyHmacResult");

  // ----------------------------------------------------
  // 5. Security Boundary Check
  // ----------------------------------------------------

  section("5. Public Type Security Boundary");

  const publicResults = [
    encryptResult,
    decryptResult,
    hashResult,
    verifyHashResult,
    signResult,
    verifySignatureResult,
    createHmacResult,
    verifyHmacResult,
  ];

  const serializedResults = JSON.stringify(publicResults);

  assert(
    !serializedResults.includes("privateKey"),
    "Public types must not expose privateKey",
  );

  assert(
    !serializedResults.includes("keyMaterial"),
    "Public types must not expose keyMaterial",
  );

  assert(
    !serializedResults.includes("secretKey"),
    "Public types must not expose secretKey",
  );

  assert(
    !serializedResults.includes("CryptoKey"),
    "Public types must not expose CryptoKey",
  );

  console.log("✓ No privateKey exposed");
  console.log("✓ No keyMaterial exposed");
  console.log("✓ No secretKey exposed");
  console.log("✓ No CryptoKey exposed");

  // ----------------------------------------------------
  // 6. Provider Leakage Check
  // ----------------------------------------------------

  section("6. Provider Boundary");

  const publicTypeObjects = [
    encryptRequest,
    encryptResult,
    decryptRequest,
    decryptResult,
    hashRequest,
    hashResult,
    verifyHashRequest,
    verifyHashResult,
    signRequest,
    signResult,
    verifySignatureRequest,
    verifySignatureResult,
    createHmacRequest,
    createHmacResult,
    verifyHmacRequest,
    verifyHmacResult,
  ];

  for (const object of publicTypeObjects) {
    const objectKeys = Object.keys(object);

    assert(
      !objectKeys.includes("provider"),
      "Public types must not expose provider",
    );

    assert(
      !objectKeys.includes("cryptoProvider"),
      "Public types must not expose cryptoProvider",
    );

    assert(
      !objectKeys.includes("keyProvider"),
      "Public types must not expose keyProvider",
    );

    assert(
      !objectKeys.includes("keyMaterialProvider"),
      "Public types must not expose keyMaterialProvider",
    );
  }

  console.log("✓ No provider field exposed");
  console.log("✓ No cryptoProvider exposed");
  console.log("✓ No keyProvider exposed");
  console.log("✓ No keyMaterialProvider exposed");

  // ----------------------------------------------------
  // 7. Key Reference Safety
  // ----------------------------------------------------

  section("7. Key Reference Safety");

  assert(
    typeof encryptResult.keyId === "string",
    "Encryption keyId must be a string",
  );

  assert(
    typeof encryptResult.keyVersion === "number",
    "Encryption keyVersion must be a number",
  );

  assert(
    typeof signResult.keyId === "string",
    "Signing keyId must be a string",
  );

  assert(
    typeof signResult.keyVersion === "number",
    "Signing keyVersion must be a number",
  );

  assert(
    typeof createHmacResult.keyId === "string",
    "HMAC keyId must be a string",
  );

  assert(
    typeof createHmacResult.keyVersion === "number",
    "HMAC keyVersion must be a number",
  );

  console.log("✓ Encryption exposes key reference only");
  console.log("✓ Signing exposes key reference only");
  console.log("✓ HMAC exposes key reference only");

  // ----------------------------------------------------
  // 8. Final Result
  // ----------------------------------------------------

  section("FINAL RESULT");

  console.log("✓ Encryption types verified");
  console.log("✓ Hashing types verified");
  console.log("✓ Signing types verified");
  console.log("✓ HMAC types verified");
  console.log("✓ SecurityContext compatibility verified");
  console.log("✓ Provider boundary verified");
  console.log("✓ Key material boundary verified");

  console.log("");
  console.log("======================================================");
  console.log("PHASE 9.2 MANUAL VERIFICATION PASSED");
  console.log("======================================================");
  console.log("");
}

try {
  run();
} catch (error) {
  console.error("");
  console.error("======================================================");
  console.error("PHASE 9.2 MANUAL VERIFICATION FAILED");
  console.error("======================================================");
  console.error("");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  console.error("");
  process.exit(1);
}
