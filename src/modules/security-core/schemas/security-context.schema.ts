import { z } from "zod";

import {
  DataClassification,
  SecurityPurpose,
  SecurityScope,
} from "../domain/enums/index.js";

export const securityContextSchema = z.object({
  scope: z.enum(SecurityScope),

  organizationId: z.string().trim().min(1).optional(),

  projectId: z.string().trim().min(1).optional(),

  applicationId: z.string().trim().min(1).optional(),

  environmentId: z.string().trim().min(1).optional(),

  classification: z.enum(DataClassification),

  purpose: z.enum(SecurityPurpose),
});

export type SecurityContextSchemaInput = z.input<typeof securityContextSchema>;

export type SecurityContextSchemaOutput = z.output<
  typeof securityContextSchema
>;
