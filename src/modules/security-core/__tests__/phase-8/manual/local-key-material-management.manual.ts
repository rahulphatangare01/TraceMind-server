import { LocalKeyMaterialProvider } from "../../../providers/local/local-key-material.provider.js";

import { AES_256_GCM_KEY_LENGTH } from "../../../constants/encryption.constants.js";

const runManualVerification = async (): Promise<void> => {
  const provider = new LocalKeyMaterialProvider();

  const first = await provider.getKeyMaterial("manual-key", 1);

  if (!Buffer.isBuffer(first)) {
    throw new Error("Key material is not a Buffer");
  }

  if (first.length !== AES_256_GCM_KEY_LENGTH) {
    throw new Error("Invalid AES-256 key material length");
  }

  const expected = Buffer.from(first);

  const second = await provider.getKeyMaterial("manual-key", 1);

  if (!second.equals(expected)) {
    throw new Error("Key material is not stable for the same key/version");
  }

  first.fill(0);

  const afterMutation = await provider.getKeyMaterial("manual-key", 1);

  if (!afterMutation.equals(expected)) {
    throw new Error("Mutating returned key material modified internal storage");
  }

  const version2 = await provider.getKeyMaterial("manual-key", 2);

  if (version2.length !== AES_256_GCM_KEY_LENGTH) {
    throw new Error("Invalid version 2 key material length");
  }

  if (version2.equals(expected)) {
    throw new Error(
      "Different key versions unexpectedly share the same material",
    );
  }

  const providerB = new LocalKeyMaterialProvider();

  const isolatedMaterial = await providerB.getKeyMaterial("manual-key", 1);

  if (isolatedMaterial.equals(expected)) {
    throw new Error(
      "Key material unexpectedly shared between provider instances",
    );
  }

  console.log("Phase 8.6 manual verification passed");
};
void runManualVerification();
