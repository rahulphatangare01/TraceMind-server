import { z } from "zod";

import {
  ENVIRONMENT_DESCRIPTION_MAX_LENGTH,
  ENVIRONMENT_NAME_MAX_LENGTH,
  ENVIRONMENT_SLUG_MAX_LENGTH,
} from "../../constants/index.js";

import { EnvironmentStatus, EnvironmentType } from "../../enums/index.js";

const environmentIdSchema = z
  .string()
  .trim()
  .min(1, "Environment ID is required");
const organizationIdSchema = z
  .string()
  .trim()
  .min(1, "Organization ID is required");
const projectIdSchema = z.string().trim().min(1, "Project ID is required");

const applicationIdSchema = z
  .string()
  .trim()
  .min(1, "Application ID is required");

const environmentNameSchema = z
  .string()
  .trim()
  .min(1, "Environment name is required")
  .max(
    ENVIRONMENT_NAME_MAX_LENGTH,
    `Environment name must not exceed ${ENVIRONMENT_NAME_MAX_LENGTH} characters`,
  );

const environmentSlugSchema = z
  .string()
  .trim()
  .min(1, "Environment slug is required")
  .max(
    ENVIRONMENT_SLUG_MAX_LENGTH,
    `Environment slug must not exceed ${ENVIRONMENT_SLUG_MAX_LENGTH} characters`,
  )
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Environment slug must contain lowercase letters, numbers, and hyphens only",
  );

const environmentDescriptionSchema = z
  .string()
  .trim()
  .max(
    ENVIRONMENT_DESCRIPTION_MAX_LENGTH,
    `Environment description must not exceed ${ENVIRONMENT_DESCRIPTION_MAX_LENGTH} characters`,
  );

const customEnvironmentTypeSchema = z
  .string()
  .trim()
  .min(1, "Custom environment type cannot be empty")
  .max(100, "Custom environment type must not exceed 100 characters");

export const environmentSettingsSchema = z.object({
  telemetryEnabled: z.boolean().default(true),

  logsEnabled: z.boolean().default(true),

  metricsEnabled: z.boolean().default(true),

  tracesEnabled: z.boolean().default(true),

  errorsEnabled: z.boolean().default(true),

  alertingEnabled: z.boolean().default(true),

  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createEnvironmentSchema = z
  .object({
    name: environmentNameSchema,

    displayName: z
      .string()
      .trim()
      .min(1, "Display name cannot be empty")
      .max(ENVIRONMENT_NAME_MAX_LENGTH)
      .optional(),

    slug: environmentSlugSchema,

    type: z.nativeEnum(EnvironmentType),

    customType: customEnvironmentTypeSchema.optional(),

    description: environmentDescriptionSchema.optional(),

    settings: environmentSettingsSchema.optional(),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.type === EnvironmentType.CUSTOM && !data.customType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customType"],
        message: "Custom environment type is required when type is CUSTOM",
      });
    }

    if (data.type !== EnvironmentType.CUSTOM && data.customType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customType"],
        message: "Custom environment type is only allowed when type is CUSTOM",
      });
    }
  });

export const createEnvironmentInternalSchema = createEnvironmentSchema.extend({
  applicationId: applicationIdSchema,
});

export const updateEnvironmentSchema = z
  .object({
    name: environmentNameSchema.optional(),

    displayName: z
      .string()
      .trim()
      .min(1, "Display name cannot be empty")
      .max(ENVIRONMENT_NAME_MAX_LENGTH)
      .optional(),

    description: environmentDescriptionSchema.optional(),

    type: z.nativeEnum(EnvironmentType).optional(),

    customType: customEnvironmentTypeSchema.optional(),

    settings: environmentSettingsSchema.optional(),
    updatedBy: z.string().uuid().nullable().optional(),
  })
  .strict();

export const updateEnvironmentStatusSchema = z
  .object({
    status: z.nativeEnum(EnvironmentStatus),
  })
  .strict();

export const environmentSchema = z
  .object({
    id: environmentIdSchema,
    projectId: projectIdSchema,
    organizationId: organizationIdSchema,
    applicationId: applicationIdSchema,

    name: environmentNameSchema,

    displayName: z.string().nullable(),

    slug: environmentSlugSchema,

    type: z.nativeEnum(EnvironmentType),

    customType: z.string().nullable(),

    description: z.string().nullable(),

    status: z.nativeEnum(EnvironmentStatus),

    settings: environmentSettingsSchema.nullable(),

    createdAt: z.coerce.date(),

    updatedAt: z.coerce.date(),

    deletedAt: z.coerce.date().nullable(),
    createdBy: z.string().uuid().nullable().optional(),
    updatedBy: z.string().uuid().nullable().optional(),
    deletedBy: z.string().uuid().nullable().optional(),
  })
  .superRefine((data, context) => {
    if (data.type === EnvironmentType.CUSTOM && !data.customType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customType"],
        message: "Custom environment must contain a custom type",
      });
    }

    if (data.type !== EnvironmentType.CUSTOM && data.customType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customType"],
        message: "Custom type is only allowed for CUSTOM environments",
      });
    }
  });
