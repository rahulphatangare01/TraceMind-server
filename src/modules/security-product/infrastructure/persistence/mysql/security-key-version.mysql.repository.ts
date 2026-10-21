import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { pool } from "../../../../../database/connection.js";
import { SecurityScope } from "../../../../security-core/public-api.js";

import type { SecurityKeyVersionPersistenceRecord } from "../../../domain/models/security-key-version-persistence.model.js";
import type { SecurityKeyVersionRepositoryPort } from "../../../application/interfaces/security-key-version.repository.port.js";
import type { SecurityResourceScope } from "../../../application/interfaces/security-resource-scope.port.js";

type SecurityKeyVersionRow = RowDataPacket & {
  id: string;
  keyId: string;
  version: number;
  purpose: string;
  status: string;
  providerKeyReference: string;
  createdAt: Date | string;
  activatedAt: Date | string | null;
  rotatedAt: Date | string | null;
  disabledAt: Date | string | null;
  destroyedAt: Date | string | null;
};

const toDate = (value: Date | string): Date =>
  value instanceof Date ? value : new Date(value);

const toNullableDate = (value: Date | string | null): Date | null =>
  value === null ? null : toDate(value);

const mapRow = (
  row: SecurityKeyVersionRow,
): SecurityKeyVersionPersistenceRecord => ({
  id: row.id,
  keyId: row.keyId,
  version: Number(row.version),
  purpose: row.purpose as SecurityKeyVersionPersistenceRecord["purpose"],
  status: row.status as SecurityKeyVersionPersistenceRecord["status"],
  providerKeyReference: row.providerKeyReference,
  createdAt: toDate(row.createdAt),
  activatedAt: toNullableDate(row.activatedAt),
  rotatedAt: toNullableDate(row.rotatedAt),
  disabledAt: toNullableDate(row.disabledAt),
  destroyedAt: toNullableDate(row.destroyedAt),
});

const buildScopePredicate = (
  scope: SecurityResourceScope,
): { sql: string; values: string[] } => {
  switch (scope.scope) {
    case SecurityScope.ORGANIZATION:
      return {
        sql: `
          k.scope = ?
          AND k.organization_id = ?
          AND k.project_id IS NULL
          AND k.application_id IS NULL
          AND k.environment_id IS NULL
        `,
        values: [scope.scope, scope.organizationId],
      };

    case SecurityScope.PROJECT:
      return {
        sql: `
          k.scope = ?
          AND k.organization_id = ?
          AND k.project_id = ?
          AND k.application_id IS NULL
          AND k.environment_id IS NULL
        `,
        values: [scope.scope, scope.organizationId, scope.projectId],
      };

    case SecurityScope.APPLICATION:
      return {
        sql: `
          k.scope = ?
          AND k.organization_id = ?
          AND k.project_id = ?
          AND k.application_id = ?
          AND k.environment_id IS NULL
        `,
        values: [
          scope.scope,
          scope.organizationId,
          scope.projectId,
          scope.applicationId,
        ],
      };

    case SecurityScope.ENVIRONMENT:
      return {
        sql: `
          k.scope = ?
          AND k.organization_id = ?
          AND k.project_id = ?
          AND k.application_id = ?
          AND k.environment_id = ?
        `,
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

const SELECT_COLUMNS = `
  v.id,
  v.key_id AS keyId,
  v.version,
  v.purpose,
  v.status,
  v.provider_key_reference AS providerKeyReference,
  v.created_at AS createdAt,
  v.activated_at AS activatedAt,
  v.rotated_at AS rotatedAt,
  v.disabled_at AS disabledAt,
  v.destroyed_at AS destroyedAt
`;

export class SecurityKeyVersionMySQLRepository implements SecurityKeyVersionRepositoryPort {
  async create(
    scope: SecurityResourceScope,
    record: SecurityKeyVersionPersistenceRecord,
  ): Promise<SecurityKeyVersionPersistenceRecord> {
    const predicate = buildScopePredicate(scope);

    const [parentRows] = await pool.execute<RowDataPacket[]>(
      `
        SELECT k.id
        FROM security_keys k
        WHERE ${predicate.sql}
          AND k.id = ?
          AND k.deleted_at IS NULL
        LIMIT 1
      `,
      [...predicate.values, record.keyId],
    );

    if (parentRows.length === 0) {
      throw new Error(
        "Security key was not found within the supplied tenant scope.",
      );
    }

    await pool.execute<ResultSetHeader>(
      `
        INSERT INTO security_key_versions (
          id,
          key_id,
          version,
          purpose,
          status,
          provider_key_reference,
          created_at,
          activated_at,
          rotated_at,
          disabled_at,
          destroyed_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        record.id,
        record.keyId,
        record.version,
        record.purpose,
        record.status,
        record.providerKeyReference,
        record.createdAt,
        record.activatedAt,
        record.rotatedAt,
        record.disabledAt,
        record.destroyedAt,
      ],
    );

    const created = await this.findByKeyAndVersion(
      scope,
      record.keyId,
      record.version,
    );

    if (!created) {
      throw new Error(
        "Key version was inserted but could not be retrieved in its supplied scope.",
      );
    }

    return created;
  }

  async findByKeyAndVersion(
    scope: SecurityResourceScope,
    keyId: string,
    version: number,
  ): Promise<SecurityKeyVersionPersistenceRecord | null> {
    const predicate = buildScopePredicate(scope);

    const [rows] = await pool.execute<SecurityKeyVersionRow[]>(
      `
        SELECT ${SELECT_COLUMNS}
        FROM security_key_versions v
        INNER JOIN security_keys k ON k.id = v.key_id
        WHERE ${predicate.sql}
          AND k.id = ?
          AND k.deleted_at IS NULL
          AND v.version = ?
        LIMIT 1
      `,
      [...predicate.values, keyId, version],
    );

    return rows.length > 0 ? mapRow(rows[0]) : null;
  }

  async findActiveByKeyId(
    scope: SecurityResourceScope,
    keyId: string,
  ): Promise<SecurityKeyVersionPersistenceRecord | null> {
    const predicate = buildScopePredicate(scope);

    const [rows] = await pool.execute<SecurityKeyVersionRow[]>(
      `
        SELECT ${SELECT_COLUMNS}
        FROM security_key_versions v
        INNER JOIN security_keys k ON k.id = v.key_id
        WHERE ${predicate.sql}
          AND k.id = ?
          AND k.deleted_at IS NULL
          AND v.status = ?
        LIMIT 1
      `,
      [...predicate.values, keyId, "ACTIVE"],
    );

    return rows.length > 0 ? mapRow(rows[0]) : null;
  }

  async findAllByKeyId(
    scope: SecurityResourceScope,
    keyId: string,
  ): Promise<SecurityKeyVersionPersistenceRecord[]> {
    const predicate = buildScopePredicate(scope);

    const [rows] = await pool.execute<SecurityKeyVersionRow[]>(
      `
        SELECT ${SELECT_COLUMNS}
        FROM security_key_versions v
        INNER JOIN security_keys k ON k.id = v.key_id
        WHERE ${predicate.sql}
          AND k.id = ?
          AND k.deleted_at IS NULL
        ORDER BY v.version DESC
      `,
      [...predicate.values, keyId],
    );

    return rows.map(mapRow);
  }

  async update(
    scope: SecurityResourceScope,
    keyId: string,
    version: number,
    changes: Partial<
      Pick<
        SecurityKeyVersionPersistenceRecord,
        "status" | "activatedAt" | "rotatedAt" | "disabledAt" | "destroyedAt"
      >
    >,
  ): Promise<SecurityKeyVersionPersistenceRecord | null> {
    const fields: string[] = [];
    const values: (string | Date | null)[] = [];

    if (changes.status !== undefined) {
      fields.push("v.status = ?");
      values.push(changes.status);
    }

    if (changes.activatedAt !== undefined) {
      fields.push("v.activated_at = ?");
      values.push(changes.activatedAt);
    }

    if (changes.rotatedAt !== undefined) {
      fields.push("v.rotated_at = ?");
      values.push(changes.rotatedAt);
    }

    if (changes.disabledAt !== undefined) {
      fields.push("v.disabled_at = ?");
      values.push(changes.disabledAt);
    }

    if (changes.destroyedAt !== undefined) {
      fields.push("v.destroyed_at = ?");
      values.push(changes.destroyedAt);
    }

    if (fields.length === 0) {
      return this.findByKeyAndVersion(scope, keyId, version);
    }

    const predicate = buildScopePredicate(scope);

    await pool.execute<ResultSetHeader>(
      `
        UPDATE security_key_versions v
        INNER JOIN security_keys k ON k.id = v.key_id
        SET ${fields.join(", ")}
        WHERE ${predicate.sql}
          AND k.id = ?
          AND k.deleted_at IS NULL
          AND v.version = ?
      `,
      [...values, ...predicate.values, keyId, version],
    );

    return this.findByKeyAndVersion(scope, keyId, version);
  }
}
