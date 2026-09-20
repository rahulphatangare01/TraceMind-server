// import { describe, expect, it } from "vitest";

// import {
//   CryptoEncoding,
//   EncryptionAlgorithm,
//   HmacAlgorithm,
//   SecurityPurpose,
//   SecurityScope,
//   SignatureAlgorithm,
//   DataClassification,
//   KeyPurpose,
// } from "../../domain/enums/index.js";

// import type { SecurityContext } from "../../domain/models/security-context.js";

// import { SecurityContextValidationError } from "../../errors/security-context-validation.error.js";
// import { InvalidCiphertextError } from "../../errors/invalid-ciphertext.error.js";

// import { SecurityBoundaryValidator } from "../../application/services/security-boundary-validator.service.js";
// import { EncryptionService } from "../../application/services/encryption.service.js";

// import { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";
// import { LocalKeyProvider } from "../../providers/local/local-key.provider.js";
// import { LocalKeyMaterialProvider } from "../../providers/local/local-key-material.provider.js";
// import { LocalSigningKeyProvider } from "../../providers/local/local-signing-key.provider.js";
// import { LocalHmacKeyProvider } from "../../providers/local/local-hmac-key.provider.js";

// import type { SignResult, CreateHmacResult } from "../../types/index.js";

// describe("Phase 6.11 - Crypto Operation Security Context Integration", () => {
//   const organizationId = "org-001";
//   const projectId = "project-001";
//   const applicationId = "application-001";
//   const environmentId = "environment-001";

//   const keyId = "security-key-001";

//   const validContext: SecurityContext = {
//     scope: SecurityScope.APPLICATION,
//     organizationId,
//     projectId,
//     applicationId,
//     classification: DataClassification.SENSITIVE,
//     purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
//   };

//   const environmentContext: SecurityContext = {
//     scope: SecurityScope.ENVIRONMENT,
//     organizationId,
//     projectId,
//     applicationId,
//     environmentId,
//     classification: DataClassification.SENSITIVE,
//     purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
//   };

//   const createSecurityComponents = () => {
//     const keyProvider = new LocalKeyProvider();
//     const keyMaterialProvider = new LocalKeyMaterialProvider();

//     const signingKeyProvider = new LocalSigningKeyProvider();
//     const hmacKeyProvider = new LocalHmacKeyProvider();

//     const cryptoProvider = new LocalCryptoProvider(
//       signingKeyProvider,
//       hmacKeyProvider,
//     );

//     const securityBoundaryValidator = new SecurityBoundaryValidator();

//     const encryptionService = new EncryptionService(
//       keyProvider,
//       keyMaterialProvider,
//       cryptoProvider,
//       securityBoundaryValidator,
//     );

//     return {
//       keyProvider,
//       keyMaterialProvider,
//       signingKeyProvider,
//       hmacKeyProvider,
//       cryptoProvider,
//       securityBoundaryValidator,
//       encryptionService,
//     };
//   };

//   /**
//    * Test 1
//    * Valid encryption context
//    */
//   it("Test 1 - should encrypt successfully with a valid security context", async () => {
//     const { keyProvider, encryptionService } = createSecurityComponents();

//     await keyProvider.createKey({
//       //   id: keyId,
//       //   purpose: "ENCRYPTION",
//       purpose: KeyPurpose.ENCRYPTION,
//       scope: SecurityScope.APPLICATION,
//       organizationId,
//       projectId,
//       applicationId,
//       provider: "LOCAL",
//     });
//     // const keyId = key.id;
//     const encryptedValue = await encryptionService.encrypt(
//       "TraceMind integration test secret",
//       validContext,
//       //    key.id,
//       keyId,
//     );

//     expect(encryptedValue).toBeDefined();
//     expect(typeof encryptedValue).toBe("string");
//     expect(encryptedValue.length).toBeGreaterThan(0);
//   });

//   /**
//    * Test 2
//    * Invalid encryption context
//    */
//   it("Test 2 - should reject encryption when the security context is invalid", async () => {
//     const { encryptionService } = createSecurityComponents();

//     const invalidContext: SecurityContext = {
//       scope: SecurityScope.APPLICATION,

//       // Missing organizationId
//       projectId,
//       applicationId,

//       classification: DataClassification.SENSITIVE,
//       purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
//     };

//     await expect(
//       encryptionService.encrypt(
//         "TraceMind integration test secret",
//         invalidContext,
//         keyId,
//       ),
//     ).rejects.toBeInstanceOf(SecurityContextValidationError);
//   });

//   /**
//    * Test 3
//    * Whitespace normalization
//    */
//   it("Test 3 - should normalize hierarchy IDs before encryption", async () => {
//     const { keyProvider, encryptionService } = createSecurityComponents();

//     await keyProvider.createKey({
//       //   id: keyId,
//       //   purpose: "ENCRYPTION",
//       purpose: KeyPurpose.ENCRYPTION,
//       scope: SecurityScope.APPLICATION,
//       organizationId,
//       projectId,
//       applicationId,
//       provider: "LOCAL",
//     });

//     const whitespaceContext: SecurityContext = {
//       scope: SecurityScope.APPLICATION,
//       organizationId: `  ${organizationId}  `,
//       projectId: ` ${projectId} `,
//       applicationId: `  ${applicationId} `,
//       classification: DataClassification.SENSITIVE,
//       purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
//     };

//     const encryptedValue = await encryptionService.encrypt(
//       "TraceMind whitespace test",
//       whitespaceContext,
//       keyId,
//     );

//     expect(encryptedValue).toBeDefined();

//     const decryptedValue = await encryptionService.decrypt(
//       encryptedValue,
//       validContext,
//     );

//     expect(decryptedValue).toBe("TraceMind whitespace test");
//   });

//   /**
//    * Test 4
//    * Wrong context fails decryption
//    */
//   it("Test 4 - should fail decryption when the security context is different", async () => {
//     const { keyProvider, encryptionService } = createSecurityComponents();

//     await keyProvider.createKey({
//       //   id: keyId,
//       //   purpose: "ENCRYPTION",
//       purpose: KeyPurpose.ENCRYPTION,
//       scope: SecurityScope.APPLICATION,
//       organizationId,
//       projectId,
//       applicationId,
//       provider: "LOCAL",
//     });

//     const encryptedValue = await encryptionService.encrypt(
//       "TraceMind context protection test",
//       validContext,
//       keyId,
//     );

//     const wrongContext: SecurityContext = {
//       ...validContext,
//       applicationId: "different-application",
//     };

//     await expect(
//       encryptionService.decrypt(encryptedValue, wrongContext),
//     ).rejects.toBeInstanceOf(InvalidCiphertextError);
//   });

//   /**
//    * Test 5
//    * Wrong classification fails decryption
//    */
//   it("Test 5 - should fail decryption when classification changes", async () => {
//     const { keyProvider, encryptionService } = createSecurityComponents();

//     await keyProvider.createKey({
//       //   id: keyId,
//       //   purpose: "ENCRYPTION",
//       purpose: KeyPurpose.ENCRYPTION,
//       scope: SecurityScope.APPLICATION,
//       organizationId,
//       projectId,
//       applicationId,
//       provider: "LOCAL",
//     });

//     const encryptedValue = await encryptionService.encrypt(
//       "TraceMind classification test",
//       validContext,
//       keyId,
//     );

//     const wrongClassificationContext: SecurityContext = {
//       ...validContext,
//       classification: DataClassification.CONFIDENTIAL,
//     };

//     await expect(
//       encryptionService.decrypt(encryptedValue, wrongClassificationContext),
//     ).rejects.toBeInstanceOf(InvalidCiphertextError);
//   });

//   /**
//    * Test 6
//    * Wrong purpose fails decryption
//    */
//   it("Test 6 - should fail decryption when purpose changes", async () => {
//     const { keyProvider, encryptionService } = createSecurityComponents();

//     await keyProvider.createKey({
//       //   id: keyId,
//       //   purpose: "ENCRYPTION",
//       purpose: KeyPurpose.ENCRYPTION,
//       scope: SecurityScope.APPLICATION,
//       organizationId,
//       projectId,
//       applicationId,
//       provider: "LOCAL",
//     });

//     const encryptedValue = await encryptionService.encrypt(
//       "TraceMind purpose test",
//       validContext,
//       keyId,
//     );

//     const wrongPurposeContext: SecurityContext = {
//       ...validContext,
//       purpose: SecurityPurpose.DATABASE_CREDENTIAL,
//     };

//     await expect(
//       encryptionService.decrypt(encryptedValue, wrongPurposeContext),
//     ).rejects.toBeInstanceOf(InvalidCiphertextError);
//   });

//   /**
//    * Test 7
//    * Same normalized context succeeds
//    */
//   it("Test 7 - should decrypt successfully with the same normalized context", async () => {
//     const { keyProvider, encryptionService } = createSecurityComponents();

//     await keyProvider.createKey({
//       //   id: keyId,
//       //   purpose: "ENCRYPTION",
//       purpose: KeyPurpose.ENCRYPTION,
//       scope: SecurityScope.APPLICATION,
//       organizationId,
//       projectId,
//       applicationId,
//       provider: "LOCAL",
//     });

//     const encryptedValue = await encryptionService.encrypt(
//       "TraceMind normalized context test",
//       validContext,
//       keyId,
//     );

//     const normalizedEquivalentContext: SecurityContext = {
//       scope: SecurityScope.APPLICATION,
//       organizationId: ` ${organizationId} `,
//       projectId: `  ${projectId}`,
//       applicationId: `${applicationId}  `,
//       classification: DataClassification.SENSITIVE,
//       purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
//     };

//     const decryptedValue = await encryptionService.decrypt(
//       encryptedValue,
//       normalizedEquivalentContext,
//     );

//     expect(decryptedValue).toBe("TraceMind normalized context test");
//   });

//   /**
//    * Test 8
//    * Signing validates context
//    */
//   it("Test 8 - should validate security context before signing", async () => {
//     const { securityBoundaryValidator, cryptoProvider } =
//       createSecurityComponents();

//     const validatedContext =
//       securityBoundaryValidator.validate(validContext).context;

//     const result: SignResult = await cryptoProvider.sign({
//       payload: "TraceMind signing test",
//       algorithm: SignatureAlgorithm.ED25519,
//       context: validatedContext,
//       encoding: CryptoEncoding.BASE64,
//     });

//     expect(result.signature).toBeDefined();
//     expect(result.keyId).toBeDefined();
//     expect(result.keyVersion).toBe(1);
//     expect(result.algorithm).toBe(SignatureAlgorithm.ED25519);
//   });

//   /**
//    * Test 9
//    * HMAC validates context
//    */
//   it("Test 9 - should validate security context before HMAC creation", async () => {
//     const { securityBoundaryValidator, cryptoProvider } =
//       createSecurityComponents();

//     const validatedContext =
//       securityBoundaryValidator.validate(validContext).context;

//     const result: CreateHmacResult = await cryptoProvider.createHmac({
//       payload: "TraceMind HMAC test",
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       context: validatedContext,
//       encoding: CryptoEncoding.BASE64,
//     });

//     expect(result.signature).toBeDefined();
//     expect(result.keyId).toBeDefined();
//     expect(result.keyVersion).toBe(1);
//     expect(result.algorithm).toBe(HmacAlgorithm.HMAC_SHA_256);
//   });

//   /**
//    * Test 10
//    * Signature verification validates context
//    */
//   it("Test 10 - should validate security context before signature verification", async () => {
//     const { securityBoundaryValidator, cryptoProvider } =
//       createSecurityComponents();

//     const validatedContext =
//       securityBoundaryValidator.validate(validContext).context;

//     const signed = await cryptoProvider.sign({
//       payload: "TraceMind signature verification test",
//       algorithm: SignatureAlgorithm.ED25519,
//       context: validatedContext,
//       encoding: CryptoEncoding.BASE64,
//     });

//     const verificationContext =
//       securityBoundaryValidator.validate(validContext).context;

//     const result = await cryptoProvider.verifySignature({
//       payload: "TraceMind signature verification test",
//       signature: signed.signature,
//       algorithm: SignatureAlgorithm.ED25519,
//       keyId: signed.keyId,
//       keyVersion: signed.keyVersion,
//       context: verificationContext,
//       encoding: CryptoEncoding.BASE64,
//     });

//     expect(result.valid).toBe(true);

//     const invalidContext = {
//       scope: SecurityScope.APPLICATION,
//       organizationId,
//       projectId,
//       // applicationId intentionally missing
//       classification: DataClassification.SENSITIVE,
//       purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
//     } as any;

//     expect(() => securityBoundaryValidator.validate(invalidContext)).toThrow(
//       SecurityContextValidationError,
//     );
//   });

//   /**
//    * Test 11
//    * HMAC verification validates context
//    */
//   it("Test 11 - should validate security context before HMAC verification", async () => {
//     const { securityBoundaryValidator, cryptoProvider } =
//       createSecurityComponents();

//     const validatedContext =
//       securityBoundaryValidator.validate(validContext).context;

//     const hmac = await cryptoProvider.createHmac({
//       payload: "TraceMind HMAC verification test",
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       context: validatedContext,
//       encoding: CryptoEncoding.BASE64,
//     });

//     const verificationContext =
//       securityBoundaryValidator.validate(validContext).context;

//     const result = await cryptoProvider.verifyHmac({
//       payload: "TraceMind HMAC verification test",
//       signature: hmac.signature,
//       algorithm: HmacAlgorithm.HMAC_SHA_256,
//       keyId: hmac.keyId,
//       keyVersion: hmac.keyVersion,
//       context: verificationContext,
//       encoding: CryptoEncoding.BASE64,
//     });

//     expect(result.valid).toBe(true);

//     const invalidContext = {
//       scope: SecurityScope.APPLICATION,
//       organizationId,
//       projectId,
//       // applicationId intentionally missing
//       classification: DataClassification.SENSITIVE,
//       purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
//     } as any;

//     expect(() => securityBoundaryValidator.validate(invalidContext)).toThrow(
//       SecurityContextValidationError,
//     );
//   });
// });

import { describe, expect, it } from "vitest";

import {
  CryptoEncoding,
  HmacAlgorithm,
  KeyPurpose,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
  DataClassification,
} from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/security-context.js";

import { SecurityContextValidationError } from "../../errors/security-context-validation.error.js";
import { InvalidCiphertextError } from "../../errors/invalid-ciphertext.error.js";

import { SecurityBoundaryValidator } from "../../application/services/security-boundary-validator.service.js";
import { EncryptionService } from "../../application/services/encryption.service.js";

import { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";
import { LocalKeyProvider } from "../../providers/local/local-key.provider.js";
import { LocalKeyMaterialProvider } from "../../providers/local/local-key-material.provider.js";
import { LocalSigningKeyProvider } from "../../providers/local/local-signing-key.provider.js";
import { LocalHmacKeyProvider } from "../../providers/local/local-hmac-key.provider.js";

describe("Phase 6.11 - Crypto Operation Security Context Integration", () => {
  const organizationId = "org-001";
  const projectId = "project-001";
  const applicationId = "application-001";

  const validContext: SecurityContext = {
    scope: SecurityScope.APPLICATION,
    organizationId,
    projectId,
    applicationId,
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  };

  /**
   * Creates a fresh security-core dependency graph for every test.
   */
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

  /**
   * Creates an encryption key using the actual
   * LocalKeyProvider contract.
   *
   * LocalKeyProvider generates the key ID internally,
   * therefore the test must use key.id.
   */
  const createApplicationEncryptionKey = async (
    keyProvider: LocalKeyProvider,
  ) => {
    return keyProvider.createKey({
      purpose: KeyPurpose.ENCRYPTION,
      scope: SecurityScope.APPLICATION,
      organizationId,
      projectId,
      applicationId,
      provider: "LOCAL",
    });
  };

  // =========================================================
  // TEST 1
  // =========================================================

  it("Test 1 - should encrypt successfully with a valid security context", async () => {
    const { keyProvider, encryptionService } = createSecurityComponents();

    const key = await createApplicationEncryptionKey(keyProvider);

    const encryptedValue = await encryptionService.encrypt(
      "TraceMind integration test secret",
      validContext,
      key.id,
    );

    expect(encryptedValue).toBeDefined();
    expect(typeof encryptedValue).toBe("string");
    expect(encryptedValue.length).toBeGreaterThan(0);
  });

  // =========================================================
  // TEST 2
  // =========================================================

  it("Test 2 - should reject encryption when the security context is invalid", async () => {
    const { encryptionService } = createSecurityComponents();

    /**
     * APPLICATION scope requires:
     *
     * organizationId
     * projectId
     * applicationId
     *
     * organizationId is intentionally missing.
     */
    const invalidContext: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      projectId,
      applicationId,
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    await expect(
      encryptionService.encrypt(
        "TraceMind invalid context test",
        invalidContext,
        "unused-key-id",
      ),
    ).rejects.toBeInstanceOf(SecurityContextValidationError);
  });

  // =========================================================
  // TEST 3
  // =========================================================

  it("Test 3 - should normalize hierarchy IDs before encryption", async () => {
    const { keyProvider, encryptionService } = createSecurityComponents();

    const key = await createApplicationEncryptionKey(keyProvider);

    const whitespaceContext: SecurityContext = {
      scope: SecurityScope.APPLICATION,

      organizationId: `  ${organizationId}  `,

      projectId: ` ${projectId} `,

      applicationId: `  ${applicationId} `,

      classification: DataClassification.SENSITIVE,

      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const encryptedValue = await encryptionService.encrypt(
      "TraceMind whitespace test",
      whitespaceContext,
      key.id,
    );

    expect(encryptedValue).toBeDefined();

    /**
     * The encryption service should normalize
     * the context before generating AAD.
     *
     * Therefore the clean context should decrypt
     * the value successfully.
     */
    const decryptedValue = await encryptionService.decrypt(
      encryptedValue,
      validContext,
    );

    expect(decryptedValue).toBe("TraceMind whitespace test");
  });

  // =========================================================
  // TEST 4
  // =========================================================

  it("Test 4 - should fail decryption when the security context is different", async () => {
    const { keyProvider, encryptionService } = createSecurityComponents();

    const key = await createApplicationEncryptionKey(keyProvider);

    const encryptedValue = await encryptionService.encrypt(
      "TraceMind context protection test",
      validContext,
      key.id,
    );

    const wrongContext: SecurityContext = {
      ...validContext,

      applicationId: "different-application",
    };

    await expect(
      encryptionService.decrypt(encryptedValue, wrongContext),
    ).rejects.toBeInstanceOf(InvalidCiphertextError);
  });

  // =========================================================
  // TEST 5
  // =========================================================

  it("Test 5 - should fail decryption when classification changes", async () => {
    const { keyProvider, encryptionService } = createSecurityComponents();

    const key = await createApplicationEncryptionKey(keyProvider);

    const encryptedValue = await encryptionService.encrypt(
      "TraceMind classification test",
      validContext,
      key.id,
    );

    const wrongClassificationContext: SecurityContext = {
      ...validContext,

      classification: DataClassification.CONFIDENTIAL,
    };

    await expect(
      encryptionService.decrypt(encryptedValue, wrongClassificationContext),
    ).rejects.toBeInstanceOf(InvalidCiphertextError);
  });

  // =========================================================
  // TEST 6
  // =========================================================

  it("Test 6 - should fail decryption when purpose changes", async () => {
    const { keyProvider, encryptionService } = createSecurityComponents();

    const key = await createApplicationEncryptionKey(keyProvider);

    const encryptedValue = await encryptionService.encrypt(
      "TraceMind purpose test",
      validContext,
      key.id,
    );

    const wrongPurposeContext: SecurityContext = {
      ...validContext,

      purpose: SecurityPurpose.DATABASE_CREDENTIAL,
    };

    await expect(
      encryptionService.decrypt(encryptedValue, wrongPurposeContext),
    ).rejects.toBeInstanceOf(InvalidCiphertextError);
  });

  // =========================================================
  // TEST 7
  // =========================================================

  it("Test 7 - should decrypt successfully with the same normalized context", async () => {
    const { keyProvider, encryptionService } = createSecurityComponents();

    const key = await createApplicationEncryptionKey(keyProvider);

    const encryptedValue = await encryptionService.encrypt(
      "TraceMind normalized context test",
      validContext,
      key.id,
    );

    const normalizedEquivalentContext: SecurityContext = {
      scope: SecurityScope.APPLICATION,

      organizationId: ` ${organizationId} `,

      projectId: `  ${projectId}`,

      applicationId: `${applicationId}  `,

      classification: DataClassification.SENSITIVE,

      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const decryptedValue = await encryptionService.decrypt(
      encryptedValue,
      normalizedEquivalentContext,
    );

    expect(decryptedValue).toBe("TraceMind normalized context test");
  });

  // =========================================================
  // TEST 8
  // =========================================================

  it("Test 8 - should validate security context before signing", async () => {
    const { securityBoundaryValidator, cryptoProvider } =
      createSecurityComponents();

    /**
     * First validate the context at the
     * security boundary.
     */
    const validatedContext =
      securityBoundaryValidator.validate(validContext).context;

    const result = await cryptoProvider.sign({
      payload: "TraceMind signing test",

      algorithm: SignatureAlgorithm.ED25519,

      context: validatedContext,

      encoding: CryptoEncoding.BASE64,
    });

    expect(result.signature).toBeDefined();

    expect(result.signature.length).toBeGreaterThan(0);

    expect(result.keyId).toBeDefined();

    expect(result.keyVersion).toBe(1);

    expect(result.algorithm).toBe(SignatureAlgorithm.ED25519);
  });

  // =========================================================
  // TEST 9
  // =========================================================

  it("Test 9 - should validate security context before HMAC creation", async () => {
    const { securityBoundaryValidator, cryptoProvider } =
      createSecurityComponents();

    const validatedContext =
      securityBoundaryValidator.validate(validContext).context;

    const result = await cryptoProvider.createHmac({
      payload: "TraceMind HMAC test",

      algorithm: HmacAlgorithm.HMAC_SHA_256,

      context: validatedContext,

      encoding: CryptoEncoding.BASE64,
    });

    expect(result.signature).toBeDefined();

    expect(result.signature.length).toBeGreaterThan(0);

    expect(result.keyId).toBeDefined();

    expect(result.keyVersion).toBe(1);

    expect(result.algorithm).toBe(HmacAlgorithm.HMAC_SHA_256);
  });

  // =========================================================
  // TEST 10
  // =========================================================

  it("Test 10 - should validate security context before signature verification", async () => {
    const { securityBoundaryValidator, cryptoProvider } =
      createSecurityComponents();

    const validatedContext =
      securityBoundaryValidator.validate(validContext).context;

    /**
     * First create a valid signature.
     */
    const signed = await cryptoProvider.sign({
      payload: "TraceMind signature verification test",

      algorithm: SignatureAlgorithm.ED25519,

      context: validatedContext,

      encoding: CryptoEncoding.BASE64,
    });

    /**
     * Validate the context before verification.
     */
    const verificationContext =
      securityBoundaryValidator.validate(validContext).context;

    const result = await cryptoProvider.verifySignature({
      payload: "TraceMind signature verification test",

      signature: signed.signature,

      algorithm: SignatureAlgorithm.ED25519,

      keyId: signed.keyId,

      keyVersion: signed.keyVersion,

      context: verificationContext,

      encoding: CryptoEncoding.BASE64,
    });

    expect(result.valid).toBe(true);

    /**
     * Also verify that an invalid context
     * is rejected by the security boundary.
     */
    const invalidContext: SecurityContext = {
      scope: SecurityScope.APPLICATION,

      organizationId,

      projectId,

      // applicationId intentionally missing

      classification: DataClassification.SENSITIVE,

      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(() => securityBoundaryValidator.validate(invalidContext)).toThrow(
      SecurityContextValidationError,
    );
  });

  // =========================================================
  // TEST 11
  // =========================================================

  it("Test 11 - should validate security context before HMAC verification", async () => {
    const { securityBoundaryValidator, cryptoProvider } =
      createSecurityComponents();

    const validatedContext =
      securityBoundaryValidator.validate(validContext).context;

    /**
     * First create a valid HMAC.
     */
    const hmac = await cryptoProvider.createHmac({
      payload: "TraceMind HMAC verification test",

      algorithm: HmacAlgorithm.HMAC_SHA_256,

      context: validatedContext,

      encoding: CryptoEncoding.BASE64,
    });

    /**
     * Validate context before verification.
     */
    const verificationContext =
      securityBoundaryValidator.validate(validContext).context;

    const result = await cryptoProvider.verifyHmac({
      payload: "TraceMind HMAC verification test",

      signature: hmac.signature,

      algorithm: HmacAlgorithm.HMAC_SHA_256,

      keyId: hmac.keyId,

      keyVersion: hmac.keyVersion,

      context: verificationContext,

      encoding: CryptoEncoding.BASE64,
    });

    expect(result.valid).toBe(true);

    /**
     * Also verify invalid context rejection.
     */
    const invalidContext: SecurityContext = {
      scope: SecurityScope.APPLICATION,

      organizationId,

      projectId,

      // applicationId intentionally missing

      classification: DataClassification.SENSITIVE,

      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(() => securityBoundaryValidator.validate(invalidContext)).toThrow(
      SecurityContextValidationError,
    );
  });
});
