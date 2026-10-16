import { SecurityScope } from "../../security-core/public-api.js";

import type { SecurityResourceScope } from "../application/interfaces/security-resource-scope.port.js";

import type { SecurityProductPersistencePort } from "../application/interfaces/security-product-persistence.port.js";

interface ManualResource {
  id: string;
  organizationId: string;
  projectId?: string;
  value: string;
}

interface CreateManualResourceInput {
  id: string;
  organizationId: string;
  projectId?: string;
  value: string;
}

interface UpdateManualResourceInput {
  value: string;
}

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`Manual verification failed: ${message}`);
  }
};

const main = async (): Promise<void> => {
  const records = new Map<string, ManualResource>();
  const deletedIds = new Set<string>();

  const repository: SecurityProductPersistencePort<
    ManualResource,
    CreateManualResourceInput,
    UpdateManualResourceInput
  > = {
    findById: async (scope, resourceId) => {
      const record = records.get(resourceId);

      if (!record || deletedIds.has(resourceId)) {
        return null;
      }

      if (record.organizationId !== scope.organizationId) {
        return null;
      }

      if (
        scope.scope !== SecurityScope.ORGANIZATION &&
        record.projectId !== scope.projectId
      ) {
        return null;
      }

      return record;
    },

    create: async (scope, input) => {
      if (scope.organizationId !== input.organizationId) {
        throw new Error("Resource scope does not match organization");
      }

      if (
        scope.scope !== SecurityScope.ORGANIZATION &&
        scope.projectId !== input.projectId
      ) {
        throw new Error("Resource scope does not match project");
      }

      if (records.has(input.id)) {
        throw new Error("Resource already exists");
      }

      const entity: ManualResource = { ...input };
      records.set(entity.id, entity);

      return entity;
    },

    update: async (scope, resourceId, input) => {
      const existing = await repository.findById(scope, resourceId);

      if (!existing) {
        return null;
      }

      const updated = { ...existing, ...input };
      records.set(resourceId, updated);

      return updated;
    },

    softDelete: async (scope, resourceId) => {
      const existing = await repository.findById(scope, resourceId);

      if (!existing) {
        return false;
      }

      deletedIds.add(resourceId);
      return true;
    },
  };

  console.log("\nSecurity Product Persistence Boundary");
  console.log("=====================================");

  const projectScope: SecurityResourceScope = {
    scope: SecurityScope.PROJECT,
    organizationId: "org-manual",
    projectId: "project-manual",
  };

  const created = await repository.create(projectScope, {
    id: "resource-manual",
    organizationId: "org-manual",
    projectId: "project-manual",
    value: "manual-test",
  });

  assert(
    created.id === "resource-manual",
    "Resource creation did not return the expected entity",
  );
  console.log("PASS: scoped resource creation");

  const found = await repository.findById(projectScope, "resource-manual");

  assert(found !== null, "Expected resource was not found in its scope");
  console.log("PASS: scoped resource lookup");

  const wrongScope: SecurityResourceScope = {
    scope: SecurityScope.PROJECT,
    organizationId: "org-manual",
    projectId: "project-other",
  };

  const crossScopeResult = await repository.findById(
    wrongScope,
    "resource-manual",
  );

  assert(
    crossScopeResult === null,
    "Resource was returned for a different project",
  );
  console.log("PASS: cross-project lookup isolation");

  const updated = await repository.update(projectScope, "resource-manual", {
    value: "updated-manually",
  });

  assert(updated?.value === "updated-manually", "Scoped update failed");
  console.log("PASS: scoped resource update");

  const deleted = await repository.softDelete(projectScope, "resource-manual");

  assert(deleted, "Soft-delete did not report success");

  assert(
    records.has("resource-manual"),
    "Soft-delete physically removed the stored record",
  );

  assert(
    (await repository.findById(projectScope, "resource-manual")) === null,
    "Soft-deleted resource was still returned",
  );
  console.log("PASS: soft-delete semantics");

  console.log("\nAll persistence-boundary manual checks passed.");
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
