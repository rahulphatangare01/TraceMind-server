import { describe, expect, it } from "vitest";

import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/security-context.js";

import { canonicalizeSecurityContext } from "../../utils/security-context.util.js";
import { normalizeSecurityContext } from "../../utils/security-context-normalization.util.js";

describe("SecurityContext - Canonicalization", () => {
  /**
   * Test 1
   * PLATFORM context
   */
  it("should generate canonical context for PLATFORM scope", () => {
    const context: SecurityContext = {
      scope: SecurityScope.PLATFORM,
      classification: DataClassification.INTERNAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const result = canonicalizeSecurityContext(context);

    expect(result).toBe("PLATFORM|||||INTERNAL|ENCRYPTED_CONFIGURATION");
  });

  /**
   * Test 2
   * ORGANIZATION context
   */
  it("should generate canonical context for ORGANIZATION scope", () => {
    const context: SecurityContext = {
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-123",
      classification: DataClassification.CONFIDENTIAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const result = canonicalizeSecurityContext(context);

    expect(result).toBe(
      "ORGANIZATION|org-123||||CONFIDENTIAL|ENCRYPTED_CONFIGURATION",
    );
  });

  /**
   * Test 3
   * PROJECT context
   */
  it("should generate canonical context for PROJECT scope", () => {
    const context: SecurityContext = {
      scope: SecurityScope.PROJECT,
      organizationId: "org-123",
      projectId: "project-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const result = canonicalizeSecurityContext(context);

    expect(result).toBe(
      "PROJECT|org-123|project-123|||SENSITIVE|ENCRYPTED_CONFIGURATION",
    );
  });

  /**
   * Test 4
   * APPLICATION context
   */
  it("should generate canonical context for APPLICATION scope", () => {
    const context: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const result = canonicalizeSecurityContext(context);

    expect(result).toBe(
      "APPLICATION|org-123|project-123|app-123||SENSITIVE|ENCRYPTED_CONFIGURATION",
    );
  });

  /**
   * Test 5
   * ENVIRONMENT context
   */
  it("should generate canonical context for ENVIRONMENT scope", () => {
    const context: SecurityContext = {
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      environmentId: "env-123",
      classification: DataClassification.HIGHLY_SENSITIVE,
      purpose: SecurityPurpose.DATABASE_CREDENTIAL,
    };

    const result = canonicalizeSecurityContext(context);

    expect(result).toBe(
      "ENVIRONMENT|org-123|project-123|app-123|env-123|HIGHLY_SENSITIVE|DATABASE_CREDENTIAL",
    );
  });

  /**
   * Test 6
   * FIELD context
   *
   * FIELD currently does not have fieldName/entityName
   * in SecurityContext, so no additional field metadata
   * should be introduced here.
   */
  it("should generate canonical context for FIELD scope", () => {
    const context: SecurityContext = {
      scope: SecurityScope.FIELD,
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const result = canonicalizeSecurityContext(context);

    expect(result).toBe("FIELD|||||SENSITIVE|ENCRYPTED_CONFIGURATION");
  });

  /**
   * Test 7
   * Deterministic output
   *
   * Equivalent contexts must always produce
   * exactly the same canonical representation.
   */
  it("should generate deterministic output for equivalent contexts", () => {
    const context1: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const context2: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const result1 = canonicalizeSecurityContext(context1);
    const result2 = canonicalizeSecurityContext(context2);

    expect(result1).toBe(result2);
  });

  /**
   * Test 8
   * Field ordering must remain fixed
   *
   * JavaScript object property insertion order must not
   * affect canonical representation.
   */
  it("should preserve fixed canonical field ordering", () => {
    const context: SecurityContext = {
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      projectId: "project-123",
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
    };

    const result = canonicalizeSecurityContext(context);

    expect(result).toBe(
      "APPLICATION|org-123|project-123|app-123||SENSITIVE|ENCRYPTED_CONFIGURATION",
    );
  });

  /**
   * Test 9
   * Undefined hierarchy fields become empty positions.
   */
  it("should represent undefined hierarchy fields as empty positions", () => {
    const context: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const result = canonicalizeSecurityContext(context);

    const parts = result.split("|");

    expect(parts).toHaveLength(7);

    expect(parts[0]).toBe("APPLICATION");
    expect(parts[1]).toBe("org-123");
    expect(parts[2]).toBe("project-123");
    expect(parts[3]).toBe("app-123");
    expect(parts[4]).toBe("");
    expect(parts[5]).toBe("SENSITIVE");
    expect(parts[6]).toBe("ENCRYPTED_CONFIGURATION");
  });

  /**
   * Test 10
   * Canonicalization must not mutate the original context.
   */
  it("should not mutate the original security context", () => {
    const context: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const originalContext = { ...context };

    canonicalizeSecurityContext(context);

    expect(context).toEqual(originalContext);
  });

  /**
   * Test 11
   * Normalization + canonicalization pipeline
   *
   * Raw IDs contain surrounding whitespace.
   * Normalization removes the surrounding whitespace,
   * then canonicalization creates the deterministic representation.
   */
  it("should normalize context before canonicalization", () => {
    const context: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "  org-123  ",
      projectId: "  project-123 ",
      applicationId: " app-123 ",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const normalizedContext = normalizeSecurityContext(context);

    const result = canonicalizeSecurityContext(normalizedContext);

    expect(result).toBe(
      "APPLICATION|org-123|project-123|app-123||SENSITIVE|ENCRYPTED_CONFIGURATION",
    );
  });
});
