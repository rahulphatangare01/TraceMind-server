import { describe, expect, it, vi } from "vitest";

import { SecurityScope } from "../../security-core/public-api.js";

import type { SecurityResourceScope } from "../application/interfaces/security-resource-scope.port.js";

import type { SecurityProductPersistencePort } from "../application/interfaces/security-product-persistence.port.js";

interface TestResource {
  id: string;
  organizationId: string;
  projectId: string;
  value: string;
}

interface CreateTestResourceInput {
  id: string;
  organizationId: string;
  projectId: string;
  value: string;
}

interface UpdateTestResourceInput {
  value: string;
}

const organizationScope: SecurityResourceScope = {
  scope: SecurityScope.ORGANIZATION,
  organizationId: "org-1",
};

const projectScope: SecurityResourceScope = {
  scope: SecurityScope.PROJECT,
  organizationId: "org-1",
  projectId: "project-1",
};

const createRepository = () => {
  const records = new Map<string, TestResource>();

  const repository: SecurityProductPersistencePort<
    TestResource,
    CreateTestResourceInput,
    UpdateTestResourceInput
  > = {
    findById: vi.fn(async (scope, resourceId) => {
      const record = records.get(resourceId);

      if (!record || record.organizationId !== scope.organizationId) {
        return null;
      }

      if (
        scope.scope !== SecurityScope.ORGANIZATION &&
        record.projectId !== scope.projectId
      ) {
        return null;
      }

      return record;
    }),

    create: vi.fn(async (scope, input) => {
      if (input.organizationId !== scope.organizationId) {
        throw new Error("Resource scope does not match organization");
      }

      if (
        scope.scope !== SecurityScope.ORGANIZATION &&
        input.projectId !== scope.projectId
      ) {
        throw new Error("Resource scope does not match project");
      }

      if (records.has(input.id)) {
        throw new Error("Resource already exists");
      }

      const entity: TestResource = { ...input };
      records.set(entity.id, entity);

      return entity;
    }),

    update: vi.fn(async (scope, resourceId, input) => {
      const existing = await repository.findById(scope, resourceId);

      if (!existing) {
        return null;
      }

      const updated: TestResource = {
        ...existing,
        ...input,
      };

      records.set(resourceId, updated);
      return updated;
    }),

    softDelete: vi.fn(async (scope, resourceId) => {
      const existing = await repository.findById(scope, resourceId);

      if (!existing) {
        return false;
      }

      records.delete(resourceId);
      return true;
    }),
  };

  return { repository, records };
};

describe("Security Product persistence port contract", () => {
  it("requires a tenant scope for resource lookup", async () => {
    const { repository } = createRepository();

    await repository.findById(projectScope, "resource-1");

    expect(repository.findById).toHaveBeenCalledWith(
      projectScope,
      "resource-1",
    );
  });

  it("returns null when a resource is outside the requested scope", async () => {
    const { repository } = createRepository();

    await repository.create(projectScope, {
      id: "resource-1",
      organizationId: "org-1",
      projectId: "project-1",
      value: "example",
    });

    const result = await repository.findById(
      {
        scope: SecurityScope.PROJECT,
        organizationId: "org-1",
        projectId: "project-other",
      },
      "resource-1",
    );

    expect(result).toBeNull();
  });

  it("rejects a create request whose organization conflicts with scope", async () => {
    const { repository } = createRepository();

    await expect(
      repository.create(projectScope, {
        id: "resource-1",
        organizationId: "org-other",
        projectId: "project-1",
        value: "example",
      }),
    ).rejects.toThrow("Resource scope does not match organization");
  });

  it("returns null when updating a missing scoped resource", async () => {
    const { repository } = createRepository();

    const result = await repository.update(projectScope, "missing-resource", {
      value: "updated",
    });

    expect(result).toBeNull();
  });

  it("returns false when soft-deleting a missing scoped resource", async () => {
    const { repository } = createRepository();

    const result = await repository.softDelete(
      projectScope,
      "missing-resource",
    );

    expect(result).toBe(false);
  });

  it("does not expose database-specific methods in the contract", () => {
    const { repository } = createRepository();

    expect(Object.keys(repository).sort()).toEqual([
      "create",
      "findById",
      "softDelete",
      "update",
    ]);

    expect("query" in repository).toBe(false);
    expect("getConnection" in repository).toBe(false);
    expect("executeSql" in repository).toBe(false);
  });

  it("supports organization-level scope without requiring child IDs", async () => {
    const { repository } = createRepository();

    await repository.create(organizationScope, {
      id: "resource-org",
      organizationId: "org-1",
      projectId: "project-1",
      value: "organization resource",
    });

    const result = await repository.findById(organizationScope, "resource-org");

    expect(result).toMatchObject({
      id: "resource-org",
      organizationId: "org-1",
    });
  });
});
