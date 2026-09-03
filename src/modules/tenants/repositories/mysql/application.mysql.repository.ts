import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../../../database/connection.js";

import type {
  Application,
  UpdateApplicationInput,
} from "../../models/index.js";

import type { ApplicationStatus } from "../../enums/index.js";
import type { IApplicationRepository } from "../interfaces/index.js";

export class ApplicationMySQLRepository implements IApplicationRepository {
  async create(data: Application): Promise<Application> {
    const query = `
      INSERT INTO applications (
        id, organization_id, project_id, name, display_name,
        code, slug, type, description, status, settings,
        created_at, updated_at, deleted_at,
        created_by, updated_by, deleted_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(query, [
      data.id,
      data.organizationId,
      data.projectId,
      data.name,
      data.displayName ?? null,
      data.code,
      data.slug,
      data.type,
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
    applicationId: string,
  ): Promise<Application | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT
        id,
        organization_id AS organizationId,
        project_id AS projectId,
        name,
        display_name AS displayName,
        code,
        slug,
        type,
        description,
        status,
        settings,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy
      FROM applications
      WHERE id = ?
        AND project_id = ?
        AND organization_id = ?
        AND deleted_at IS NULL
      LIMIT 1
      `,
      [applicationId, projectId, organizationId],
    );

    return rows.length ? (rows[0] as Application) : null;
  }

  async findByCode(
    organizationId: string,
    projectId: string,
    code: string,
  ): Promise<Application | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT
        id,
        organization_id AS organizationId,
        project_id AS projectId,
        name,
        display_name AS displayName,
        code,
        slug,
        type,
        description,
        status,
        settings,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy
      FROM applications
      WHERE organization_id = ?
        AND project_id = ?
        AND code = ?
        AND deleted_at IS NULL
      LIMIT 1
      `,
      [organizationId, projectId, code],
    );

    return rows.length ? (rows[0] as Application) : null;
  }

  async findBySlug(
    organizationId: string,
    projectId: string,
    slug: string,
  ): Promise<Application | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT
        id,
        organization_id AS organizationId,
        project_id AS projectId,
        name,
        display_name AS displayName,
        code,
        slug,
        type,
        description,
        status,
        settings,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy
      FROM applications
      WHERE organization_id = ?
        AND project_id = ?
        AND slug = ?
        AND deleted_at IS NULL
      LIMIT 1
      `,
      [organizationId, projectId, slug],
    );

    return rows.length ? (rows[0] as Application) : null;
  }

  async findAllByProject(
    organizationId: string,
    projectId: string,
  ): Promise<Application[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT
        id,
        organization_id AS organizationId,
        project_id AS projectId,
        name,
        display_name AS displayName,
        code,
        slug,
        type,
        description,
        status,
        settings,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy
      FROM applications
      WHERE organization_id = ?
        AND project_id = ?
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      `,
      [organizationId, projectId],
    );

    return rows as Application[];
  }

  async update(
    organizationId: string,
    projectId: string,
    applicationId: string,
    data: UpdateApplicationInput,
  ): Promise<Application | null> {
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

    if (data.type !== undefined) {
      fields.push("type = ?");
      values.push(data.type);
    }

    if (data.settings !== undefined) {
      fields.push("settings = ?");
      values.push(JSON.stringify(data.settings));
    }

    if (data.updatedBy !== undefined) {
      fields.push("updated_by = ?");
      values.push(data.updatedBy);
    }

    if (!fields.length) {
      return this.findById(organizationId, projectId, applicationId);
    }

    values.push(applicationId, projectId, organizationId);

    const [result] = await pool.execute<ResultSetHeader>(
      `
      UPDATE applications
      SET ${fields.join(", ")}
      WHERE id = ?
        AND project_id = ?
        AND organization_id = ?
        AND deleted_at IS NULL
      `,
      values,
    );

    if (!result.affectedRows) {
      return null;
    }

    return this.findById(organizationId, projectId, applicationId);
  }

  async updateStatus(
    organizationId: string,
    projectId: string,
    applicationId: string,
    status: ApplicationStatus,
  ): Promise<Application | null> {
    const [result] = await pool.execute<ResultSetHeader>(
      `
      UPDATE applications
      SET status = ?
      WHERE id = ?
        AND project_id = ?
        AND organization_id = ?
        AND deleted_at IS NULL
      `,
      [status, applicationId, projectId, organizationId],
    );

    if (!result.affectedRows) {
      return null;
    }

    return this.findById(organizationId, projectId, applicationId);
  }

  async softDelete(
    organizationId: string,
    projectId: string,
    applicationId: string,
    deletedBy?: string,
  ): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `
      UPDATE applications
      SET
        deleted_at = CURRENT_TIMESTAMP(3),
        deleted_by = ?
      WHERE id = ?
        AND project_id = ?
        AND organization_id = ?
        AND deleted_at IS NULL
      `,
      [deletedBy ?? null, applicationId, projectId, organizationId],
    );

    return result.affectedRows > 0;
  }

  async restore(
    organizationId: string,
    projectId: string,
    applicationId: string,
    restoredBy?: string,
  ): Promise<Application | null> {
    const [result] = await pool.execute<ResultSetHeader>(
      `
      UPDATE applications
      SET
        deleted_at = NULL,
        deleted_by = NULL,
        updated_by = ?
      WHERE id = ?
        AND project_id = ?
        AND organization_id = ?
        AND deleted_at IS NOT NULL
      `,
      [restoredBy ?? null, applicationId, projectId, organizationId],
    );

    if (!result.affectedRows) {
      return null;
    }

    return this.findById(organizationId, projectId, applicationId);
  }
}
