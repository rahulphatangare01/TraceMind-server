CREATE TABLE projects (
    id CHAR(36) NOT NULL,

    organization_id CHAR(36) NOT NULL,

    name VARCHAR(150) NOT NULL,
    display_name VARCHAR(150) NULL,

    code VARCHAR(50) NOT NULL,
    slug VARCHAR(150) NOT NULL,

    description VARCHAR(1000) NULL,

    status VARCHAR(30) NOT NULL,

    settings JSON NULL,

    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),

    deleted_at DATETIME(3) NULL,

    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    deleted_by CHAR(36) NULL,

    PRIMARY KEY (id),

    /*
     * Required for composite foreign keys.
     */
    CONSTRAINT uq_projects_id_organization
        UNIQUE (id, organization_id),

    /*
     * Resource identity within an organization.
     */
    CONSTRAINT uq_projects_organization_code
        UNIQUE (organization_id, code),

    CONSTRAINT uq_projects_organization_slug
        UNIQUE (organization_id, slug),

    CONSTRAINT fk_projects_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations (id)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    INDEX idx_projects_organization_id (organization_id),

    INDEX idx_projects_organization_status (
        organization_id,
        status
    ),

    INDEX idx_projects_organization_deleted_at (
        organization_id,
        deleted_at
    ),

    INDEX idx_projects_organization_created_at (
        organization_id,
        created_at
    )

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;