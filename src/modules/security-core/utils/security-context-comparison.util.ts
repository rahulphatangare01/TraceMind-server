import type { SecurityContext } from "../domain/models/security-context.js";
import { canonicalizeSecurityContext } from "./security-context.util.js";
import { normalizeSecurityContext } from "./security-context-normalization.util.js";

export const areSecurityContextsEqual = (
  contextA: SecurityContext,
  contextB: SecurityContext,
): boolean => {
  const normalizedContextA = normalizeSecurityContext(contextA);
  const normalizedContextB = normalizeSecurityContext(contextB);

  const canonicalContextA = canonicalizeSecurityContext(normalizedContextA);

  const canonicalContextB = canonicalizeSecurityContext(normalizedContextB);

  return canonicalContextA === canonicalContextB;
};
