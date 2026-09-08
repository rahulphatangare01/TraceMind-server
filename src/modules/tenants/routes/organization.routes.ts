import { Router } from "express";

import { asyncHandler } from "../../../common/utils/async-handler.js";
import { validateRequest } from "../../../common/middleware/validation.middleware.js";

import { organizationController } from "../container/tenant.container.js";

import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../models/index.js";

import { changeOrganizationStatusSchema } from "../validators/request.validator.js";

import { organizationIdParamSchema } from "../validators/request.validator.js";

const router = Router();

// 1. Create Organization
router.post(
  "/",
  validateRequest({
    body: createOrganizationSchema,
  }),
  asyncHandler(organizationController.create),
);

// 2. Get All Organizations
router.get("/", asyncHandler(organizationController.findAll));

// 3. Get Organization

router.get(
  "/:organizationId",
  validateRequest({
    params: organizationIdParamSchema,
  }),
  asyncHandler(organizationController.findById),
);

//4. Update Organization
router.patch(
  "/:organizationId",
  validateRequest({
    params: organizationIdParamSchema,
    body: updateOrganizationSchema,
  }),
  asyncHandler(organizationController.update),
);

// 5. Change Status
router.patch(
  "/:organizationId/status",
  validateRequest({
    params: organizationIdParamSchema,
    body: changeOrganizationStatusSchema,
  }),
  asyncHandler(organizationController.changeStatus),
);

// 6. Soft Delete

router.delete(
  "/:organizationId",
  validateRequest({
    params: organizationIdParamSchema,
  }),
  asyncHandler(organizationController.softDelete),
);

// 7. Restore

router.post(
  "/:organizationId/restore",
  validateRequest({
    params: organizationIdParamSchema,
  }),
  asyncHandler(organizationController.restore),
);
export default router;
