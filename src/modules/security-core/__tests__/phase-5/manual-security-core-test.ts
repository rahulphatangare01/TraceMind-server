import {
  CryptoEncoding,
  DataClassification,
  HmacAlgorithm,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
} from "../../index.js";

import { securityCore } from "../../security-core.container.js";

const context = {
  scope: SecurityScope.ORGANIZATION,
  organizationId: "org_manual_test",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.HMAC,
};

const payload = "TraceMind Phase 5 manual verification";

async function main() {
  console.log("==========================================");
  console.log("TraceMind Security Core - Phase 5 Manual");
  console.log("==========================================");

  // ==================================================
  // 1. HMAC Creation
  // ==================================================

  const hmac = await securityCore.cryptoProvider.createHmac({
    payload,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  console.log("\n1. HMAC Creation:");
  console.log(hmac);

  // ==================================================
  // 2. HMAC Verification
  // ==================================================

  const hmacVerification = await securityCore.cryptoProvider.verifyHmac({
    payload,
    signature: hmac.signature,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    keyId: hmac.keyId,
    keyVersion: hmac.keyVersion,
    context,
    encoding: hmac.encoding,
  });

  console.log("\n2. HMAC Verification:");
  console.log(hmacVerification);

  // ==================================================
  // 3. HMAC Wrong Payload
  // ==================================================

  const invalidHmac = await securityCore.cryptoProvider.verifyHmac({
    payload: "Modified payload",
    signature: hmac.signature,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    keyId: hmac.keyId,
    keyVersion: hmac.keyVersion,
    context,
    encoding: hmac.encoding,
  });

  console.log("\n3. HMAC Wrong Payload:");
  console.log(invalidHmac);

  // ==================================================
  // 4. Ed25519 Signing
  // ==================================================

  const signingContext = {
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org_manual_test",
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.SIGNING,
  };

  const signed = await securityCore.cryptoProvider.sign({
    payload,
    algorithm: SignatureAlgorithm.ED25519,
    context: signingContext,
    encoding: CryptoEncoding.BASE64,
  });

  console.log("\n4. Ed25519 Signing:");
  console.log(signed);

  // ==================================================
  // 5. Signature Verification
  // ==================================================

  const signatureVerification =
    await securityCore.cryptoProvider.verifySignature({
      payload,
      signature: signed.signature,
      algorithm: SignatureAlgorithm.ED25519,
      keyId: signed.keyId,
      keyVersion: signed.keyVersion,
      context: signingContext,
      encoding: signed.encoding,
    });

  console.log("\n5. Signature Verification:");
  console.log(signatureVerification);

  // ==================================================
  // 6. Modified Payload Signature Verification
  // ==================================================

  const invalidSignature = await securityCore.cryptoProvider.verifySignature({
    payload: "Modified payload",
    signature: signed.signature,
    algorithm: SignatureAlgorithm.ED25519,
    keyId: signed.keyId,
    keyVersion: signed.keyVersion,
    context: signingContext,
    encoding: signed.encoding,
  });

  console.log("\n6. Modified Payload:");
  console.log(invalidSignature);

  // ==================================================
  // 7. SHA-256
  // ==================================================

  const hash = await securityCore.cryptoProvider.hash({
    value: payload,
    algorithm: "SHA-256" as any,
    encoding: CryptoEncoding.HEX,
  });

  console.log("\n7. SHA-256:");
  console.log(hash);

  // ==================================================
  // 8. Argon2id
  // ==================================================

  const passwordHash = await securityCore.cryptoProvider.hash({
    value: "TraceMindPassword@123",
    algorithm: "ARGON2ID" as any,
  });

  console.log("\n8. Argon2id:");
  console.log(passwordHash);

  console.log("\n==========================================");
  console.log("Phase 5 Manual Verification Completed");
  console.log("==========================================");
}

main().catch((error) => {
  console.error("\nManual verification failed:");
  console.error(error);
  process.exit(1);
});
