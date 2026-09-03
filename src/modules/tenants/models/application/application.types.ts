import { z } from "zod";

import {
  applicationSchema,
  createApplicationInternalSchema,
  createApplicationSchema,
  updateApplicationSchema,
  updateApplicationStatusSchema,
} from "./application.model.js";

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export type CreateApplicationInternalInput = z.infer<
  typeof createApplicationInternalSchema
>;

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export type UpdateApplicationStatusInput = z.infer<
  typeof updateApplicationStatusSchema
>;

export type Application = z.infer<typeof applicationSchema>;
