import type { SecurityContext } from "../domain/models/security-context";

export const canonicalizeSecurityContext = (
  context: SecurityContext,
): string => {
  const values = [
    context.scope,
    context.organizationId ?? "",
    context.projectId ?? "",
    context.applicationId ?? "",
    context.environmentId ?? "",
    context.classification,
    context.purpose,
  ];

  return values.join("|");
};
