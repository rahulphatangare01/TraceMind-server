import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { pool } from "../../../../../database/connection.js";
import { SecurityScope } from "../../../../security-core/public-api.js";

import type { SecurityKeyPersistenceRecord } from "../../../domain/models/security-key-persistence.model.js";
import type {
  SecurityKeyRepositoryPort,
  UpdateSecurityKeyPersistenceInput,
} from "../../../application/interfaces/security-key.repository.port.js";
import type { SecurityResourceScope } from "../../../application/interfaces/security-resource-scope.port.js";

type SecurityKeyRow = RowDataPacket & {
  id: string;
  purpose: string;
  scope: string;
  organizationId: string;
  projectId: string | null;
  applicationId: string | null;
  environmentId: string | null;
  provider: string;
  status: string;
  currentVersion: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
};

interface ScopePredicate {
  sql: string;
  values: string[];
}

const toDate = (value: Date | string): Date =>
  value instanceof Date ? value : new Date(value);

const toNullableDate = (value: Date | string | null): Date | null =>
  value === null ? null : toDate(value);

const mapRow = (row: SecurityKeyRow): SecurityKeyPersistenceRecord => ({
  id: row.id,
  purpose: row.purpose as SecurityKeyPersistenceRecord["purpose"],
  scope: row.scope as SecurityKeyPersistenceRecord["scope"],
  organizationId: row.organizationId,
  projectId: row.projectId,
  applicationId: row.applicationId,
  environmentId: row.environmentId,
  provider: row.provider,
  status: row.status as SecurityKeyPersistenceRecord["status"],
  currentVersion: Number(row.currentVersion),
  createdAt: toDate(row.createdAt),
  updatedAt: toDate(row.updatedAt),
  deletedAt: toNullableDate(row.deletedAt),
  createdBy: row.createdBy,
  updatedBy: row.updatedBy,
  deletedBy: row.deletedBy,
});

const buildScopePredicate = (scope: SecurityResourceScope): ScopePredicate => {
  switch (scope.scope) {
    case SecurityScope.ORGANIZATION:
      return {
        sql: `
          scope = ?
          AND organization_id = ?
          AND project_id IS NULL
          AND application_id IS NULL
          AND environment_id IS NULL
        `,
        values: [scope.scope, scope.organizationId],
      };

    case SecurityScope.PROJECT:
      return {
        sql: `
          scope = ?
          AND organization_id = ?
          AND project_id = ?
          AND application_id IS NULL
          AND environment_id IS NULL
        `,
        values: [scope.scope, scope.organizationId, scope.projectId],
      };

    case SecurityScope.APPLICATION:
      return {
        sql: `
          scope = ?
          AND organization_id = ?
          AND project_id = ?
          AND application_id = ?
          AND environment_id IS NULL
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
          scope = ?
          AND organization_id = ?
          AND project_id = ?
          AND application_id = ?
          AND environment_id = ?
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

const assertScopeMatchesRecord = (
  scope: SecurityResourceScope,
  record: SecurityKeyPersistenceRecord,
): void => {
  const matches =
    scope.scope === record.scope &&
    scope.organizationId === record.organizationId &&
    ("projectId" in scope
      ? scope.projectId === record.projectId
      : record.projectId === null) &&
    ("applicationId" in scope
      ? scope.applicationId === record.applicationId
      : record.applicationId === null) &&
    ("environmentId" in scope
      ? scope.environmentId === record.environmentId
      : record.environmentId === null);

  if (!matches) {
    throw new Error(
      "Security key scope does not match the persistence record.",
    );
  }
};

const SELECT_COLUMNS = `
  id,
  purpose,
  scope,
  organization_id AS organizationId,
  project_id AS projectId,
  application_id AS applicationId,
  environment_id AS environmentId,
  provider,
  status,
  current_version AS currentVersion,
  created_at AS createdAt,
  updated_at AS updatedAt,
  deleted_at AS deletedAt,
  created_by AS createdBy,
  updated_by AS updatedBy,
  deleted_by AS deletedBy
`;

export class SecurityKeyMySQLRepository implements SecurityKeyRepositoryPort {
  async findById(
    scope: SecurityResourceScope,
    resourceId: string,
  ): Promise<SecurityKeyPersistenceRecord | null> {
    const predicate = buildScopePredicate(scope);

    const [rows] = await pool.execute<SecurityKeyRow[]>(
      `
        SELECT ${SELECT_COLUMNS}
        FROM security_keys
        WHERE ${predicate.sql}
          AND id = ?
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [...predicate.values, resourceId],
    );

    return rows.length > 0 ? mapRow(rows[0]) : null;
  }

  async create(
    scope: SecurityResourceScope,
    input: SecurityKeyPersistenceRecord,
  ): Promise<SecurityKeyPersistenceRecord> {
    assertScopeMatchesRecord(scope, input);

    if (input.deletedAt !== null) {
      throw new Error("A new security key cannot be created as soft-deleted.");
    }

    await pool.execute<ResultSetHeader>(
      `
        INSERT INTO security_keys (
          id,
          purpose,
          scope,
          organization_id,
          project_id,
          application_id,
          environment_id,
          provider,
          status,
          current_version,
          created_at,
          updated_at,
          deleted_at,
          created_by,
          updated_by,
          deleted_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.id,
        input.purpose,
        input.scope,
        input.organizationId,
        input.projectId,
        input.applicationId,
        input.environmentId,
        input.provider,
        input.status,
        input.currentVersion,
        input.createdAt,
        input.updatedAt,
        input.deletedAt,
        input.createdBy,
        input.updatedBy,
        input.deletedBy,
      ],
    );

    const created = await this.findById(scope, input.id);

    if (!created) {
      throw new Error(
        "Security key was inserted but could not be retrieved in its supplied scope.",
      );
    }

    return created;
  }

  async update(
    scope: SecurityResourceScope,
    resourceId: string,
    input: UpdateSecurityKeyPersistenceInput,
  ): Promise<SecurityKeyPersistenceRecord | null> {
    const fields: string[] = [];
    const values: (string | Date | null)[] = [];

    if (input.provider !== undefined) {
      fields.push("provider = ?");
      values.push(input.provider);
    }

    if (input.status !== undefined) {
      fields.push("status = ?");
      values.push(input.status);
    }

    if (input.updatedAt !== undefined) {
      fields.push("updated_at = ?");
      values.push(input.updatedAt);
    }

    if (input.updatedBy !== undefined) {
      fields.push("updated_by = ?");
      values.push(input.updatedBy);
    }

    if (fields.length === 0) {
      return this.findById(scope, resourceId);
    }

    const predicate = buildScopePredicate(scope);

    await pool.execute<ResultSetHeader>(
      `
        UPDATE security_keys
        SET ${fields.join(", ")}
        WHERE ${predicate.sql}
          AND id = ?
          AND deleted_at IS NULL
      `,
      [...values, ...predicate.values, resourceId],
    );

    return this.findById(scope, resourceId);
  }

  async softDelete(
    scope: SecurityResourceScope,
    resourceId: string,
    deletedBy?: string,
  ): Promise<boolean> {
    const predicate = buildScopePredicate(scope);

    const [result] = await pool.execute<ResultSetHeader>(
      `
        UPDATE security_keys
        SET
          deleted_at = CURRENT_TIMESTAMP(3),
          deleted_by = ?,
          updated_at = CURRENT_TIMESTAMP(3)
        WHERE ${predicate.sql}
          AND id = ?
          AND deleted_at IS NULL
      `,
      [deletedBy ?? null, ...predicate.values, resourceId],
    );

    return result.affectedRows > 0;
  }
}
