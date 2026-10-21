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
import { SecurityKeyVersionMySQLRepository } from "../infrastructure/persistence/mysql/security-key-version.mysql.repository.js";
import type { KeyStatus } from "../../security-core/public-api.js";
const scope = {
  scope: SecurityScope.PROJECT,
  organizationId: "org-001",
  projectId: "project-001",
} as const;

const versionRow = {
  id: "version-001",
  keyId: "key-001",
  version: 1,
  purpose: "ENCRYPTED_CONFIGURATION",
  status: "ACTIVE",
  providerKeyReference: "provider-reference-001",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  activatedAt: new Date("2026-01-01T00:00:00.000Z"),
  rotatedAt: null,
  disabledAt: null,
  destroyedAt: null,
};

describe("SecurityKeyVersionMySQLRepository", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("finds a version using the complete tenant scope", async () => {
    executeMock.mockResolvedValueOnce([[versionRow], []]);

    const repository = new SecurityKeyVersionMySQLRepository();

    const result = await repository.findByKeyAndVersion(scope, "key-001", 1);

    expect(result?.id).toBe("version-001");

    const [query, parameters] = executeMock.mock.calls[0];

    expect(query).toContain("INNER JOIN security_keys");
    expect(query).toContain("k.organization_id = ?");
    expect(query).toContain("k.project_id = ?");
    expect(query).toContain("k.application_id IS NULL");
    expect(query).toContain("k.environment_id IS NULL");
    expect(query).toContain("k.deleted_at IS NULL");

    expect(parameters).toEqual([
      "PROJECT",
      "org-001",
      "project-001",
      "key-001",
      1,
    ]);
  });

  it("returns null when a version is outside the supplied scope", async () => {
    executeMock.mockResolvedValueOnce([[], []]);

    const repository = new SecurityKeyVersionMySQLRepository();

    await expect(
      repository.findByKeyAndVersion(scope, "key-outside-scope", 1),
    ).resolves.toBeNull();
  });

  it("filters active-version queries by status and scope", async () => {
    executeMock.mockResolvedValueOnce([[versionRow], []]);

    const repository = new SecurityKeyVersionMySQLRepository();

    const result = await repository.findActiveByKeyId(scope, "key-001");

    expect(result?.status).toBe("ACTIVE");

    const [query, parameters] = executeMock.mock.calls[0];

    expect(query).toContain("v.status = ?");
    expect(parameters).toEqual([
      "PROJECT",
      "org-001",
      "project-001",
      "key-001",
      "ACTIVE",
    ]);
  });

  it("returns version history ordered by version descending", async () => {
    executeMock.mockResolvedValueOnce([
      [{ ...versionRow, version: 2, id: "version-002" }, versionRow],
      [],
    ]);

    const repository = new SecurityKeyVersionMySQLRepository();

    const result = await repository.findAllByKeyId(scope, "key-001");

    expect(result).toHaveLength(2);
    expect(result[0].version).toBe(2);
    expect(result[1].version).toBe(1);

    const [query] = executeMock.mock.calls[0];
    expect(query).toContain("ORDER BY v.version DESC");
  });

  it("updates lifecycle fields with parameterized values", async () => {
    executeMock
      .mockResolvedValueOnce([{ affectedRows: 1 }, []])
      .mockResolvedValueOnce([[versionRow], []]);

    const repository = new SecurityKeyVersionMySQLRepository();

    // const result = await repository.update(scope, "key-001", 1, {
    //   status: "DECRYPT_ONLY" as typeof versionRow.status,
    //   rotatedAt: new Date("2026-02-01T00:00:00.000Z"),
    // });
    const result = await repository.update(scope, "key-001", 1, {
      status: "DECRYPT_ONLY" as KeyStatus,
      rotatedAt: new Date("2026-02-01T00:00:00.000Z"),
    });
    expect(result?.id).toBe("version-001");

    const [query, parameters] = executeMock.mock.calls[0];

    expect(query).toContain("UPDATE security_key_versions");
    expect(query).toContain("INNER JOIN security_keys");
    expect(query).toContain("k.organization_id = ?");
    expect(query).toContain("v.version = ?");

    expect(parameters).toEqual([
      "DECRYPT_ONLY",
      new Date("2026-02-01T00:00:00.000Z"),
      "PROJECT",
      "org-001",
      "project-001",
      "key-001",
      1,
    ]);
  });

  it("maps nullable lifecycle timestamps to null", async () => {
    executeMock.mockResolvedValueOnce([
      [
        {
          ...versionRow,
          activatedAt: null,
          rotatedAt: null,
          disabledAt: null,
          destroyedAt: null,
        },
      ],
      [],
    ]);

    const repository = new SecurityKeyVersionMySQLRepository();

    const result = await repository.findByKeyAndVersion(scope, "key-001", 1);

    expect(result?.createdAt).toBeInstanceOf(Date);
    expect(result?.activatedAt).toBeNull();
    expect(result?.rotatedAt).toBeNull();
    expect(result?.disabledAt).toBeNull();
    expect(result?.destroyedAt).toBeNull();
  });
});
