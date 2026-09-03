CREATE TABLE environments (
    id CHAR(36) NOT NULL,

    organization_id CHAR(36) NOT NULL,
    project_id CHAR(36) NOT NULL,
    application_id CHAR(36) NOT NULL,

    name VARCHAR(150) NOT NULL,
    display_name VARCHAR(150) NULL,

    slug VARCHAR(150) NOT NULL,

    type VARCHAR(50) NOT NULL,
    custom_type VARCHAR(100) NULL,

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
     * Environment identity inside an application.
     */
    CONSTRAINT uq_environments_application_slug
        UNIQUE (
            application_id,
            slug
        ),

    /*
     * Ensures the Application belongs to the same
     * Project and Organization.
     */
    CONSTRAINT fk_environments_application_hierarchy
        FOREIGN KEY (
            application_id,
            project_id,
            organization_id
        )
        REFERENCES applications (
            id,
            project_id,
            organization_id
        )
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    INDEX idx_environments_organization_id (
        organization_id
    ),

    INDEX idx_environments_project_id (
        project_id
    ),

    INDEX idx_environments_application_id (
        application_id
    ),

    INDEX idx_environments_tenant_hierarchy (
        organization_id,
        project_id,
        application_id
    ),

    INDEX idx_environments_organization_status (
        organization_id,
        status
    ),

    INDEX idx_environments_application_status (
        application_id,
        status
    ),

    INDEX idx_environments_organization_application_status (
        organization_id,
        application_id,
        status
    ),

    INDEX idx_environments_organization_deleted_at (
        organization_id,
        deleted_at
    )

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;