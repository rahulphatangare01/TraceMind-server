import { securityCore } from "../../security-core.container.js";

import { CryptoEncoding, HashAlgorithm } from "../../domain/enums/index.js";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async (): Promise<void> => {
  console.log("==============================================");
  console.log("TraceMind Security Core - Phase 9.7");
  console.log("Security Service Hash Verification API");
  console.log("==============================================");

  const value = "TraceMind Phase 9.7 hash verification";

  // --------------------------------------------------
  // TEST 1
  // SHA-256 valid hash
  // --------------------------------------------------

  console.log("\n[TEST 1] SHA-256 valid hash");

  const sha256Hash = await securityCore.securityServiceHashingApi.hash({
    value,
    algorithm: HashAlgorithm.SHA_256,
  });

  const sha256Verification =
    await securityCore.securityServiceHashVerificationApi.verifyHash({
      value,
      hash: sha256Hash.hash,
      algorithm: HashAlgorithm.SHA_256,
      encoding: sha256Hash.encoding,
    });

  assert(
    sha256Verification.valid === true,
    "SHA-256 valid hash verification failed.",
  );

  console.log("PASS: SHA-256 valid hash verified.");

  // --------------------------------------------------
  // TEST 2
  // SHA-256 invalid value
  // --------------------------------------------------

  console.log("\n[TEST 2] SHA-256 invalid value");

  const invalidValueVerification =
    await securityCore.securityServiceHashVerificationApi.verifyHash({
      value: "Different TraceMind value",
      hash: sha256Hash.hash,
      algorithm: HashAlgorithm.SHA_256,
      encoding: sha256Hash.encoding,
    });

  assert(
    invalidValueVerification.valid === false,
    "SHA-256 verification should fail for a different value.",
  );

  console.log("PASS: Different value rejected.");

  // --------------------------------------------------
  // TEST 3
  // Tampered SHA-256 hash
  // --------------------------------------------------

  console.log("\n[TEST 3] Tampered SHA-256 hash");

  const tamperedHash =
    sha256Hash.hash.length > 0
      ? `${sha256Hash.hash.slice(0, -1)}${
          sha256Hash.hash.endsWith("a") ? "b" : "a"
        }`
      : sha256Hash.hash;

  const tamperedVerification =
    await securityCore.securityServiceHashVerificationApi.verifyHash({
      value,
      hash: tamperedHash,
      algorithm: HashAlgorithm.SHA_256,
      encoding: sha256Hash.encoding,
    });

  assert(
    tamperedVerification.valid === false,
    "Tampered SHA-256 hash should not verify.",
  );

  console.log("PASS: Tampered SHA-256 hash rejected.");

  // --------------------------------------------------
  // TEST 4
  // SHA-256 Base64
  // --------------------------------------------------

  console.log("\n[TEST 4] SHA-256 Base64 verification");

  const base64Hash = await securityCore.securityServiceHashingApi.hash({
    value,
    algorithm: HashAlgorithm.SHA_256,
    encoding: CryptoEncoding.BASE64,
  });

  const base64Verification =
    await securityCore.securityServiceHashVerificationApi.verifyHash({
      value,
      hash: base64Hash.hash,
      algorithm: HashAlgorithm.SHA_256,
      encoding: CryptoEncoding.BASE64,
    });

  assert(
    base64Verification.valid === true,
    "SHA-256 Base64 verification failed.",
  );

  console.log("PASS: SHA-256 Base64 hash verified.");

  // --------------------------------------------------
  // TEST 5
  // Argon2id valid hash
  // --------------------------------------------------

  console.log("\n[TEST 5] Argon2id valid hash");

  const argon2Hash = await securityCore.securityServiceHashingApi.hash({
    value,
    algorithm: HashAlgorithm.ARGON2ID,
  });

  const argon2Verification =
    await securityCore.securityServiceHashVerificationApi.verifyHash({
      value,
      hash: argon2Hash.hash,
      algorithm: HashAlgorithm.ARGON2ID,
    });

  assert(
    argon2Verification.valid === true,
    "Argon2id valid hash verification failed.",
  );

  console.log("PASS: Argon2id valid hash verified.");

  // --------------------------------------------------
  // TEST 6
  // Argon2id invalid value
  // --------------------------------------------------

  console.log("\n[TEST 6] Argon2id invalid value");

  const invalidArgon2Verification =
    await securityCore.securityServiceHashVerificationApi.verifyHash({
      value: "Different TraceMind password",
      hash: argon2Hash.hash,
      algorithm: HashAlgorithm.ARGON2ID,
    });

  assert(
    invalidArgon2Verification.valid === false,
    "Argon2id verification should fail for a different value.",
  );

  console.log("PASS: Argon2id different value rejected.");

  // --------------------------------------------------
  // TEST 7
  // Invalid algorithm
  // --------------------------------------------------

  console.log("\n[TEST 7] Invalid hash algorithm");

  let invalidAlgorithmRejected = false;

  try {
    await securityCore.securityServiceHashVerificationApi.verifyHash({
      value,
      hash: sha256Hash.hash,
      algorithm: "INVALID" as HashAlgorithm,
    });
  } catch {
    invalidAlgorithmRejected = true;
  }

  assert(invalidAlgorithmRejected, "Invalid hash algorithm was not rejected.");

  console.log("PASS: Invalid hash algorithm rejected.");

  // --------------------------------------------------
  // FINAL
  // --------------------------------------------------

  console.log("\n==============================================");
  console.log("Phase 9.7 manual verification completed.");
  console.log("==============================================");
};

run().catch((error: unknown) => {
  console.error("\nPhase 9.7 manual verification failed:", error);
  process.exitCode = 1;
});
