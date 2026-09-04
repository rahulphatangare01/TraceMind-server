// import type {
//   OrganizationStatus,
//   ProjectStatus,
//   ApplicationStatus,
//   EnvironmentStatus,
// } from "../enums/index.js";

// // type TenantLifecycleStatus =
// //   | OrganizationStatus
// //   | ProjectStatus
// //   | ApplicationStatus
// //   | EnvironmentStatus;

// // export const TENANT_LIFECYCLE_TRANSITIONS: Record<
// //   TenantLifecycleStatus,
// //   readonly TenantLifecycleStatus[]
// // > = {
// //   ACTIVE: ["INACTIVE", "SUSPENDED", "ARCHIVED", "DELETED"],

// //   INACTIVE: ["ACTIVE", "SUSPENDED", "ARCHIVED", "DELETED"],

// //   SUSPENDED: ["ACTIVE", "ARCHIVED", "DELETED"],

// //   ARCHIVED: ["ACTIVE", "DELETED"],

// //   DELETED: [],
// // } as const;
// export type TenantLifecycleStatus =
//   | "ACTIVE"
//   | "INACTIVE"
//   | "SUSPENDED"
//   | "ARCHIVED";

// export const TENANT_LIFECYCLE_TRANSITIONS: Record<
//   TenantLifecycleStatus,
//   readonly TenantLifecycleStatus[]
// > = {
//   ACTIVE: ["INACTIVE", "SUSPENDED", "ARCHIVED"],

//   INACTIVE: ["ACTIVE", "SUSPENDED", "ARCHIVED"],

//   SUSPENDED: ["ACTIVE", "INACTIVE", "ARCHIVED"],

//   ARCHIVED: ["ACTIVE"],
// };

// import type {
//   OrganizationStatus,
//   ProjectStatus,
//   ApplicationStatus,
//   EnvironmentStatus,
// } from "../enums/index.js";

// export type TenantLifecycleStatus =
//   | OrganizationStatus
//   | ProjectStatus
//   | ApplicationStatus
//   | EnvironmentStatus;

// export const TENANT_LIFECYCLE_TRANSITIONS: Record<
//   TenantLifecycleStatus,
//   readonly TenantLifecycleStatus[]
// > = {
//   ACTIVE: ["INACTIVE", "SUSPENDED", "ARCHIVED"],

//   INACTIVE: ["ACTIVE", "SUSPENDED", "ARCHIVED"],

//   SUSPENDED: ["ACTIVE", "INACTIVE", "ARCHIVED"],

//   ARCHIVED: ["ACTIVE"],
// };
export enum TenantLifecycleStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  ARCHIVED = "ARCHIVED",
}

export const TENANT_LIFECYCLE_TRANSITIONS: Record<
  TenantLifecycleStatus,
  readonly TenantLifecycleStatus[]
> = {
  [TenantLifecycleStatus.PENDING]: [
    TenantLifecycleStatus.ACTIVE,
    TenantLifecycleStatus.INACTIVE,
    TenantLifecycleStatus.SUSPENDED,
    TenantLifecycleStatus.ARCHIVED,
  ],
  [TenantLifecycleStatus.ACTIVE]: [
    TenantLifecycleStatus.INACTIVE,
    TenantLifecycleStatus.SUSPENDED,
    TenantLifecycleStatus.ARCHIVED,
  ],

  [TenantLifecycleStatus.INACTIVE]: [
    TenantLifecycleStatus.ACTIVE,
    TenantLifecycleStatus.SUSPENDED,
    TenantLifecycleStatus.ARCHIVED,
  ],

  [TenantLifecycleStatus.SUSPENDED]: [
    TenantLifecycleStatus.ACTIVE,
    TenantLifecycleStatus.INACTIVE,
    TenantLifecycleStatus.ARCHIVED,
  ],

  [TenantLifecycleStatus.ARCHIVED]: [TenantLifecycleStatus.ACTIVE],
};
export type OrganizationStatus = TenantLifecycleStatus;
export type ProjectStatus = TenantLifecycleStatus;
export type ApplicationStatus = TenantLifecycleStatus;
export type EnvironmentStatus = TenantLifecycleStatus;
