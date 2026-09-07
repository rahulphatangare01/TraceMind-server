import { LifecycleTransitionError } from "../../../common/errors/lifecycle-transition.error.js";
import {
  TENANT_LIFECYCLE_TRANSITIONS,
  type TenantLifecycleStatus,
} from "./tenant-lifecycle.constants.js";
import {
  OrganizationStatus,
  ProjectStatus,
  ApplicationStatus,
  EnvironmentStatus,
} from "../enums/index.js";

export const isValidTenantStatusTransition = (
  currentStatus: TenantLifecycleStatus,
  nextStatus: TenantLifecycleStatus,
): boolean => {
  if (currentStatus === nextStatus) {
    return true;
  }

  return TENANT_LIFECYCLE_TRANSITIONS[currentStatus].includes(nextStatus);
};
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

export const validateTenantStatusTransition = (
  resource: string,
  currentStatus: string | any,
  nextStatus: string | any,
): void => {
  const isValid = isValidTenantStatusTransition(currentStatus, nextStatus);

  if (!isValid) {
    throw new LifecycleTransitionError(resource, currentStatus, nextStatus);
  }
};

const ORGANIZATION_TRANSITIONS: Record<
  OrganizationStatus,
  readonly OrganizationStatus[]
> = {
  [OrganizationStatus.PENDING]: [
    OrganizationStatus.ACTIVE,
    OrganizationStatus.INACTIVE,
  ],

  [OrganizationStatus.ACTIVE]: [
    OrganizationStatus.INACTIVE,
    OrganizationStatus.SUSPENDED,
    OrganizationStatus.ARCHIVED,
  ],

  [OrganizationStatus.INACTIVE]: [
    OrganizationStatus.ACTIVE,
    OrganizationStatus.ARCHIVED,
  ],

  [OrganizationStatus.SUSPENDED]: [
    OrganizationStatus.ACTIVE,
    OrganizationStatus.INACTIVE,
    OrganizationStatus.ARCHIVED,
  ],

  [OrganizationStatus.ARCHIVED]: [],
};

const PROJECT_TRANSITIONS: Record<ProjectStatus, readonly ProjectStatus[]> = {
  [ProjectStatus.DRAFT]: [ProjectStatus.ACTIVE, ProjectStatus.ARCHIVED],

  [ProjectStatus.ACTIVE]: [
    ProjectStatus.ON_HOLD,
    ProjectStatus.INACTIVE,
    ProjectStatus.ARCHIVED,
  ],

  [ProjectStatus.ON_HOLD]: [
    ProjectStatus.ACTIVE,
    ProjectStatus.INACTIVE,
    ProjectStatus.ARCHIVED,
  ],

  [ProjectStatus.INACTIVE]: [ProjectStatus.ACTIVE, ProjectStatus.ARCHIVED],

  [ProjectStatus.ARCHIVED]: [],
};

const ENVIRONMENT_TRANSITIONS: Record<
  EnvironmentStatus,
  readonly EnvironmentStatus[]
> = {
  [EnvironmentStatus.DRAFT]: [
    EnvironmentStatus.ACTIVE,
    EnvironmentStatus.ARCHIVED,
  ],

  [EnvironmentStatus.ACTIVE]: [
    EnvironmentStatus.MAINTENANCE,
    EnvironmentStatus.INACTIVE,
    EnvironmentStatus.ARCHIVED,
  ],

  [EnvironmentStatus.MAINTENANCE]: [
    EnvironmentStatus.ACTIVE,
    EnvironmentStatus.INACTIVE,
    EnvironmentStatus.ARCHIVED,
  ],

  [EnvironmentStatus.INACTIVE]: [
    EnvironmentStatus.ACTIVE,
    EnvironmentStatus.ARCHIVED,
  ],

  [EnvironmentStatus.ARCHIVED]: [],
};
const APPLICATION_TRANSITIONS: Record<
  ApplicationStatus,
  readonly ApplicationStatus[]
> = {
  [ApplicationStatus.DRAFT]: [
    ApplicationStatus.ACTIVE,
    ApplicationStatus.ARCHIVED,
  ],

  [ApplicationStatus.ACTIVE]: [
    ApplicationStatus.MAINTENANCE,
    ApplicationStatus.INACTIVE,
    ApplicationStatus.ARCHIVED,
  ],

  [ApplicationStatus.MAINTENANCE]: [
    ApplicationStatus.ACTIVE,
    ApplicationStatus.INACTIVE,
    ApplicationStatus.ARCHIVED,
  ],

  [ApplicationStatus.INACTIVE]: [
    ApplicationStatus.ACTIVE,
    ApplicationStatus.ARCHIVED,
  ],

  [ApplicationStatus.ARCHIVED]: [],
};

export const validateOrganizationStatusTransition = (
  currentStatus: OrganizationStatus,
  nextStatus: OrganizationStatus,
): void => {
  if (currentStatus === nextStatus) {
    return;
  }

  const allowedTransitions = ORGANIZATION_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(nextStatus)) {
    throw new LifecycleTransitionError(
      "Organization",
      currentStatus,
      nextStatus,
    );
  }
};

export const validateProjectStatusTransition = (
  currentStatus: ProjectStatus,
  nextStatus: ProjectStatus,
): void => {
  if (currentStatus === nextStatus) {
    return;
  }

  const allowedTransitions = PROJECT_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(nextStatus)) {
    throw new LifecycleTransitionError("Project", currentStatus, nextStatus);
  }
};

export const validateApplicationStatusTransition = (
  currentStatus: ApplicationStatus,
  nextStatus: ApplicationStatus,
): void => {
  if (currentStatus === nextStatus) {
    return;
  }

  const allowedTransitions = APPLICATION_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(nextStatus)) {
    throw new LifecycleTransitionError(
      "Application",
      currentStatus,
      nextStatus,
    );
  }
};
export const validateEnvironmentStatusTransition = (
  currentStatus: EnvironmentStatus,
  nextStatus: EnvironmentStatus,
): void => {
  if (currentStatus === nextStatus) {
    return;
  }

  const allowedTransitions = ENVIRONMENT_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(nextStatus)) {
    throw new LifecycleTransitionError(
      "Environment",
      currentStatus,
      nextStatus,
    );
  }
};
