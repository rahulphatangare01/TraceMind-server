import { z } from "zod";

import {
  createEnvironmentInternalSchema,
  createEnvironmentSchema,
  environmentSchema,
  updateEnvironmentSchema,
  updateEnvironmentStatusSchema,
} from "./environment.model.js";

export type CreateEnvironmentInput = z.infer<typeof createEnvironmentSchema>;

export type CreateEnvironmentInternalInput = z.infer<
  typeof createEnvironmentInternalSchema
>;

export type UpdateEnvironmentInput = z.infer<typeof updateEnvironmentSchema>;

export type UpdateEnvironmentStatusInput = z.infer<
  typeof updateEnvironmentStatusSchema
>;

export type Environment = z.infer<typeof environmentSchema>;
