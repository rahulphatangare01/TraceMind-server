import { describe, expect, it } from "vitest";

import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import { SecurityContextValidator } from "../../application/services/security-context-validator.service.js";

import { SecurityContextValidationError } from "../../errors/security-context-validation.error.js";

describe("SecurityContextValidator", () => {
  const validator = new SecurityContextValidator();

  it("should validate PLATFORM context", () => {
    const context = validator.validate({
      scope: SecurityScope.PLATFORM,
      classification: DataClassification.SECRET,
      purpose: SecurityPurpose.SIGNING,
    });

    expect(context.scope).toBe(SecurityScope.PLATFORM);
  });

  it("should validate ORGANIZATION context", () => {
    const context = validator.validate({
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    });

    expect(context.organizationId).toBe("org-123");
  });

  it("should validate PROJECT context", () => {
    const context = validator.validate({
      scope: SecurityScope.PROJECT,
      organizationId: "org-123",
      projectId: "project-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    });

    expect(context.projectId).toBe("project-123");
  });

  it("should validate APPLICATION context", () => {
    const context = validator.validate({
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.OAUTH_CLIENT_SECRET,
    });

    expect(context.applicationId).toBe("app-123");
  });

  it("should validate ENVIRONMENT context", () => {
    const context = validator.validate({
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      environmentId: "production",
      classification: DataClassification.SECRET,
      purpose: SecurityPurpose.DATABASE_CREDENTIAL,
    });

    expect(context.environmentId).toBe("production");
  });

  it("should reject invalid scope", () => {
    expect(() =>
      validator.validate({
        scope: "INVALID",
        classification: DataClassification.SENSITIVE,
        purpose: SecurityPurpose.API_KEY,
      }),
    ).toThrow(SecurityContextValidationError);
  });

  it("should reject missing classification", () => {
    expect(() =>
      validator.validate({
        scope: SecurityScope.ORGANIZATION,
        organizationId: "org-123",
        purpose: SecurityPurpose.API_KEY,
      }),
    ).toThrow(SecurityContextValidationError);
  });

  it("should reject missing purpose", () => {
    expect(() =>
      validator.validate({
        scope: SecurityScope.ORGANIZATION,
        organizationId: "org-123",
        classification: DataClassification.SENSITIVE,
      }),
    ).toThrow(SecurityContextValidationError);
  });

  it("should reject missing required organizationId", () => {
    expect(() =>
      validator.validate({
        scope: SecurityScope.ORGANIZATION,
        classification: DataClassification.SENSITIVE,
        purpose: SecurityPurpose.API_KEY,
      }),
    ).toThrow(SecurityContextValidationError);
  });

  it("should reject forbidden projectId for ORGANIZATION", () => {
    expect(() =>
      validator.validate({
        scope: SecurityScope.ORGANIZATION,
        organizationId: "org-123",
        projectId: "project-123",
        classification: DataClassification.SENSITIVE,
        purpose: SecurityPurpose.API_KEY,
      }),
    ).toThrow(SecurityContextValidationError);
  });

  it("should reject PROJECT without organizationId", () => {
    expect(() =>
      validator.validate({
        scope: SecurityScope.PROJECT,
        projectId: "project-123",
        classification: DataClassification.SENSITIVE,
        purpose: SecurityPurpose.API_KEY,
      }),
    ).toThrow(SecurityContextValidationError);
  });

  it("should reject APPLICATION without projectId", () => {
    expect(() =>
      validator.validate({
        scope: SecurityScope.APPLICATION,
        organizationId: "org-123",
        applicationId: "app-123",
        classification: DataClassification.SENSITIVE,
        purpose: SecurityPurpose.API_KEY,
      }),
    ).toThrow(SecurityContextValidationError);
  });

  it("should reject ENVIRONMENT without applicationId", () => {
    expect(() =>
      validator.validate({
        scope: SecurityScope.ENVIRONMENT,
        organizationId: "org-123",
        projectId: "project-123",
        environmentId: "production",
        classification: DataClassification.SECRET,
        purpose: SecurityPurpose.DATABASE_CREDENTIAL,
      }),
    ).toThrow(SecurityContextValidationError);
  });

  it("should reject empty organizationId", () => {
    expect(() =>
      validator.validate({
        scope: SecurityScope.ORGANIZATION,
        organizationId: "",
        classification: DataClassification.SENSITIVE,
        purpose: SecurityPurpose.API_KEY,
      }),
    ).toThrow(SecurityContextValidationError);
  });

  it("should reject non-object input", () => {
    expect(() => validator.validate(null)).toThrow(
      SecurityContextValidationError,
    );

    expect(() => validator.validate("invalid")).toThrow(
      SecurityContextValidationError,
    );

    expect(() => validator.validate(123)).toThrow(
      SecurityContextValidationError,
    );
  });

  it("should expose validation details", () => {
    try {
      validator.validate({
        scope: SecurityScope.PROJECT,
        projectId: "project-123",
        classification: DataClassification.SENSITIVE,
        purpose: SecurityPurpose.API_KEY,
      });

      throw new Error("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(SecurityContextValidationError);

      if (error instanceof SecurityContextValidationError) {
        expect(error.errors.length).toBeGreaterThan(0);
      }
    }
  });
});
