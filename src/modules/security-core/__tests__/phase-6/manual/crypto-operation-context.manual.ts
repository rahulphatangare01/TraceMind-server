import {
  CryptoEncoding,
  EncryptionAlgorithm,
  HmacAlgorithm,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
  DataClassification,
  KeyPurpose,
} from "../../../domain/enums/index.js";

import type { SecurityContext } from "../../../domain/models/security-context.js";

import { SecurityBoundaryValidator } from "../../../application/services/security-boundary-validator.service.js";
import { EncryptionService } from "../../../application/services/encryption.service.js";

import { LocalCryptoProvider } from "../../../providers/local/local-crypto.provider.js";
import { LocalKeyProvider } from "../../../providers/local/local-key.provider.js";
import { LocalKeyMaterialProvider } from "../../../providers/local/local-key-material.provider.js";
import { LocalSigningKeyProvider } from "../../../providers/local/local-signing-key.provider.js";
import { LocalHmacKeyProvider } from "../../../providers/local/local-hmac-key.provider.js";

const ORGANIZATION_ID = "org-001";
const PROJECT_ID = "project-001";
const APPLICATION_ID = "application-001";

const KEY_ID = "manual-security-key-001";

const createSecurityComponents = () => {
  const keyProvider = new LocalKeyProvider();

  const keyMaterialProvider = new LocalKeyMaterialProvider();

  const signingKeyProvider = new LocalSigningKeyProvider();

  const hmacKeyProvider = new LocalHmacKeyProvider();

  const cryptoProvider = new LocalCryptoProvider(
    signingKeyProvider,
    hmacKeyProvider,
  );

  const securityBoundaryValidator = new SecurityBoundaryValidator();

  const encryptionService = new EncryptionService(
    keyProvider,
    keyMaterialProvider,
    cryptoProvider,
    securityBoundaryValidator,
  );

  return {
    keyProvider,
    keyMaterialProvider,
    signingKeyProvider,
    hmacKeyProvider,
    cryptoProvider,
    securityBoundaryValidator,
    encryptionService,
  };
};

const main = async (): Promise<void> => {
  console.log("\n==============================================");
  console.log("TraceMind - Phase 6.11 Manual Crypto Context Test");
  console.log("==============================================\n");

  const {
    keyProvider,
    cryptoProvider,
    securityBoundaryValidator,
    encryptionService,
  } = createSecurityComponents();

  /**
   * APPLICATION security context
   */
  const applicationContext: SecurityContext = {
    scope: SecurityScope.APPLICATION,
    organizationId: ORGANIZATION_ID,
    projectId: PROJECT_ID,
    applicationId: APPLICATION_ID,
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  };

  /**
   * Create encryption key
   */
  const key = await keyProvider.createKey({
    // id: KEY_ID,
    // purpose: "ENCRYPTION",
    purpose: KeyPurpose.ENCRYPTION,
    scope: SecurityScope.APPLICATION,
    organizationId: ORGANIZATION_ID,
    projectId: PROJECT_ID,
    applicationId: APPLICATION_ID,
    provider: "LOCAL",
  });
  // const KEY_ID = key.id;
  const keyId = key.id;
  console.log("Security key created:", KEY_ID);

  /**
   * 1. Encrypt with APPLICATION context
   */
  console.log("\n1. Encrypt with APPLICATION context");

  const encryptedValue = await encryptionService.encrypt(
    "TraceMind Phase 6.11 manual secret",
    applicationContext,
    // KEY_ID,
    keyId,
  );

  console.log("Encryption successful.");

  /**
   * 2. Print envelope
   */
  console.log("\n2. Print encryption envelope");

  console.log(encryptedValue);

  /**
   * 3. Decrypt with same context
   */
  console.log("\n3. Decrypt with same context");

  const decryptedValue = await encryptionService.decrypt(
    encryptedValue,
    applicationContext,
  );

  console.log("Decrypted value:", decryptedValue);

  /**
   * 4. Decrypt with whitespace-normalized context
   */
  console.log("\n4. Decrypt with whitespace-normalized context");

  const whitespaceContext: SecurityContext = {
    scope: SecurityScope.APPLICATION,
    organizationId: `  ${ORGANIZATION_ID}  `,
    projectId: ` ${PROJECT_ID} `,
    applicationId: `  ${APPLICATION_ID} `,
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  };

  const whitespaceDecryptedValue = await encryptionService.decrypt(
    encryptedValue,
    whitespaceContext,
  );

  console.log("Decrypted value:", whitespaceDecryptedValue);

  /**
   * 5. Decrypt with different organization
   */
  console.log("\n5. Decrypt with different organization");

  const differentOrganizationContext: SecurityContext = {
    ...applicationContext,
    organizationId: "different-org-001",
  };

  try {
    await encryptionService.decrypt(
      encryptedValue,
      differentOrganizationContext,
    );

    console.error("ERROR: Different organization was unexpectedly accepted.");
  } catch (error) {
    console.log(
      "Expected failure:",
      error instanceof Error ? error.message : error,
    );
  }

  /**
   * 6. Decrypt with different classification
   */
  console.log("\n6. Decrypt with different classification");

  const differentClassificationContext: SecurityContext = {
    ...applicationContext,
    classification: DataClassification.CONFIDENTIAL,
  };

  try {
    await encryptionService.decrypt(
      encryptedValue,
      differentClassificationContext,
    );

    console.error("ERROR: Different classification was unexpectedly accepted.");
  } catch (error) {
    console.log(
      "Expected failure:",
      error instanceof Error ? error.message : error,
    );
  }

  /**
   * 7. Decrypt with different purpose
   */
  console.log("\n7. Decrypt with different purpose");

  const differentPurposeContext: SecurityContext = {
    ...applicationContext,
    purpose: SecurityPurpose.DATABASE_CREDENTIAL,
  };

  try {
    await encryptionService.decrypt(encryptedValue, differentPurposeContext);

    console.error("ERROR: Different purpose was unexpectedly accepted.");
  } catch (error) {
    console.log(
      "Expected failure:",
      error instanceof Error ? error.message : error,
    );
  }

  /**
   * 8. Sign with valid context
   */
  console.log("\n8. Sign with valid context");

  const validatedContext =
    securityBoundaryValidator.validate(applicationContext).context;

  const signature = await cryptoProvider.sign({
    payload: "TraceMind Phase 6.11 signing test",
    algorithm: SignatureAlgorithm.ED25519,
    context: validatedContext,
    encoding: CryptoEncoding.BASE64,
  });

  console.log("Signature created successfully.");

  console.log("Signature:", signature.signature);

  console.log("Key ID:", signature.keyId);

  console.log("Key Version:", signature.keyVersion);

  /**
   * 9. HMAC with valid context
   */
  console.log("\n9. HMAC with valid context");

  const hmac = await cryptoProvider.createHmac({
    payload: "TraceMind Phase 6.11 HMAC test",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    context: validatedContext,
    encoding: CryptoEncoding.BASE64,
  });

  console.log("HMAC created successfully.");

  console.log("HMAC:", hmac.signature);

  console.log("Key ID:", hmac.keyId);

  console.log("Key Version:", hmac.keyVersion);

  console.log("\n==============================================");

  console.log("Phase 6.11 manual test completed.");

  console.log("==============================================\n");
};

main().catch((error: unknown) => {
  console.error("\nPhase 6.11 manual test failed:");

  console.error(error);

  process.exitCode = 1;
});
