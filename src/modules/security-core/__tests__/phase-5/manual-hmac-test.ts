import {
  CryptoEncoding,
  DataClassification,
  HmacAlgorithm,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import { LocalCryptoProvider } from "../../providers/local/local-crypto.provider.js";
import { LocalHmacKeyProvider } from "../../providers/local/local-hmac-key.provider.js";

const hmacKeyProvider = new LocalHmacKeyProvider();

const cryptoProvider = new LocalCryptoProvider(undefined, hmacKeyProvider);

const context = {
  scope: SecurityScope.ORGANIZATION,
  organizationId: "org_test_001",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.HMAC,
};

const payload = "TraceMind secure payload";

async function main() {
  console.log("====================================");
  console.log("Phase 5.6 + 5.7 HMAC Manual Test");
  console.log("====================================");

  // 1. Create HMAC
  const created = await cryptoProvider.createHmac({
    payload,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    context,
  });

  console.log("\n1. Created HMAC:");
  console.log(created);

  // 2. Verify correct payload
  const valid = await cryptoProvider.verifyHmac({
    payload,
    signature: created.signature,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    keyId: created.keyId,
    keyVersion: created.keyVersion,
    context,
    encoding: created.encoding,
  });

  console.log("\n2. Correct payload:");
  console.log(valid);

  // 3. Verify wrong payload
  const wrongPayload = await cryptoProvider.verifyHmac({
    payload: "Wrong payload",
    signature: created.signature,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    keyId: created.keyId,
    keyVersion: created.keyVersion,
    context,
    encoding: created.encoding,
  });

  console.log("\n3. Wrong payload:");
  console.log(wrongPayload);

  // 4. Modified signature
  const modifiedSignature =
    created.signature.slice(0, -1) +
    (created.signature.endsWith("A") ? "B" : "A");

  const modified = await cryptoProvider.verifyHmac({
    payload,
    signature: modifiedSignature,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    keyId: created.keyId,
    keyVersion: created.keyVersion,
    context,
    encoding: created.encoding,
  });

  console.log("\n4. Modified signature:");
  console.log(modified);

  // 5. Wrong key ID
  const wrongKey = await cryptoProvider.verifyHmac({
    payload,
    signature: created.signature,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    keyId: "wrong-key-id",
    keyVersion: created.keyVersion,
    context,
    encoding: created.encoding,
  });

  console.log("\n5. Wrong keyId:");
  console.log(wrongKey);

  // 6. Wrong key version
  const wrongVersion = await cryptoProvider.verifyHmac({
    payload,
    signature: created.signature,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    keyId: created.keyId,
    keyVersion: 999,
    context,
    encoding: created.encoding,
  });

  console.log("\n6. Wrong keyVersion:");
  console.log(wrongVersion);

  // 7. Same payload + same key
  const second = await cryptoProvider.createHmac({
    payload,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    context,
  });

  console.log("\n7. Same payload + same key:");
  console.log("Same HMAC:", created.signature === second.signature);

  // 8. Different payload
  const different = await cryptoProvider.createHmac({
    payload: "Different payload",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    context,
  });

  console.log("\n8. Different payload:");
  console.log("Different HMAC:", created.signature !== different.signature);

  // 9. HEX
  const hex = await cryptoProvider.createHmac({
    payload,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    context,
    encoding: CryptoEncoding.HEX,
  });

  console.log("\n9. HEX HMAC:");
  console.log(hex);

  // 10. BASE64
  const base64 = await cryptoProvider.createHmac({
    payload,
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    context,
    encoding: CryptoEncoding.BASE64,
  });

  console.log("\n10. BASE64 HMAC:");
  console.log(base64);

  console.log("\n====================================");
  console.log("HMAC Manual Test Completed");
  console.log("====================================");
}

main().catch((error) => {
  console.error("\nHMAC manual test failed:");
  console.error(error);
  process.exit(1);
});
