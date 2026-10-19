import {
  SecurityScope,
  type SecurityKey,
} from "../../../security-core/public-api.js";

function requireId(value: string | undefined, field: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Security key persistence requires a valid ${field}.`);
  }
}

function requireAbsent(value: string | undefined, field: string): void {
  if (value !== undefined) {
    throw new Error(`${field} is not allowed for this security key scope.`);
  }
}

/**
 * Validates that a Security Core key has a complete, consistent
 * tenant hierarchy before it is mapped for Security Product persistence.
 *
 * This validates the declared scope and identifiers. It does not prove
 * that the referenced tenant resources exist in the database.
 */
export function assertValidSecurityKeyForPersistence(key: SecurityKey): void {
  requireId(key.id, "id");
  requireId(key.organizationId, "organizationId");

  switch (key.scope) {
    case SecurityScope.ORGANIZATION:
      requireAbsent(key.projectId, "projectId");
      requireAbsent(key.applicationId, "applicationId");
      requireAbsent(key.environmentId, "environmentId");
      break;

    case SecurityScope.PROJECT:
      requireId(key.projectId, "projectId");
      requireAbsent(key.applicationId, "applicationId");
      requireAbsent(key.environmentId, "environmentId");
      break;

    case SecurityScope.APPLICATION:
      requireId(key.projectId, "projectId");
      requireId(key.applicationId, "applicationId");
      requireAbsent(key.environmentId, "environmentId");
      break;

    case SecurityScope.ENVIRONMENT:
      requireId(key.projectId, "projectId");
      requireId(key.applicationId, "applicationId");
      requireId(key.environmentId, "environmentId");
      break;

    case SecurityScope.PLATFORM:
    case SecurityScope.FIELD:
      throw new Error(
        `Security scope "${key.scope}" is not supported by Security Product persistence.`,
      );

    default:
      throw new Error(`Unsupported security key scope: ${String(key.scope)}.`);
  }
}
