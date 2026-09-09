import type { Request, Response } from "express";

import { ValidationError } from "../../../common/errors/index.js";
import { sendSuccess } from "../../../common/utils/api-response.js";

import type { ProjectService } from "../services/project.service.js";

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { organizationId } = req.params;

    if (typeof organizationId !== "string") {
      throw new ValidationError("Invalid organizationId parameter");
    }

    const project = await this.projectService.create(organizationId, req.body);

    sendSuccess(res, project, 201, {
      message: "Project created successfully",
    });
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    const { organizationId } = req.params;

    if (typeof organizationId !== "string") {
      throw new ValidationError("Invalid organizationId parameter");
    }

    const projects =
      await this.projectService.findAllByOrganization(organizationId);

    sendSuccess(res, projects, 200, {
      message: "Projects fetched successfully",
    });
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId } = req.params;

    if (typeof organizationId !== "string" || typeof projectId !== "string") {
      throw new ValidationError("Invalid project parameters");
    }

    const project = await this.projectService.findById(
      organizationId,
      projectId,
    );

    sendSuccess(res, project, 200, {
      message: "Project fetched successfully",
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId } = req.params;

    if (typeof organizationId !== "string" || typeof projectId !== "string") {
      throw new ValidationError("Invalid project parameters");
    }

    const project = await this.projectService.update(
      organizationId,
      projectId,
      req.body,
    );

    sendSuccess(res, project, 200, {
      message: "Project updated successfully",
    });
  };

  changeStatus = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId } = req.params;

    if (typeof organizationId !== "string" || typeof projectId !== "string") {
      throw new ValidationError("Invalid project parameters");
    }

    const project = await this.projectService.changeStatus(
      organizationId,
      projectId,
      req.body.status,
      req.body.updatedBy,
    );

    sendSuccess(res, project, 200, {
      message: "Project status updated successfully",
    });
  };

  softDelete = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId } = req.params;

    if (typeof organizationId !== "string" || typeof projectId !== "string") {
      throw new ValidationError("Invalid project parameters");
    }

    const project = await this.projectService.softDelete(
      organizationId,
      projectId,
    );

    sendSuccess(res, project, 200, {
      message: "Project deleted successfully",
    });
  };

  restore = async (req: Request, res: Response): Promise<void> => {
    const { organizationId, projectId } = req.params;

    if (typeof organizationId !== "string" || typeof projectId !== "string") {
      throw new ValidationError("Invalid project parameters");
    }

    const project = await this.projectService.restore(
      organizationId,
      projectId,
    );

    sendSuccess(res, project, 200, {
      message: "Project restored successfully",
    });
  };
}
