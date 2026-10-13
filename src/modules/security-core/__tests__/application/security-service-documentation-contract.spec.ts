import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const documentationPath = resolve(
  process.cwd(),
  "docs/security-core/phase-9/9.20-security-service-public-api.md",
);

const contractPath = resolve(
  process.cwd(),
  "src/modules/security-core/application/interfaces/security.service.interface.ts",
);

describe("Phase 9.20 - Security Service Documentation Contract", () => {
  it("contains the public API documentation file", () => {
    expect(existsSync(documentationPath)).toBe(true);
  });

  it("contains the authoritative SecurityService interface", () => {
    expect(existsSync(contractPath)).toBe(true);
  });

  it("documents the required public API operations", () => {
    const documentation = readFileSync(documentationPath, "utf8");

    const contract = readFileSync(contractPath, "utf8");

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
      expect(documentation, `Documentation is missing '${operation}'`).toMatch(
        new RegExp(`\\b${operation}\\s*\\(`),
      );

      expect(
        contract,
        "SecurityService interface is missing an operation",
      ).toMatch(new RegExp(`\\b${operation}\\s*\\(`));
    }
  });

  it("documents the required security scopes", () => {
    const documentation = readFileSync(documentationPath, "utf8");

    const scopes = [
      "PLATFORM",
      "ORGANIZATION",
      "PROJECT",
      "APPLICATION",
      "ENVIRONMENT",
      "FIELD",
    ] as const;

    for (const scope of scopes) {
      expect(
        documentation,
        `Documentation is missing scope '${scope}'`,
      ).toContain(`\`${scope}\``);
    }
  });

  it("documents the security context and boundary validation", () => {
    const documentation = readFileSync(documentationPath, "utf8");

    const requiredTerms = [
      "SecurityContext",
      "SecurityContextValidator",
      "SecurityBoundaryValidator",
      "organizationId",
      "projectId",
      "applicationId",
      "environmentId",
    ];

    for (const term of requiredTerms) {
      expect(documentation, `Documentation is missing '${term}'`).toContain(
        term,
      );
    }
  });

  it("documents provider resolution and key management separately", () => {
    const documentation = readFileSync(documentationPath, "utf8");

    expect(documentation).toContain("## 5. Provider Resolution");
    expect(documentation).toContain("## 6. Key Management");
    expect(documentation).toContain("SecurityServiceKeyManagementApi");
    expect(documentation).toContain("Provider");
    expect(documentation).toContain("silently fall back");
  });

  it("documents error handling and sensitive-data protection", () => {
    const documentation = readFileSync(documentationPath, "utf8");

    expect(documentation).toContain("## 7. Error Handling");
    expect(documentation).toContain("SecurityServiceErrorHandlingService");
    expect(documentation).toContain("sensitive input values");
    expect(documentation).toContain("raw key material");
    expect(documentation).toContain("private signing keys");
  });

  it("documents usage examples, testing, and known limitations", () => {
    const documentation = readFileSync(documentationPath, "utf8");

    const requiredSections = [
      "## 8. Usage Example",
      "## 9. Security Boundaries",
      "## 10. Testing and Regression",
      "## 11. Known Limitations",
      "## 12. Source of Truth",
    ];

    for (const section of requiredSections) {
      expect(
        documentation,
        `Documentation is missing section '${section}'`,
      ).toContain(section);
    }

    expect(documentation).toContain("HashAlgorithm.SHA_256");
    expect(documentation).toContain("CryptoEncoding.HEX");
    expect(documentation).toContain("Signature context binding");
  });

  it("references the actual public facade and container", () => {
    const documentation = readFileSync(documentationPath, "utf8");

    expect(documentation).toContain(
      "src/modules/security-core/application/interfaces/security.service.interface.ts",
    );

    expect(documentation).toContain(
      "src/modules/security-core/application/services/security-service.facade.ts",
    );

    expect(documentation).toContain(
      "src/modules/security-core/security-core.container.ts",
    );
  });
});
