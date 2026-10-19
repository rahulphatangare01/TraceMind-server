import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const designPath = resolve(
  process.cwd(),
  "src/modules/security-product/SECURITY_PRODUCT_SCHEMA_DESIGN.md",
);

const design = readFileSync(designPath, "utf8");
const normalizedDesign = design.replace(/\s+/g, " ");

describe("Security Product schema design", () => {
  it("documents both required persistence tables", () => {
    expect(design).toContain("### 4.1 security_keys");
    expect(design).toContain("### 4.2 security_key_versions");
  });

  it("follows existing database conventions", () => {
    expect(design).toContain("CHAR(36)");
    expect(design).toContain("DATETIME(3)");
    expect(design).toContain("utf8mb4_unicode_ci");
    expect(design).toContain("InnoDB");
  });

  it("defines tenant scope combinations", () => {
    expect(design).toContain("ORGANIZATION");
    expect(design).toContain("PROJECT");
    expect(design).toContain("APPLICATION");
    expect(design).toContain("ENVIRONMENT");
    expect(design).toContain("CHECK constraint");
  });

  it("documents tenant hierarchy constraints", () => {
    expect(normalizedDesign).toContain(
      "(project_id, organization_id) references projects(id, organization_id)",
    );
    expect(normalizedDesign).toContain(
      "(application_id, project_id, organization_id)",
    );
    expect(normalizedDesign).toContain(
      "(environment_id, application_id, project_id, organization_id)",
    );
  });

  it("requires unique key-version identity", () => {
    expect(normalizedDesign).toContain("UNIQUE (key_id, version)");
  });

  it("addresses active-version and current-version consistency", () => {
    expect(design).toContain("Active-version integrity");
    expect(design).toContain("Current Version Consistency");
    expect(design).toContain("concurrent rotations");
  });

  it("preserves version history during soft deletion", () => {
    expect(design).toContain("deleted_at");
    expect(design).toContain("Retain version history");
    expect(design).toContain("must not physically delete");
  });

  it("excludes raw key material", () => {
    expect(design).toContain("Do not persist raw cryptographic key material");
  });

  //   it("documents unresolved MySQL and migration dependencies", () => {
  //     expect(design).toContain("CHECK constraint enforcement behavior");
  //     expect(design).toContain("supporting constraint to environments");
  //     expect(design).toContain("schema execution order");
  //   });
  it("documents unresolved MySQL and migration dependencies", () => {
    expect(normalizedDesign).toContain("CHECK constraint enforcement behavior");
    expect(normalizedDesign).toContain("supporting constraint to environments");
    expect(normalizedDesign).toContain("schema execution order");
  });
  it("keeps implementation outside the design phase", () => {
    expect(design).toContain("## 10. Out of Scope");
    expect(design).toContain("SQL schema or migration files");
    expect(design).toContain("## 11. Acceptance Criteria");
    expect(design).toContain(
      "Proposed — pending verification and developer approval",
    );
  });
});
