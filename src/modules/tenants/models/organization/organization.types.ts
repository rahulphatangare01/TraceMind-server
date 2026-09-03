import { z } from "zod";

import {
  createOrganizationSchema,
  updateOrganizationSchema,
  updateOrganizationStatusSchema,
  organizationSchema,
} from "./organization.model.js";

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export type UpdateOrganizationStatusInput = z.infer<
  typeof updateOrganizationStatusSchema
>;

export type Organization = z.infer<typeof organizationSchema>;
