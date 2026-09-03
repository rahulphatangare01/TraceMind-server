import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { pool } from "../../../../database/connection.js";

import type {
  Organization,
  UpdateOrganizationInput,
} from "../../models/index.js";

import type { OrganizationStatus } from "../../enums/index.js";

import type { IOrganizationRepository } from "../interfaces/index.js";

export class OrganizationMySQLRepository implements IOrganizationRepository {
  async create(data: Organization): Promise<Organization> {
    const query = `
      INSERT INTO organizations (
        id,
        name,
        display_name,
        code,
        slug,
        type,
        status,
        timezone,
        country_code,
        settings,
        created_at,
        updated_at,
        deleted_at,
          created_by,
            updated_by,
            deleted_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(query, [
      data.id,
      data.name,
      data.displayName ?? null,
      data.code,
      data.slug,
      data.type,
      data.status,
      data.timezone ?? null,
      data.countryCode ?? null,
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

  async findById(organizationId: string): Promise<Organization | null> {
    const query = `
      SELECT
        id,
        name,
        display_name AS displayName,
        code,
        slug,
        type,
        status,
        timezone,
        country_code AS countryCode,
        settings,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy
      FROM organizations
      WHERE id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [organizationId]);

    return rows.length > 0 ? (rows[0] as Organization) : null;
  }

  async findByCode(code: string): Promise<Organization | null> {
    const query = `
      SELECT
        id,
        name,
        display_name AS displayName,
        code,
        slug,
        type,
        status,
        timezone,
        country_code AS countryCode,
        settings,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy
      FROM organizations
      WHERE code = ?
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [code]);

    return rows.length > 0 ? (rows[0] as Organization) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const query = `
      SELECT
        id,
        name,
        display_name AS displayName,
        code,
        slug,
        type,
        status,
        timezone,
        country_code AS countryCode,
        settings,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy
      FROM organizations
      WHERE slug = ?
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [slug]);

    return rows.length > 0 ? (rows[0] as Organization) : null;
  }

  async findAll(): Promise<Organization[]> {
    const query = `
      SELECT
        id,
        name,
        display_name AS displayName,
        code,
        slug,
        type,
        status,
        timezone,
        country_code AS countryCode,
        settings,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt,
        created_by AS createdBy,
        updated_by AS updatedBy,
        deleted_by AS deletedBy
      FROM organizations
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query);

    return rows as Organization[];
  }

  async update(
    organizationId: string,
    data: UpdateOrganizationInput,
  ): Promise<Organization | null> {
    const fields: string[] = [];

    const values: (string | number | boolean | null | Date)[] = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }

    if (data.displayName !== undefined) {
      fields.push("display_name = ?");
      values.push(data.displayName);
    }

    if (data.timezone !== undefined) {
      fields.push("timezone = ?");
      values.push(data.timezone);
    }

    if (data.countryCode !== undefined) {
      fields.push("country_code = ?");
      values.push(data.countryCode);
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
      return this.findById(organizationId);
    }

    values.push(organizationId);

    const query = `
    UPDATE organizations
    SET ${fields.join(", ")}
    WHERE id = ?
      AND deleted_at IS NULL
  `;

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(organizationId);
  }

  async updateStatus(
    organizationId: string,
    status: OrganizationStatus,
  ): Promise<Organization | null> {
    const query = `
      UPDATE organizations
      SET status = ?
      WHERE id = ?
        AND deleted_at IS NULL
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      status,
      organizationId,
    ]);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(organizationId);
  }

  async softDelete(
    organizationId: string,
    deletedBy?: string,
  ): Promise<boolean> {
    const query = `
      UPDATE organizations
      SET
        deleted_at = CURRENT_TIMESTAMP(3),
        deleted_by = ?
      WHERE id = ?
        AND deleted_at IS NULL
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      deletedBy ?? null,
      organizationId,
    ]);

    return result.affectedRows > 0;
  }

  async restore(
    organizationId: string,
    restoredBy?: string,
  ): Promise<Organization | null> {
    const query = `
      UPDATE organizations
      SET
        deleted_at = NULL,
        deleted_by = NULL,
        updated_by = ?
      WHERE id = ?
        AND deleted_at IS NOT NULL
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      restoredBy ?? null,
      organizationId,
    ]);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(organizationId);
  }
}
