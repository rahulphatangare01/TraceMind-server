import { securityCore } from "../../security-core.container.js";
import { CryptoEncoding, HashAlgorithm } from "../../domain/enums/index.js";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async (): Promise<void> => {
  console.log("==============================================");
  console.log("TraceMind Security Core - Phase 9.6");
  console.log("Security Service Hashing API Manual Test");
  console.log("==============================================");

  const value = "TraceMind Phase 9.6 hashing verification";

  // Test 1: SHA-256 using default encoding
  console.log("\n[TEST 1] SHA-256 hashing");

  const sha256Result = await securityCore.securityServiceHashingApi.hash({
    value,
    algorithm: HashAlgorithm.SHA_256,
  });

  assert(Boolean(sha256Result.hash), "SHA-256 hash is empty.");
  assert(
    sha256Result.algorithm === HashAlgorithm.SHA_256,
    "SHA-256 algorithm metadata mismatch.",
  );
  assert(
    sha256Result.encoding === CryptoEncoding.HEX,
    "Expected default SHA-256 encoding to be HEX.",
  );
  assert(
    !sha256Result.hash.includes(value),
    "Hash result must not contain the original plaintext.",
  );

  console.log("PASS: SHA-256 hash generated.");
  console.log(`Encoding: ${sha256Result.encoding}`);

  // Test 2: SHA-256 with explicit Base64 encoding
  console.log("\n[TEST 2] SHA-256 with Base64 encoding");

  const base64Result = await securityCore.securityServiceHashingApi.hash({
    value,
    algorithm: HashAlgorithm.SHA_256,
    encoding: CryptoEncoding.BASE64,
  });

  assert(Boolean(base64Result.hash), "Base64 SHA-256 hash is empty.");
  assert(
    base64Result.encoding === CryptoEncoding.BASE64,
    "Base64 encoding metadata mismatch.",
  );

  console.log("PASS: SHA-256 Base64 hash generated.");

  // Test 3: Argon2id
  console.log("\n[TEST 3] Argon2id hashing");

  const argon2Result = await securityCore.securityServiceHashingApi.hash({
    value,
    algorithm: HashAlgorithm.ARGON2ID,
  });

  assert(Boolean(argon2Result.hash), "Argon2id hash is empty.");
  assert(
    argon2Result.algorithm === HashAlgorithm.ARGON2ID,
    "Argon2id algorithm metadata mismatch.",
  );
  assert(
    argon2Result.encoding === CryptoEncoding.UTF8,
    "Argon2id encoding metadata mismatch.",
  );
  assert(
    !argon2Result.hash.includes(value),
    "Argon2id result must not contain the original plaintext.",
  );

  console.log("PASS: Argon2id hash generated.");

  // Test 4: Argon2id uses a random salt
  console.log("\n[TEST 4] Argon2id produces different hashes");

  const secondArgon2Result = await securityCore.securityServiceHashingApi.hash({
    value,
    algorithm: HashAlgorithm.ARGON2ID,
  });

  assert(
    argon2Result.hash !== secondArgon2Result.hash,
    "Argon2id should generate different hashes for the same value.",
  );

  console.log("PASS: Argon2id generated distinct hashes.");

  // Test 5: Invalid algorithm
  console.log("\n[TEST 5] Invalid algorithm rejection");

  let invalidAlgorithmRejected = false;

  try {
    await securityCore.securityServiceHashingApi.hash({
      value,
      algorithm: "INVALID" as HashAlgorithm,
    });
  } catch {
    invalidAlgorithmRejected = true;
  }

  assert(invalidAlgorithmRejected, "Invalid hash algorithm was not rejected.");

  console.log("PASS: Invalid algorithm rejected.");

  // Test 6: Invalid encoding
  console.log("\n[TEST 6] Invalid encoding rejection");

  let invalidEncodingRejected = false;

  try {
    await securityCore.securityServiceHashingApi.hash({
      value,
      algorithm: HashAlgorithm.SHA_256,
      encoding: "INVALID" as CryptoEncoding,
    });
  } catch {
    invalidEncodingRejected = true;
  }

  assert(invalidEncodingRejected, "Invalid hash encoding was not rejected.");

  console.log("PASS: Invalid encoding rejected.");

  console.log("\n==============================================");
  console.log("Phase 9.6 manual verification completed.");
  console.log("==============================================");
};

run().catch((error: unknown) => {
  console.error("\nPhase 9.6 manual verification failed:", error);
  process.exitCode = 1;
});
