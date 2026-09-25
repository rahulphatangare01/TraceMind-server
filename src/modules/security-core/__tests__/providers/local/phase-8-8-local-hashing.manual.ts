import { CryptoEncoding, HashAlgorithm } from "../../../domain/enums/index.js";

import { LocalCryptoProvider } from "../../../providers/local/local-crypto.provider.js";

const runManualVerification = async (): Promise<void> => {
  const cryptoProvider = new LocalCryptoProvider();

  /**
   * ---------------------------------------------------------
   * 1. SHA-256 Hash
   * ---------------------------------------------------------
   */

  const shaValue = "TraceMind SHA-256 manual test";

  const shaHash = await cryptoProvider.hash({
    value: shaValue,
    algorithm: HashAlgorithm.SHA_256,
    encoding: CryptoEncoding.BASE64,
  });

  if (!shaHash.hash) {
    throw new Error("SHA-256 hash was not generated");
  }

  if (shaHash.algorithm !== HashAlgorithm.SHA_256) {
    throw new Error("SHA-256 algorithm metadata mismatch");
  }

  console.log("✓ SHA-256 hash generated");

  /**
   * ---------------------------------------------------------
   * 2. SHA-256 Verification
   * ---------------------------------------------------------
   */

  const shaVerification = await cryptoProvider.verifyHash({
    value: shaValue,
    hash: shaHash.hash,
    algorithm: HashAlgorithm.SHA_256,
    encoding: CryptoEncoding.BASE64,
  });

  if (!shaVerification.valid) {
    throw new Error("Valid SHA-256 hash was rejected");
  }

  console.log("✓ SHA-256 verification successful");

  /**
   * ---------------------------------------------------------
   * 3. SHA-256 Invalid Verification
   * ---------------------------------------------------------
   */

  const invalidShaVerification = await cryptoProvider.verifyHash({
    value: "TraceMind modified SHA value",
    hash: shaHash.hash,
    algorithm: HashAlgorithm.SHA_256,
    encoding: CryptoEncoding.BASE64,
  });

  if (invalidShaVerification.valid) {
    throw new Error("Invalid SHA-256 value was accepted");
  }

  console.log("✓ Invalid SHA-256 value rejected");

  /**
   * ---------------------------------------------------------
   * 4. Argon2id Hash
   * ---------------------------------------------------------
   */

  const argonValue = "TraceMind Argon2id manual test";

  const argonHash = await cryptoProvider.hash({
    value: argonValue,
    algorithm: HashAlgorithm.ARGON2ID,
    encoding: CryptoEncoding.BASE64,
  });

  if (!argonHash.hash) {
    throw new Error("Argon2id hash was not generated");
  }

  if (argonHash.algorithm !== HashAlgorithm.ARGON2ID) {
    throw new Error("Argon2id algorithm metadata mismatch");
  }

  console.log("✓ Argon2id hash generated");

  /**
   * ---------------------------------------------------------
   * 5. Argon2id Verification
   * ---------------------------------------------------------
   */

  const argonVerification = await cryptoProvider.verifyHash({
    value: argonValue,
    hash: argonHash.hash,
    algorithm: HashAlgorithm.ARGON2ID,
    encoding: CryptoEncoding.BASE64,
  });

  if (!argonVerification.valid) {
    throw new Error("Valid Argon2id hash was rejected");
  }

  console.log("✓ Argon2id verification successful");

  /**
   * ---------------------------------------------------------
   * 6. Argon2id Invalid Verification
   * ---------------------------------------------------------
   */

  const invalidArgonVerification = await cryptoProvider.verifyHash({
    value: "TraceMind modified Argon2id value",
    hash: argonHash.hash,
    algorithm: HashAlgorithm.ARGON2ID,
    encoding: CryptoEncoding.BASE64,
  });

  if (invalidArgonVerification.valid) {
    throw new Error("Invalid Argon2id value was accepted");
  }

  console.log("✓ Invalid Argon2id value rejected");

  /**
   * ---------------------------------------------------------
   * 7. Argon2id Salt / Randomness
   * ---------------------------------------------------------
   */

  const secondArgonHash = await cryptoProvider.hash({
    value: argonValue,
    algorithm: HashAlgorithm.ARGON2ID,
    encoding: CryptoEncoding.BASE64,
  });

  if (argonHash.hash === secondArgonHash.hash) {
    throw new Error("Argon2id generated identical hashes for the same value");
  }

  console.log("✓ Argon2id salt/randomness verified");

  /**
   * ---------------------------------------------------------
   * Final Result
   * ---------------------------------------------------------
   */

  console.log("Phase 8.8 manual verification passed");
};
void runManualVerification();
