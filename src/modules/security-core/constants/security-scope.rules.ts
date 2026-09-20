import { SecurityScope } from "../domain/enums/security-scope.enum.js";

export interface SecurityScopeRule {
  requiresOrganizationId: boolean;
  requiresProjectId: boolean;
  requiresApplicationId: boolean;
  requiresEnvironmentId: boolean;

  allowsOrganizationId: boolean;
  allowsProjectId: boolean;
  allowsApplicationId: boolean;
  allowsEnvironmentId: boolean;
}

export const SECURITY_SCOPE_RULES: Record<SecurityScope, SecurityScopeRule> = {
  [SecurityScope.PLATFORM]: {
    requiresOrganizationId: false,
    requiresProjectId: false,
    requiresApplicationId: false,
    requiresEnvironmentId: false,

    allowsOrganizationId: false,
    allowsProjectId: false,
    allowsApplicationId: false,
    allowsEnvironmentId: false,
  },

  [SecurityScope.ORGANIZATION]: {
    requiresOrganizationId: true,
    requiresProjectId: false,
    requiresApplicationId: false,
    requiresEnvironmentId: false,

    allowsOrganizationId: true,
    allowsProjectId: false,
    allowsApplicationId: false,
    allowsEnvironmentId: false,
  },

  [SecurityScope.PROJECT]: {
    requiresOrganizationId: true,
    requiresProjectId: true,
    requiresApplicationId: false,
    requiresEnvironmentId: false,

    allowsOrganizationId: true,
    allowsProjectId: true,
    allowsApplicationId: false,
    allowsEnvironmentId: false,
  },

  [SecurityScope.APPLICATION]: {
    requiresOrganizationId: true,
    requiresProjectId: true,
    requiresApplicationId: true,
    requiresEnvironmentId: false,

    allowsOrganizationId: true,
    allowsProjectId: true,
    allowsApplicationId: true,
    allowsEnvironmentId: false,
  },

  [SecurityScope.ENVIRONMENT]: {
    requiresOrganizationId: true,
    requiresProjectId: true,
    requiresApplicationId: true,
    requiresEnvironmentId: true,

    allowsOrganizationId: true,
    allowsProjectId: true,
    allowsApplicationId: true,
    allowsEnvironmentId: true,
  },

  [SecurityScope.FIELD]: {
    requiresOrganizationId: false,
    requiresProjectId: false,
    requiresApplicationId: false,
    requiresEnvironmentId: false,

    allowsOrganizationId: false,
    allowsProjectId: false,
    allowsApplicationId: false,
    allowsEnvironmentId: false,
  },
};

export const getSecurityScopeRule = (
  scope: SecurityScope,
): SecurityScopeRule => {
  return SECURITY_SCOPE_RULES[scope];
};

export const isSecurityScopeSupported = (scope: SecurityScope): boolean => {
  return scope in SECURITY_SCOPE_RULES;
};
