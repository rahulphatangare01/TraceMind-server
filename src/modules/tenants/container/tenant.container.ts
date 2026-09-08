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
import { OrganizationController } from "../controllers/index.js";

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

// export const applicationService = new ApplicationService(applicationRepository);
export const applicationService = new ApplicationService(
  applicationRepository,
  organizationRepository,
  projectRepository,
);

// export const environmentService = new EnvironmentService(environmentRepository);
export const environmentService = new EnvironmentService(
  environmentRepository,
  organizationRepository,
  projectRepository,
  applicationRepository,
);
