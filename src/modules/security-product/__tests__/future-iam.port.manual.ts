import { SecurityScope } from "../../security-core/public-api.js";

import type {
  FutureIamAuthorizationPort,
  SecurityProductAuthorizationRequest,
} from "../application/interfaces/future-iam.port.js";

const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) {
    throw new Error(message);
  }
};

const main = async (): Promise<void> => {
  const request: SecurityProductAuthorizationRequest = {
    actor: {
      actorId: "service-001",
      actorType: "SERVICE",
    },
    action: "security.secret.read",
    resourceType: "security-secret",
    resourceId: "secret-001",
    scope: {
      scope: SecurityScope.PROJECT,
      organizationId: "org-001",
      projectId: "project-001",
    },
  };

  let receivedRequest: SecurityProductAuthorizationRequest | undefined;
  function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
      throw new Error(message);
    }
  }
  const iam: FutureIamAuthorizationPort = {
    async authorize(input) {
      receivedRequest = input;

      return {
        allowed: false,
        decisionId: "manual-decision-001",
      };
    },
  };

  const decision = await iam.authorize(request);

  assert(
    receivedRequest === request,
    "Expected the adapter to receive the original request.",
  );

  assert(
    receivedRequest.actor.actorType === "SERVICE",
    "Expected the actor type to be preserved.",
  );

  assert(
    receivedRequest.scope.scope === SecurityScope.PROJECT,
    "Expected the tenant scope to be preserved.",
  );

  assert(
    decision.allowed === false,
    "Expected a denied decision to remain denied.",
  );

  assert(
    decision.decisionId === "manual-decision-001",
    "Expected the optional decision ID to be preserved.",
  );

  console.log("All future IAM boundary manual checks passed.");
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
