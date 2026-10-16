import type {
  SecurityProductCommonInfrastructurePort,
  SecurityProductLoggerPort,
  SecurityProductRequestContextPort,
  SecurityProductIdentifierPort,
} from "../interfaces/common-infrastructure.port.js";

export interface SecurityProductCommonInfrastructureDependencies {
  logger: SecurityProductLoggerPort;
  requestContext: SecurityProductRequestContextPort;
  identifiers: SecurityProductIdentifierPort;
}

export const createSecurityProductCommonInfrastructurePort = (
  dependencies: SecurityProductCommonInfrastructureDependencies,
): SecurityProductCommonInfrastructurePort => {
  return {
    logger: dependencies.logger,
    requestContext: dependencies.requestContext,
    identifiers: dependencies.identifiers,
  };
};
