import { afterEach, describe, expect, it, vi } from "vitest";

const { executeMock } = vi.hoisted(() => ({
  executeMock: vi.fn(),
}));

vi.mock("../../../database/connection.js", () => ({
  pool: {
    execute: executeMock,
  },
}));

import { SecurityScope } from "../../security-core/public-api.js";
import { SecurityKeyMySQLRepository } from "../infrastructure/persistence/mysql/security-key.mysql.repository.js";

const scope = {
  scope: SecurityScope.PROJECT,
  organizationId: "org-001",
  projectId: "project-001",
} as const;

const dbRow = {
  id: "key-001",
  purpose: "ENCRYPTED_CONFIGURATION",
  scope: "PROJECT",
  organizationId: "org-001",
  projectId: "project-001",
  applicationId: null,
  environmentId: null,
  provider: "local",
  status: "ACTIVE",
  currentVersion: 1,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  deletedBy: null,
};

describe("SecurityKeyMySQLRepository", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("applies the complete project scope to findById", async () => {
    executeMock.mockResolvedValueOnce([[dbRow], []]);

    const repository = new SecurityKeyMySQLRepository();

    const result = await repository.findById(scope, "key-001");

    expect(result?.id).toBe("key-001");

    const [query, parameters] = executeMock.mock.calls[0];

    expect(query).toContain("organization_id = ?");
    expect(query).toContain("project_id = ?");
    expect(query).toContain("application_id IS NULL");
    expect(query).toContain("environment_id IS NULL");
    expect(query).toContain("deleted_at IS NULL");

    expect(parameters).toEqual([
      "PROJECT",
      "org-001",
      "project-001",
      "key-001",
    ]);
  });

  it("returns null when no scoped key exists", async () => {
    executeMock.mockResolvedValueOnce([[], []]);

    const repository = new SecurityKeyMySQLRepository();

    await expect(
      repository.findById(scope, "key-outside-scope"),
    ).resolves.toBeNull();
  });

  it("rejects a create request when the record scope differs", async () => {
    const repository = new SecurityKeyMySQLRepository();

    const mismatchedRecord = {
      ...dbRow,
      scope: SecurityScope.ORGANIZATION,
      projectId: null,
    };

    await expect(
      repository.create(scope, mismatchedRecord as never),
    ).rejects.toThrow(
      "Security key scope does not match the persistence record.",
    );

    expect(executeMock).not.toHaveBeenCalled();
  });

  it("soft-deletes only a matching, non-deleted scoped key", async () => {
    executeMock.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    const repository = new SecurityKeyMySQLRepository();

    await expect(
      repository.softDelete(scope, "key-001", "user-001"),
    ).resolves.toBe(true);

    const [query, parameters] = executeMock.mock.calls[0];

    expect(query).toContain("UPDATE security_keys");
    expect(query).toContain("deleted_at = CURRENT_TIMESTAMP(3)");
    expect(query).toContain("deleted_at IS NULL");

    expect(parameters).toEqual([
      "user-001",
      "PROJECT",
      "org-001",
      "project-001",
      "key-001",
    ]);
  });

  it("maps database timestamp and nullable fields", async () => {
    executeMock.mockResolvedValueOnce([
      [
        {
          ...dbRow,
          createdAt: "2026-01-01 00:00:00.000",
          updatedAt: "2026-01-02 00:00:00.000",
        },
      ],
      [],
    ]);

    const repository = new SecurityKeyMySQLRepository();
    const result = await repository.findById(scope, "key-001");

    expect(result?.createdAt).toBeInstanceOf(Date);
    expect(result?.updatedAt).toBeInstanceOf(Date);
    expect(result?.deletedAt).toBeNull();
    expect(result?.applicationId).toBeNull();
    expect(result?.environmentId).toBeNull();
  });
});
