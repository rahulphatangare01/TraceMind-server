import { describe, expect, it, vi } from "vitest";

import { SecurityScope } from "../../security-core/public-api.js";

import type {
  FutureIamAuthorizationPort,
  SecurityProductAuthorizationRequest,
} from "../application/interfaces/future-iam.port.js";

describe("Future IAM integration boundary", () => {
  const request: SecurityProductAuthorizationRequest = {
    actor: {
      actorId: "user-001",
      actorType: "USER",
    },
    action: "security.key.rotate",
    resourceType: "security-key",
    resourceId: "key-001",
    scope: {
      scope: SecurityScope.ORGANIZATION,
      organizationId: "org-001",
    },
  };

  it("passes the actor, action, resource and scope to the IAM adapter", async () => {
    const authorize = vi.fn().mockResolvedValue({
      allowed: true,
      decisionId: "decision-001",
    });

    const iam: FutureIamAuthorizationPort = { authorize };

    const decision = await iam.authorize(request);

    expect(authorize).toHaveBeenCalledOnce();
    expect(authorize).toHaveBeenCalledWith(request);
    expect(decision).toEqual({
      allowed: true,
      decisionId: "decision-001",
    });
  });

  it("preserves a denied decision instead of treating it as allowed", async () => {
    const iam: FutureIamAuthorizationPort = {
      authorize: vi.fn().mockResolvedValue({
        allowed: false,
        decisionId: "decision-002",
      }),
    };

    const decision = await iam.authorize(request);

    expect(decision.allowed).toBe(false);
  });

  it("does not require a decision ID", async () => {
    const iam: FutureIamAuthorizationPort = {
      authorize: vi.fn().mockResolvedValue({
        allowed: true,
      }),
    };

    await expect(iam.authorize(request)).resolves.toEqual({
      allowed: true,
    });
  });

  it("does not expose a concrete IAM implementation in the contract", () => {
    const contractKeys = Object.keys(request).sort();

    expect(contractKeys).toEqual([
      "action",
      "actor",
      "resourceId",
      "resourceType",
      "scope",
    ]);
  });
});
