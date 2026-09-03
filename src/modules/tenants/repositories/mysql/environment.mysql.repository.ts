import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { pool } from "../../../../database/connection.js";

import type {
  Environment,
  UpdateEnvironmentInput,
} from "../../models/index.js";

import type { EnvironmentStatus } from "../../enums/index.js";

import type { IEnvironmentRepository } from "../interfaces/index.js";

export class EnvironmentMySQLRepository implements IEnvironmentRepository {
  async create(data: Environment): Promise<Environment> {
    const query = `
      INSERT INTO environments (
        id,
        organization_id,
        project_id,
        application_id,
        name,
        slug,
        type,
        description,
        status,
        settings,
        created_by,
        updated_by,
        deleted_by,
        created_at,
        updated_at,
        deleted_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(query, [
      data.id,
      data.organizationId,
      data.projectId,
      data.applicationId,
      data.name,
      data.slug,
      data.type,
      data.description ?? null,
      data.status,
      data.settings !== null ? JSON.stringify(data.settings) : null,
      data.createdBy ?? null,
      data.updatedBy ?? null,
      data.deletedBy ?? null,
      data.createdAt,
      data.updatedAt,
      data.deletedAt ?? null,
    ]);

    return data;
  }

  async findById(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
  ): Promise<Environment | null> {
    const query = `
      SELECT
        id,
        organization_id AS organizationId,
        project_id AS projectId,
        application_id AS applicationId,
        name,
        slug,
        type,
        description,
        status,
        settings,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt
      FROM environments
      WHERE id = ?
        AND organization_id = ?
        AND project_id = ?
        AND application_id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [
      environmentId,
      organizationId,
      projectId,
      applicationId,
    ]);

    return rows.length > 0 ? (rows[0] as Environment) : null;
  }

  async findBySlug(
    organizationId: string,
    projectId: string,
    applicationId: string,
    slug: string,
  ): Promise<Environment | null> {
    const query = `
      SELECT
        id,
        organization_id AS organizationId,
        project_id AS projectId,
        application_id AS applicationId,
        name,
        slug,
        type,
        description,
        status,
        settings,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt
      FROM environments
      WHERE organization_id = ?
        AND project_id = ?
        AND application_id = ?
        AND slug = ?
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [
      organizationId,
      projectId,
      applicationId,
      slug,
    ]);

    return rows.length > 0 ? (rows[0] as Environment) : null;
  }

  async findAllByApplication(
    organizationId: string,
    projectId: string,
    applicationId: string,
  ): Promise<Environment[]> {
    const query = `
      SELECT
        id,
        organization_id AS organizationId,
        project_id AS projectId,
        application_id AS applicationId,
        name,
        slug,
        type,
        description,
        status,
        settings,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt
      FROM environments
      WHERE organization_id = ?
        AND project_id = ?
        AND application_id = ?
        AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [
      organizationId,
      projectId,
      applicationId,
    ]);

    return rows as Environment[];
  }

  async update(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
    data: UpdateEnvironmentInput,
  ): Promise<Environment | null> {
    const fields: string[] = [];

    const values: (string | number | boolean | null | Date)[] = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }

    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }

    if (data.type !== undefined) {
      fields.push("type = ?");
      values.push(data.type);
    }

    if (data.settings !== undefined) {
      fields.push("settings = ?");
      values.push(
        data.settings === null ? null : JSON.stringify(data.settings),
      );
    }

    if (data.updatedBy !== undefined) {
      fields.push("updated_by = ?");
      values.push(data.updatedBy);
    }

    if (fields.length === 0) {
      return this.findById(
        organizationId,
        projectId,
        applicationId,
        environmentId,
      );
    }

    values.push(environmentId, organizationId, projectId, applicationId);

    const query = `
      UPDATE environments
      SET ${fields.join(", ")}
      WHERE id = ?
        AND organization_id = ?
        AND project_id = ?
        AND application_id = ?
        AND deleted_at IS NULL
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(
      organizationId,
      projectId,
      applicationId,
      environmentId,
    );
  }

  async updateStatus(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
    status: EnvironmentStatus,
  ): Promise<Environment | null> {
    const query = `
      UPDATE environments
      SET status = ?
      WHERE id = ?
        AND organization_id = ?
        AND project_id = ?
        AND application_id = ?
        AND deleted_at IS NULL
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      status,
      environmentId,
      organizationId,
      projectId,
      applicationId,
    ]);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(
      organizationId,
      projectId,
      applicationId,
      environmentId,
    );
  }

  async softDelete(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
    deletedBy?: string,
  ): Promise<boolean> {
    const query = `
      UPDATE environments
      SET
        deleted_at = CURRENT_TIMESTAMP(3),
        deleted_by = ?,
        updated_by = ?
      WHERE id = ?
        AND organization_id = ?
        AND project_id = ?
        AND application_id = ?
        AND deleted_at IS NULL
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      deletedBy ?? null,
      deletedBy ?? null,
      environmentId,
      organizationId,
      projectId,
      applicationId,
    ]);

    return result.affectedRows > 0;
  }

  async restore(
    organizationId: string,
    projectId: string,
    applicationId: string,
    environmentId: string,
    restoredBy?: string,
  ): Promise<Environment | null> {
    const query = `
      UPDATE environments
      SET
        deleted_at = NULL,
        deleted_by = NULL,
        updated_by = ?
      WHERE id = ?
        AND organization_id = ?
        AND project_id = ?
        AND application_id = ?
        AND deleted_at IS NOT NULL
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      restoredBy ?? null,
      environmentId,
      organizationId,
      projectId,
      applicationId,
    ]);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(
      organizationId,
      projectId,
      applicationId,
      environmentId,
    );
  }
}
