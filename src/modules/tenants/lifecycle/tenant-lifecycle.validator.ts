// import {
//   TENANT_LIFECYCLE_TRANSITIONS,
//   type TenantLifecycleStatus,
// } from "./tenant-lifecycle.constants.js";

// export const isValidTenantStatusTransition = (
//   currentStatus: TenantLifecycleStatus,
//   nextStatus: TenantLifecycleStatus,
// ): boolean => {
//   if (currentStatus === nextStatus) {
//     return true;
//   }

//   return TENANT_LIFECYCLE_TRANSITIONS[currentStatus].includes(nextStatus);
// };

// export const validateTenantStatusTransition = (
//   currentStatus: TenantLifecycleStatus,
//   nextStatus: TenantLifecycleStatus,
// ): void => {
//   const isValid = isValidTenantStatusTransition(currentStatus, nextStatus);

//   if (!isValid) {
//     throw new Error(
//       `Invalid tenant lifecycle transition: ${currentStatus} → ${nextStatus}`,
//     );
//   }
// };
import {
  TENANT_LIFECYCLE_TRANSITIONS,
  type TenantLifecycleStatus,
} from "./tenant-lifecycle.constants.js";

// export const isValidTenantStatusTransition = (
//   currentStatus: TenantLifecycleStatus,
//   nextStatus: TenantLifecycleStatus,
// ): boolean => {
//   if (currentStatus === nextStatus) {
//     return true;
//   }

//   return TENANT_LIFECYCLE_TRANSITIONS[currentStatus].includes(nextStatus);
// };
export const isValidTenantStatusTransition = (
  currentStatus: TenantLifecycleStatus,
  nextStatus: TenantLifecycleStatus,
): boolean => {
  if (currentStatus === nextStatus) {
    return true;
  }

  return TENANT_LIFECYCLE_TRANSITIONS[currentStatus].includes(nextStatus);
};
export const validateTenantStatusTransition = (
  currentStatus: TenantLifecycleStatus,
  nextStatus: TenantLifecycleStatus,
): void => {
  const isValid = isValidTenantStatusTransition(currentStatus, nextStatus);

  if (!isValid) {
    throw new Error(
      `Invalid tenant lifecycle transition: ${currentStatus} → ${nextStatus}`,
    );
  }
};
