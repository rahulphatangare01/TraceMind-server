import { Router } from "express";

import {
  applicationRoutes,
  environmentRoutes,
  organizationRoutes,
  projectRoutes,
} from "./index.js";

const router = Router();

router.use("/organizations", organizationRoutes);
router.use("/organizations/:organizationId/projects", projectRoutes);
router.use(
  "/organizations/:organizationId/projects/:projectId/applications",
  applicationRoutes,
);
router.use(
  "/organizations/:organizationId/projects/:projectId/applications/:applicationId/environments",
  environmentRoutes,
);
export default router;

// /api/v1/organizations/{organizationId}/projects
