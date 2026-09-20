import { describe, expect, it } from "vitest";

import { SecurityScope } from "../../domain/enums/security-scope.enum.js";

import {
  getSecurityScopeRule,
  isSecurityScopeSupported,
} from "../../constants/security-scope.rules.js";

describe("Security Scope Rules", () => {
  it("should define PLATFORM scope correctly", () => {
    const rule = getSecurityScopeRule(SecurityScope.PLATFORM);

    expect(rule.requiresOrganizationId).toBe(false);
    expect(rule.requiresProjectId).toBe(false);
    expect(rule.requiresApplicationId).toBe(false);
    expect(rule.requiresEnvironmentId).toBe(false);

    expect(rule.allowsOrganizationId).toBe(false);
    expect(rule.allowsProjectId).toBe(false);
    expect(rule.allowsApplicationId).toBe(false);
    expect(rule.allowsEnvironmentId).toBe(false);
  });

  it("should define ORGANIZATION scope correctly", () => {
    const rule = getSecurityScopeRule(SecurityScope.ORGANIZATION);

    expect(rule.requiresOrganizationId).toBe(true);
    expect(rule.requiresProjectId).toBe(false);
    expect(rule.requiresApplicationId).toBe(false);
    expect(rule.requiresEnvironmentId).toBe(false);

    expect(rule.allowsOrganizationId).toBe(true);
    expect(rule.allowsProjectId).toBe(false);
    expect(rule.allowsApplicationId).toBe(false);
    expect(rule.allowsEnvironmentId).toBe(false);
  });

  it("should define PROJECT scope correctly", () => {
    const rule = getSecurityScopeRule(SecurityScope.PROJECT);

    expect(rule.requiresOrganizationId).toBe(true);
    expect(rule.requiresProjectId).toBe(true);
    expect(rule.requiresApplicationId).toBe(false);
    expect(rule.requiresEnvironmentId).toBe(false);

    expect(rule.allowsOrganizationId).toBe(true);
    expect(rule.allowsProjectId).toBe(true);
    expect(rule.allowsApplicationId).toBe(false);
    expect(rule.allowsEnvironmentId).toBe(false);
  });

  it("should define APPLICATION scope correctly", () => {
    const rule = getSecurityScopeRule(SecurityScope.APPLICATION);

    expect(rule.requiresOrganizationId).toBe(true);
    expect(rule.requiresProjectId).toBe(true);
    expect(rule.requiresApplicationId).toBe(true);
    expect(rule.requiresEnvironmentId).toBe(false);

    expect(rule.allowsOrganizationId).toBe(true);
    expect(rule.allowsProjectId).toBe(true);
    expect(rule.allowsApplicationId).toBe(true);
    expect(rule.allowsEnvironmentId).toBe(false);
  });

  it("should define ENVIRONMENT scope correctly", () => {
    const rule = getSecurityScopeRule(SecurityScope.ENVIRONMENT);

    expect(rule.requiresOrganizationId).toBe(true);
    expect(rule.requiresProjectId).toBe(true);
    expect(rule.requiresApplicationId).toBe(true);
    expect(rule.requiresEnvironmentId).toBe(true);

    expect(rule.allowsOrganizationId).toBe(true);
    expect(rule.allowsProjectId).toBe(true);
    expect(rule.allowsApplicationId).toBe(true);
    expect(rule.allowsEnvironmentId).toBe(true);
  });

  it("should define FIELD as a reserved scope", () => {
    const rule = getSecurityScopeRule(SecurityScope.FIELD);

    expect(rule.requiresOrganizationId).toBe(false);
    expect(rule.requiresProjectId).toBe(false);
    expect(rule.requiresApplicationId).toBe(false);
    expect(rule.requiresEnvironmentId).toBe(false);

    expect(rule.allowsOrganizationId).toBe(false);
    expect(rule.allowsProjectId).toBe(false);
    expect(rule.allowsApplicationId).toBe(false);
    expect(rule.allowsEnvironmentId).toBe(false);
  });

  it("should support all defined security scopes", () => {
    expect(isSecurityScopeSupported(SecurityScope.PLATFORM)).toBe(true);

    expect(isSecurityScopeSupported(SecurityScope.ORGANIZATION)).toBe(true);

    expect(isSecurityScopeSupported(SecurityScope.PROJECT)).toBe(true);

    expect(isSecurityScopeSupported(SecurityScope.APPLICATION)).toBe(true);

    expect(isSecurityScopeSupported(SecurityScope.ENVIRONMENT)).toBe(true);

    expect(isSecurityScopeSupported(SecurityScope.FIELD)).toBe(true);
  });
});
