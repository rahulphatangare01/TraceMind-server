import { z } from "zod";

import {
  createProjectInternalSchema,
  createProjectSchema,
  projectSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
} from "./project.model.js";

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export type CreateProjectInternalInput = z.infer<
  typeof createProjectInternalSchema
>;

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export type UpdateProjectStatusInput = z.infer<
  typeof updateProjectStatusSchema
>;

export type Project = z.infer<typeof projectSchema>;
