import { securityCore } from "../../security-core.container.js";

import { SecurityBoundaryValidator } from "../../application/services/security-boundary-validator.service.js";
import { SecurityContextValidator } from "../../application/services/security-context-validator.service.js";

import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/security-context.js";

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

async function runManualTest(): Promise<void> {
  printSection("Phase 9.19 - Security Boundary Review");

  const boundaryValidator = new SecurityBoundaryValidator();
  const contextValidator = new SecurityContextValidator();

  const baseContext = {
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
  };

  // 1. Verify the existing validators are available.
  printSection("1. Validator Availability");

  assert(
    boundaryValidator !== undefined,
    "Security boundary validator is unavailable",
  );

  assert(
    contextValidator !== undefined,
    "Security context validator is unavailable",
  );

  console.log("✓ Security boundary validator is available");
  console.log("✓ Security context validator is available");

  // 2. Verify valid scope boundaries.
  printSection("2. Valid Scope Boundaries");

  const validContexts: SecurityContext[] = [
    {
      ...baseContext,
      scope: SecurityScope.PLATFORM,
    },
    {
      ...baseContext,
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-123",
    },
    {
      ...baseContext,
      scope: SecurityScope.PROJECT,
      organizationId: "org-123",
      projectId: "project-123",
    },
    {
      ...baseContext,
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
    },
    {
      ...baseContext,
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      environmentId: "env-123",
    },
    {
      ...baseContext,
      scope: SecurityScope.FIELD,
    },
  ];

  for (const context of validContexts) {
    const result = boundaryValidator.validate(context);

    assert(
      result.valid === true,
      `Valid ${context.scope} context was rejected`,
    );

    console.log(`✓ ${context.scope} scope accepted`);
  }

  // 3. Verify cross-boundary identifiers are rejected.
  printSection("3. Invalid Scope Boundaries");

  //   const invalidContexts: unknown[] = [
  const invalidContexts: SecurityContext[] = [
    {
      ...baseContext,
      scope: SecurityScope.PLATFORM,
      organizationId: "org-123",
    },
    {
      ...baseContext,
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-123",
      projectId: "project-123",
    },
    {
      ...baseContext,
      scope: SecurityScope.PROJECT,
      projectId: "project-123",
    },
    {
      ...baseContext,
      scope: SecurityScope.FIELD,
      organizationId: "org-123",
    },
    {
      ...baseContext,
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
    },
  ];

  //   for (const context of invalidContexts) {
  //     let rejected = false;

  //     try {
  //       boundaryValidator.validate(context);
  //     } catch {
  //       rejected = true;
  //     }

  //     assert(rejected, "An invalid scope boundary was accepted");
  //   }
  for (const context of invalidContexts) {
    let rejected = false;

    try {
      boundaryValidator.validate(context);
    } catch {
      rejected = true;
    }

    assert(rejected, "An invalid scope boundary was accepted");
  }
  console.log("✓ All invalid boundary cases were rejected");

  // 4. Verify normalization without mutating the original input.
  printSection("4. Context Normalization");

  const contextWithWhitespace: SecurityContext = {
    ...baseContext,
    scope: SecurityScope.APPLICATION,
    organizationId: "  org-123  ",
    projectId: " project-123 ",
    applicationId: " app-123 ",
  };

  const originalContext = { ...contextWithWhitespace };

  const normalizedResult = boundaryValidator.validate(contextWithWhitespace);

  assert(
    normalizedResult.valid === true,
    "Valid context with surrounding whitespace was rejected",
  );

  assert(
    normalizedResult.context.organizationId === "org-123",
    "Organization ID was not normalized",
  );

  assert(
    normalizedResult.context.projectId === "project-123",
    "Project ID was not normalized",
  );

  assert(
    normalizedResult.context.applicationId === "app-123",
    "Application ID was not normalized",
  );

  assert(
    contextWithWhitespace.organizationId === originalContext.organizationId &&
      contextWithWhitespace.projectId === originalContext.projectId &&
      contextWithWhitespace.applicationId === originalContext.applicationId,
    "Boundary validation mutated the original context",
  );

  console.log("✓ Scope identifiers were normalized");
  console.log("✓ Original context was not mutated");

  // 5. Verify whitespace-only identifiers are rejected.
  printSection("5. Empty Identifier Rejection");

  let emptyIdentifierRejected = false;

  try {
    boundaryValidator.validate({
      ...baseContext,
      scope: SecurityScope.ORGANIZATION,
      organizationId: "   ",
    });
  } catch {
    emptyIdentifierRejected = true;
  }

  assert(
    emptyIdentifierRejected,
    "Whitespace-only organization ID was accepted",
  );

  console.log("✓ Whitespace-only identifier was rejected");

  // 6. Verify the public facade is still available.
  printSection("6. Public API Regression");

  assert(
    securityCore.securityService !== undefined,
    "Public Security Service facade is unavailable",
  );

  const service = securityCore.securityService;

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
    assert(
      typeof service[operation] === "function",
      `Public operation '${operation}' is unavailable`,
    );
  }

  console.log("✓ Public facade remains available");
  console.log("✓ All eight public operations remain available");

  printSection("Final Result");

  console.log("✓ Validator availability checked");
  console.log("✓ Valid scope boundaries checked");
  console.log("✓ Invalid scope boundaries rejected");
  console.log("✓ Context normalization checked");
  console.log("✓ Original context immutability checked");
  console.log("✓ Empty identifier rejection checked");
  console.log("✓ Public API regression checked");

  console.log("");
  console.log("==================================================");
  console.log("PHASE 9.19 MANUAL VERIFICATION PASSED");
  console.log("==================================================");
}

runManualTest().catch((error: unknown) => {
  console.error("Phase 9.19 manual test failed:", error);
  process.exitCode = 1;
});
