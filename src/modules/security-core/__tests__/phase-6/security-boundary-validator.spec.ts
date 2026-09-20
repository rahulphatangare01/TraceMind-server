import { describe, expect, it } from "vitest";

import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/security-context.js";

import { SecurityBoundaryValidationError } from "../../errors/security-boundary-validation.error.js";

import { SecurityBoundaryValidator } from "../../application/services/security-boundary-validator.service.js";

describe("SecurityBoundaryValidator", () => {
  const validator = new SecurityBoundaryValidator();

  /**
   * Test 1
   * PLATFORM boundary
   */
  it("should validate PLATFORM security boundary", () => {
    const context: SecurityContext = {
      scope: SecurityScope.PLATFORM,
      classification: DataClassification.INTERNAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const result = validator.validate(context);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.context).toEqual(context);
  });

  /**
   * Test 2
   * ORGANIZATION boundary
   */
  it("should validate ORGANIZATION security boundary", () => {
    const context: SecurityContext = {
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-123",
      classification: DataClassification.CONFIDENTIAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const result = validator.validate(context);

    expect(result.valid).toBe(true);
    expect(result.context).toEqual(context);
  });

  /**
   * Test 3
   * PROJECT boundary
   */
  it("should validate PROJECT security boundary", () => {
    const context: SecurityContext = {
      scope: SecurityScope.PROJECT,
      organizationId: "org-123",
      projectId: "project-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const result = validator.validate(context);

    expect(result.valid).toBe(true);
    expect(result.context).toEqual(context);
  });

  /**
   * Test 4
   * APPLICATION boundary
   */
  it("should validate APPLICATION security boundary", () => {
    const context: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const result = validator.validate(context);

    expect(result.valid).toBe(true);
    expect(result.context).toEqual(context);
  });

  /**
   * Test 5
   * ENVIRONMENT boundary
   */
  it("should validate ENVIRONMENT security boundary", () => {
    const context: SecurityContext = {
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      environmentId: "env-123",
      classification: DataClassification.HIGHLY_SENSITIVE,
      purpose: SecurityPurpose.DATABASE_CREDENTIAL,
    };

    const result = validator.validate(context);

    expect(result.valid).toBe(true);
    expect(result.context).toEqual(context);
  });

  /**
   * Test 6
   * Missing organization boundary.
   */
  it("should reject PROJECT context without organizationId", () => {
    const context = {
      scope: SecurityScope.PROJECT,
      projectId: "project-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(() => validator.validate(context as SecurityContext)).toThrow(
      SecurityBoundaryValidationError,
    );
  });

  /**
   * Test 7
   * Missing project boundary.
   */
  it("should reject APPLICATION context without projectId", () => {
    const context = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(() => validator.validate(context as SecurityContext)).toThrow(
      SecurityBoundaryValidationError,
    );
  });

  /**
   * Test 8
   * Missing application boundary.
   */
  it("should reject ENVIRONMENT context without applicationId", () => {
    const context = {
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-123",
      projectId: "project-123",
      environmentId: "env-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(() => validator.validate(context as SecurityContext)).toThrow(
      SecurityBoundaryValidationError,
    );
  });

  /**
   * Test 9
   * PLATFORM must not contain tenant IDs.
   */
  it("should reject PLATFORM context containing organizationId", () => {
    const context = {
      scope: SecurityScope.PLATFORM,
      organizationId: "org-123",
      classification: DataClassification.INTERNAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(() => validator.validate(context as SecurityContext)).toThrow(
      SecurityBoundaryValidationError,
    );
  });

  /**
   * Test 10
   * ORGANIZATION cannot contain project boundary.
   */
  it("should reject ORGANIZATION context containing projectId", () => {
    const context = {
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-123",
      projectId: "project-123",
      classification: DataClassification.CONFIDENTIAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(() => validator.validate(context as SecurityContext)).toThrow(
      SecurityBoundaryValidationError,
    );
  });

  /**
   * Test 11
   * Normalization should happen before boundary validation.
   */
  it("should normalize hierarchy identifiers before validation", () => {
    const context: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "  org-123  ",
      projectId: " project-123 ",
      applicationId: " app-123 ",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const result = validator.validate(context);

    expect(result.valid).toBe(true);

    expect(result.context.organizationId).toBe("org-123");

    expect(result.context.projectId).toBe("project-123");

    expect(result.context.applicationId).toBe("app-123");
  });

  /**
   * Test 12
   * Original context must not be mutated.
   */
  it("should not mutate the original context", () => {
    const context: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "  org-123  ",
      projectId: " project-123 ",
      applicationId: " app-123 ",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const originalContext = { ...context };

    validator.validate(context);

    expect(context).toEqual(originalContext);
  });

  /**
   * Test 13
   * Environment requires the complete hierarchy.
   */
  it("should reject ENVIRONMENT context without complete hierarchy", () => {
    const context = {
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-123",
      projectId: "project-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.DATABASE_CREDENTIAL,
    };

    expect(() => validator.validate(context as SecurityContext)).toThrow(
      SecurityBoundaryValidationError,
    );
  });

  /**
   * Test 14
   * FIELD is currently supported as a reserved scope
   * without hierarchy IDs.
   */
  it("should validate FIELD security boundary", () => {
    const context: SecurityContext = {
      scope: SecurityScope.FIELD,
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const result = validator.validate(context);

    expect(result.valid).toBe(true);
  });
});
