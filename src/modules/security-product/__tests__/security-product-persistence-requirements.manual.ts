import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const requirementsPath = resolve(
  process.cwd(),
  "src/modules/security-product/PERSISTENCE_REQUIREMENTS.md",
);

const requirements = readFileSync(requirementsPath, "utf8");
const normalizedRequirements = requirements.replace(/\s+/g, " ");
const checks: Array<{
  name: string;
  verify: () => void;
}> = [
  {
    name: "Requirements document exists and is not empty",
    verify: () => {
      assert.ok(requirements.trim().length > 0);
    },
  },
  {
    name: "Initial persisted resources are defined",
    verify: () => {
      assert.ok(requirements.includes("Security key metadata"));
      assert.ok(requirements.includes("Key-version lifecycle records"));
    },
  },
  {
    name: "Tenant scopes are defined",
    verify: () => {
      for (const scope of [
        "ORGANIZATION",
        "PROJECT",
        "APPLICATION",
        "ENVIRONMENT",
      ]) {
        assert.ok(
          requirements.includes(scope),
          `Missing tenant scope: ${scope}`,
        );
      }
    },
  },
  //   {
  //     name: "Complete tenant scope is required for persistence",
  //     verify: () => {
  //       assert.ok(
  //         requirements.includes(
  //           "The complete supplied scope must be used in database reads and mutations.",
  //         ),
  //       );
  //       assert.ok(
  //         requirements.includes(
  //           "An unscoped lookup followed by an ownership check is insufficient.",
  //         ),
  //       );
  //     },
  //   },

  {
    name: "Complete tenant scope is required for persistence",
    verify: () => {
      assert.ok(
        normalizedRequirements.includes(
          "The complete supplied scope must be used in database reads and mutations.",
        ),
      );
      assert.ok(
        normalizedRequirements.includes(
          "An unscoped lookup followed by an ownership check is insufficient.",
        ),
      );
    },
  },
  {
    name: "Key metadata and version lifecycle are covered",
    verify: () => {
      assert.ok(requirements.includes("currentVersion"));
      assert.ok(requirements.includes("providerKeyReference"));
      assert.ok(requirements.includes("DECRYPT_ONLY"));
      assert.ok(requirements.includes("Concurrent rotations"));
    },
  },
  {
    name: "Raw key material is excluded from metadata persistence",
    verify: () => {
      assert.ok(
        requirements.includes(
          "Raw cryptographic key material must not be stored in MySQL",
        ),
      );
    },
  },
  {
    name: "Soft deletion and database constraints are documented",
    verify: () => {
      assert.ok(requirements.includes("softDelete"));
      assert.ok(requirements.includes("must not physically delete"));
      assert.ok(requirements.includes("Unique version identity per key"));
    },
  },
  {
    name: "Repository and testing requirements are documented",
    verify: () => {
      assert.ok(requirements.includes("## 11. Repository Requirements"));
      assert.ok(requirements.includes("## 13. Testing Requirements"));
      assert.ok(
        requirements.includes("Cross-tenant read and mutation rejection"),
      );
    },
  },
  {
    name: "Implementation remains outside this requirements phase",
    verify: () => {
      assert.ok(requirements.includes("## 14. Out of Scope"));
      assert.ok(requirements.includes("MySQL repository classes."));
      assert.ok(requirements.includes("A persistent `KeyProvider`."));
    },
  },
  {
    name: "Acceptance criteria require developer approval",
    verify: () => {
      assert.ok(requirements.includes("## 15. Acceptance Criteria"));
      assert.ok(
        requirements.includes(
          "**Final status:** Pending verification and developer approval.",
        ),
      );
    },
  },
];

let failures = 0;

console.log("\nSecurity Product Persistence Requirements — Manual Check\n");

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
    `Persistence requirements manual verification failed: ${failures} check(s) failed.`,
  );
}

console.log("All persistence requirements manual checks passed.");
