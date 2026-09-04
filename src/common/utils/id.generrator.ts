import { randomUUID } from "node:crypto";

/**
 * Generate a unique application identifier.
 */
export const generateId = (): string => {
  return randomUUID();
};
export const generateRequestId = (): string => {
  return `req_${randomUUID()}`;
};

export const generateTraceId = (): string => {
  return `trc_${randomUUID()}`;
};

export const generateSpanId = (): string => {
  return `spn_${randomUUID()}`;
};
