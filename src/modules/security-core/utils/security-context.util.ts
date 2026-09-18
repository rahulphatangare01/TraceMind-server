import type { SecurityContext } from "../domain/models/security-context";

export const canonicalizeSecurityContext = (
  context: SecurityContext,
): string => {
  return [
    context.scope,
    context.organizationId ?? "",
    context.projectId ?? "",
    context.applicationId ?? "",
    context.environmentId ?? "",
    context.classification,
    context.purpose,
  ].join("|");
};
