import { LocalKeyProvider } from "../../../providers/local/local-key.provider.js";

import {
  KeyPurpose,
  KeyStatus,
  SecurityScope,
} from "../../../domain/enums/index.js";

const createRequest = () => ({
  purpose: KeyPurpose.ENCRYPTION,
  scope: SecurityScope.ORGANIZATION,
  organizationId: "org-hardening-manual",
});
const runManualVerification = async (): Promise<void> => {
  const provider = new LocalKeyProvider();

  const key = await provider.createKey(createRequest());

  if (!key.id) {
    throw new Error("Key id was not generated");
  }

  if (key.currentVersion !== 1) {
    throw new Error("Initial key version is not 1");
  }

  if (key.status !== KeyStatus.ACTIVE) {
    throw new Error("Initial key is not ACTIVE");
  }

  const activeVersion = await provider.getActiveVersion(key.id);

  if (!activeVersion) {
    throw new Error("Active key version could not be resolved");
  }

  if (activeVersion.version !== 1) {
    throw new Error("Initial active version is incorrect");
  }

  const rotatedVersion = await provider.rotateKey(key.id);

  if (rotatedVersion.version !== 2) {
    throw new Error("Key rotation did not create version 2");
  }

  if (rotatedVersion.status !== KeyStatus.ACTIVE) {
    throw new Error("Rotated version is not ACTIVE");
  }

  const updatedKey = await provider.getKey(key.id);

  if (!updatedKey) {
    throw new Error("Key could not be retrieved after rotation");
  }

  if (updatedKey.currentVersion !== 2) {
    throw new Error("Current version was not updated after rotation");
  }

  const currentActiveVersion = await provider.getActiveVersion(key.id);

  if (!currentActiveVersion) {
    throw new Error("Current active version could not be resolved");
  }

  if (currentActiveVersion.version !== 2) {
    throw new Error("Current active version is not version 2");
  }

  const oldVersion = await provider.getKeyVersion({
    keyId: key.id,
    version: 1,
  });

  if (!oldVersion) {
    throw new Error("Previous key version is no longer addressable");
  }

  const unknownKey = await provider.getKey("unknown-key");

  if (unknownKey !== null) {
    throw new Error("Unknown key unexpectedly resolved");
  }

  const providerB = new LocalKeyProvider();

  const leakedKey = await providerB.getKey(key.id);

  if (leakedKey !== null) {
    throw new Error("Key leaked between provider instances");
  }

  console.log("Phase 8.4 manual verification passed");
};
void runManualVerification();
