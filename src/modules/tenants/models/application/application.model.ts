import { z } from "zod";

import {
  APPLICATION_CODE_MAX_LENGTH,
  APPLICATION_DESCRIPTION_MAX_LENGTH,
  APPLICATION_NAME_MAX_LENGTH,
  APPLICATION_SLUG_MAX_LENGTH,
} from "../../constants/index.js";

import { ApplicationStatus, ApplicationType } from "../../enums/index.js";

/**
 * Common Application Field Validation
 */

const applicationIdSchema = z
  .string()
  .trim()
  .min(1, "Application ID is required");

const projectIdSchema = z.string().trim().min(1, "Project ID is required");
const organizationIdSchema = z
  .string()
  .trim()
  .min(1, "Organization ID is required");

const applicationNameSchema = z
  .string()
  .trim()
  .min(1, "Application name is required")
  .max(
    APPLICATION_NAME_MAX_LENGTH,
    `Application name must not exceed ${APPLICATION_NAME_MAX_LENGTH} characters`,
  );

const applicationCodeSchema = z
  .string()
  .trim()
  .min(1, "Application code is required")
  .max(
    APPLICATION_CODE_MAX_LENGTH,
    `Application code must not exceed ${APPLICATION_CODE_MAX_LENGTH} characters`,
  )
  .regex(
    /^[A-Z0-9_-]+$/,
    "Application code must contain only uppercase letters, numbers, underscores, or hyphens",
  );

const applicationSlugSchema = z
  .string()
  .trim()
  .min(1, "Application slug is required")
  .max(
    APPLICATION_SLUG_MAX_LENGTH,
    `Application slug must not exceed ${APPLICATION_SLUG_MAX_LENGTH} characters`,
  )
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Application slug must contain lowercase letters, numbers, and hyphens only",
  );

const applicationDescriptionSchema = z
  .string()
  .trim()
  .max(
    APPLICATION_DESCRIPTION_MAX_LENGTH,
    `Application description must not exceed ${APPLICATION_DESCRIPTION_MAX_LENGTH} characters`,
  );

export const applicationSettingsSchema = z.object({
  telemetryEnabled: z.boolean().default(true),

  logsEnabled: z.boolean().default(true),

  metricsEnabled: z.boolean().default(true),

  tracesEnabled: z.boolean().default(true),

  errorsEnabled: z.boolean().default(true),

  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createApplicationSchema = z
  .object({
    name: applicationNameSchema,

    displayName: z
      .string()
      .trim()
      .min(1, "Display name cannot be empty")
      .max(APPLICATION_NAME_MAX_LENGTH)
      .optional(),

    code: applicationCodeSchema,

    slug: applicationSlugSchema,

    type: z.nativeEnum(ApplicationType),

    description: applicationDescriptionSchema.optional(),

    settings: applicationSettingsSchema.optional(),
  })
  .strict();

export const createApplicationInternalSchema = createApplicationSchema.extend({
  projectId: projectIdSchema,
});

export const updateApplicationSchema = z
  .object({
    name: applicationNameSchema.optional(),

    displayName: z
      .string()
      .trim()
      .min(1, "Display name cannot be empty")
      .max(APPLICATION_NAME_MAX_LENGTH)
      .optional(),

    description: applicationDescriptionSchema.optional(),

    type: z.nativeEnum(ApplicationType).optional(),

    settings: applicationSettingsSchema.optional(),
    updatedBy: z.string().uuid().nullable().optional(),
  })
  .strict();
export const updateApplicationStatusSchema = z
  .object({
    status: z.nativeEnum(ApplicationStatus),
  })
  .strict();

export const applicationSchema = z.object({
  id: applicationIdSchema,

  projectId: projectIdSchema,
  organizationId: organizationIdSchema,

  name: applicationNameSchema,

  displayName: z.string().nullable(),

  code: applicationCodeSchema,

  slug: applicationSlugSchema,

  type: z.nativeEnum(ApplicationType),

  description: z.string().nullable(),

  status: z.nativeEnum(ApplicationStatus),

  settings: applicationSettingsSchema.nullable(),

  createdAt: z.coerce.date(),

  updatedAt: z.coerce.date(),

  deletedAt: z.coerce.date().nullable(),
  createdBy: z.string().uuid().nullable().optional(),
  updatedBy: z.string().uuid().nullable().optional(),
  deletedBy: z.string().uuid().nullable().optional(),
});
