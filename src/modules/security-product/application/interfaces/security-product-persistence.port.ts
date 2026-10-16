import type { SecurityResourceScope } from "./security-resource-scope.port.js";

/**
 * Generic contract for a tenant-scoped Security Product repository.
 *
 * Resource-specific repositories can specialize this contract with
 * their own domain entity, create input, and update input types.
 *
 * No SQL, MySQL pool, database row, or ORM type is exposed here.
 */
export interface SecurityProductPersistencePort<
  TEntity,
  TCreateInput,
  TUpdateInput,
> {
  /**
   * Finds a resource within the complete supplied tenant scope.
   *
   * Returns null when no matching, non-deleted resource exists.
   * Implementations must apply the scope to the database query;
   * checking ownership only after an unscoped lookup is insufficient.
   */
  findById(
    scope: SecurityResourceScope,
    resourceId: string,
  ): Promise<TEntity | null>;

  /**
   * Persists a new resource within the supplied scope.
   *
   * Implementations must reject scope/entity mismatches and rely
   * on database constraints where available to enforce hierarchy.
   */
  create(scope: SecurityResourceScope, input: TCreateInput): Promise<TEntity>;

  /**
   * Updates a resource only when it belongs to the supplied scope.
   *
   * Returns null if the scoped resource does not exist.
   */
  update(
    scope: SecurityResourceScope,
    resourceId: string,
    input: TUpdateInput,
  ): Promise<TEntity | null>;

  /**
   * Soft-deletes a resource within the supplied scope.
   *
   * Returns false if no matching resource was changed.
   * Implementations must not physically delete data through this
   * generic operation.
   */
  softDelete(
    scope: SecurityResourceScope,
    resourceId: string,
    deletedBy?: string,
  ): Promise<boolean>;
}
