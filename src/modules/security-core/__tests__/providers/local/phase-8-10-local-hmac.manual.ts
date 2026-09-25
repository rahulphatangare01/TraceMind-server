import {
  CryptoEncoding,
  DataClassification,
  HmacAlgorithm,
  SecurityPurpose,
  SecurityScope,
} from "../../../domain/enums/index.js";

import type { SecurityContext } from "../../../domain/models/security-context.js";

import { LocalCryptoProvider } from "../../../providers/local/local-crypto.provider.js";
import { LocalHmacKeyProvider } from "../../../providers/local/local-hmac-key.provider.js";

const runManualVerification = async (): Promise<void> => {
  const context: SecurityContext = {
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-hmac-manual",
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.HMAC,
  };

  const hmacKeyProvider = new LocalHmacKeyProvider();

  const cryptoProvider = new LocalCryptoProvider(undefined, hmacKeyProvider);

  /**
   * ---------------------------------------------------------
   * 1. Create HMAC
   * ---------------------------------------------------------
   */

  const payload = "TraceMind HMAC manual test";

  const hmac = await cryptoProvider.createHmac({
    payload,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  if (!hmac.signature) {
    throw new Error("HMAC was not generated");
  }

  if (hmac.algorithm !== HmacAlgorithm.HMAC_SHA_256) {
    throw new Error("HMAC algorithm mismatch");
  }

  if (!hmac.keyId) {
    throw new Error("HMAC key ID was not generated");
  }

  if (hmac.keyVersion !== 1) {
    throw new Error("Unexpected HMAC key version");
  }

  console.log("✓ HMAC-SHA-256 generated");

  /**
   * ---------------------------------------------------------
   * 2. Verify Valid HMAC
   * ---------------------------------------------------------
   */

  const verification = await cryptoProvider.verifyHmac({
    payload,
    signature: hmac.signature,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    keyId: hmac.keyId,
    keyVersion: hmac.keyVersion,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  if (!verification.valid) {
    throw new Error("Valid HMAC was rejected");
  }

  console.log("✓ Valid HMAC verified");

  /**
   * ---------------------------------------------------------
   * 3. Modified Payload
   * ---------------------------------------------------------
   */

  const modifiedPayloadVerification = await cryptoProvider.verifyHmac({
    payload: "TraceMind modified payload",
    signature: hmac.signature,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    keyId: hmac.keyId,
    keyVersion: hmac.keyVersion,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  if (modifiedPayloadVerification.valid) {
    throw new Error("Modified payload was accepted");
  }

  console.log("✓ Modified payload rejected");

  /**
   * ---------------------------------------------------------
   * 4. Tampered HMAC
   * ---------------------------------------------------------
   */

  const signatureBuffer = Buffer.from(hmac.signature, "base64");

  signatureBuffer[0] = signatureBuffer[0] ^ 0xff;

  const tamperedHmac = signatureBuffer.toString("base64");

  const tamperedVerification = await cryptoProvider.verifyHmac({
    payload,
    signature: tamperedHmac,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    keyId: hmac.keyId,
    keyVersion: hmac.keyVersion,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  if (tamperedVerification.valid) {
    throw new Error("Tampered HMAC was accepted");
  }

  console.log("✓ Tampered HMAC rejected");

  /**
   * ---------------------------------------------------------
   * 5. Unknown Key
   * ---------------------------------------------------------
   */

  const unknownKeyVerification = await cryptoProvider.verifyHmac({
    payload,
    signature: hmac.signature,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    keyId: "unknown-key-id",
    keyVersion: hmac.keyVersion,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  if (unknownKeyVerification.valid) {
    throw new Error("Unknown HMAC key was accepted");
  }

  console.log("✓ Unknown HMAC key rejected");

  /**
   * ---------------------------------------------------------
   * 6. Unicode Payload
   * ---------------------------------------------------------
   */

  const unicodePayload = "TraceMind सुरक्षित 🔐";

  const unicodeHmac = await cryptoProvider.createHmac({
    payload: unicodePayload,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  const unicodeVerification = await cryptoProvider.verifyHmac({
    payload: unicodePayload,
    signature: unicodeHmac.signature,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    keyId: unicodeHmac.keyId,
    keyVersion: unicodeHmac.keyVersion,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  if (!unicodeVerification.valid) {
    throw new Error("Unicode payload HMAC verification failed");
  }

  console.log("✓ Unicode payload verified");

  /**
   * ---------------------------------------------------------
   * Final Result
   * ---------------------------------------------------------
   */

  console.log("Phase 8.10 manual verification passed");
};
void runManualVerification();
