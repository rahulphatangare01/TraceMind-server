import { Router } from "express";

import { validateRequest } from "../../../common/middleware/validation.middleware.js";
import { asyncHandler } from "../../../common/utils/async-handler.js";

import { applicationController } from "../container/tenant.container.js";

import {
  createApplicationSchema,
  updateApplicationSchema,
} from "../models/index.js";

import {
  applicationIdParamSchema,
  changeApplicationStatusSchema,
  projectApplicationParamSchema,
} from "../validators/request.validator.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  validateRequest({
    params: projectApplicationParamSchema,
    body: createApplicationSchema,
  }),
  asyncHandler(applicationController.create),
);

router.get(
  "/",
  validateRequest({
    params: projectApplicationParamSchema,
  }),
  asyncHandler(applicationController.findAll),
);

router.get(
  "/:applicationId",
  validateRequest({
    params: applicationIdParamSchema,
  }),
  asyncHandler(applicationController.findById),
);

router.patch(
  "/:applicationId",
  validateRequest({
    params: applicationIdParamSchema,
    body: updateApplicationSchema,
  }),
  asyncHandler(applicationController.update),
);

router.patch(
  "/:applicationId/status",
  validateRequest({
    params: applicationIdParamSchema,
    body: changeApplicationStatusSchema,
  }),
  asyncHandler(applicationController.changeStatus),
);

router.delete(
  "/:applicationId",
  validateRequest({
    params: applicationIdParamSchema,
  }),
  asyncHandler(applicationController.softDelete),
);

router.post(
  "/:applicationId/restore",
  validateRequest({
    params: applicationIdParamSchema,
  }),
  asyncHandler(applicationController.restore),
);

export default router;
