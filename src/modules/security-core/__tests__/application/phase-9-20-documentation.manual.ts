import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`Manual verification failed: ${message}`);
  }
};

const printSection = (title: string): void => {
  console.log("");
  console.log("==================================================");
  console.log(title);
  console.log("==================================================");
};

function runManualTest(): void {
  printSection("Phase 9.20 - Documentation Manual Verification");

  const documentationPath = resolve(
    process.cwd(),
    "docs/security-core/phase-9/9.20-security-service-public-api.md",
  );

  const contractPath = resolve(
    process.cwd(),
    "src/modules/security-core/application/interfaces/security.service.interface.ts",
  );

  const facadePath = resolve(
    process.cwd(),
    "src/modules/security-core/application/services/security-service.facade.ts",
  );

  const containerPath = resolve(
    process.cwd(),
    "src/modules/security-core/security-core.container.ts",
  );

  // 1. Verify documentation and source files exist.
  printSection("1. File Availability");

  assert(
    existsSync(documentationPath),
    "Phase 9.20 documentation file is missing",
  );

  assert(existsSync(contractPath), "SecurityService interface file is missing");

  assert(existsSync(facadePath), "SecurityService facade file is missing");

  assert(existsSync(containerPath), "Security Core container file is missing");

  console.log("✓ Documentation file exists");
  console.log("✓ Public API interface exists");
  console.log("✓ Public facade implementation exists");
  console.log("✓ Security Core container exists");

  // 2. Read the documentation and public contract.
  const documentation = readFileSync(documentationPath, "utf8");

  const contract = readFileSync(contractPath, "utf8");

  // 3. Verify the documented sections.
  printSection("2. Required Documentation Sections");

  const requiredSections = [
    "## 1. Purpose",
    "## 2. Architecture",
    "## 3. Public API Contract",
    "## 4. Security Context",
    "## 5. Provider Resolution",
    "## 6. Key Management",
    "## 7. Error Handling",
    "## 8. Usage Example",
    "## 9. Security Boundaries",
    "## 10. Testing and Regression",
    "## 11. Known Limitations",
    "## 12. Source of Truth",
  ];

  for (const section of requiredSections) {
    assert(
      documentation.includes(section),
      `Missing documentation section: ${section}`,
    );

    console.log(`✓ ${section}`);
  }

  // 4. Compare the documented operations with the interface.
  printSection("3. Public API Contract Coverage");

  const operations = [
    "encrypt",
    "decrypt",
    "hash",
    "verifyHash",
    "sign",
    "verifySignature",
    "createHmac",
    "verifyHmac",
  ] as const;

  for (const operation of operations) {
    const documented = new RegExp(`\\b${operation}\\s*\\(`).test(documentation);

    const implementedInContract = new RegExp(`\\b${operation}\\s*\\(`).test(
      contract,
    );

    assert(documented, `Documentation does not describe ${operation}()`);

    assert(
      implementedInContract,
      `SecurityService interface does not expose ${operation}()`,
    );

    console.log(`✓ ${operation}() documented and declared`);
  }

  // 5. Verify documented security boundaries.
  printSection("4. Security Boundary Documentation");

  const requiredSecurityTerms = [
    "SecurityContextValidator",
    "SecurityBoundaryValidator",
    "PLATFORM",
    "ORGANIZATION",
    "PROJECT",
    "APPLICATION",
    "ENVIRONMENT",
    "FIELD",
    "raw key material",
    "private signing keys",
    "authorization",
  ];

  for (const term of requiredSecurityTerms) {
    assert(
      documentation.includes(term),
      `Security documentation is missing: ${term}`,
    );

    console.log(`✓ ${term}`);
  }

  // 6. Verify references to implementation files.
  printSection("5. Source References");

  const sourceReferences = [
    "src/modules/security-core/application/interfaces/security.service.interface.ts",
    "src/modules/security-core/application/services/security-service.facade.ts",
    "src/modules/security-core/application/services/security-service-validation.service.ts",
    "src/modules/security-core/application/services/security-boundary-validator.service.ts",
    "src/modules/security-core/application/services/security-context-validator.service.ts",
    "src/modules/security-core/application/services/security-service-error-handling.service.ts",
    "src/modules/security-core/application/services/security-service-key-management-api.service.ts",
    "src/modules/security-core/application/services/security-service-provider-resolution.service.ts",
    "src/modules/security-core/security-core.container.ts",
  ];

  for (const reference of sourceReferences) {
    assert(
      documentation.includes(reference),
      `Missing source reference: ${reference}`,
    );

    console.log(`✓ ${reference}`);
  }

  // 7. Verify the documentation has meaningful content.
  printSection("6. Documentation Completeness");

  assert(documentation.trim().length > 0, "Documentation is empty");

  assert(
    documentation.includes("```ts"),
    "No TypeScript usage example was found",
  );

  assert(
    documentation.includes("## 11. Known Limitations"),
    "Known limitations section is missing",
  );

  assert(
    documentation.includes("## 12. Source of Truth"),
    "Source of truth section is missing",
  );

  console.log("✓ Documentation contains content and code examples");
  console.log("✓ Known limitations are documented");
  console.log("✓ Authoritative source files are referenced");

  printSection("Final Result");

  console.log("✓ Documentation and source files exist");
  console.log("✓ Required sections are present");
  console.log("✓ Eight public API operations are documented");
  console.log("✓ Security boundaries are documented");
  console.log("✓ Source references are present");
  console.log("✓ Documentation completeness checks passed");

  console.log("");
  console.log("==================================================");
  console.log("PHASE 9.20 MANUAL VERIFICATION PASSED");
  console.log("==================================================");
}

try {
  runManualTest();
} catch (error: unknown) {
  console.error("Phase 9.20 manual test failed:", error);
  process.exitCode = 1;
}
