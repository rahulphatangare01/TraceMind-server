import { describe, expect, it } from "vitest";

import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../../domain/enums/index.js";

import { validateSecurityContextFields } from "../../utils/security-context-fields.util.js";

const classification = DataClassification.SENSITIVE;

const purpose = SecurityPurpose.API_KEY;

describe("Security Context Field Validation", () => {
  it("should accept PLATFORM without hierarchy IDs", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.PLATFORM,
      classification,
      purpose,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject PLATFORM with organizationId", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.PLATFORM,
      organizationId: "org-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain(
      "organizationId is not allowed for PLATFORM scope",
    );
  });

  it("should accept valid ORGANIZATION scope", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject ORGANIZATION without organizationId", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.ORGANIZATION,
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain(
      "organizationId is required for ORGANIZATION scope",
    );
  });

  it("should reject ORGANIZATION with projectId", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-1",
      projectId: "project-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain(
      "projectId is not allowed for ORGANIZATION scope",
    );
  });

  it("should accept valid PROJECT scope", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.PROJECT,
      organizationId: "org-1",
      projectId: "project-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject PROJECT without organizationId", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.PROJECT,
      projectId: "project-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain(
      "organizationId is required for PROJECT scope",
    );
  });

  it("should reject PROJECT without projectId", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.PROJECT,
      organizationId: "org-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain("projectId is required for PROJECT scope");
  });

  it("should reject PROJECT with applicationId", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.PROJECT,
      organizationId: "org-1",
      projectId: "project-1",
      applicationId: "app-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain(
      "applicationId is not allowed for PROJECT scope",
    );
  });

  it("should accept valid APPLICATION scope", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.APPLICATION,
      organizationId: "org-1",
      projectId: "project-1",
      applicationId: "app-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject APPLICATION without applicationId", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.APPLICATION,
      organizationId: "org-1",
      projectId: "project-1",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain(
      "applicationId is required for APPLICATION scope",
    );
  });

  it("should reject APPLICATION with environmentId", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.APPLICATION,
      organizationId: "org-1",
      projectId: "project-1",
      applicationId: "app-1",
      environmentId: "production",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain(
      "environmentId is not allowed for APPLICATION scope",
    );
  });

  it("should accept valid ENVIRONMENT scope", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-1",
      projectId: "project-1",
      applicationId: "app-1",
      environmentId: "production",
      classification,
      purpose,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject ENVIRONMENT without organizationId", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.ENVIRONMENT,
      projectId: "project-1",
      applicationId: "app-1",
      environmentId: "production",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain(
      "organizationId is required for ENVIRONMENT scope",
    );
  });

  it("should reject ENVIRONMENT without projectId", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-1",
      applicationId: "app-1",
      environmentId: "production",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain(
      "projectId is required for ENVIRONMENT scope",
    );
  });

  it("should reject ENVIRONMENT without applicationId", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.ENVIRONMENT,
      organizationId: "org-1",
      projectId: "project-1",
      environmentId: "production",
      classification,
      purpose,
    });

    expect(result.valid).toBe(false);

    expect(result.errors).toContain(
      "applicationId is required for ENVIRONMENT scope",
    );
  });

  it("should accept FIELD as the current reserved scope", () => {
    const result = validateSecurityContextFields({
      scope: SecurityScope.FIELD,
      classification,
      purpose,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
