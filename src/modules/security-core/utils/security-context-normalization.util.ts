import type { SecurityContext } from "../domain/models/security-context.js";

export const normalizeSecurityContext = (
  context: SecurityContext,
): SecurityContext => {
  return {
    ...context,

    organizationId: context.organizationId?.trim(),

    projectId: context.projectId?.trim(),

    applicationId: context.applicationId?.trim(),

    environmentId: context.environmentId?.trim(),
  };
};
