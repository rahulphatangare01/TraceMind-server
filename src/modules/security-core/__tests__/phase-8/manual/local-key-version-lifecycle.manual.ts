import { LocalKeyProvider } from "../../../providers/local/local-key.provider.js";

import {
  KeyPurpose,
  KeyStatus,
  SecurityScope,
} from "../../../domain/enums/index.js";

const runManualVerification = async (): Promise<void> => {
  const provider = new LocalKeyProvider();

  const key = await provider.createKey({
    purpose: KeyPurpose.ENCRYPTION,
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-version-manual",
  });

  const version1 = await provider.getActiveVersion(key.id);

  if (!version1) {
    throw new Error("Version 1 was not created");
  }

  if (version1.version !== 1) {
    throw new Error("Initial version is not version 1");
  }

  if (version1.status !== KeyStatus.ACTIVE) {
    throw new Error("Initial version is not ACTIVE");
  }

  const version2 = await provider.rotateKey(key.id);

  if (version2.version !== 2) {
    throw new Error("First rotation did not create version 2");
  }

  if (version2.status !== KeyStatus.ACTIVE) {
    throw new Error("Version 2 is not ACTIVE");
  }

  const oldVersion = await provider.getKeyVersion({
    keyId: key.id,
    version: 1,
  });

  if (!oldVersion) {
    throw new Error("Version 1 disappeared after rotation");
  }

  if (oldVersion.status !== KeyStatus.DECRYPT_ONLY) {
    throw new Error("Version 1 was not changed to DECRYPT_ONLY");
  }

  const version3 = await provider.rotateKey(key.id);

  if (version3.version !== 3) {
    throw new Error("Second rotation did not create version 3");
  }

  const activeVersion = await provider.getActiveVersion(key.id);

  if (!activeVersion) {
    throw new Error("Active version could not be resolved");
  }

  if (activeVersion.version !== 3) {
    throw new Error("Version 3 is not the active version");
  }

  if (activeVersion.status !== KeyStatus.ACTIVE) {
    throw new Error("Version 3 is not ACTIVE");
  }

  const version2AfterRotation = await provider.getKeyVersion({
    keyId: key.id,
    version: 2,
  });

  if (!version2AfterRotation) {
    throw new Error("Version 2 disappeared after second rotation");
  }

  if (version2AfterRotation.status !== KeyStatus.DECRYPT_ONLY) {
    throw new Error("Version 2 is not DECRYPT_ONLY");
  }

  const updatedKey = await provider.getKey(key.id);

  if (!updatedKey) {
    throw new Error("Key could not be retrieved");
  }

  if (updatedKey.currentVersion !== 3) {
    throw new Error("currentVersion is not 3");
  }

  console.log("Phase 8.5 manual verification passed");
};
void runManualVerification();
