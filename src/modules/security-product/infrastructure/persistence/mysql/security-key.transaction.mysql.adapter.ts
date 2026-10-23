import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import { pool } from "../../../../../database/connection.js";
import { SecurityScope } from "../../../../security-core/public-api.js";

import type { SecurityKeyTransactionPort } from "../../../application/interfaces/security-key-transaction.port.js";
import type { SecurityResourceScope } from "../../../application/interfaces/security-resource-scope.port.js";
import type { SecurityKeyPersistenceRecord } from "../../../domain/models/security-key-persistence.model.js";
import type { SecurityKeyVersionPersistenceRecord } from "../../../domain/models/security-key-version-persistence.model.js";

const buildScopePredicate = (
  scope: SecurityResourceScope,
  alias = "k",
): { sql: string; values: string[] } => {
  switch (scope.scope) {
    case SecurityScope.ORGANIZATION:
      return {
        sql: `${alias}.scope = ? AND ${alias}.organization_id = ? AND ${alias}.project_id IS NULL AND ${alias}.application_id IS NULL AND ${alias}.environment_id IS NULL`,
        values: [scope.scope, scope.organizationId],
      };

    case SecurityScope.PROJECT:
      return {
        sql: `${alias}.scope = ? AND ${alias}.organization_id = ? AND ${alias}.project_id = ? AND ${alias}.application_id IS NULL AND ${alias}.environment_id IS NULL`,
        values: [scope.scope, scope.organizationId, scope.projectId],
      };

    case SecurityScope.APPLICATION:
      return {
        sql: `${alias}.scope = ? AND ${alias}.organization_id = ? AND ${alias}.project_id = ? AND ${alias}.application_id = ? AND ${alias}.environment_id IS NULL`,
        values: [
          scope.scope,
          scope.organizationId,
          scope.projectId,
          scope.applicationId,
        ],
      };

    case SecurityScope.ENVIRONMENT:
      return {
        sql: `${alias}.scope = ? AND ${alias}.organization_id = ? AND ${alias}.project_id = ? AND ${alias}.application_id = ? AND ${alias}.environment_id = ?`,
        values: [
          scope.scope,
          scope.organizationId,
          scope.projectId,
          scope.applicationId,
          scope.environmentId,
        ],
      };
  }
};

const insertKey = async (
  connection: PoolConnection,
  key: SecurityKeyPersistenceRecord,
): Promise<void> => {
  await connection.execute(
    `
      INSERT INTO security_keys (
        id, purpose, scope, organization_id, project_id,
        application_id, environment_id, provider, status,
        current_version, created_at, updated_at, deleted_at,
        created_by, updated_by, deleted_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      key.id,
      key.purpose,
      key.scope,
      key.organizationId,
      key.projectId,
      key.applicationId,
      key.environmentId,
      key.provider,
      key.status,
      key.currentVersion,
      key.createdAt,
      key.updatedAt,
      key.deletedAt,
      key.createdBy,
      key.updatedBy,
      key.deletedBy,
    ],
  );
};

const insertVersion = async (
  connection: PoolConnection,
  version: SecurityKeyVersionPersistenceRecord,
): Promise<void> => {
  await connection.execute(
    `
      INSERT INTO security_key_versions (
        id, key_id, version, purpose, status, provider_key_reference,
        created_at, activated_at, rotated_at, disabled_at, destroyed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      version.id,
      version.keyId,
      version.version,
      version.purpose,
      version.status,
      version.providerKeyReference,
      version.createdAt,
      version.activatedAt,
      version.rotatedAt,
      version.disabledAt,
      version.destroyedAt,
    ],
  );
};

export class SecurityKeyTransactionMySQLAdapter implements SecurityKeyTransactionPort {
  async createKeyWithInitialVersion(
    scope: SecurityResourceScope,
    key: SecurityKeyPersistenceRecord,
    initialVersion: SecurityKeyVersionPersistenceRecord,
  ): Promise<void> {
    const predicate = buildScopePredicate(scope);

    const matchesScope =
      key.scope === scope.scope &&
      key.organizationId === scope.organizationId &&
      ("projectId" in scope
        ? key.projectId === scope.projectId
        : key.projectId === null) &&
      ("applicationId" in scope
        ? key.applicationId === scope.applicationId
        : key.applicationId === null) &&
      ("environmentId" in scope
        ? key.environmentId === scope.environmentId
        : key.environmentId === null);

    if (!matchesScope) {
      throw new Error("Security key does not match the supplied scope.");
    }

    if (
      initialVersion.keyId !== key.id ||
      initialVersion.version !== key.currentVersion
    ) {
      throw new Error(
        "Initial key version must match the key ID and current version.",
      );
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // The INSERT is constrained by the validated scope and the database
      // hierarchy constraints. Validate tenant ownership before persistence.
      const [scopeRows] = await connection.execute<RowDataPacket[]>(
        `
          SELECT id
          FROM security_keys
          WHERE ${predicate.sql}
            AND id = ?
          LIMIT 1
          FOR UPDATE
        `,
        [...predicate.values, key.id],
      );

      if (scopeRows.length > 0) {
        throw new Error("Security key already exists in the supplied scope.");
      }

      await insertKey(connection, key);
      await insertVersion(connection, initialVersion);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async rotateKeyWithVersion(
    scope: SecurityResourceScope,
    keyId: string,
    expectedCurrentVersion: number,
    previousVersion: SecurityKeyVersionPersistenceRecord,
    nextVersion: SecurityKeyVersionPersistenceRecord,
    updatedAt: Date,
    updatedBy?: string | null,
  ): Promise<boolean> {
    // if (
    //   previousVersion.keyId !== keyId ||
    //   nextVersion.keyId !== keyId ||
    //   previousVersion.version !== expectedCurrentVersion ||
    //   nextVersion.version !== expectedCurrentVersion + 1
    // ) {
    //   throw new Error("Key rotation version sequence is invalid.");
    // }
    if (
      previousVersion.keyId !== keyId ||
      nextVersion.keyId !== keyId ||
      previousVersion.version !== expectedCurrentVersion ||
      nextVersion.version !== expectedCurrentVersion + 1
    ) {
      throw new Error("Key rotation version sequence is invalid.");
    }

    if (
      previousVersion.status !== "DECRYPT_ONLY" ||
      nextVersion.status !== "ACTIVE"
    ) {
      throw new Error("Key rotation lifecycle states are invalid.");
    }
    const predicate = buildScopePredicate(scope);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [keyRows] = await connection.execute<RowDataPacket[]>(
        `
          SELECT id, current_version AS currentVersion
          FROM security_keys k
          WHERE ${predicate.sql}
            AND k.id = ?
            AND k.deleted_at IS NULL
          LIMIT 1
          FOR UPDATE
        `,
        [...predicate.values, keyId],
      );

      if (
        keyRows.length === 0 ||
        Number(keyRows[0].currentVersion) !== expectedCurrentVersion
      ) {
        await connection.rollback();
        return false;
      }

      // const [versionRows] = await connection.execute<RowDataPacket[]>(
      //   `
      //     SELECT id, key_id AS keyId, version, status
      //     FROM security_key_versions
      //     WHERE key_id = ? AND version = ?
      //     LIMIT 1
      //     FOR UPDATE
      //   `,
      //   [keyId, expectedCurrentVersion],
      // );
      const [versionRows] = await connection.execute<RowDataPacket[]>(
        `
    SELECT
      v.id,
      v.key_id AS keyId,
      v.version,
      v.status
    FROM security_key_versions v
    INNER JOIN security_keys k ON k.id = v.key_id
    WHERE ${predicate.sql}
      AND k.id = ?
      AND k.deleted_at IS NULL
      AND v.version = ?
    LIMIT 1
    FOR UPDATE
  `,
        [...predicate.values, keyId, expectedCurrentVersion],
      );
      if (versionRows.length === 0 || versionRows[0].status !== "ACTIVE") {
        throw new Error("The current key version is missing or is not ACTIVE.");
      }

      const [previousUpdate] = await connection.execute<ResultSetHeader>(
        `
          UPDATE security_key_versions
          SET status = ?, rotated_at = ?
          WHERE key_id = ?
            AND version = ?
            AND status = ?
        `,
        // [
        //   previousVersion.status,
        //   previousVersion.rotatedAt ?? updatedAt,
        //   keyId,
        //   expectedCurrentVersion,
        //   "ACTIVE",
        // ],
        [
          "DECRYPT_ONLY",
          previousVersion.rotatedAt ?? updatedAt,
          keyId,
          expectedCurrentVersion,
          "ACTIVE",
        ],
      );

      if (previousUpdate.affectedRows !== 1) {
        throw new Error("Failed to transition the previous key version.");
      }

      await insertVersion(connection, nextVersion);

      const [keyUpdate] = await connection.execute<ResultSetHeader>(
        `
          UPDATE security_keys k
          SET current_version = ?,
              updated_at = ?,
              updated_by = ?
          WHERE ${predicate.sql}
            AND k.id = ?
            AND k.current_version = ?
            AND k.deleted_at IS NULL
        `,
        [
          nextVersion.version,
          updatedAt,
          updatedBy ?? null,
          ...predicate.values,
          keyId,
          expectedCurrentVersion,
        ],
      );

      if (keyUpdate.affectedRows !== 1) {
        throw new Error("Failed to update the current key version.");
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
