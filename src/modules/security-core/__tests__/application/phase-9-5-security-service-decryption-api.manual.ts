// import { securityCore } from "../../security-core.container.js";

// import {
//   DataClassification,
//   KeyPurpose,
//   SecurityPurpose,
//   SecurityScope,
// } from "../../domain/enums/index.js";

// import type { SecurityContext } from "../../domain/models/security-context.js";
// import type { DecryptRequest } from "../../types/encryption.types.js";
// import { SecurityServiceDecryptionApi } from "../../application/services/security-service-decryption-api.service.js";
// const run = async (): Promise<void> => {
//   const context: SecurityContext = {
//     scope: SecurityScope.APPLICATION,
//     organizationId: "org-phase-9-5",
//     projectId: "project-phase-9-5",
//     applicationId: "application-phase-9-5",
//     classification: DataClassification.SENSITIVE,
//     purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
//   };

//   const key = await securityCore.keyProvider.createKey({
//     purpose: KeyPurpose.ENCRYPTION,
//     scope: SecurityScope.APPLICATION,
//     organizationId: context.organizationId!,
//     projectId: context.projectId!,
//     applicationId: context.applicationId!,
//     provider: "LOCAL",
//   });

//   const plaintext = "TraceMind Phase 9.5 decryption verification";

//   console.log("Running Phase 9.5 encryption/decryption round trip...");

//   const encrypted = await securityCore.securityServiceEncryptionApi.encrypt({
//     plaintext,
//     context,
//     keyId: key.id,
//   });

//   const decryptRequest: DecryptRequest = {
//     ...encrypted,
//     context,
//   };

//   const decrypted =
//     await securityCore.securityServiceDecryptionApi.decrypt(decryptRequest);

//   if (decrypted.plaintext !== plaintext) {
//     throw new Error("Decryption verification failed: plaintext mismatch.");
//   }

//   console.log("Phase 9.5 manual verification passed.");
// };

// run().catch((error: unknown) => {
//   console.error("Phase 9.5 manual verification failed:", error);
//   process.exitCode = 1;
// });

import { securityCore } from "../../security-core.container.js";

import {
  DataClassification,
  KeyPurpose,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/security-context.js";
import type { DecryptRequest } from "../../types/encryption.types.js";
import { SecurityServiceDecryptionApi } from "../../application/services/security-service-decryption-api.service.js";
const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const expectFailure = async (
  label: string,
  operation: () => Promise<unknown>,
): Promise<void> => {
  try {
    await operation();
  } catch (error: unknown) {
    console.log(`PASS: ${label}`);

    if (error instanceof Error) {
      console.log(`  Expected failure: ${error.message}`);
    }

    return;
  }

  throw new Error(`FAIL: ${label} — operation unexpectedly succeeded.`);
};

const run = async (): Promise<void> => {
  console.log("==============================================");
  console.log("TraceMind Security Core - Phase 9.5");
  console.log("Decryption API Manual Verification");
  console.log("==============================================");

  // --------------------------------------------------
  // 1. Prepare security context
  // --------------------------------------------------

  const context: SecurityContext = {
    scope: SecurityScope.APPLICATION,
    organizationId: "org-phase-9-5",
    projectId: "project-phase-9-5",
    applicationId: "application-phase-9-5",
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  };

  // --------------------------------------------------
  // 2. Create encryption key
  // --------------------------------------------------

  console.log("\n[TEST 1] Create encryption key");

  const key = await securityCore.keyProvider.createKey({
    purpose: KeyPurpose.ENCRYPTION,
    scope: SecurityScope.APPLICATION,
    organizationId: context.organizationId!,
    projectId: context.projectId!,
    applicationId: context.applicationId!,
    provider: "LOCAL",
  });

  assert(Boolean(key.id), "Encryption key ID was not generated.");

  console.log("PASS: Encryption key created.");
  console.log(`  Key ID: ${key.id}`);

  // --------------------------------------------------
  // 3. Encrypt plaintext
  // --------------------------------------------------

  console.log("\n[TEST 2] Encrypt plaintext");

  const plaintext = "TraceMind Phase 9.5 decryption verification";

  const encrypted = await securityCore.securityServiceEncryptionApi.encrypt({
    plaintext,
    context,
    keyId: key.id,
  });

  assert(Boolean(encrypted.ciphertext), "Ciphertext is missing.");
  assert(Boolean(encrypted.iv), "Initialization vector is missing.");
  assert(Boolean(encrypted.authTag), "Authentication tag is missing.");
  assert(Boolean(encrypted.keyId), "Encryption key ID is missing.");
  assert(
    Number.isInteger(encrypted.keyVersion) && encrypted.keyVersion > 0,
    "Encryption key version is invalid.",
  );

  console.log("PASS: Plaintext encrypted.");
  console.log(`  Algorithm: ${encrypted.algorithm}`);
  console.log(`  Key ID: ${encrypted.keyId}`);
  console.log(`  Key version: ${encrypted.keyVersion}`);

  // --------------------------------------------------
  // 4. Build decryption request
  // --------------------------------------------------

  const decryptRequest: DecryptRequest = {
    ...encrypted,
    context,
  };

  // --------------------------------------------------
  // 5. Valid decryption - round trip
  // --------------------------------------------------

  console.log("\n[TEST 3] Valid decryption round trip");

  const decrypted =
    await securityCore.securityServiceDecryptionApi.decrypt(decryptRequest);

  assert(
    decrypted.plaintext === plaintext,
    "Decrypted plaintext does not match the original plaintext.",
  );

  console.log("PASS: Decrypted plaintext matches original plaintext.");

  // --------------------------------------------------
  // 6. Invalid key version
  // --------------------------------------------------

  console.log("\n[TEST 4] Invalid key version");

  const invalidKeyVersionRequest: DecryptRequest = {
    ...decryptRequest,
    keyVersion: 0,
  };

  await expectFailure("Invalid key version is rejected", () =>
    securityCore.securityServiceDecryptionApi.decrypt(invalidKeyVersionRequest),
  );

  // --------------------------------------------------
  // 7. Wrong context
  // --------------------------------------------------

  console.log("\n[TEST 5] Wrong application context");

  const wrongContext: SecurityContext = {
    ...context,
    applicationId: "different-application",
  };

  const wrongContextRequest: DecryptRequest = {
    ...decryptRequest,
    context: wrongContext,
  };

  await expectFailure(
    "Decryption with a different application context is rejected",
    () =>
      securityCore.securityServiceDecryptionApi.decrypt(wrongContextRequest),
  );

  // --------------------------------------------------
  // 8. Tampered ciphertext
  // --------------------------------------------------

  console.log("\n[TEST 6] Tampered ciphertext");

  const tamperedCiphertextRequest: DecryptRequest = {
    ...decryptRequest,
    ciphertext: `${decryptRequest.ciphertext.slice(0, -1)}${
      decryptRequest.ciphertext.endsWith("A") ? "B" : "A"
    }`,
  };

  await expectFailure("Tampered ciphertext is rejected", () =>
    securityCore.securityServiceDecryptionApi.decrypt(
      tamperedCiphertextRequest,
    ),
  );

  // --------------------------------------------------
  // 9. Tampered authentication tag
  // --------------------------------------------------

  console.log("\n[TEST 7] Tampered authentication tag");

  const tamperedAuthTagRequest: DecryptRequest = {
    ...decryptRequest,
    authTag: `${decryptRequest.authTag.slice(0, -1)}${
      decryptRequest.authTag.endsWith("A") ? "B" : "A"
    }`,
  };

  await expectFailure("Tampered authentication tag is rejected", () =>
    securityCore.securityServiceDecryptionApi.decrypt(tamperedAuthTagRequest),
  );

  // --------------------------------------------------
  // 10. Tampered IV
  // --------------------------------------------------

  console.log("\n[TEST 8] Tampered initialization vector");

  const tamperedIvRequest: DecryptRequest = {
    ...decryptRequest,
    iv: `${decryptRequest.iv.slice(0, -1)}${
      decryptRequest.iv.endsWith("A") ? "B" : "A"
    }`,
  };

  await expectFailure("Tampered initialization vector is rejected", () =>
    securityCore.securityServiceDecryptionApi.decrypt(tamperedIvRequest),
  );

  // --------------------------------------------------
  // 11. Final result
  // --------------------------------------------------

  console.log("\n==============================================");
  console.log("Phase 9.5 manual verification completed.");
  console.log("==============================================");
};

run().catch((error: unknown) => {
  console.error("\nPhase 9.5 manual verification failed:", error);
  process.exitCode = 1;
});
