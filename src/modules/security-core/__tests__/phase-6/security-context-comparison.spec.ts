import { describe, expect, it } from "vitest";

import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import type { SecurityContext } from "../../domain/models/security-context.js";

import { areSecurityContextsEqual } from "../../utils/security-context-comparison.util.js";

describe("SecurityContext - Equality / Comparison", () => {
  /**
   * Test 1
   * Equivalent contexts should be equal.
   */
  it("should return true for equivalent security contexts", () => {
    const contextA: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const contextB: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(areSecurityContextsEqual(contextA, contextB)).toBe(true);
  });

  /**
   * Test 2
   * Different scope should not be equal.
   */
  it("should return false when scope is different", () => {
    const contextA: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const contextB: SecurityContext = {
      scope: SecurityScope.PROJECT,
      organizationId: "org-123",
      projectId: "project-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(areSecurityContextsEqual(contextA, contextB)).toBe(false);
  });

  /**
   * Test 3
   * Different organization should not be equal.
   */
  it("should return false when organizationId is different", () => {
    const contextA: SecurityContext = {
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const contextB: SecurityContext = {
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-456",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(areSecurityContextsEqual(contextA, contextB)).toBe(false);
  });

  /**
   * Test 4
   * Different project should not be equal.
   */
  it("should return false when projectId is different", () => {
    const contextA: SecurityContext = {
      scope: SecurityScope.PROJECT,
      organizationId: "org-123",
      projectId: "project-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const contextB: SecurityContext = {
      scope: SecurityScope.PROJECT,
      organizationId: "org-123",
      projectId: "project-456",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(areSecurityContextsEqual(contextA, contextB)).toBe(false);
  });

  /**
   * Test 5
   * Different application should not be equal.
   */
  it("should return false when applicationId is different", () => {
    const contextA: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const contextB: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-456",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(areSecurityContextsEqual(contextA, contextB)).toBe(false);
  });

  /**
   * Test 6
   * Different environment should not be equal.
   */
  it("should return false when environmentId is different", () => {
    const contextA: SecurityContext = {
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      environmentId: "env-123",
      classification: DataClassification.HIGHLY_SENSITIVE,
      purpose: SecurityPurpose.DATABASE_CREDENTIAL,
    };

    const contextB: SecurityContext = {
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      environmentId: "env-456",
      classification: DataClassification.HIGHLY_SENSITIVE,
      purpose: SecurityPurpose.DATABASE_CREDENTIAL,
    };

    expect(areSecurityContextsEqual(contextA, contextB)).toBe(false);
  });

  /**
   * Test 7
   * Different classification should not be equal.
   */
  it("should return false when classification is different", () => {
    const contextA: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const contextB: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.CONFIDENTIAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(areSecurityContextsEqual(contextA, contextB)).toBe(false);
  });

  /**
   * Test 8
   * Different purpose should not be equal.
   */
  it("should return false when purpose is different", () => {
    const contextA: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const contextB: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.DATABASE_CREDENTIAL,
    };

    expect(areSecurityContextsEqual(contextA, contextB)).toBe(false);
  });

  /**
   * Test 9
   * Surrounding whitespace should be ignored
   * because comparison normalizes both contexts.
   */
  it("should treat surrounding whitespace as equivalent", () => {
    const contextA: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const contextB: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "  org-123  ",
      projectId: " project-123 ",
      applicationId: " app-123 ",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(areSecurityContextsEqual(contextA, contextB)).toBe(true);
  });

  /**
   * Test 10
   * Different internal whitespace must remain different.
   *
   * Normalization only trims surrounding whitespace.
   */
  it("should not ignore internal whitespace differences", () => {
    const contextA: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const contextB: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org 123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(areSecurityContextsEqual(contextA, contextB)).toBe(false);
  });

  /**
   * Test 11
   * Object property ordering must not affect equality.
   */
  it("should ignore object property insertion order", () => {
    const contextA: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const contextB: SecurityContext = {
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      projectId: "project-123",
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
    };

    expect(areSecurityContextsEqual(contextA, contextB)).toBe(true);
  });

  /**
   * Test 12
   * Original contexts must not be mutated.
   */
  it("should not mutate either security context", () => {
    const contextA: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "  org-123  ",
      projectId: " project-123 ",
      applicationId: " app-123 ",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const contextB: SecurityContext = {
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const originalA = { ...contextA };
    const originalB = { ...contextB };

    areSecurityContextsEqual(contextA, contextB);

    expect(contextA).toEqual(originalA);
    expect(contextB).toEqual(originalB);
  });

  /**
   * Test 13
   * Same canonical context should always produce equality.
   */
  it("should return true when canonical representations are identical", () => {
    const contextA: SecurityContext = {
      scope: SecurityScope.PLATFORM,
      classification: DataClassification.INTERNAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    const contextB: SecurityContext = {
      scope: SecurityScope.PLATFORM,
      classification: DataClassification.INTERNAL,
      purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
    };

    expect(areSecurityContextsEqual(contextA, contextB)).toBe(true);
  });
});
