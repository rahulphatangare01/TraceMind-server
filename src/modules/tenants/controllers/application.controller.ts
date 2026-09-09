import type { Request, Response } from "express";

import { ValidationError } from "../../../common/errors/index.js";
import { sendSuccess } from "../../../common/utils/api-response.js";
import type { ApplicationService } from "../services/application.service.js";

export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId } = req.params;

    if (typeof organizationId !== "string" || typeof projectId !== "string") {
      throw new ValidationError(
        "Invalid organizationId or projectId parameter",
      );
    }

    const application = await this.applicationService.create(
      organizationId,
      projectId,
      req.body,
    );

    sendSuccess(res, application, 201, {
      message: "Application created successfully",
    });
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId } = req.params;

    if (typeof organizationId !== "string" || typeof projectId !== "string") {
      throw new ValidationError(
        "Invalid organizationId or projectId parameter",
      );
    }

    const applications = await this.applicationService.findAllByProject(
      organizationId,
      projectId,
    );

    sendSuccess(res, applications, 200, {
      message: "Applications fetched successfully",
    });
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId, applicationId } = req.params;

    if (
      typeof organizationId !== "string" ||
      typeof projectId !== "string" ||
      typeof applicationId !== "string"
    ) {
      throw new ValidationError("Invalid application parameters");
    }

    const application = await this.applicationService.findById(
      organizationId,
      projectId,
      applicationId,
    );

    sendSuccess(res, application, 200, {
      message: "Application fetched successfully",
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId, applicationId } = req.params;

    if (
      typeof organizationId !== "string" ||
      typeof projectId !== "string" ||
      typeof applicationId !== "string"
    ) {
      throw new ValidationError("Invalid application parameters");
    }

    const application = await this.applicationService.update(
      organizationId,
      projectId,
      applicationId,
      req.body,
    );

    sendSuccess(res, application, 200, {
      message: "Application updated successfully",
    });
  };

  changeStatus = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId, applicationId } = req.params;

    if (
      typeof organizationId !== "string" ||
      typeof projectId !== "string" ||
      typeof applicationId !== "string"
    ) {
      throw new ValidationError("Invalid application parameters");
    }

    const application = await this.applicationService.changeStatus(
      organizationId,
      projectId,
      applicationId,
      req.body.status,
      req.body.updatedBy,
    );

    sendSuccess(res, application, 200, {
      message: "Application status updated successfully",
    });
  };

  softDelete = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId, applicationId } = req.params;

    if (
      typeof organizationId !== "string" ||
      typeof projectId !== "string" ||
      typeof applicationId !== "string"
    ) {
      throw new ValidationError("Invalid application parameters");
    }

    const application = await this.applicationService.softDelete(
      organizationId,
      projectId,
      applicationId,
    );

    sendSuccess(res, application, 200, {
      message: "Application deleted successfully",
    });
  };

  restore = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId, applicationId } = req.params;

    if (
      typeof organizationId !== "string" ||
      typeof projectId !== "string" ||
      typeof applicationId !== "string"
    ) {
      throw new ValidationError("Invalid application parameters");
    }

    const application = await this.applicationService.restore(
      organizationId,
      projectId,
      applicationId,
    );

    sendSuccess(res, application, 200, {
      message: "Application restored successfully",
    });
  };
}
