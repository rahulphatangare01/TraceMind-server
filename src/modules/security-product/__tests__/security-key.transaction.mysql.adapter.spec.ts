// import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// import type {
//   PoolConnection,
//   ResultSetHeader,
//   RowDataPacket,
// } from "mysql2/promise";

// import type { SecurityKeyPersistenceRecord } from "../domain/models/security-key-persistence.model.js";
// import type { SecurityKeyVersionPersistenceRecord } from "../domain/models/security-key-version-persistence.model.js";
// import type { SecurityResourceScope } from "../application/interfaces/security-resource-scope.port.js";

// const { mockPool, mockConnection } = vi.hoisted(() => {
//   const connection = {
//     query: vi.fn(),
//     execute: vi.fn(),
//     beginTransaction: vi.fn(),
//     commit: vi.fn(),
//     rollback: vi.fn(),
//     release: vi.fn(),
//   };

//   return {
//     mockConnection: connection,
//     mockPool: {
//       getConnection: vi.fn(),
//       query: vi.fn(),
//       execute: vi.fn(),
//     },
//   };
// });

// vi.mock("../../../database/connection.js", () => ({
//   pool: mockPool,
// }));

// import { SecurityKeyTransactionMySQLAdapter } from "../infrastructure/persistence/mysql/security-key.transaction.mysql.adapter.js";

// type MockRow = RowDataPacket & Record<string, unknown>;

// const IDS = {
//   key: "key-111",
//   version1: "version-111",
//   version2: "version-222",
//   organization: "org-111",
//   project: "project-111",
// };

// const projectScope = {
//   scope: "PROJECT",
//   organizationId: IDS.organization,
//   projectId: IDS.project,
// } as SecurityResourceScope;

// const createKeyRecord = (
//   overrides: Partial<SecurityKeyPersistenceRecord> = {},
// ): SecurityKeyPersistenceRecord => ({
//   id: IDS.key,
//   purpose: "ENCRYPTED_CONFIGURATION" as SecurityKeyPersistenceRecord["purpose"],
//   scope: "PROJECT" as SecurityKeyPersistenceRecord["scope"],
//   organizationId: IDS.organization,
//   projectId: IDS.project,
//   applicationId: null,
//   environmentId: null,
//   provider: "LOCAL",
//   status: "ACTIVE" as SecurityKeyPersistenceRecord["status"],
//   currentVersion: 1,
//   createdAt: new Date("2026-01-01T10:00:00.000Z"),
//   updatedAt: new Date("2026-01-01T10:00:00.000Z"),
//   deletedAt: null,
//   createdBy: null,
//   updatedBy: null,
//   deletedBy: null,
//   ...overrides,
// });

// const createVersionRecord = (
//   overrides: Partial<SecurityKeyVersionPersistenceRecord> = {},
// ): SecurityKeyVersionPersistenceRecord => ({
//   id: IDS.version1,
//   keyId: IDS.key,
//   version: 1,
//   purpose:
//     "ENCRYPTED_CONFIGURATION" as SecurityKeyVersionPersistenceRecord["purpose"],
//   status: "ACTIVE" as SecurityKeyVersionPersistenceRecord["status"],
//   providerKeyReference: "local-key-reference-v1",
//   createdAt: new Date("2026-01-01T10:00:00.000Z"),
//   activatedAt: new Date("2026-01-01T10:00:00.000Z"),
//   rotatedAt: null,
//   disabledAt: null,
//   destroyedAt: null,
//   ...overrides,
// });

// const keyRow = (currentVersion = 1): MockRow =>
//   ({
//     id: IDS.key,
//     purpose: "ENCRYPTED_CONFIGURATION",
//     scope: "PROJECT",
//     organization_id: IDS.organization,
//     project_id: IDS.project,
//     application_id: null,
//     environment_id: null,
//     provider: "LOCAL",
//     status: "ACTIVE",
//     current_version: currentVersion,
//     currentVersion,
//     created_at: new Date("2026-01-01T10:00:00.000Z"),
//     updated_at: new Date("2026-01-01T10:00:00.000Z"),
//     deleted_at: null,
//     created_by: null,
//     updated_by: null,
//     deleted_by: null,
//   }) as MockRow;

// const versionRow = (status = "ACTIVE"): MockRow =>
//   ({
//     id: IDS.version1,
//     key_id: IDS.key,
//     version: 1,
//     purpose: "ENCRYPTED_CONFIGURATION",
//     status,
//     provider_key_reference: "local-key-reference-v1",
//   }) as MockRow;

// const resultHeader = (affectedRows = 1): ResultSetHeader =>
//   ({
//     affectedRows,
//     insertId: 0,
//     warningStatus: 0,
//     fieldCount: 0,
//     info: "",
//     serverStatus: 0,
//     changedRows: 0,
//   }) as ResultSetHeader;

// const rowsResult = (rows: MockRow[] = []) => [rows, []];
// const headerResult = (header = resultHeader()) => [header, []];
// const configureSqlMocks = (
//   handler: (sql: string) => Promise<unknown>,
// ): void => {
//   mockConnection.query.mockImplementation((sql: string) => handler(sql));
//   mockConnection.execute.mockImplementation((sql: string) => handler(sql));
// };

// const defaultSqlResult = (sql: string): Promise<unknown> => {
//   return Promise.resolve(/SELECT/i.test(sql) ? rowsResult([]) : headerResult());
// };
// describe("SecurityKeyTransactionMySQLAdapter", () => {
//   let adapter: SecurityKeyTransactionMySQLAdapter;

//   beforeEach(() => {
//     vi.clearAllMocks();

//     mockPool.getConnection.mockResolvedValue(
//       mockConnection as unknown as PoolConnection,
//     );

//     mockConnection.beginTransaction.mockResolvedValue(undefined);
//     mockConnection.commit.mockResolvedValue(undefined);
//     mockConnection.rollback.mockResolvedValue(undefined);
//     mockConnection.release.mockImplementation(() => undefined);

//     // The adapter may use query() or execute() for parameterized statements.
//     // Both methods share one configurable SQL response handler.
//     mockConnection.query.mockImplementation(() =>
//       Promise.resolve(rowsResult()),
//     );
//     mockConnection.execute.mockImplementation(() =>
//       Promise.resolve(headerResult()),
//     );

//     adapter = new SecurityKeyTransactionMySQLAdapter();
//   });

//   afterEach(() => {
//     vi.restoreAllMocks();
//   });

//   describe("createKeyWithInitialVersion", () => {
//     it("creates the key and its initial version in one transaction", async () => {
//       mockConnection.query.mockImplementation(async (sql: string) => {
//         if (/SELECT/i.test(sql) && /security_keys/i.test(sql)) {
//           return rowsResult([]);
//         }

//         return rowsResult([]);
//       });

//       mockConnection.execute.mockResolvedValue(headerResult());

//       await adapter.createKeyWithInitialVersion(
//         projectScope,
//         createKeyRecord(),
//         createVersionRecord(),
//       );

//       expect(mockPool.getConnection).toHaveBeenCalledTimes(1);
//       expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);

//       const allCalls = [
//         ...mockConnection.query.mock.calls,
//         ...mockConnection.execute.mock.calls,
//       ];

//       const sqlStatements = allCalls.map(([sql]) => String(sql));

//       expect(
//         sqlStatements.some((sql) => /INSERT INTO\s+security_keys/i.test(sql)),
//       ).toBe(true);

//       expect(
//         sqlStatements.some((sql) =>
//           /INSERT INTO\s+security_key_versions/i.test(sql),
//         ),
//       ).toBe(true);

//       expect(mockConnection.commit).toHaveBeenCalledTimes(1);
//       expect(mockConnection.rollback).not.toHaveBeenCalled();
//       expect(mockConnection.release).toHaveBeenCalledTimes(1);
//     });

//     it("rejects a key whose tenant scope does not match the requested scope", async () => {
//       const mismatchedKey = createKeyRecord({
//         organizationId: "different-org",
//       });

//       await expect(
//         adapter.createKeyWithInitialVersion(
//           projectScope,
//           mismatchedKey,
//           createVersionRecord(),
//         ),
//       ).rejects.toThrow();

//       expect(mockConnection.commit).not.toHaveBeenCalled();
//       expect(mockConnection.release).not.toHaveBeenCalled();
//     });

//     it("rejects an initial version belonging to another key", async () => {
//       const mismatchedVersion = createVersionRecord({
//         keyId: "different-key",
//       });

//       await expect(
//         adapter.createKeyWithInitialVersion(
//           projectScope,
//           createKeyRecord(),
//           mismatchedVersion,
//         ),
//       ).rejects.toThrow();

//       expect(mockConnection.commit).not.toHaveBeenCalled();
//     });

//     it("rejects an initial version that does not match currentVersion", async () => {
//       const key = createKeyRecord({ currentVersion: 2 });
//       const version = createVersionRecord({ version: 1 });

//       await expect(
//         adapter.createKeyWithInitialVersion(projectScope, key, version),
//       ).rejects.toThrow();

//       expect(mockConnection.commit).not.toHaveBeenCalled();
//     });

//     it("rolls back when inserting the initial version fails", async () => {
//       mockConnection.query.mockImplementation(async (sql: string) => {
//         if (/SELECT/i.test(sql) && /security_keys/i.test(sql)) {
//           return rowsResult([]);
//         }

//         return rowsResult([]);
//       });

//       mockConnection.execute.mockImplementation(async (sql: string) => {
//         if (/INSERT INTO\s+security_key_versions/i.test(sql)) {
//           throw new Error("Simulated version insert failure");
//         }

//         return headerResult();
//       });

//       await expect(
//         adapter.createKeyWithInitialVersion(
//           projectScope,
//           createKeyRecord(),
//           createVersionRecord(),
//         ),
//       ).rejects.toThrow("Simulated version insert failure");

//       expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
//       expect(mockConnection.commit).not.toHaveBeenCalled();
//       expect(mockConnection.release).toHaveBeenCalledTimes(1);
//     });

//     it("releases the connection if transaction setup fails", async () => {
//       mockConnection.beginTransaction.mockRejectedValue(
//         new Error("Unable to begin transaction"),
//       );

//       await expect(
//         adapter.createKeyWithInitialVersion(
//           projectScope,
//           createKeyRecord(),
//           createVersionRecord(),
//         ),
//       ).rejects.toThrow("Unable to begin transaction");

//       expect(mockConnection.release).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("rotateKeyWithVersion", () => {
//     const previousVersion = createVersionRecord({
//       id: IDS.version1,
//       version: 1,
//       status: "DECRYPT_ONLY" as SecurityKeyVersionPersistenceRecord["status"],
//       rotatedAt: new Date("2026-02-01T10:00:00.000Z"),
//     });

//     const nextVersion = createVersionRecord({
//       id: IDS.version2,
//       version: 2,
//       status: "ACTIVE" as SecurityKeyVersionPersistenceRecord["status"],
//       providerKeyReference: "local-key-reference-v2",
//       createdAt: new Date("2026-02-01T10:00:00.000Z"),
//       activatedAt: new Date("2026-02-01T10:00:00.000Z"),
//     });

//     // const configureSuccessfulRotation = () => {
//     //   mockConnection.query.mockImplementation(async (sql: string) => {
//     //     if (/SELECT/i.test(sql) && /security_keys/i.test(sql)) {
//     //       return rowsResult([keyRow(1)]);
//     //     }

//     //     if (/SELECT/i.test(sql) && /security_key_versions/i.test(sql)) {
//     //       return rowsResult([versionRow("ACTIVE")]);
//     //     }

//     //     return rowsResult([]);
//     //   });

//     //   mockConnection.execute.mockResolvedValue(headerResult());
//     // };
//     const configureSuccessfulRotation = () => {
//       configureSqlMocks(async (sql: string) => {
//         if (/SELECT/i.test(sql) && /security_keys/i.test(sql)) {
//           return rowsResult([keyRow(1)]);
//         }

//         if (/SELECT/i.test(sql) && /security_key_versions/i.test(sql)) {
//           return rowsResult([versionRow("ACTIVE")]);
//         }

//         return defaultSqlResult(sql);
//       });
//     };
//     it("rotates the key atomically when the expected version matches", async () => {
//       configureSuccessfulRotation();

//       const result = await adapter.rotateKeyWithVersion(
//         projectScope,
//         IDS.key,
//         1,
//         previousVersion,
//         nextVersion,
//         new Date("2026-02-01T10:00:00.000Z"),
//         "user-111",
//       );

//       expect(result).toBe(true);
//       expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);

//       const allCalls = [
//         ...mockConnection.query.mock.calls,
//         ...mockConnection.execute.mock.calls,
//       ];

//       const sqlStatements = allCalls.map(([sql]) => String(sql));

//       expect(
//         sqlStatements.some(
//           (sql) =>
//             /UPDATE\s+security_key_versions/i.test(sql) ||
//             /UPDATE\s+security_key_versions\s+\w+\s+INNER JOIN/i.test(sql),
//         ),
//       ).toBe(true);

//       expect(
//         sqlStatements.some((sql) =>
//           /INSERT INTO\s+security_key_versions/i.test(sql),
//         ),
//       ).toBe(true);

//       expect(
//         sqlStatements.some((sql) => /UPDATE\s+security_keys/i.test(sql)),
//       ).toBe(true);

//       expect(mockConnection.commit).toHaveBeenCalledTimes(1);
//       expect(mockConnection.rollback).not.toHaveBeenCalled();
//       expect(mockConnection.release).toHaveBeenCalledTimes(1);
//     });

//     it("returns false and rolls back when the current version is stale", async () => {
//       mockConnection.query.mockImplementation(async (sql: string) => {
//         if (/SELECT/i.test(sql) && /security_keys/i.test(sql)) {
//           return rowsResult([keyRow(2)]);
//         }

//         return rowsResult([]);
//       });

//       const result = await adapter.rotateKeyWithVersion(
//         projectScope,
//         IDS.key,
//         1,
//         previousVersion,
//         nextVersion,
//         new Date("2026-02-01T10:00:00.000Z"),
//       );

//       expect(result).toBe(false);
//       expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
//       expect(mockConnection.commit).not.toHaveBeenCalled();
//       expect(mockConnection.release).toHaveBeenCalledTimes(1);
//     });

//     it("returns false when the scoped key cannot be found", async () => {
//       mockConnection.query.mockImplementation(async (sql: string) => {
//         if (/SELECT/i.test(sql) && /security_keys/i.test(sql)) {
//           return rowsResult([]);
//         }

//         return rowsResult([]);
//       });

//       const result = await adapter.rotateKeyWithVersion(
//         projectScope,
//         IDS.key,
//         1,
//         previousVersion,
//         nextVersion,
//         new Date("2026-02-01T10:00:00.000Z"),
//       );

//       expect(result).toBe(false);
//       expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
//       expect(mockConnection.commit).not.toHaveBeenCalled();
//     });

//     it("rejects a previous version that belongs to a different key", async () => {
//       configureSuccessfulRotation();

//       await expect(
//         adapter.rotateKeyWithVersion(
//           projectScope,
//           IDS.key,
//           1,
//           { ...previousVersion, keyId: "different-key" },
//           nextVersion,
//           new Date("2026-02-01T10:00:00.000Z"),
//         ),
//       ).rejects.toThrow();

//       expect(mockConnection.commit).not.toHaveBeenCalled();
//     });

//     it("rejects a next version with an unexpected version number", async () => {
//       configureSuccessfulRotation();

//       await expect(
//         adapter.rotateKeyWithVersion(
//           projectScope,
//           IDS.key,
//           1,
//           previousVersion,
//           { ...nextVersion, version: 3 },
//           new Date("2026-02-01T10:00:00.000Z"),
//         ),
//       ).rejects.toThrow();

//       expect(mockConnection.commit).not.toHaveBeenCalled();
//     });

//     it("rolls back when inserting the next version fails", async () => {
//       mockConnection.query.mockImplementation(async (sql: string) => {
//         if (/SELECT/i.test(sql) && /security_keys/i.test(sql)) {
//           return rowsResult([keyRow(1)]);
//         }

//         if (/SELECT/i.test(sql) && /security_key_versions/i.test(sql)) {
//           return rowsResult([versionRow("ACTIVE")]);
//         }

//         return rowsResult([]);
//       });

//       mockConnection.execute.mockImplementation(async (sql: string) => {
//         if (/INSERT INTO\s+security_key_versions/i.test(sql)) {
//           throw new Error("Simulated rotation insert failure");
//         }

//         return headerResult();
//       });

//       await expect(
//         adapter.rotateKeyWithVersion(
//           projectScope,
//           IDS.key,
//           1,
//           previousVersion,
//           nextVersion,
//           new Date("2026-02-01T10:00:00.000Z"),
//         ),
//       ).rejects.toThrow("Simulated rotation insert failure");

//       expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
//       expect(mockConnection.commit).not.toHaveBeenCalled();
//       expect(mockConnection.release).toHaveBeenCalledTimes(1);
//     });

//     it("rolls back when updating the parent key affects no rows", async () => {
//       mockConnection.query.mockImplementation(async (sql: string) => {
//         if (/SELECT/i.test(sql) && /security_keys/i.test(sql)) {
//           return rowsResult([keyRow(1)]);
//         }

//         if (/SELECT/i.test(sql) && /security_key_versions/i.test(sql)) {
//           return rowsResult([versionRow("ACTIVE")]);
//         }

//         return rowsResult([]);
//       });

//       mockConnection.execute.mockImplementation(async (sql: string) => {
//         if (/UPDATE\s+security_keys/i.test(sql)) {
//           return headerResult(resultHeader(0));
//         }

//         return headerResult(resultHeader(1));
//       });

//       await expect(
//         adapter.rotateKeyWithVersion(
//           projectScope,
//           IDS.key,
//           1,
//           previousVersion,
//           nextVersion,
//           new Date("2026-02-01T10:00:00.000Z"),
//         ),
//       ).rejects.toThrow();

//       expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
//       expect(mockConnection.commit).not.toHaveBeenCalled();
//       expect(mockConnection.release).toHaveBeenCalledTimes(1);
//     });

//     it("releases the connection if rotation fails unexpectedly", async () => {
//       mockConnection.beginTransaction.mockResolvedValue(undefined);
//       mockConnection.query.mockRejectedValue(
//         new Error("Simulated database failure"),
//       );

//       await expect(
//         adapter.rotateKeyWithVersion(
//           projectScope,
//           IDS.key,
//           1,
//           previousVersion,
//           nextVersion,
//           new Date("2026-02-01T10:00:00.000Z"),
//         ),
//       ).rejects.toThrow("Simulated database failure");

//       expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
//       expect(mockConnection.commit).not.toHaveBeenCalled();
//       expect(mockConnection.release).toHaveBeenCalledTimes(1);
//     });
//   });
// });

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import type { SecurityKeyPersistenceRecord } from "../domain/models/security-key-persistence.model.js";
import type { SecurityKeyVersionPersistenceRecord } from "../domain/models/security-key-version-persistence.model.js";
import type { SecurityResourceScope } from "../application/interfaces/security-resource-scope.port.js";

const { mockPool, mockConnection } = vi.hoisted(() => {
  const connection = {
    query: vi.fn(),
    execute: vi.fn(),
    beginTransaction: vi.fn(),
    commit: vi.fn(),
    rollback: vi.fn(),
    release: vi.fn(),
  };

  return {
    mockConnection: connection,
    mockPool: {
      getConnection: vi.fn(),
      query: vi.fn(),
      execute: vi.fn(),
    },
  };
});

vi.mock("../../../database/connection.js", () => ({
  pool: mockPool,
}));

import { SecurityKeyTransactionMySQLAdapter } from "../infrastructure/persistence/mysql/security-key.transaction.mysql.adapter.js";

type MockRow = RowDataPacket & Record<string, unknown>;
type SqlHandler = (sql: string) => Promise<unknown>;

const IDS = {
  key: "key-111",
  version1: "version-111",
  version2: "version-222",
  organization: "org-111",
  project: "project-111",
};

const projectScope = {
  scope: "PROJECT",
  organizationId: IDS.organization,
  projectId: IDS.project,
} as SecurityResourceScope;

const createKeyRecord = (
  overrides: Partial<SecurityKeyPersistenceRecord> = {},
): SecurityKeyPersistenceRecord => ({
  id: IDS.key,
  purpose: "ENCRYPTED_CONFIGURATION" as SecurityKeyPersistenceRecord["purpose"],
  scope: "PROJECT" as SecurityKeyPersistenceRecord["scope"],
  organizationId: IDS.organization,
  projectId: IDS.project,
  applicationId: null,
  environmentId: null,
  provider: "LOCAL",
  status: "ACTIVE" as SecurityKeyPersistenceRecord["status"],
  currentVersion: 1,
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  updatedAt: new Date("2026-01-01T10:00:00.000Z"),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  deletedBy: null,
  ...overrides,
});

const createVersionRecord = (
  overrides: Partial<SecurityKeyVersionPersistenceRecord> = {},
): SecurityKeyVersionPersistenceRecord => ({
  id: IDS.version1,
  keyId: IDS.key,
  version: 1,
  purpose:
    "ENCRYPTED_CONFIGURATION" as SecurityKeyVersionPersistenceRecord["purpose"],
  status: "ACTIVE" as SecurityKeyVersionPersistenceRecord["status"],
  providerKeyReference: "local-key-reference-v1",
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  activatedAt: new Date("2026-01-01T10:00:00.000Z"),
  rotatedAt: null,
  disabledAt: null,
  destroyedAt: null,
  ...overrides,
});

const keyRow = (currentVersion = 1): MockRow =>
  ({
    id: IDS.key,
    purpose: "ENCRYPTED_CONFIGURATION",
    scope: "PROJECT",
    organization_id: IDS.organization,
    project_id: IDS.project,
    application_id: null,
    environment_id: null,
    provider: "LOCAL",
    status: "ACTIVE",
    current_version: currentVersion,
    currentVersion,
    created_at: new Date("2026-01-01T10:00:00.000Z"),
    updated_at: new Date("2026-01-01T10:00:00.000Z"),
    deleted_at: null,
    created_by: null,
    updated_by: null,
    deleted_by: null,
  }) as MockRow;

const versionRow = (status = "ACTIVE"): MockRow =>
  ({
    id: IDS.version1,
    key_id: IDS.key,
    version: 1,
    purpose: "ENCRYPTED_CONFIGURATION",
    status,
    provider_key_reference: "local-key-reference-v1",
  }) as MockRow;

const resultHeader = (affectedRows = 1): ResultSetHeader =>
  ({
    affectedRows,
    insertId: 0,
    warningStatus: 0,
    fieldCount: 0,
    info: "",
    serverStatus: 0,
    changedRows: 0,
  }) as ResultSetHeader;

const rowsResult = (rows: MockRow[] = []) => [rows, []];
const headerResult = (header = resultHeader()) => [header, []];

const defaultSqlResult = (sql: string): Promise<unknown> =>
  Promise.resolve(/^\s*SELECT\b/i.test(sql) ? rowsResult([]) : headerResult());

/**
 * Configure both mysql2 methods because the adapter may use either one.
 * Prioritize the version table because version queries may also join keys.
 */
const configureSqlMocks = (handler: SqlHandler): void => {
  const implementation = (sql: unknown) => handler(String(sql));

  mockConnection.query.mockImplementation(implementation);
  mockConnection.execute.mockImplementation(implementation);
};

const configureRotationRows = (currentVersion: number | null): void => {
  configureSqlMocks(async (sql) => {
    if (/^\s*SELECT\b/i.test(sql)) {
      if (/security_key_versions/i.test(sql)) {
        return rowsResult([versionRow("ACTIVE")]);
      }

      if (/security_keys/i.test(sql)) {
        return currentVersion === null
          ? rowsResult([])
          : rowsResult([keyRow(currentVersion)]);
      }

      return rowsResult([]);
    }

    return headerResult();
  });
};

describe("SecurityKeyTransactionMySQLAdapter", () => {
  let adapter: SecurityKeyTransactionMySQLAdapter;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPool.getConnection.mockResolvedValue(
      mockConnection as unknown as PoolConnection,
    );

    mockConnection.beginTransaction.mockResolvedValue(undefined);
    mockConnection.commit.mockResolvedValue(undefined);
    mockConnection.rollback.mockResolvedValue(undefined);
    mockConnection.release.mockImplementation(() => undefined);

    configureSqlMocks(defaultSqlResult);

    adapter = new SecurityKeyTransactionMySQLAdapter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createKeyWithInitialVersion", () => {
    it("creates the key and initial version in one transaction", async () => {
      configureSqlMocks(async (sql) => {
        if (/^\s*SELECT\b/i.test(sql)) {
          return rowsResult([]);
        }

        return headerResult();
      });

      await adapter.createKeyWithInitialVersion(
        projectScope,
        createKeyRecord(),
        createVersionRecord(),
      );

      expect(mockPool.getConnection).toHaveBeenCalledTimes(1);
      expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);

      const statements = [
        ...mockConnection.query.mock.calls,
        ...mockConnection.execute.mock.calls,
      ].map(([sql]) => String(sql));

      expect(
        statements.some((sql) => /INSERT INTO\s+security_keys/i.test(sql)),
      ).toBe(true);

      expect(
        statements.some((sql) =>
          /INSERT INTO\s+security_key_versions/i.test(sql),
        ),
      ).toBe(true);

      expect(mockConnection.commit).toHaveBeenCalledTimes(1);
      expect(mockConnection.rollback).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    it("rejects a key whose tenant scope does not match", async () => {
      await expect(
        adapter.createKeyWithInitialVersion(
          projectScope,
          createKeyRecord({ organizationId: "different-org" }),
          createVersionRecord(),
        ),
      ).rejects.toThrow();

      expect(mockConnection.commit).not.toHaveBeenCalled();
      expect(mockPool.getConnection).not.toHaveBeenCalled();
    });

    it("rejects an initial version belonging to another key", async () => {
      await expect(
        adapter.createKeyWithInitialVersion(
          projectScope,
          createKeyRecord(),
          createVersionRecord({ keyId: "different-key" }),
        ),
      ).rejects.toThrow();

      expect(mockConnection.commit).not.toHaveBeenCalled();
    });

    it("rejects an initial version inconsistent with currentVersion", async () => {
      await expect(
        adapter.createKeyWithInitialVersion(
          projectScope,
          createKeyRecord({ currentVersion: 2 }),
          createVersionRecord({ version: 1 }),
        ),
      ).rejects.toThrow();

      expect(mockConnection.commit).not.toHaveBeenCalled();
    });

    it("rolls back when inserting the initial version fails", async () => {
      configureSqlMocks(async (sql) => {
        if (/^\s*SELECT\b/i.test(sql)) {
          return rowsResult([]);
        }

        if (/INSERT INTO\s+security_key_versions/i.test(sql)) {
          throw new Error("Simulated version insert failure");
        }

        return headerResult();
      });

      await expect(
        adapter.createKeyWithInitialVersion(
          projectScope,
          createKeyRecord(),
          createVersionRecord(),
        ),
      ).rejects.toThrow("Simulated version insert failure");

      expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
      expect(mockConnection.commit).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    it("releases the connection if transaction setup fails", async () => {
      mockConnection.beginTransaction.mockRejectedValue(
        new Error("Unable to begin transaction"),
      );

      await expect(
        adapter.createKeyWithInitialVersion(
          projectScope,
          createKeyRecord(),
          createVersionRecord(),
        ),
      ).rejects.toThrow("Unable to begin transaction");

      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });
  });

  describe("rotateKeyWithVersion", () => {
    const previousVersion = createVersionRecord({
      id: IDS.version1,
      version: 1,
      status: "DECRYPT_ONLY" as SecurityKeyVersionPersistenceRecord["status"],
      rotatedAt: new Date("2026-02-01T10:00:00.000Z"),
    });

    const nextVersion = createVersionRecord({
      id: IDS.version2,
      version: 2,
      status: "ACTIVE" as SecurityKeyVersionPersistenceRecord["status"],
      providerKeyReference: "local-key-reference-v2",
      createdAt: new Date("2026-02-01T10:00:00.000Z"),
      activatedAt: new Date("2026-02-01T10:00:00.000Z"),
    });

    const rotate = () =>
      adapter.rotateKeyWithVersion(
        projectScope,
        IDS.key,
        1,
        previousVersion,
        nextVersion,
        new Date("2026-02-01T10:00:00.000Z"),
        "user-111",
      );

    it("rotates atomically when the expected version matches", async () => {
      configureRotationRows(1);

      const result = await rotate();

      expect(result).toBe(true);
      expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);

      const statements = [
        ...mockConnection.query.mock.calls,
        ...mockConnection.execute.mock.calls,
      ].map(([sql]) => String(sql));

      expect(
        statements.some((sql) => /UPDATE\s+security_key_versions/i.test(sql)),
      ).toBe(true);

      expect(
        statements.some((sql) =>
          /INSERT INTO\s+security_key_versions/i.test(sql),
        ),
      ).toBe(true);

      expect(
        statements.some((sql) => /UPDATE\s+security_keys/i.test(sql)),
      ).toBe(true);

      expect(mockConnection.commit).toHaveBeenCalledTimes(1);
      expect(mockConnection.rollback).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    it("returns false and rolls back when the current version is stale", async () => {
      configureRotationRows(2);

      const result = await rotate();

      expect(result).toBe(false);
      expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
      expect(mockConnection.commit).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    it("returns false when the scoped key cannot be found", async () => {
      configureRotationRows(null);

      const result = await rotate();

      expect(result).toBe(false);
      expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
      expect(mockConnection.commit).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    it("rejects a previous version belonging to another key", async () => {
      configureRotationRows(1);

      await expect(
        adapter.rotateKeyWithVersion(
          projectScope,
          IDS.key,
          1,
          { ...previousVersion, keyId: "different-key" },
          nextVersion,
          new Date("2026-02-01T10:00:00.000Z"),
        ),
      ).rejects.toThrow();

      expect(mockConnection.commit).not.toHaveBeenCalled();
    });

    it("rejects an unexpected next version number", async () => {
      configureRotationRows(1);

      await expect(
        adapter.rotateKeyWithVersion(
          projectScope,
          IDS.key,
          1,
          previousVersion,
          { ...nextVersion, version: 3 },
          new Date("2026-02-01T10:00:00.000Z"),
        ),
      ).rejects.toThrow();

      expect(mockConnection.commit).not.toHaveBeenCalled();
    });

    it("rolls back when inserting the next version fails", async () => {
      configureSqlMocks(async (sql) => {
        if (/^\s*SELECT\b/i.test(sql)) {
          if (/security_key_versions/i.test(sql)) {
            return rowsResult([versionRow("ACTIVE")]);
          }

          if (/security_keys/i.test(sql)) {
            return rowsResult([keyRow(1)]);
          }

          return rowsResult([]);
        }

        if (/INSERT INTO\s+security_key_versions/i.test(sql)) {
          throw new Error("Simulated rotation insert failure");
        }

        return headerResult();
      });

      await expect(rotate()).rejects.toThrow(
        "Simulated rotation insert failure",
      );

      expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
      expect(mockConnection.commit).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    it("rolls back when updating the parent key affects no rows", async () => {
      configureSqlMocks(async (sql) => {
        if (/^\s*SELECT\b/i.test(sql)) {
          if (/security_key_versions/i.test(sql)) {
            return rowsResult([versionRow("ACTIVE")]);
          }

          if (/security_keys/i.test(sql)) {
            return rowsResult([keyRow(1)]);
          }

          return rowsResult([]);
        }

        if (/UPDATE\s+security_keys/i.test(sql)) {
          return headerResult(resultHeader(0));
        }

        return headerResult();
      });

      await expect(rotate()).rejects.toThrow();

      expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
      expect(mockConnection.commit).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    it("rolls back and releases the connection on a database failure", async () => {
      const databaseError = new Error("Simulated database failure");

      configureSqlMocks(async () => {
        throw databaseError;
      });

      await expect(rotate()).rejects.toThrow("Simulated database failure");

      expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
      expect(mockConnection.commit).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });
  });
});
