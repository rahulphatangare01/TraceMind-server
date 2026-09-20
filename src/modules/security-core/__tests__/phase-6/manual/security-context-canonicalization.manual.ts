import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../../domain/enums/index.js";

import type { SecurityContext } from "../../../domain/models/security-context.js";

import { canonicalizeSecurityContext } from "../../../utils/security-context.util.js";
import { normalizeSecurityContext } from "../../../utils/security-context-normalization.util.js";

const printResult = (testName: string, context: SecurityContext): void => {
  const canonical = canonicalizeSecurityContext(context);

  console.log("\n========================================");
  console.log(testName);
  console.log("========================================");

  console.log("Input Context:");
  console.log(JSON.stringify(context, null, 2));

  console.log("\nCanonical Context:");
  console.log(canonical);

  console.log("\nCanonical Parts:");
  console.log(canonical.split("|"));
};

/**
 * Test 1
 * PLATFORM
 */
const platformContext: SecurityContext = {
  scope: SecurityScope.PLATFORM,
  classification: DataClassification.INTERNAL,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

printResult("TEST 1 - PLATFORM CONTEXT", platformContext);

/**
 * Test 2
 * ORGANIZATION
 */
const organizationContext: SecurityContext = {
  scope: SecurityScope.ORGANIZATION,
  organizationId: "org-123",
  classification: DataClassification.CONFIDENTIAL,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

printResult("TEST 2 - ORGANIZATION CONTEXT", organizationContext);

/**
 * Test 3
 * PROJECT
 */
const projectContext: SecurityContext = {
  scope: SecurityScope.PROJECT,
  organizationId: "org-123",
  projectId: "project-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

printResult("TEST 3 - PROJECT CONTEXT", projectContext);

/**
 * Test 4
 * APPLICATION
 */
const applicationContext: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
  projectId: "project-123",
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

printResult("TEST 4 - APPLICATION CONTEXT", applicationContext);

/**
 * Test 5
 * ENVIRONMENT
 */
const environmentContext: SecurityContext = {
  scope: SecurityScope.ENVIRONMENT,
  organizationId: "org-123",
  projectId: "project-123",
  applicationId: "app-123",
  environmentId: "env-123",
  classification: DataClassification.HIGHLY_SENSITIVE,
  purpose: SecurityPurpose.DATABASE_CREDENTIAL,
};

printResult("TEST 5 - ENVIRONMENT CONTEXT", environmentContext);

/**
 * Test 6
 * FIELD
 */
const fieldContext: SecurityContext = {
  scope: SecurityScope.FIELD,
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

printResult("TEST 6 - FIELD CONTEXT", fieldContext);

/**
 * Test 7
 * Deterministic output
 */
const deterministicContext1: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
  projectId: "project-123",
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

const deterministicContext2: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
  projectId: "project-123",
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

const deterministicResult1 = canonicalizeSecurityContext(deterministicContext1);

const deterministicResult2 = canonicalizeSecurityContext(deterministicContext2);

console.log("\n========================================");
console.log("TEST 7 - DETERMINISTIC OUTPUT");
console.log("========================================");

console.log("Result 1:");
console.log(deterministicResult1);

console.log("\nResult 2:");
console.log(deterministicResult2);

console.log("\nSame Output:", deterministicResult1 === deterministicResult2);

/**
 * Test 8
 * Fixed field ordering
 */
const orderingContext: SecurityContext = {
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  projectId: "project-123",
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
};

const orderingResult = canonicalizeSecurityContext(orderingContext);

console.log("\n========================================");
console.log("TEST 8 - FIXED FIELD ORDERING");
console.log("========================================");

console.log("Input property order:");
console.log(Object.keys(orderingContext));

console.log("\nCanonical output:");
console.log(orderingResult);

/**
 * Test 9
 * Undefined hierarchy fields
 */
const undefinedFieldsContext: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
  projectId: "project-123",
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

const undefinedFieldsResult = canonicalizeSecurityContext(
  undefinedFieldsContext,
);

console.log("\n========================================");
console.log("TEST 9 - UNDEFINED HIERARCHY FIELDS");
console.log("========================================");

console.log("Canonical output:");
console.log(undefinedFieldsResult);

console.log("\nParts:");
undefinedFieldsResult.split("|").forEach((part, index) => {
  console.log(`${index}: "${part}"`);
});

/**
 * Test 10
 * No mutation
 */
const mutationContext: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
  projectId: "project-123",
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

const contextBefore = JSON.stringify(mutationContext);

canonicalizeSecurityContext(mutationContext);

const contextAfter = JSON.stringify(mutationContext);

console.log("\n========================================");
console.log("TEST 10 - CONTEXT MUTATION");
console.log("========================================");

console.log("Context before:");
console.log(contextBefore);

console.log("\nContext after:");
console.log(contextAfter);

console.log("\nContext unchanged:", contextBefore === contextAfter);

/**
 * Test 11
 * Normalization + canonicalization
 */
const rawContext: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "  org-123  ",
  projectId: "  project-123 ",
  applicationId: " app-123 ",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

const normalizedContext = normalizeSecurityContext(rawContext);

const normalizedCanonical = canonicalizeSecurityContext(normalizedContext);

console.log("\n========================================");
console.log("TEST 11 - NORMALIZATION + CANONICALIZATION");
console.log("========================================");

console.log("Raw Context:");
console.log(JSON.stringify(rawContext, null, 2));

console.log("\nNormalized Context:");
console.log(JSON.stringify(normalizedContext, null, 2));

console.log("\nCanonical Context:");
console.log(normalizedCanonical);

console.log("\n========================================");
console.log("MANUAL CANONICALIZATION TEST COMPLETE");
console.log("========================================");
