import {
  DataClassification,
  HmacAlgorithm,
  SecurityPurpose,
  SecurityScope,
  SignatureAlgorithm,
} from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/security-context.js";

import { SecurityContextValidationError } from "../../errors/security-context-validation.error.js";

import { securityCore } from "../../security-core.container.js";

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

const context: SecurityContext = {
  scope: SecurityScope.APPLICATION,
  organizationId: "org-phase-9-13-manual",
  projectId: "project-phase-9-13-manual",
  applicationId: "application-phase-9-13-manual",
  classification: DataClassification.SENSITIVE,
  purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
};

async function runManualTest(): Promise<void> {
  printSection("Phase 9.13 - Security Context Integration");

  /*
   * ==================================================
   * 1. Valid Context
   * ==================================================
   */
  printSection("1. Valid Context");

  const normalizedContext =
    securityCore.securityServiceValidation.validateEncryptRequest({
      plaintext: "TraceMind Phase 9.13",
      keyId: "manual-key",
      context: {
        ...context,
        organizationId: `  ${context.organizationId}  `,
        projectId: ` ${context.projectId} `,
        applicationId: ` ${context.applicationId} `,
      },
    });

  assert(
    normalizedContext.organizationId === context.organizationId,
    "Organization ID was not normalized",
  );

  assert(
    normalizedContext.projectId === context.projectId,
    "Project ID was not normalized",
  );

  assert(
    normalizedContext.applicationId === context.applicationId,
    "Application ID was not normalized",
  );

  console.log("✓ Security context validated");

  console.log("✓ Security context normalized");

  /*
   * ==================================================
   * 2. Invalid Context
   * ==================================================
   */
  printSection("2. Invalid Context");

  let invalidContextRejected = false;

  try {
    securityCore.securityServiceValidation.validateEncryptRequest({
      plaintext: "TraceMind invalid context",
      keyId: "manual-key",
      context: {
        scope: SecurityScope.APPLICATION,
        projectId: context.projectId,
        applicationId: context.applicationId,
        classification: DataClassification.SENSITIVE,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      },
    });
  } catch (error) {
    invalidContextRejected = error instanceof SecurityContextValidationError;
  }

  assert(invalidContextRejected, "Invalid security context was not rejected");

  console.log("✓ Invalid context rejected");

  /*
   * ==================================================
   * 3. Signing Context Integration
   * ==================================================
   */
  printSection("3. Signing Context Integration");

  const signResult = await securityCore.securityServiceSigningApi.sign({
    payload: "TraceMind Phase 9.13 signing",
    algorithm: SignatureAlgorithm.ED25519,
    context: {
      ...context,
      organizationId: ` ${context.organizationId} `,
    },
  });

  assert(signResult.signature.length > 0, "Signing failed");

  console.log("✓ Signing succeeds with validated context");

  /*
   * ==================================================
   * 4. HMAC Context Integration
   * ==================================================
   */
  printSection("4. HMAC Context Integration");

  const hmacResult = await securityCore.securityServiceHmacApi.createHmac({
    payload: "TraceMind Phase 9.13 HMAC",
    algorithm: HmacAlgorithm.HMAC_SHA_256,
    context: {
      ...context,
      projectId: ` ${context.projectId} `,
    },
  });

  assert(hmacResult.signature.length > 0, "HMAC creation failed");

  console.log("✓ HMAC succeeds with validated context");

  console.log("");

  console.log("==================================================");

  console.log("Phase 9.13 manual verification completed");

  console.log("==================================================");
}

runManualTest().catch((error) => {
  console.error("Phase 9.13 manual test failed:", error);

  process.exitCode = 1;
});
