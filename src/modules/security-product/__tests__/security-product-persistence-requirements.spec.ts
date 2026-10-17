import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const requirementsPath = resolve(
  process.cwd(),
  "src/modules/security-product/PERSISTENCE_REQUIREMENTS.md",
);

const requirements = readFileSync(requirementsPath, "utf8");

describe("Security Product persistence requirements", () => {
  it("documents the purpose and phase status", () => {
    expect(requirements).toContain(
      "11.3.2 — Define Security Product Persistence Requirements",
    );
    expect(requirements).toContain(
      "pending developer verification and approval",
    );
  });

  it("identifies key metadata and key versions as initial resources", () => {
    expect(requirements).toContain("### 3.1 Initial persistence resources");
    expect(requirements).toContain("Security key metadata");
    expect(requirements).toContain("Key-version lifecycle records");
    expect(requirements).toContain("Provider key references");
  });

  it("documents the existing persistence and key-management contracts", () => {
    expect(requirements).toContain("SecurityProductPersistencePort");
    expect(requirements).toContain("SecurityKeyManagementService");
    expect(requirements).toContain("findById");
    expect(requirements).toContain("softDelete");
    expect(requirements).toContain("rotating a key");
  });

  it("documents all supported tenant resource scopes", () => {
    for (const scope of [
      "ORGANIZATION",
      "PROJECT",
      "APPLICATION",
      "ENVIRONMENT",
    ]) {
      expect(requirements).toContain(scope);
    }

    expect(requirements).toContain(
      "PLATFORM and FIELD are not part of the current",
    );
  });

  //   it("requires complete-scope enforcement in database queries", () => {
  //     expect(requirements).toContain(
  //       "The complete supplied scope must be used in database reads and mutations.",
  //     );
  //     expect(requirements).toContain(
  //       "An unscoped lookup followed by an ownership check is insufficient.",
  //     );
  //     expect(requirements).toContain(
  //       "The database schema must enforce hierarchy constraints",
  //     );
  //   });

  it("requires complete-scope enforcement in database queries", () => {
    const normalizedRequirements = requirements.replace(/\s+/g, " ");

    expect(normalizedRequirements).toContain(
      "The complete supplied scope must be used in database reads and mutations.",
    );

    expect(normalizedRequirements).toContain(
      "An unscoped lookup followed by an ownership check is insufficient.",
    );

    expect(normalizedRequirements).toContain(
      "The database schema must enforce hierarchy constraints",
    );
  });

  it("documents key-version lifecycle consistency", () => {
    expect(requirements).toContain(
      "A rotation creates a new version with a unique version number.",
    );
    expect(requirements).toContain(
      "The previously active version transitions to DECRYPT_ONLY",
    );
    expect(requirements).toContain(
      "Concurrent rotations must not create duplicate version numbers",
    );
    expect(requirements).toContain(
      "Failed operations must not leave partially applied lifecycle changes.",
    );
  });

  it("prohibits raw key-material storage in this persistence layer", () => {
    expect(requirements).toContain(
      "Raw cryptographic key material must not be stored in MySQL",
    );
    expect(requirements).toContain(
      "Secrets, passwords, encryption keys, and provider credentials must",
    );
  });

  //   it("documents repository and schema requirements", () => {
  //     expect(requirements).toContain("## 11. Repository Requirements");
  //     expect(requirements).toContain("## 12. Schema Requirements");
  //     expect(requirements).toContain("Primary keys and stable identifiers");
  //     expect(requirements).toContain("Unique version identity per key");
  //     expect(requirements).toContain("Parameterized SQL");
  //   });

  it("documents repository and schema requirements", () => {
    const normalizedRequirements = requirements.replace(/\s+/g, " ");

    expect(normalizedRequirements).toContain("## 11. Repository Requirements");

    expect(normalizedRequirements).toContain("## 12. Schema Requirements");

    expect(normalizedRequirements).toContain(
      "Primary keys and stable identifiers",
    );

    expect(normalizedRequirements).toContain("Unique version identity per key");

    expect(normalizedRequirements).toContain("Use parameterized SQL.");
  });

  it("defines testing and acceptance criteria", () => {
    expect(requirements).toContain("## 13. Testing Requirements");
    expect(requirements).toContain("Cross-tenant read and mutation rejection");
    expect(requirements).toContain(
      "Atomicity of multi-record lifecycle operations",
    );
    expect(requirements).toContain("## 15. Acceptance Criteria");
    expect(requirements).toContain(
      "**Final status:** Pending verification and developer approval.",
    );
  });

  it("keeps implementation outside the current phase", () => {
    expect(requirements).toContain("## 14. Out of Scope");
    expect(requirements).toContain("SQL schema files.");
    expect(requirements).toContain("MySQL repository classes.");
    expect(requirements).toContain("A persistent `KeyProvider`.");
  });
});
