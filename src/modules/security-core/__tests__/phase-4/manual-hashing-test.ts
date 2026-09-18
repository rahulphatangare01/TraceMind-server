// import { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";

// import { HashAlgorithm, CryptoEncoding } from "../../domain/enums/index.js";

// const main = async (): Promise<void> => {
//   const cryptoProvider = new LocalCryptoProvider();

//   const value = "Hello TraceMind";

//   console.log("=================================");
//   console.log("TraceMind Phase 4 Hashing Test");
//   console.log("=================================");

//   console.log("\nOriginal:");
//   console.log(value);

//   // ---------------------------------------------
//   // ARGON2ID
//   // ---------------------------------------------

//   const argonHash1 = await cryptoProvider.hash({
//     value,
//     algorithm: HashAlgorithm.ARGON2ID,
//   });

//   console.log("\nArgon2id Hash 1:");
//   console.log(argonHash1.hash);

//   const argonHash2 = await cryptoProvider.hash({
//     value,
//     algorithm: HashAlgorithm.ARGON2ID,
//   });

//   console.log("\nArgon2id Hash 2:");
//   console.log(argonHash2.hash);

//   console.log(
//     "\nArgon2id hashes different:",
//     argonHash1.hash !== argonHash2.hash,
//   );

//   const argonValid = await cryptoProvider.verifyHash({
//     value,
//     hash: argonHash1.hash,
//     algorithm: HashAlgorithm.ARGON2ID,
//   });

//   console.log("Argon2id valid:", argonValid.valid);

//   const argonInvalid = await cryptoProvider.verifyHash({
//     value: "Wrong Password",
//     hash: argonHash1.hash,
//     algorithm: HashAlgorithm.ARGON2ID,
//   });

//   console.log("Argon2id wrong value:", argonInvalid.valid);

//   // ---------------------------------------------
//   // SHA-256
//   // ---------------------------------------------

//   const shaHash = await cryptoProvider.hash({
//     value,
//     algorithm: HashAlgorithm.SHA_256,
//     encoding: CryptoEncoding.HEX,
//   });

//   console.log("\nSHA-256 Hash:");
//   console.log(shaHash.hash);

//   const shaValid = await cryptoProvider.verifyHash({
//     value,
//     hash: shaHash.hash,
//     algorithm: HashAlgorithm.SHA_256,
//     encoding: CryptoEncoding.HEX,
//   });

//   console.log("SHA-256 valid:", shaValid.valid);

//   const shaInvalid = await cryptoProvider.verifyHash({
//     value: "Wrong Value",
//     hash: shaHash.hash,
//     algorithm: HashAlgorithm.SHA_256,
//     encoding: CryptoEncoding.HEX,
//   });

//   console.log("SHA-256 wrong value:", shaInvalid.valid);

//   // ---------------------------------------------
//   // Final result
//   // ---------------------------------------------

//   if (
//     argonValid.valid === true &&
//     argonInvalid.valid === false &&
//     shaValid.valid === true &&
//     shaInvalid.valid === false &&
//     argonHash1.hash !== argonHash2.hash
//   ) {
//     console.log("\n✅ PHASE 4 MANUAL HASHING TEST PASSED");
//   } else {
//     console.log("\n❌ PHASE 4 MANUAL HASHING TEST FAILED");
//   }
// };

// main().catch((error) => {
//   console.error("\n❌ Phase 4 test failed:");

//   console.error(error);

//   process.exit(1);
// });
import { CryptoEncoding, HashAlgorithm } from "../../domain/enums/index.js";

import { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";

const cryptoProvider = new LocalCryptoProvider();

const plaintext = "MySecretPassword@123";

async function main() {
  console.log("====================================");
  console.log("Phase 4.7 - Hashing Manual Test");
  console.log("====================================");

  // ------------------------------------
  // 1. Argon2id Hash
  // ------------------------------------

  const argonHash = await cryptoProvider.hash({
    value: plaintext,
    algorithm: HashAlgorithm.ARGON2ID,
  });

  console.log("\n1. Argon2id Hash:");
  console.log(argonHash);

  // ------------------------------------
  // 2. Argon2id Verification - Correct
  // ------------------------------------

  const argonValid = await cryptoProvider.verifyHash({
    value: plaintext,
    hash: argonHash.hash,
    algorithm: HashAlgorithm.ARGON2ID,
  });

  console.log("\n2. Argon2id Correct Value:");
  console.log(argonValid);

  // ------------------------------------
  // 3. Argon2id Verification - Wrong
  // ------------------------------------

  const argonInvalid = await cryptoProvider.verifyHash({
    value: "WrongPassword",
    hash: argonHash.hash,
    algorithm: HashAlgorithm.ARGON2ID,
  });

  console.log("\n3. Argon2id Wrong Value:");
  console.log(argonInvalid);

  // ------------------------------------
  // 4. SHA-256 Hash
  // ------------------------------------

  const shaHash = await cryptoProvider.hash({
    value: plaintext,
    algorithm: HashAlgorithm.SHA_256,
    encoding: CryptoEncoding.HEX,
  });

  console.log("\n4. SHA-256 Hash:");
  console.log(shaHash);

  // ------------------------------------
  // 5. SHA-256 Verification - Correct
  // ------------------------------------

  const shaValid = await cryptoProvider.verifyHash({
    value: plaintext,
    hash: shaHash.hash,
    algorithm: HashAlgorithm.SHA_256,
    encoding: CryptoEncoding.HEX,
  });

  console.log("\n5. SHA-256 Correct Value:");
  console.log(shaValid);

  // ------------------------------------
  // 6. SHA-256 Verification - Wrong
  // ------------------------------------

  const shaInvalid = await cryptoProvider.verifyHash({
    value: "WrongPassword",
    hash: shaHash.hash,
    algorithm: HashAlgorithm.SHA_256,
    encoding: CryptoEncoding.HEX,
  });

  console.log("\n6. SHA-256 Wrong Value:");
  console.log(shaInvalid);

  console.log("\n====================================");
  console.log("Phase 4.7 Manual Test Completed");
  console.log("====================================");
}

main().catch((error) => {
  console.error("\nManual hashing test failed:");
  console.error(error);
  process.exit(1);
});
