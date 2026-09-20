import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../../domain/enums/index.js";

import type { SecurityContext } from "../../../domain/models/security-context.js";

import { areSecurityContextsEqual } from "../../../utils/security-context-comparison.util.js";
import { canonicalizeSecurityContext } from "../../../utils/security-context.util.js";
import { normalizeSecurityContext } from "../../../utils/security-context-normalization.util.js";

const printComparison = (
  testName: string,
  contextA: SecurityContext,
  contextB: SecurityContext,
): void => {
  const normalizedA = normalizeSecurityContext(contextA);
  const normalizedB = normalizeSecurityContext(contextB);

  const canonicalA = canonicalizeSecurityContext(normalizedA);
  const canonicalB = canonicalizeSecurityContext(normalizedB);

  const equal = areSecurityContextsEqual(contextA, contextB);

  console.log("\n========================================");
  console.log(testName);
  console.log("========================================");

  console.log("\nContext A:");
  console.log(JSON.stringify(contextA, null, 2));

  console.log("\nContext B:");
  console.log(JSON.stringify(contextB, null, 2));

  console.log("\nCanonical A:");
  console.log(canonicalA);

  console.log("\nCanonical B:");
  console.log(canonicalB);

  console.log("\nEqual:");
  console.log(equal);
};

/**
 * Test 1
 * Same contexts
 */
const sameContextA: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
  projectId: "project-123",
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

const sameContextB: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
  projectId: "project-123",
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

printComparison("TEST 1 - SAME CONTEXT", sameContextA, sameContextB);

/**
 * Test 2
 * Different organization
 */
const organizationA: SecurityContext = {
  scope: SecurityScope.ORGANIZATION,
  organizationId: "org-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

const organizationB: SecurityContext = {
  scope: SecurityScope.ORGANIZATION,
  organizationId: "org-456",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

printComparison(
  "TEST 2 - DIFFERENT ORGANIZATION",
  organizationA,
  organizationB,
);

/**
 * Test 3
 * Different purpose
 */
const purposeA: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
  projectId: "project-123",
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

const purposeB: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
  projectId: "project-123",
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.DATABASE_CREDENTIAL,
};

printComparison("TEST 3 - DIFFERENT PURPOSE", purposeA, purposeB);

/**
 * Test 4
 * Whitespace normalization
 */
const whitespaceA: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
  projectId: "project-123",
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

const whitespaceB: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "  org-123  ",
  projectId: " project-123 ",
  applicationId: " app-123 ",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

printComparison("TEST 4 - WHITESPACE NORMALIZATION", whitespaceA, whitespaceB);

/**
 * Test 5
 * Object property order
 */
const orderingA: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
  projectId: "project-123",
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

const orderingB: SecurityContext = {
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  projectId: "project-123",
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
};

printComparison(
  "TEST 5 - DIFFERENT OBJECT PROPERTY ORDER",
  orderingA,
  orderingB,
);

/**
 * Test 6
 * Internal whitespace difference
 */
const internalWhitespaceA: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
  projectId: "project-123",
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

const internalWhitespaceB: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org 123",
  projectId: "project-123",
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

printComparison(
  "TEST 6 - INTERNAL WHITESPACE DIFFERENCE",
  internalWhitespaceA,
  internalWhitespaceB,
);

console.log("\n========================================");
console.log("MANUAL CONTEXT COMPARISON TEST COMPLETE");
console.log("========================================");
