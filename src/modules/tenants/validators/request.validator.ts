import { z } from "zod";
// import { OrganizationStatus } from "../enums/organization.enums";
import {
  OrganizationStatus,
  ApplicationStatus,
  ProjectStatus,
  EnvironmentStatus,
} from "../enums/index.js";
export const organizationIdParamSchema = z.object({
  organizationId: z.string().trim().min(1),
});

export const projectIdParamSchema = z.object({
  organizationId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
});

export const applicationIdParamSchema = z.object({
  organizationId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  applicationId: z.string().trim().min(1),
});

export const environmentIdParamSchema = z.object({
  organizationId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  applicationId: z.string().trim().min(1),
  environmentId: z.string().trim().min(1),
});
export const changeOrganizationStatusSchema = z.object({
  status: z.nativeEnum(OrganizationStatus),
});

export const organizationProjectParamSchema = z.object({
  organizationId: z.string().trim().min(1),
});
export const changeProjectStatusSchema = z.object({
  status: z.nativeEnum(ProjectStatus),
});
export const projectApplicationParamSchema = z.object({
  organizationId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
});
export const changeApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});
export const applicationEnvironmentParamSchema = z.object({
  organizationId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  applicationId: z.string().trim().min(1),
});
export const changeEnvironmentStatusSchema = z.object({
  status: z.nativeEnum(EnvironmentStatus),
});
