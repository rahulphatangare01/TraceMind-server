import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const designPath = resolve(
  process.cwd(),
  "src/modules/security-product/SECURITY_PRODUCT_SCHEMA_DESIGN.md",
);

const design = readFileSync(designPath, "utf8");
const normalizedDesign = design.replace(/\s+/g, " ");

const checks: Array<{ name: string; verify: () => void }> = [
  {
    name: "Schema design document exists and is not empty",
    verify: () => {
      assert.ok(design.trim().length > 0);
    },
  },
  {
    name: "Both persistence tables are defined",
    verify: () => {
      assert.ok(design.includes("### 4.1 security_keys"));
      assert.ok(design.includes("### 4.2 security_key_versions"));
    },
  },
  {
    name: "Existing database conventions are preserved",
    verify: () => {
      assert.ok(design.includes("CHAR(36)"));
      assert.ok(design.includes("DATETIME(3)"));
      assert.ok(design.includes("InnoDB"));
    },
  },
  {
    name: "All supported tenant scopes are documented",
    verify: () => {
      for (const scope of [
        "ORGANIZATION",
        "PROJECT",
        "APPLICATION",
        "ENVIRONMENT",
      ]) {
        assert.ok(design.includes(scope), `Missing scope: ${scope}`);
      }
    },
  },
  {
    name: "Tenant hierarchy foreign-key dependencies are documented",
    verify: () => {
      assert.ok(
        normalizedDesign.includes(
          "(project_id, organization_id) references projects(id, organization_id)",
        ),
      );
      assert.ok(
        normalizedDesign.includes(
          "(environment_id, application_id, project_id, organization_id)",
        ),
      );
    },
  },
  {
    name: "Key versions have unique identities",
    verify: () => {
      assert.ok(normalizedDesign.includes("UNIQUE (key_id, version)"));
    },
  },
  {
    name: "Rotation and current-version integrity are addressed",
    verify: () => {
      assert.ok(design.includes("Active-version integrity"));
      assert.ok(design.includes("Current Version Consistency"));
      assert.ok(design.includes("concurrent rotations"));
    },
  },
  {
    name: "Soft deletion preserves version history",
    verify: () => {
      assert.ok(design.includes("deleted_at"));
      assert.ok(design.includes("Retain version history"));
    },
  },
  {
    name: "Raw cryptographic key material is excluded",
    verify: () => {
      assert.ok(
        design.includes("Do not persist raw cryptographic key material"),
      );
    },
  },
  //   {
  //     name: "Design dependencies and acceptance criteria are documented",
  //     verify: () => {
  //       assert.ok(design.includes("CHECK constraint enforcement behavior"));
  //       assert.ok(design.includes("supporting constraint to environments"));
  //       assert.ok(design.includes("## 11. Acceptance Criteria"));
  //       assert.ok(design.includes("pending verification and developer approval"));
  //     },
  //   },
  {
    name: "Design dependencies and acceptance criteria are documented",
    verify: () => {
      assert.ok(
        normalizedDesign.includes("CHECK constraint enforcement behavior"),
      );
      assert.ok(
        normalizedDesign.includes("supporting constraint to environments"),
      );
      assert.ok(normalizedDesign.includes("## 11. Acceptance Criteria"));
      assert.ok(
        normalizedDesign.includes(
          "pending verification and developer approval",
        ),
      );
    },
  },
];

let failures = 0;

console.log("\nSecurity Product Schema Design — Manual Check\n");

for (const check of checks) {
  try {
    check.verify();
    console.log(`PASS: ${check.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL: ${check.name}`);
    console.error(error);
  }
}

console.log(`\nResults: ${checks.length - failures}/${checks.length} passed`);

if (failures > 0) {
  throw new Error(
    `Schema design manual verification failed: ${failures} check(s) failed.`,
  );
}

console.log("All schema design manual checks passed.");
