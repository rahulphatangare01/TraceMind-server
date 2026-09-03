import { z } from "zod";

import {
  PROJECT_CODE_MAX_LENGTH,
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
  PROJECT_SLUG_MAX_LENGTH,
} from "../../constants/index.js";

import { ProjectStatus } from "../../enums/index.js";

/**
 * Common project field validation.
 */

const projectIdSchema = z.string().trim().min(1, "Project ID is required");

const organizationIdSchema = z
  .string()
  .trim()
  .min(1, "Organization ID is required");

const projectNameSchema = z
  .string()
  .trim()
  .min(1, "Project name is required")
  .max(
    PROJECT_NAME_MAX_LENGTH,
    `Project name must not exceed ${PROJECT_NAME_MAX_LENGTH} characters`,
  );

const projectCodeSchema = z
  .string()
  .trim()
  .min(1, "Project code is required")
  .max(
    PROJECT_CODE_MAX_LENGTH,
    `Project code must not exceed ${PROJECT_CODE_MAX_LENGTH} characters`,
  )
  .regex(
    /^[A-Z0-9_-]+$/,
    "Project code must contain only uppercase letters, numbers, underscores, or hyphens",
  );

const projectSlugSchema = z
  .string()
  .trim()
  .min(1, "Project slug is required")
  .max(
    PROJECT_SLUG_MAX_LENGTH,
    `Project slug must not exceed ${PROJECT_SLUG_MAX_LENGTH} characters`,
  )
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Project slug must contain lowercase letters, numbers, and hyphens only",
  );

const projectDescriptionSchema = z
  .string()
  .trim()
  .max(
    PROJECT_DESCRIPTION_MAX_LENGTH,
    `Project description must not exceed ${PROJECT_DESCRIPTION_MAX_LENGTH} characters`,
  );

/**
 * Controlled project settings.
 *
 * We should not allow completely uncontrolled JSON for project settings.
 */
export const projectSettingsSchema = z.object({
  telemetryEnabled: z.boolean().default(true),

  allowCustomApplications: z.boolean().default(true),

  allowCustomEnvironments: z.boolean().default(true),

  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createProjectSchema = z.object({
  name: projectNameSchema,

  displayName: z
    .string()
    .trim()
    .min(1, "Display name cannot be empty")
    .max(PROJECT_NAME_MAX_LENGTH)
    .optional(),

  code: projectCodeSchema,

  slug: projectSlugSchema,

  description: projectDescriptionSchema.optional(),

  settings: projectSettingsSchema.optional(),
});

export const createProjectInternalSchema = createProjectSchema.extend({
  organizationId: organizationIdSchema,
});

export const updateProjectSchema = z
  .object({
    name: projectNameSchema.optional(),

    displayName: z
      .string()
      .trim()
      .min(1, "Display name cannot be empty")
      .max(PROJECT_NAME_MAX_LENGTH)
      .optional(),

    description: projectDescriptionSchema.optional(),

    settings: projectSettingsSchema.optional(),
    updatedBy: z.string().uuid().nullable().optional(),
  })
  .strict();

export const updateProjectStatusSchema = z
  .object({
    status: z.nativeEnum(ProjectStatus),
  })
  .strict();

export const projectSchema = z.object({
  id: projectIdSchema,

  organizationId: organizationIdSchema,

  name: projectNameSchema,

  displayName: z.string().nullable(),

  code: projectCodeSchema,

  slug: projectSlugSchema,

  description: z.string().nullable(),

  status: z.nativeEnum(ProjectStatus),

  settings: projectSettingsSchema.nullable(),

  createdAt: z.coerce.date(),

  updatedAt: z.coerce.date(),

  deletedAt: z.coerce.date().nullable(),
  createdBy: z.string().uuid().nullable().optional(),
  updatedBy: z.string().uuid().nullable().optional(),
  deletedBy: z.string().uuid().nullable().optional(),
});
