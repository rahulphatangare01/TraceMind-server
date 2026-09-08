import type { Request, Response } from "express";

import { sendSuccess } from "../../../common/utils/api-response.js";
import type { OrganizationService } from "../services/organization.service.js";
import { ValidationError } from "../../../common/errors//index.js";

export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const organization = await this.organizationService.create(req.body);

    // sendSuccess(res, organization, 201);
    sendSuccess(res, organization, 201, {
      message: "Organization created successfully",
    });
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    const { organizationId } = req.params;
    if (typeof organizationId !== "string") {
      throw new ValidationError("Invalid organizationId parameter");
    }
    const organization =
      await this.organizationService.findById(organizationId);

    // sendSuccess(res, organization);
    sendSuccess(res, organization, 200, {
      message: "Organization fetched successfully",
    });
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    const organizations = await this.organizationService.findAll();

    // sendSuccess(res, organizations);
    sendSuccess(res, organizations, 200, {
      message: "Organization fetched successfully",
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { organizationId } = req.params;
    if (typeof organizationId !== "string") {
      throw new ValidationError("Invalid organizationId parameter");
    }
    const organization = await this.organizationService.update(
      organizationId,
      req.body,
    );

    // sendSuccess(res, organization);
    sendSuccess(res, organization, 200, {
      message: "Organization updated successfully",
    });
  };

  changeStatus = async (req: Request, res: Response): Promise<void> => {
    const { organizationId } = req.params;
    const { status } = req.body;
    if (typeof organizationId !== "string") {
      throw new ValidationError("Invalid organizationId parameter");
    }
    const organization = await this.organizationService.changeStatus(
      organizationId,
      status,
    );

    // sendSuccess(res, organization);
    sendSuccess(res, organization, 200, {
      message: "Organization status updated successfully",
    });
  };

  softDelete = async (req: Request, res: Response): Promise<void> => {
    const { organizationId } = req.params;
    if (typeof organizationId !== "string") {
      throw new ValidationError("Invalid organizationId parameter");
    }
    const organization =
      await this.organizationService.softDelete(organizationId);

    // sendSuccess(res, organization);
    sendSuccess(res, organization, 200, {
      message: "Organization Deleted successfully",
    });
  };

  restore = async (req: Request, res: Response): Promise<void> => {
    const { organizationId } = req.params;
    if (typeof organizationId !== "string") {
      throw new ValidationError("Invalid organizationId parameter");
    }
    const organization = await this.organizationService.restore(organizationId);

    // sendSuccess(res, organization);
    sendSuccess(res, organization, 200, {
      message: "Organization restore successfully",
    });
  };
}
