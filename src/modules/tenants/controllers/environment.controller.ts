import type { Request, Response } from "express";

import { ValidationError } from "../../../common/errors/index.js";
import { sendSuccess } from "../../../common/utils/api-response.js";
import type { EnvironmentService } from "../services/environment.service.js";

export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId, applicationId } = req.params;

    if (
      typeof organizationId !== "string" ||
      typeof projectId !== "string" ||
      typeof applicationId !== "string"
    ) {
      throw new ValidationError(
        "Invalid organizationId, projectId or applicationId parameter",
      );
    }

    const environment = await this.environmentService.create(
      organizationId,
      projectId,
      applicationId,
      req.body,
    );

    sendSuccess(res, environment, 201, {
      message: "Environment created successfully",
    });
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId, applicationId } = req.params;

    if (
      typeof organizationId !== "string" ||
      typeof projectId !== "string" ||
      typeof applicationId !== "string"
    ) {
      throw new ValidationError(
        "Invalid organizationId, projectId or applicationId parameter",
      );
    }

    const environments = await this.environmentService.findAllByApplication(
      organizationId,
      projectId,
      applicationId,
    );

    sendSuccess(res, environments, 200, {
      message: "Environments fetched successfully",
    });
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId, applicationId, environmentId } =
      req.params;

    if (
      typeof organizationId !== "string" ||
      typeof projectId !== "string" ||
      typeof applicationId !== "string" ||
      typeof environmentId !== "string"
    ) {
      throw new ValidationError("Invalid environment parameters");
    }

    const environment = await this.environmentService.findById(
      organizationId,
      projectId,
      applicationId,
      environmentId,
    );

    sendSuccess(res, environment, 200, {
      message: "Environment fetched successfully",
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId, applicationId, environmentId } =
      req.params;

    if (
      typeof organizationId !== "string" ||
      typeof projectId !== "string" ||
      typeof applicationId !== "string" ||
      typeof environmentId !== "string"
    ) {
      throw new ValidationError("Invalid environment parameters");
    }

    const environment = await this.environmentService.update(
      organizationId,
      projectId,
      applicationId,
      environmentId,
      req.body,
    );

    sendSuccess(res, environment, 200, {
      message: "Environment updated successfully",
    });
  };

  changeStatus = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId, applicationId, environmentId } =
      req.params;

    if (
      typeof organizationId !== "string" ||
      typeof projectId !== "string" ||
      typeof applicationId !== "string" ||
      typeof environmentId !== "string"
    ) {
      throw new ValidationError("Invalid environment parameters");
    }

    const environment = await this.environmentService.changeStatus(
      organizationId,
      projectId,
      applicationId,
      environmentId,
      req.body.status,
      req.body.updatedBy,
    );

    sendSuccess(res, environment, 200, {
      message: "Environment status updated successfully",
    });
  };

  softDelete = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId, applicationId, environmentId } =
      req.params;

    if (
      typeof organizationId !== "string" ||
      typeof projectId !== "string" ||
      typeof applicationId !== "string" ||
      typeof environmentId !== "string"
    ) {
      throw new ValidationError("Invalid environment parameters");
    }

    const environment = await this.environmentService.softDelete(
      organizationId,
      projectId,
      applicationId,
      environmentId,
    );

    sendSuccess(res, environment, 200, {
      message: "Environment deleted successfully",
    });
  };

  restore = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId, applicationId, environmentId } =
      req.params;

    if (
      typeof organizationId !== "string" ||
      typeof projectId !== "string" ||
      typeof applicationId !== "string" ||
      typeof environmentId !== "string"
    ) {
      throw new ValidationError("Invalid environment parameters");
    }

    const environment = await this.environmentService.restore(
      organizationId,
      projectId,
      applicationId,
      environmentId,
    );

    sendSuccess(res, environment, 200, {
      message: "Environment restored successfully",
    });
  };
}
