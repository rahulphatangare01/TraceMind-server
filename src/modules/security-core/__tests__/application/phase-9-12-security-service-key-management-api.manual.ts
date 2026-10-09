import assert from "node:assert/strict";

import {
  KeyPurpose,
  KeyStatus,
  SecurityScope,
} from "../../domain/enums/index.js";

import type { KeyReference } from "../../types/index.js";

import { securityCore } from "../../security-core.container.js";

async function testCreateKey(): Promise<string> {
  console.log("\nTest 1 - Create key");

  const key = await securityCore.securityServiceKeyManagementApi.createKey({
    purpose: KeyPurpose.ENCRYPTION,
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-phase-9-12-manual",
  });

  assert.ok(key.id, "Created key must have an ID");

  assert.equal(
    key.purpose,
    KeyPurpose.ENCRYPTION,
    "Key purpose must be ENCRYPTION",
  );

  assert.equal(
    key.scope,
    SecurityScope.ORGANIZATION,
    "Key scope must be ORGANIZATION",
  );

  assert.equal(key.status, KeyStatus.ACTIVE, "New key must be ACTIVE");

  assert.equal(key.currentVersion, 1, "New key must start at version 1");

  console.log("✓ Key created");
  console.log("✓ Key ID:", key.id);
  console.log("✓ Status:", key.status);
  console.log("✓ Current version:", key.currentVersion);

  return key.id;
}

async function testGetKey(keyId: string): Promise<void> {
  console.log("\nTest 2 - Get key");

  const key = await securityCore.securityServiceKeyManagementApi.getKey(keyId);

  assert.ok(key, "Created key must be retrievable");

  assert.equal(key.id, keyId, "Returned key ID must match requested key ID");

  console.log("✓ Key retrieved successfully");
}

async function testGetKeyVersion(keyId: string): Promise<void> {
  console.log("\nTest 3 - Get key version");

  const reference: KeyReference = {
    keyId,
    version: 1,
  };

  const version =
    await securityCore.securityServiceKeyManagementApi.getKeyVersion(reference);

  assert.ok(version, "Key version must exist");

  assert.equal(
    version.keyId,
    keyId,
    "Key version must belong to requested key",
  );

  assert.equal(version.version, 1, "Initial key version must be version 1");

  assert.equal(
    version.status,
    KeyStatus.ACTIVE,
    "Initial key version must be ACTIVE",
  );

  console.log("✓ Key version retrieved");
  console.log("✓ Version:", version.version);
  console.log("✓ Status:", version.status);
}

async function testGetActiveKeyVersion(keyId: string): Promise<void> {
  console.log("\nTest 4 - Get active key version");

  const version =
    await securityCore.securityServiceKeyManagementApi.getActiveKeyVersion(
      keyId,
    );

  assert.ok(version, "Active key version must exist");

  assert.equal(
    version.keyId,
    keyId,
    "Active version must belong to requested key",
  );

  assert.equal(
    version.status,
    KeyStatus.ACTIVE,
    "Active version must have ACTIVE status",
  );

  console.log("✓ Active key version resolved");
  console.log("✓ Version:", version.version);
}

async function testRotateKey(keyId: string): Promise<void> {
  console.log("\nTest 5 - Rotate key");

  const rotatedVersion =
    await securityCore.securityServiceKeyManagementApi.rotateKey(keyId);

  assert.equal(
    rotatedVersion.keyId,
    keyId,
    "Rotated version must belong to requested key",
  );

  assert.equal(
    rotatedVersion.version,
    2,
    "First rotation must create version 2",
  );

  assert.equal(
    rotatedVersion.status,
    KeyStatus.ACTIVE,
    "New rotated version must be ACTIVE",
  );

  console.log("✓ Key rotated");
  console.log("✓ New version:", rotatedVersion.version);
  console.log("✓ New status:", rotatedVersion.status);
}

async function testPreviousVersionAfterRotation(keyId: string): Promise<void> {
  console.log("\nTest 6 - Previous version remains available");

  const previousVersion =
    await securityCore.securityServiceKeyManagementApi.getKeyVersion({
      keyId,
      version: 1,
    });

  assert.ok(previousVersion, "Previous version must remain retrievable");

  assert.equal(
    previousVersion.version,
    1,
    "Previous version must remain version 1",
  );

  assert.equal(
    previousVersion.status,
    KeyStatus.DECRYPT_ONLY,
    "Previous version must become DECRYPT_ONLY after rotation",
  );

  console.log("✓ Previous version preserved");
  console.log("✓ Previous version status:", previousVersion.status);
}

async function testActiveVersionAfterRotation(keyId: string): Promise<void> {
  console.log("\nTest 7 - Active version after rotation");

  const activeVersion =
    await securityCore.securityServiceKeyManagementApi.getActiveKeyVersion(
      keyId,
    );

  assert.ok(activeVersion, "Active version must exist after rotation");

  assert.equal(
    activeVersion.version,
    2,
    "Version 2 must be active after first rotation",
  );

  assert.equal(
    activeVersion.status,
    KeyStatus.ACTIVE,
    "Version 2 must be ACTIVE",
  );

  console.log("✓ Version 2 is active");
}

async function testChangeKeyStatus(keyId: string): Promise<void> {
  console.log("\nTest 8 - Change key version status");

  const reference: KeyReference = {
    keyId,
    version: 2,
  };

  const updatedVersion =
    await securityCore.securityServiceKeyManagementApi.changeKeyStatus(
      reference,
      KeyStatus.DISABLED,
    );

  assert.equal(
    updatedVersion.keyId,
    keyId,
    "Updated version must belong to requested key",
  );

  assert.equal(
    updatedVersion.version,
    2,
    "Updated version must remain version 2",
  );

  assert.equal(
    updatedVersion.status,
    KeyStatus.DISABLED,
    "Version status must change to DISABLED",
  );

  console.log("✓ Key version status changed");
  console.log("✓ Version:", updatedVersion.version);
  console.log("✓ Status:", updatedVersion.status);
}

async function testUnknownKey(): Promise<void> {
  console.log("\nTest 9 - Unknown key");

  const result = await securityCore.securityServiceKeyManagementApi.getKey(
    "unknown-phase-9-12-key",
  );

  assert.equal(result, null, "Unknown key should return null");

  console.log("✓ Unknown key handled correctly");
}

async function testRawKeyMaterialProtection(keyId: string): Promise<void> {
  console.log("\nTest 10 - Raw key material protection");

  const key = await securityCore.securityServiceKeyManagementApi.getKey(keyId);

  assert.ok(key, "Key must exist");

  const serialized = JSON.stringify(key);

  assert.doesNotMatch(
    serialized,
    /secret|privateKey|publicKey|keyMaterial|password|token/i,
    "Key metadata must not contain raw key material",
  );

  const version =
    await securityCore.securityServiceKeyManagementApi.getKeyVersion({
      keyId,
      version: 1,
    });

  assert.ok(version, "Key version must exist");

  const versionSerialized = JSON.stringify(version);

  assert.doesNotMatch(
    versionSerialized,
    /secret|privateKey|publicKey|keyMaterial|password|token/i,
    "Key version metadata must not contain raw key material",
  );

  console.log("✓ Raw key material is not exposed");
}

async function run(): Promise<void> {
  console.log("==============================================");
  console.log("TraceMind - Phase 9.12 Manual Verification");
  console.log("Security Service Key Management API");
  console.log("==============================================");

  try {
    const keyId = await testCreateKey();

    await testGetKey(keyId);
    await testGetKeyVersion(keyId);
    await testGetActiveKeyVersion(keyId);
    await testRotateKey(keyId);
    await testPreviousVersionAfterRotation(keyId);
    await testActiveVersionAfterRotation(keyId);
    await testChangeKeyStatus(keyId);
    await testUnknownKey();
    await testRawKeyMaterialProtection(keyId);

    console.log("\n==============================================");
    console.log("PHASE 9.12 MANUAL VERIFICATION PASSED");
    console.log("==============================================");
  } catch (error) {
    console.error("\n==============================================");
    console.error("PHASE 9.12 MANUAL VERIFICATION FAILED");
    console.error("==============================================");

    console.error(error);

    process.exitCode = 1;
  }
}

// await run();
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
