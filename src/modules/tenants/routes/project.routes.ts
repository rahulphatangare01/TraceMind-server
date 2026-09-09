import { Router } from "express";

import { validateRequest } from "../../../common/middleware/validation.middleware.js";
import { asyncHandler } from "../../../common/utils/async-handler.js";

import { projectController } from "../container/tenant.container.js";

import { createProjectSchema, updateProjectSchema } from "../models/index.js";

import {
  changeProjectStatusSchema,
  organizationIdParamSchema,
  projectIdParamSchema,
} from "../validators/request.validator.js";

// const router = Router();
const router = Router({ mergeParams: true });

router.post(
  "/",
  validateRequest({
    params: organizationIdParamSchema,
    body: createProjectSchema,
  }),
  asyncHandler(projectController.create),
);

router.get(
  "/",
  validateRequest({
    params: organizationIdParamSchema,
  }),
  asyncHandler(projectController.findAll),
);

router.get(
  "/:projectId",
  validateRequest({
    params: projectIdParamSchema,
  }),
  asyncHandler(projectController.findById),
);

router.patch(
  "/:projectId",
  validateRequest({
    params: projectIdParamSchema,
    body: updateProjectSchema,
  }),
  asyncHandler(projectController.update),
);

router.patch(
  "/:projectId/status",
  validateRequest({
    params: projectIdParamSchema,
    body: changeProjectStatusSchema,
  }),
  asyncHandler(projectController.changeStatus),
);

router.delete(
  "/:projectId",
  validateRequest({
    params: projectIdParamSchema,
  }),
  asyncHandler(projectController.softDelete),
);

router.post(
  "/:projectId/restore",
  validateRequest({
    params: projectIdParamSchema,
  }),
  asyncHandler(projectController.restore),
);

export default router;
