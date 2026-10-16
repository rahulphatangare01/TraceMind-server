export type TenantResourceOwnershipErrorCode =
  | "UNSUPPORTED_SCOPE"
  | "INVALID_CONTEXT"
  | "ORGANIZATION_NOT_FOUND"
  | "PROJECT_NOT_FOUND"
  | "APPLICATION_NOT_FOUND"
  | "ENVIRONMENT_NOT_FOUND"
  | "OWNERSHIP_MISMATCH";

export class TenantResourceOwnershipError extends Error {
  constructor(
    public readonly code: TenantResourceOwnershipErrorCode,
    message: string,
  ) {
    super(message);

    this.name = "TenantResourceOwnershipError";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
