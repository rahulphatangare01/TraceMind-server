import { z } from "zod";

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
