import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const documentationPath = resolve(
  process.cwd(),
  "docs/security-core/local-provider.md",
);

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function run(): void {
  console.log("");
  console.log("======================================================");
  console.log("Phase 8.17 - Documentation & Final Review");
  console.log("======================================================");

  /**
   * ---------------------------------------------------------
   * 1. Documentation Exists
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("1. Checking Local Provider documentation...");

  assert(
    existsSync(documentationPath),
    "Local Provider documentation does not exist",
  );

  const documentation = readFileSync(documentationPath, "utf8");

  console.log("   ✓ Documentation file exists");

  /**
   * ---------------------------------------------------------
   * 2. Architecture Documentation
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("2. Checking architecture documentation...");

  assert(
    documentation.includes("## 2. Architecture"),
    "Architecture section missing",
  );

  assert(
    documentation.includes("LocalSecurityProvider"),
    "LocalSecurityProvider missing",
  );

  assert(
    documentation.includes("LocalKeyProvider"),
    "LocalKeyProvider missing",
  );

  assert(
    documentation.includes("LocalKeyMaterialProvider"),
    "LocalKeyMaterialProvider missing",
  );

  assert(
    documentation.includes("LocalSigningKeyProvider"),
    "LocalSigningKeyProvider missing",
  );

  assert(
    documentation.includes("LocalHmacKeyProvider"),
    "LocalHmacKeyProvider missing",
  );

  assert(
    documentation.includes("LocalCryptoProvider"),
    "LocalCryptoProvider missing",
  );

  console.log("   ✓ Architecture documented");

  /**
   * ---------------------------------------------------------
   * 3. Cryptography Documentation
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("3. Checking cryptographic documentation...");

  const algorithms = [
    "AES-256-GCM",
    "SHA-256",
    "Argon2id",
    "Ed25519",
    "HMAC-SHA-256",
  ];

  for (const algorithm of algorithms) {
    assert(
      documentation.includes(algorithm),
      `${algorithm} documentation missing`,
    );
  }

  console.log("   ✓ Cryptographic algorithms documented");

  /**
   * ---------------------------------------------------------
   * 4. Security Documentation
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("4. Checking security documentation...");

  assert(
    documentation.includes("## 13. Security Boundaries"),
    "Security boundary documentation missing",
  );

  assert(
    documentation.includes("## 18. Security Considerations"),
    "Security considerations missing",
  );

  console.log("   ✓ Security boundaries documented");
  console.log("   ✓ Security considerations documented");

  /**
   * ---------------------------------------------------------
   * 5. Isolation Documentation
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("5. Checking isolation documentation...");

  assert(
    documentation.includes("## 14. Isolation and Concurrency"),
    "Isolation documentation missing",
  );

  console.log("   ✓ Isolation and concurrency documented");

  /**
   * ---------------------------------------------------------
   * 6. Limitations
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("6. Checking known limitations...");

  assert(
    documentation.includes("## 17. Known Limitations"),
    "Known limitations section missing",
  );

  assert(
    documentation.includes("In-memory key state"),
    "In-memory limitation missing",
  );

  assert(
    documentation.includes("AWS KMS"),
    "AWS KMS limitation not documented",
  );

  assert(
    documentation.includes("Azure Key Vault"),
    "Azure Key Vault limitation not documented",
  );

  assert(
    documentation.includes("Google Cloud KMS"),
    "Google Cloud KMS limitation not documented",
  );

  console.log("   ✓ Known limitations documented");

  /**
   * ---------------------------------------------------------
   * 7. Final Phase 8 Documentation
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("7. Checking Phase 8 completion documentation...");

  assert(
    documentation.includes("## 19. Phase 8 Completion"),
    "Phase 8 completion section missing",
  );

  console.log("   ✓ Phase 8 completion documented");

  /**
   * ---------------------------------------------------------
   * Final Result
   * ---------------------------------------------------------
   */

  console.log("");
  console.log("======================================================");
  console.log("Phase 8.17 Manual Verification PASSED");
  console.log("======================================================");
  console.log("");
}

try {
  run();
} catch (error) {
  console.error("");
  console.error("======================================================");
  console.error("Phase 8.17 Manual Verification FAILED");
  console.error("======================================================");
  console.error("");
  console.error(error);
  process.exit(1);
}
