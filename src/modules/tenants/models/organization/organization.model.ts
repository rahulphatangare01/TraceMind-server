import { z } from "zod";

import {
  ORGANIZATION_CODE_MAX_LENGTH,
  ORGANIZATION_NAME_MAX_LENGTH,
  ORGANIZATION_SLUG_MAX_LENGTH,
} from "../../constants/index.js";

import { OrganizationStatus, OrganizationType } from "../../enums/index.js";

/**
 * Common organization field validation.
 */
const organizationNameSchema = z
  .string()
  .trim()
  .min(1, "Organization name is required")
  .max(
    ORGANIZATION_NAME_MAX_LENGTH,
    `Organization name must not exceed ${ORGANIZATION_NAME_MAX_LENGTH} characters`,
  );

const organizationCodeSchema = z
  .string()
  .trim()
  .min(1, "Organization code is required")
  .max(
    ORGANIZATION_CODE_MAX_LENGTH,
    `Organization code must not exceed ${ORGANIZATION_CODE_MAX_LENGTH} characters`,
  )
  .regex(
    /^[A-Z0-9_-]+$/,
    "Organization code must contain only uppercase letters, numbers, underscores, or hyphens",
  );
export const organizationSettingsSchema = z.object({
  defaultTimezone: z.string().trim().optional(),

  allowCustomEnvironments: z.boolean().default(true),

  metadata: z.record(z.string(), z.unknown()).optional(),
});
const organizationSlugSchema = z
  .string()
  .trim()
  .min(1, "Organization slug is required")
  .max(
    ORGANIZATION_SLUG_MAX_LENGTH,
    `Organization slug must not exceed ${ORGANIZATION_SLUG_MAX_LENGTH} characters`,
  )
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Organization slug must contain lowercase letters, numbers, and hyphens only",
  );

const timezoneSchema = z
  .string()
  .trim()
  .min(1, "Timezone is required")
  .max(100);

const countryCodeSchema = z
  .string()
  .trim()
  .length(2, "Country code must be a 2-character ISO code")
  .toUpperCase();

export const createOrganizationSchema = z.object({
  name: organizationNameSchema,

  displayName: z.string().trim().max(ORGANIZATION_NAME_MAX_LENGTH).optional(),

  code: organizationCodeSchema,

  slug: organizationSlugSchema,

  type: z.nativeEnum(OrganizationType).default(OrganizationType.CUSTOMER),

  timezone: timezoneSchema.default("UTC"),

  countryCode: countryCodeSchema.optional(),

  // settings: z.record(z.string(), z.unknown()).optional(),
  settings: organizationSettingsSchema.optional(),
});

export const updateOrganizationSchema = z
  .object({
    name: organizationNameSchema.optional(),

    displayName: z.string().trim().max(ORGANIZATION_NAME_MAX_LENGTH).optional(),

    timezone: timezoneSchema.optional(),

    countryCode: countryCodeSchema.optional(),

    settings: organizationSettingsSchema.nullable().optional(),

    updatedBy: z.string().uuid().nullable().optional(),
  })
  .strict();

export const updateOrganizationStatusSchema = z.object({
  status: z.nativeEnum(OrganizationStatus),
});

// settings: organizationSettingsSchema.optional()

export const organizationSchema = z.object({
  id: z.string().min(1),

  code: organizationCodeSchema,

  name: organizationNameSchema,

  displayName: z.string().nullable(),

  slug: organizationSlugSchema,

  type: z.nativeEnum(OrganizationType),

  status: z.nativeEnum(OrganizationStatus),

  timezone: timezoneSchema,

  countryCode: countryCodeSchema.nullable(),

  settings: organizationSettingsSchema.nullable(),

  createdAt: z.coerce.date(),

  updatedAt: z.coerce.date(),

  deletedAt: z.coerce.date().nullable(),
  createdBy: z.string().uuid().nullable().optional(),
  updatedBy: z.string().uuid().nullable().optional(),
  deletedBy: z.string().uuid().nullable().optional(),
});
