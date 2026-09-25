import {
  CryptoEncoding,
  DataClassification,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
} from "../../../domain/enums/index.js";

import type { SecurityContext } from "../../../domain/models/security-context.js";

import { LocalCryptoProvider } from "../../../providers/local/local-crypto.provider.js";
import { LocalSigningKeyProvider } from "../../../providers/local/local-signing-key.provider.js";

const runManualVerification = async (): Promise<void> => {
  const context: SecurityContext = {
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-signing-manual",
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.SIGNING,
  };

  const signingKeyProvider = new LocalSigningKeyProvider();

  const cryptoProvider = new LocalCryptoProvider(signingKeyProvider);

  /**
   * ---------------------------------------------------------
   * 1. Sign Payload
   * ---------------------------------------------------------
   */

  const payload = "TraceMind signing manual test";

  const signed = await cryptoProvider.sign({
    payload,
    algorithm: SignatureAlgorithm.ED25519,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  if (!signed.signature) {
    throw new Error("Signature was not generated");
  }

  if (signed.algorithm !== SignatureAlgorithm.ED25519) {
    throw new Error("Signature algorithm mismatch");
  }

  if (!signed.keyId) {
    throw new Error("Signing key ID was not generated");
  }

  if (signed.keyVersion !== 1) {
    throw new Error("Unexpected signing key version");
  }

  console.log("✓ Ed25519 signature generated");

  /**
   * ---------------------------------------------------------
   * 2. Verify Valid Signature
   * ---------------------------------------------------------
   */

  const verification = await cryptoProvider.verifySignature({
    payload,
    signature: signed.signature,
    algorithm: SignatureAlgorithm.ED25519,
    keyId: signed.keyId,
    keyVersion: signed.keyVersion,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  if (!verification.valid) {
    throw new Error("Valid Ed25519 signature was rejected");
  }

  console.log("✓ Valid signature verified");

  /**
   * ---------------------------------------------------------
   * 3. Modified Payload
   * ---------------------------------------------------------
   */

  const modifiedPayloadVerification = await cryptoProvider.verifySignature({
    payload: "TraceMind modified payload",
    signature: signed.signature,
    algorithm: SignatureAlgorithm.ED25519,
    keyId: signed.keyId,
    keyVersion: signed.keyVersion,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  if (modifiedPayloadVerification.valid) {
    throw new Error("Modified payload was accepted");
  }

  console.log("✓ Modified payload rejected");

  /**
   * ---------------------------------------------------------
   * 4. Wrong Security Context
   * ---------------------------------------------------------
   */

  //   const wrongContext: SecurityContext = {
  //     ...context,
  //     organizationId: "different-organization",
  //   };

  //   const wrongContextVerification = await cryptoProvider.verifySignature({
  //     payload,
  //     signature: signed.signature,
  //     algorithm: SignatureAlgorithm.ED25519,
  //     keyId: signed.keyId,
  //     keyVersion: signed.keyVersion,
  //     context: wrongContext,
  //     encoding: CryptoEncoding.BASE64,
  //   });

  //   if (wrongContextVerification.valid) {
  //     throw new Error("Signature was accepted with the wrong security context");
  //   }

  //   console.log("✓ Wrong security context rejected");

  /**
   * ---------------------------------------------------------
   * 5. Tampered Signature
   * ---------------------------------------------------------
   */

  const signatureBuffer = Buffer.from(signed.signature, "base64");

  signatureBuffer[0] = signatureBuffer[0] ^ 0xff;

  const tamperedSignature = signatureBuffer.toString("base64");

  const tamperedVerification = await cryptoProvider.verifySignature({
    payload,
    signature: tamperedSignature,
    algorithm: SignatureAlgorithm.ED25519,
    keyId: signed.keyId,
    keyVersion: signed.keyVersion,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  if (tamperedVerification.valid) {
    throw new Error("Tampered signature was accepted");
  }

  console.log("✓ Tampered signature rejected");

  /**
   * ---------------------------------------------------------
   * 6. Unicode Payload
   * ---------------------------------------------------------
   */

  const unicodePayload = "TraceMind सुरक्षित 🔐";

  const unicodeSigned = await cryptoProvider.sign({
    payload: unicodePayload,
    algorithm: SignatureAlgorithm.ED25519,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  const unicodeVerification = await cryptoProvider.verifySignature({
    payload: unicodePayload,
    signature: unicodeSigned.signature,
    algorithm: SignatureAlgorithm.ED25519,
    keyId: unicodeSigned.keyId,
    keyVersion: unicodeSigned.keyVersion,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  if (!unicodeVerification.valid) {
    throw new Error("Unicode payload signature verification failed");
  }

  console.log("✓ Unicode payload verified");

  /**
   * ---------------------------------------------------------
   * Final Result
   * ---------------------------------------------------------
   */

  console.log("Phase 8.9 manual verification passed");
};
void runManualVerification();
