// import { EncryptionService } from "../../application/services/encryption.service.js";
// import { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";
// import { LocalKeyMaterialProvider } from "../../providers/local/local-key-material.provider.js";

// import { SecurityScope } from "../../domain/enums/security-scope.enum.js";
// import { DataClassification } from "../../domain/enums/data-classification.enum.js";
// import { SecurityPurpose } from "../../domain/enums/security-purpose.enum.js";

// // TODO:
// // Replace this import with your actual KeyProvider implementation.
// // import { KeyProvider } from "../../providers/local/local-key.provider.js";
// import { LocalKeyProvider } from "../../providers/local/local-key.provider.js";
// const main = async (): Promise<void> => {
//   // const main = async () => {
//   const plaintext = "Hello TraceMind";

//   console.log("=================================");
//   console.log("TraceMind Phase 3 Encryption Test");
//   console.log("=================================\n");

//   console.log("Original:", plaintext);

//   /**
//    * -------------------------------------------------------
//    * 1. Security Context
//    * -------------------------------------------------------
//    */
//   const context = {
//     scope: SecurityScope.ORGANIZATION,
//     organizationId: "org_123",
//     classification: DataClassification.CONFIDENTIAL,
//     purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
//   };

//   /**
//    * -------------------------------------------------------
//    * 2. Key ID
//    * -------------------------------------------------------
//    */
//   const key = await keyProvider.createKey({
//   purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
//   scope: SecurityScope.ORGANIZATION,
//   organizationId: "org_123",
// });

// const keyId = key.id;
//   // const keyId = "key_org_123";

//   /**
//    * -------------------------------------------------------
//    * 3. Create Phase 3 dependencies
//    * -------------------------------------------------------
//    */
//   // private readonly keyProvider: KeyProvider,
//   //    const key = await this.keyProvider.getKeyVersion({
//   //       keyId: envelope.keyId,
//   //       version: envelope.keyVersion,
//   //     });
//   // const keyProvider = new KeyProvider();
//   const keyProvider = new LocalKeyProvider();
//   const keyMaterialProvider = new LocalKeyMaterialProvider();

//   const cryptoProvider = new LocalCryptoProvider();

//   /**
//    * -------------------------------------------------------
//    * 4. Create EncryptionService
//    * -------------------------------------------------------
//    */
//   const encryptionService = new EncryptionService(
//     keyProvider,
//     keyMaterialProvider,
//     cryptoProvider,
//   );

//   /**
//    * -------------------------------------------------------
//    * 5. Encrypt
//    * -------------------------------------------------------
//    */
//   const encrypted = await encryptionService.encrypt(plaintext, context, keyId);

//   console.log("\nEncrypted Envelope:");
//   console.log(encrypted);

//   /**
//    * -------------------------------------------------------
//    * 6. Decrypt
//    * -------------------------------------------------------
//    */
//   const decrypted = await encryptionService.decrypt(encrypted, context);

//   console.log("\nDecrypted:", decrypted);

//   /**
//    * -------------------------------------------------------
//    * 7. Verify
//    * -------------------------------------------------------
//    */
//   if (decrypted === plaintext) {
//     console.log("\n✅ ENCRYPTION / DECRYPTION TEST PASSED");
//   } else {
//     console.log("\n❌ ENCRYPTION / DECRYPTION TEST FAILED");
//   }
// };

// main().catch((error) => {
//   console.error("\n❌ Phase 3 test failed:");
//   console.error(error);

//   process.exit(1);
// });

import { EncryptionService } from "../../application/services/encryption.service.js";

import { LocalKeyProvider } from "../../providers/local/local-key.provider.js";

import { LocalKeyMaterialProvider } from "../../providers/local/local-key-material.provider.js";

import { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";

import {
  SecurityScope,
  DataClassification,
  SecurityPurpose,
  KeyPurpose,
} from "../../domain/enums/index.js";

const main = async (): Promise<void> => {
  const plaintext = "Hello TraceMind";

  console.log("=================================");
  console.log("TraceMind Phase 3 Manual Test");
  console.log("=================================\n");

  console.log("Original:", plaintext);

  /**
   * ----------------------------------------------------
   * 1. Create Phase 3 providers
   * ----------------------------------------------------
   */

  const keyProvider = new LocalKeyProvider();

  const keyMaterialProvider = new LocalKeyMaterialProvider();

  const cryptoProvider = new LocalCryptoProvider();

  /**
   * ----------------------------------------------------
   * 2. Create EncryptionService
   * ----------------------------------------------------
   */

  const encryptionService = new EncryptionService(
    keyProvider,
    keyMaterialProvider,
    cryptoProvider,
  );

  /**
   * ----------------------------------------------------
   * 3. Create Security Context
   * ----------------------------------------------------
   */

  const context = {
    scope: SecurityScope.ORGANIZATION,

    organizationId: "org_123",

    classification: DataClassification.CONFIDENTIAL,

    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  };

  /**
   * ----------------------------------------------------
   * 4. Create Security Key
   * ----------------------------------------------------
   *
   * IMPORTANT:
   * We cannot use "key_org_123" unless that key
   * actually exists inside LocalKeyProvider.
   */

  const key = await keyProvider.createKey({
    purpose: KeyPurpose.ENCRYPTION,

    scope: SecurityScope.ORGANIZATION,

    organizationId: "org_123",
  });

  console.log("\nCreated Key:");
  console.dir(key, { depth: null });

  /**
   * ----------------------------------------------------
   * 5. Get generated Key ID
   * ----------------------------------------------------
   */

  const keyId = key.id;

  console.log("\nKey ID:");
  console.log(keyId);

  /**
   * ----------------------------------------------------
   * 6. Encrypt
   * ----------------------------------------------------
   */

  const encrypted = await encryptionService.encrypt(plaintext, context, keyId);

  console.log("\nEncrypted Envelope:");
  console.dir(encrypted, { depth: null });

  /**
   * ----------------------------------------------------
   * 7. Decrypt
   * ----------------------------------------------------
   */

  const decrypted = await encryptionService.decrypt(encrypted, context);

  console.log("\nDecrypted:");
  console.log(decrypted);

  /**
   * ----------------------------------------------------
   * 8. Verify
   * ----------------------------------------------------
   */

  if (decrypted === plaintext) {
    console.log("\n✅ ENCRYPTION / DECRYPTION TEST PASSED");
  } else {
    console.log("\n❌ ENCRYPTION / DECRYPTION TEST FAILED");
  }
};

main().catch((error) => {
  console.error("\n❌ Phase 3 test failed:");
  console.error(error);

  process.exit(1);
});
