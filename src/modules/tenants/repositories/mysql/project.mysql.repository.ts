import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { pool } from "../../../../database/connection.js";

import type { Project, UpdateProjectInput } from "../../models/index.js";

import type { ProjectStatus } from "../../enums/index.js";

import type { IProjectRepository } from "../interfaces/index.js";

export class ProjectMySQLRepository implements IProjectRepository {
  async create(data: Project): Promise<Project> {
    const query = `
      INSERT INTO projects (
        id,
        organization_id,
        name,
        display_name,
        code,
        slug,
        description,
        status,
        settings,
        created_at,
        updated_at,
        deleted_at,
         created_by,
             updated_by,
            deleted_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)
    `;

    await pool.execute(query, [
      data.id,
      data.organizationId,
      data.name,
      data.displayName ?? null,
      data.code,
      data.slug,
      data.description ?? null,
      data.status,
      data.settings ? JSON.stringify(data.settings) : null,
      data.createdAt,
      data.updatedAt,
      data.deletedAt ?? null,
      data.createdBy ?? null,
      data.updatedBy ?? null,
      data.deletedBy ?? null,
    ]);

    return data;
  }

  async findById(
    organizationId: string,
    projectId: string,
  ): Promise<Project | null> {
    const query = `
      SELECT
        id,
        organization_id AS organizationId,
        name,
        display_name AS displayName,
        code,
        slug,
        description,
        status,
        settings,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy
      FROM projects
      WHERE id = ?
        AND organization_id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [
      projectId,
      organizationId,
    ]);

    return rows.length > 0 ? (rows[0] as Project) : null;
  }

  async findByCode(
    organizationId: string,
    code: string,
  ): Promise<Project | null> {
    const query = `
      SELECT
        id,
        organization_id AS organizationId,
        name,
        display_name AS displayName,
        code,
        slug,
        description,
        status,
        settings,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy
      FROM projects
      WHERE organization_id = ?
        AND code = ?
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [
      organizationId,
      code,
    ]);

    return rows.length > 0 ? (rows[0] as Project) : null;
  }

  async findBySlug(
    organizationId: string,
    slug: string,
  ): Promise<Project | null> {
    const query = `
      SELECT
        id,
        organization_id AS organizationId,
        name,
        display_name AS displayName,
        code,
        slug,
        description,
        status,
        settings,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy
      FROM projects
      WHERE organization_id = ?
        AND slug = ?
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [
      organizationId,
      slug,
    ]);

    return rows.length > 0 ? (rows[0] as Project) : null;
  }

  async findAllByOrganization(organizationId: string): Promise<Project[]> {
    const query = `
      SELECT
        id,
        organization_id AS organizationId,
        name,
        display_name AS displayName,
        code,
        slug,
        description,
        status,
        settings,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy
      FROM projects
      WHERE organization_id = ?
        AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [organizationId]);

    return rows as Project[];
  }

  async update(
    organizationId: string,
    projectId: string,
    data: UpdateProjectInput,
  ): Promise<Project | null> {
    const fields: string[] = [];
    // const values: unknown[] = [];
    const values: (string | number | boolean | null | Date)[] = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }

    if (data.displayName !== undefined) {
      fields.push("display_name = ?");
      values.push(data.displayName);
    }

    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }

    if (data.settings !== undefined) {
      fields.push("settings = ?");
      values.push(JSON.stringify(data.settings));
    }

    if (data.updatedBy !== undefined) {
      fields.push("updated_by = ?");
      values.push(data.updatedBy);
    }

    if (fields.length === 0) {
      return this.findById(organizationId, projectId);
    }

    values.push(projectId, organizationId);

    const query = `
      UPDATE projects
      SET ${fields.join(", ")}
      WHERE id = ?
        AND organization_id = ?
        AND deleted_at IS NULL
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(organizationId, projectId);
  }

  async updateStatus(
    organizationId: string,
    projectId: string,
    status: ProjectStatus,
  ): Promise<Project | null> {
    const query = `
      UPDATE projects
      SET status = ?
      WHERE id = ?
        AND organization_id = ?
        AND deleted_at IS NULL
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      status,
      projectId,
      organizationId,
    ]);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(organizationId, projectId);
  }

  async softDelete(
    organizationId: string,
    projectId: string,
    deletedBy?: string,
  ): Promise<boolean> {
    const query = `
      UPDATE projects
      SET
        deleted_at = CURRENT_TIMESTAMP(3),
        deleted_by = ?
      WHERE id = ?
        AND organization_id = ?
        AND deleted_at IS NULL
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      deletedBy ?? null,
      projectId,
      organizationId,
    ]);

    return result.affectedRows > 0;
  }

  async restore(
    organizationId: string,
    projectId: string,
    restoredBy?: string,
  ): Promise<Project | null> {
    const query = `
      UPDATE projects
      SET
        deleted_at = NULL,
        deleted_by = NULL,
        updated_by = ?
      WHERE id = ?
        AND organization_id = ?
        AND deleted_at IS NOT NULL
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      restoredBy ?? null,
      projectId,
      organizationId,
    ]);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(organizationId, projectId);
  }
}
