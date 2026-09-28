import { securityCore } from "../../security-core.container.js";
import type { EncryptRequest } from "../../types/encryption.types.js";
import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

const request: EncryptRequest = {
  plaintext: "TraceMind Phase 9.4 manual encryption test",
  keyId: "local-test-key",
  context: {
    scope: SecurityScope.ORGANIZATION,
    organizationId: "manual-test-organization",
    classification: DataClassification.CONFIDENTIAL,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  },
};

const run = async (): Promise<void> => {
  console.log("Starting Phase 9.4 manual verification...");

  const result =
    await securityCore.securityServiceEncryptionApi.encrypt(request);

  console.log("Encryption API result:");
  console.log({
    ...result,
    ciphertext: `${result.ciphertext.slice(0, 12)}...`,
    iv: `${result.iv.slice(0, 8)}...`,
    authTag: `${result.authTag.slice(0, 8)}...`,
  });

  if (!result.ciphertext) {
    throw new Error("Manual verification failed: ciphertext is empty.");
  }

  if (!result.keyId || result.keyId !== request.keyId) {
    throw new Error("Manual verification failed: key ID mismatch.");
  }

  if (!Number.isInteger(result.keyVersion) || result.keyVersion <= 0) {
    throw new Error("Manual verification failed: invalid key version.");
  }

  if (!result.iv || !result.authTag) {
    throw new Error("Manual verification failed: IV or auth tag is missing.");
  }

  console.log("Phase 9.4 manual verification passed.");
};

run().catch((error: unknown) => {
  console.error("Phase 9.4 manual verification failed:", error);
  process.exitCode = 1;
});
