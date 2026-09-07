import { AppError } from "./app.error.js";

export class TenantHierarchyError extends AppError {
  constructor(message = "Invalid tenant hierarchy", details?: unknown) {
    super(message, {
      code: "TENANT_HIERARCHY_VIOLATION",
      statusCode: 422,
      details,
    });

    this.name = "TenantHierarchyError";
  }
}

// throw new TenantHierarchyError(
//   "Project does not belong to the specified organization",
// );
