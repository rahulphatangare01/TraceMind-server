import {
  OrganizationMySQLRepository,
  ProjectMySQLRepository,
  ApplicationMySQLRepository,
  EnvironmentMySQLRepository,
} from "../repositories/mysql/index.js";

import {
  OrganizationService,
  ProjectService,
  ApplicationService,
  EnvironmentService,
} from "../services/index.js";

const organizationRepository = new OrganizationMySQLRepository();

const projectRepository = new ProjectMySQLRepository();

const applicationRepository = new ApplicationMySQLRepository();

const environmentRepository = new EnvironmentMySQLRepository();

export const organizationService = new OrganizationService(
  organizationRepository,
);

export const projectService = new ProjectService(projectRepository);

export const applicationService = new ApplicationService(applicationRepository);

export const environmentService = new EnvironmentService(environmentRepository);
