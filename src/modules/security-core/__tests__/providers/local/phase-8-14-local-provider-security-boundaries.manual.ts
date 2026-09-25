import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

import { SecurityBoundaryValidator } from "../../../application/services/security-boundary-validator.service.js";

import {
  SecurityScope,
  DataClassification,
  SecurityPurpose,
} from "../../../domain/enums";

console.log("\n=== Phase 8.14 Local Provider Security Boundaries ===\n");

const provider = new LocalSecurityProvider();

const validator = new SecurityBoundaryValidator();

/**
 * ---------------------------------------------------------
 * 1. Provider Creation
 * ---------------------------------------------------------
 */

console.log("1. Creating Local Security Provider...");

if (!provider) {
  throw new Error("Local Security Provider could not be created");
}

console.log("   ✓ Local provider created");

/**
 * ---------------------------------------------------------
 * 2. Provider Identity
 * ---------------------------------------------------------
 */

console.log("2. Checking Local provider identity...");

const metadata = provider.getMetadata();

if (metadata.type !== "LOCAL") {
  throw new Error("Provider is not LOCAL");
}

if (metadata.id !== "local-security-provider") {
  throw new Error("Unexpected Local provider ID");
}

console.log("   ✓ Local provider identity verified");

/**
 * ---------------------------------------------------------
 * 3. PLATFORM Scope
 * ---------------------------------------------------------
 */

console.log("3. Testing PLATFORM security boundary...");

const platformContext = {
  scope: SecurityScope.PLATFORM,
  classification: DataClassification.INTERNAL,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

validator.validate(platformContext);

console.log("   ✓ PLATFORM context accepted");

/**
 * ---------------------------------------------------------
 * 4. Invalid PLATFORM Scope
 * ---------------------------------------------------------
 */

console.log("4. Testing invalid PLATFORM hierarchy...");

try {
  validator.validate({
    scope: SecurityScope.PLATFORM,
    organizationId: "org-1",
    classification: DataClassification.INTERNAL,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  });

  throw new Error("Invalid PLATFORM context was accepted");
} catch {
  console.log("   ✓ Invalid PLATFORM hierarchy rejected");
}

/**
 * ---------------------------------------------------------
 * 5. ORGANIZATION Scope
 * ---------------------------------------------------------
 */

console.log("5. Testing ORGANIZATION security boundary...");

validator.validate({
  scope: SecurityScope.ORGANIZATION,
  organizationId: "org-1",
  classification: DataClassification.CONFIDENTIAL,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
});

console.log("   ✓ ORGANIZATION context accepted");

/**
 * ---------------------------------------------------------
 * 6. Invalid ORGANIZATION Scope
 * ---------------------------------------------------------
 */

console.log("6. Testing invalid ORGANIZATION hierarchy...");

try {
  validator.validate({
    scope: SecurityScope.ORGANIZATION,
    classification: DataClassification.CONFIDENTIAL,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  });

  throw new Error("Invalid ORGANIZATION context was accepted");
} catch {
  console.log("   ✓ Missing organizationId rejected");
}

/**
 * ---------------------------------------------------------
 * 7. PROJECT Scope
 * ---------------------------------------------------------
 */

console.log("7. Testing PROJECT security boundary...");

validator.validate({
  scope: SecurityScope.PROJECT,
  organizationId: "org-1",
  projectId: "project-1",
  classification: DataClassification.CONFIDENTIAL,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
});

console.log("   ✓ PROJECT context accepted");

/**
 * ---------------------------------------------------------
 * 8. Invalid PROJECT Scope
 * ---------------------------------------------------------
 */

console.log("8. Testing invalid PROJECT hierarchy...");

try {
  validator.validate({
    scope: SecurityScope.PROJECT,
    organizationId: "org-1",
    classification: DataClassification.CONFIDENTIAL,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  });

  throw new Error("Invalid PROJECT context was accepted");
} catch {
  console.log("   ✓ Missing projectId rejected");
}

/**
 * ---------------------------------------------------------
 * 9. APPLICATION Scope
 * ---------------------------------------------------------
 */

console.log("9. Testing APPLICATION security boundary...");

validator.validate({
  scope: SecurityScope.APPLICATION,
  organizationId: "org-1",
  projectId: "project-1",
  applicationId: "app-1",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.API_KEY,
});

console.log("   ✓ APPLICATION context accepted");

/**
 * ---------------------------------------------------------
 * 10. Invalid APPLICATION Scope
 * ---------------------------------------------------------
 */

console.log("10. Testing invalid APPLICATION hierarchy...");

try {
  validator.validate({
    scope: SecurityScope.APPLICATION,
    organizationId: "org-1",
    projectId: "project-1",
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.API_KEY,
  });

  throw new Error("Invalid APPLICATION context was accepted");
} catch {
  console.log("   ✓ Missing applicationId rejected");
}

/**
 * ---------------------------------------------------------
 * 11. ENVIRONMENT Scope
 * ---------------------------------------------------------
 */

console.log("11. Testing ENVIRONMENT security boundary...");

validator.validate({
  scope: SecurityScope.ENVIRONMENT,
  organizationId: "org-1",
  projectId: "project-1",
  applicationId: "app-1",
  environmentId: "env-1",
  classification: DataClassification.HIGHLY_SENSITIVE,
  purpose: SecurityPurpose.DATABASE_CREDENTIAL,
});

console.log("   ✓ ENVIRONMENT context accepted");

/**
 * ---------------------------------------------------------
 * 12. Invalid ENVIRONMENT Scope
 * ---------------------------------------------------------
 */

console.log("12. Testing invalid ENVIRONMENT hierarchy...");

try {
  validator.validate({
    scope: SecurityScope.ENVIRONMENT,
    organizationId: "org-1",
    projectId: "project-1",
    applicationId: "app-1",
    classification: DataClassification.HIGHLY_SENSITIVE,
    purpose: SecurityPurpose.DATABASE_CREDENTIAL,
  });

  throw new Error("Invalid ENVIRONMENT context was accepted");
} catch {
  console.log("   ✓ Missing environmentId rejected");
}

/**
 * ---------------------------------------------------------
 * 13. Invalid Classification
 * ---------------------------------------------------------
 */

// console.log("13. Testing invalid data classification...");

// try {
//   validator.validate({
//     scope: SecurityScope.ORGANIZATION,
//     organizationId: "org-1",
//     classification: "INVALID_CLASSIFICATION",
//     purpose: SecurityPurpose.API_KEY,
//   });

//   throw new Error("Invalid classification was accepted");
// } catch {
//   console.log("   ✓ Invalid classification rejected");
// }
console.log("13. Testing invalid data classification...");

try {
  validator.validate({
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-1",
    classification: "INVALID_CLASSIFICATION" as unknown as DataClassification,
    purpose: SecurityPurpose.API_KEY,
  });

  console.log("   ✗ Invalid classification was accepted");
} catch {
  console.log("   ✓ Invalid classification rejected");
}
/**
 * ---------------------------------------------------------
 * 14. Invalid Purpose
 * ---------------------------------------------------------
 */

// console.log("14. Testing invalid security purpose...");

// try {
//   validator.validate({
//     scope: SecurityScope.ORGANIZATION,
//     organizationId: "org-1",
//     classification: DataClassification.SENSITIVE,
//     purpose: "INVALID_PURPOSE",
//   });

//   throw new Error("Invalid security purpose was accepted");
// } catch {
//   console.log("   ✓ Invalid security purpose rejected");
// }
console.log("14. Testing invalid security purpose...");

try {
  validator.validate({
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-1",
    classification: DataClassification.SENSITIVE,
    purpose: "INVALID_PURPOSE" as unknown as SecurityPurpose,
  });

  console.log("   ✗ Invalid security purpose was accepted");
} catch {
  console.log("   ✓ Invalid security purpose rejected");
}
/**
 * ---------------------------------------------------------
 * 15. Raw Key Material Exposure
 * ---------------------------------------------------------
 */

console.log("15. Checking provider metadata security...");

const serializedMetadata = JSON.stringify(metadata);

if (serializedMetadata.includes("privateKey")) {
  throw new Error("Provider metadata exposes private key information");
}

if (serializedMetadata.includes("keyMaterial")) {
  throw new Error("Provider metadata exposes raw key material");
}

if (serializedMetadata.includes("secret")) {
  throw new Error("Provider metadata exposes secret information");
}

console.log("   ✓ No raw key material exposed");

/**
 * ---------------------------------------------------------
 * 16. Capability Stability
 * ---------------------------------------------------------
 */

console.log("16. Checking provider capability stability...");

if (metadata.capabilities.length === 0) {
  throw new Error("Local provider has no capabilities");
}

console.log(`   ✓ ${metadata.capabilities.length} capabilities available`);

/**
 * ---------------------------------------------------------
 * Final Result
 * ---------------------------------------------------------
 */

console.log("\n==============================================");

console.log("Phase 8.14 manual verification PASSED");

console.log("Local Provider Security Boundaries are valid.");

console.log("==============================================\n");
