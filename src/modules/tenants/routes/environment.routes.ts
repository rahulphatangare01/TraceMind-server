import { Router } from "express";

import { validateRequest } from "../../../common/middleware/validation.middleware.js";
import { asyncHandler } from "../../../common/utils/async-handler.js";

import { environmentController } from "../container/tenant.container.js";

import {
  createEnvironmentSchema,
  updateEnvironmentSchema,
} from "../models/index.js";

import {
  applicationEnvironmentParamSchema,
  changeEnvironmentStatusSchema,
  environmentIdParamSchema,
} from "../validators/request.validator.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  validateRequest({
    params: applicationEnvironmentParamSchema,
    body: createEnvironmentSchema,
  }),
  asyncHandler(environmentController.create),
);

router.get(
  "/",
  validateRequest({
    params: applicationEnvironmentParamSchema,
  }),
  asyncHandler(environmentController.findAll),
);

router.get(
  "/:environmentId",
  validateRequest({
    params: environmentIdParamSchema,
  }),
  asyncHandler(environmentController.findById),
);

router.patch(
  "/:environmentId",
  validateRequest({
    params: environmentIdParamSchema,
    body: updateEnvironmentSchema,
  }),
  asyncHandler(environmentController.update),
);

router.patch(
  "/:environmentId/status",
  validateRequest({
    params: environmentIdParamSchema,
    body: changeEnvironmentStatusSchema,
  }),
  asyncHandler(environmentController.changeStatus),
);

router.delete(
  "/:environmentId",
  validateRequest({
    params: environmentIdParamSchema,
  }),
  asyncHandler(environmentController.softDelete),
);

router.post(
  "/:environmentId/restore",
  validateRequest({
    params: environmentIdParamSchema,
  }),
  asyncHandler(environmentController.restore),
);

export default router;
