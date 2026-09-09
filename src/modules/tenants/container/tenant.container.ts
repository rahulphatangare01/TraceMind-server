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
import {
  OrganizationController,
  ProjectController,
  ApplicationController,
  EnvironmentController,
} from "../controllers/index.js";

const organizationRepository = new OrganizationMySQLRepository();

const projectRepository = new ProjectMySQLRepository();

const applicationRepository = new ApplicationMySQLRepository();

const environmentRepository = new EnvironmentMySQLRepository();

// export const organizationService = new OrganizationService(
//   organizationRepository,
// );
export const organizationService = new OrganizationService(
  organizationRepository,
);

export const organizationController = new OrganizationController(
  organizationService,
);
// export const projectService = new ProjectService(projectRepository);
export const projectService = new ProjectService(
  projectRepository,
  organizationRepository,
);
export const projectController = new ProjectController(projectService);

// export const applicationService = new ApplicationService(applicationRepository);
export const applicationService = new ApplicationService(
  applicationRepository,
  organizationRepository,
  projectRepository,
);
export const applicationController = new ApplicationController(
  applicationService,
);
// export const environmentService = new EnvironmentService(environmentRepository);
export const environmentService = new EnvironmentService(
  environmentRepository,
  organizationRepository,
  projectRepository,
  applicationRepository,
);

export const environmentController = new EnvironmentController(
  environmentService,
);
