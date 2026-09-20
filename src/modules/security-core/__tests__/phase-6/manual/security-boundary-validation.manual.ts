import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../../domain/enums/index.js";

import type { SecurityContext } from "../../../domain/models/security-context.js";

import { SecurityBoundaryValidationError } from "../../../errors/security-boundary-validation.error.js";

import { SecurityBoundaryValidator } from "../../../application/services/security-boundary-validator.service.js";

const validator = new SecurityBoundaryValidator();

const testBoundary = (name: string, context: any): void => {
  console.log("\n========================================");
  console.log(name);
  console.log("========================================");

  console.log("\nInput:");
  console.log(JSON.stringify(context, null, 2));

  try {
    const result = validator.validate(context);

    console.log("\nVALID: true");

    console.log("\nNormalized Context:");
    console.log(JSON.stringify(result.context, null, 2));
  } catch (error) {
    if (error instanceof SecurityBoundaryValidationError) {
      console.log("\nVALID: false");

      console.log("\nError Code:");
      console.log(error.code);

      console.log("\nValidation Errors:");

      for (const validationError of error.errors) {
        console.log(`- ${validationError}`);
      }

      return;
    }

    throw error;
  }
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

testBoundary("TEST 1 - PLATFORM BOUNDARY", platformContext);

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

testBoundary("TEST 2 - ORGANIZATION BOUNDARY", organizationContext);

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

testBoundary("TEST 3 - PROJECT BOUNDARY", projectContext);

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

testBoundary("TEST 4 - APPLICATION BOUNDARY", applicationContext);

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

testBoundary("TEST 5 - ENVIRONMENT BOUNDARY", environmentContext);

/**
 * Test 6
 * Invalid PLATFORM boundary
 */
const invalidPlatformContext: unknown = {
  scope: SecurityScope.PLATFORM,
  organizationId: "org-123",
  classification: DataClassification.INTERNAL,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

testBoundary("TEST 6 - INVALID PLATFORM BOUNDARY", invalidPlatformContext);

/**
 * Test 7
 * Invalid APPLICATION hierarchy
 */
const invalidApplicationContext: unknown = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-123",
  applicationId: "app-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

testBoundary(
  "TEST 7 - INVALID APPLICATION HIERARCHY",
  invalidApplicationContext,
);

/**
 * Test 8
 * Invalid ENVIRONMENT hierarchy
 */
const invalidEnvironmentContext: unknown = {
  scope: SecurityScope.ENVIRONMENT,
  organizationId: "org-123",
  projectId: "project-123",
  environmentId: "env-123",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.DATABASE_CREDENTIAL,
};

testBoundary(
  "TEST 8 - INVALID ENVIRONMENT HIERARCHY",
  invalidEnvironmentContext,
);

/**
 * Test 9
 * Normalization
 */
const normalizedContext: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "  org-123  ",
  projectId: " project-123 ",
  applicationId: " app-123 ",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

testBoundary(
  "TEST 9 - NORMALIZATION BEFORE BOUNDARY VALIDATION",
  normalizedContext,
);

console.log("\n========================================");
console.log("MANUAL SECURITY BOUNDARY TEST COMPLETE");
console.log("========================================");
