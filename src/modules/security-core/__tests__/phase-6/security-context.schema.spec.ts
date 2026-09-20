import { describe, expect, it } from "vitest";

import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import { securityContextSchema } from "../../schemas/security-context.schema.js";

describe("Security Context Zod Schema", () => {
  const validContext = {
    scope: SecurityScope.ORGANIZATION,
    organizationId: "org-123",
    classification: DataClassification.SENSITIVE,
    purpose: SecurityPurpose.API_KEY,
  };

  it("should accept a valid organization context", () => {
    const result = securityContextSchema.safeParse(validContext);

    expect(result.success).toBe(true);
  });

  it("should accept PLATFORM context without hierarchy IDs", () => {
    const result = securityContextSchema.safeParse({
      scope: SecurityScope.PLATFORM,
      classification: DataClassification.SECRET,
      purpose: SecurityPurpose.SIGNING,
    });

    expect(result.success).toBe(true);
  });

  it("should accept PROJECT context structurally", () => {
    const result = securityContextSchema.safeParse({
      scope: SecurityScope.PROJECT,
      organizationId: "org-123",
      projectId: "project-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    });

    expect(result.success).toBe(true);
  });

  it("should accept APPLICATION context structurally", () => {
    const result = securityContextSchema.safeParse({
      scope: SecurityScope.APPLICATION,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.OAUTH_CLIENT_SECRET,
    });

    expect(result.success).toBe(true);
  });

  it("should accept ENVIRONMENT context structurally", () => {
    const result = securityContextSchema.safeParse({
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-123",
      projectId: "project-123",
      applicationId: "app-123",
      environmentId: "production",
      classification: DataClassification.SECRET,
      purpose: SecurityPurpose.DATABASE_CREDENTIAL,
    });

    expect(result.success).toBe(true);
  });

  it("should accept FIELD scope structurally", () => {
    const result = securityContextSchema.safeParse({
      scope: SecurityScope.FIELD,
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    });

    expect(result.success).toBe(true);
  });

  it("should reject missing scope", () => {
    const result = securityContextSchema.safeParse({
      organizationId: "org-123",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    });

    expect(result.success).toBe(false);
  });

  it("should reject missing classification", () => {
    const result = securityContextSchema.safeParse({
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-123",
      purpose: SecurityPurpose.API_KEY,
    });

    expect(result.success).toBe(false);
  });

  it("should reject missing purpose", () => {
    const result = securityContextSchema.safeParse({
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-123",
      classification: DataClassification.SENSITIVE,
    });

    expect(result.success).toBe(false);
  });

  it("should reject empty organizationId", () => {
    const result = securityContextSchema.safeParse({
      scope: SecurityScope.ORGANIZATION,
      organizationId: "",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    });

    expect(result.success).toBe(false);
  });

  it("should reject whitespace-only organizationId", () => {
    const result = securityContextSchema.safeParse({
      scope: SecurityScope.ORGANIZATION,
      organizationId: "   ",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    });

    expect(result.success).toBe(false);
  });

  it("should reject invalid scope", () => {
    const result = securityContextSchema.safeParse({
      scope: "INVALID_SCOPE",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    });

    expect(result.success).toBe(false);
  });

  it("should reject invalid classification", () => {
    const result = securityContextSchema.safeParse({
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-123",
      classification: "INVALID_CLASSIFICATION",
      purpose: SecurityPurpose.API_KEY,
    });

    expect(result.success).toBe(false);
  });

  it("should reject invalid purpose", () => {
    const result = securityContextSchema.safeParse({
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-123",
      classification: DataClassification.SENSITIVE,
      purpose: "INVALID_PURPOSE",
    });

    expect(result.success).toBe(false);
  });

  it("should trim valid IDs", () => {
    const result = securityContextSchema.safeParse({
      scope: SecurityScope.ORGANIZATION,
      organizationId: "  org-123  ",
      classification: DataClassification.SENSITIVE,
      purpose: SecurityPurpose.API_KEY,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.organizationId).toBe("org-123");
    }
  });

  it("should preserve valid classification and purpose", () => {
    const result = securityContextSchema.safeParse({
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-123",
      classification: DataClassification.SECRET,
      purpose: SecurityPurpose.API_KEY,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.classification).toBe(DataClassification.SECRET);

      expect(result.data.purpose).toBe(SecurityPurpose.API_KEY);
    }
  });
});
