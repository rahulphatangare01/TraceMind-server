CREATE TABLE applications (
    id CHAR(36) NOT NULL,

    organization_id CHAR(36) NOT NULL,
    project_id CHAR(36) NOT NULL,

    name VARCHAR(150) NOT NULL,
    display_name VARCHAR(150) NULL,

    code VARCHAR(50) NOT NULL,
    slug VARCHAR(150) NOT NULL,

    type VARCHAR(50) NOT NULL,

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
     * Required for Environment composite foreign key.
     */
    CONSTRAINT uq_applications_hierarchy
        UNIQUE (
            id,
            project_id,
            organization_id
        ),

    /*
     * Application identity inside a project.
     */
    CONSTRAINT uq_applications_project_code
        UNIQUE (
            project_id,
            code
        ),

    CONSTRAINT uq_applications_project_slug
        UNIQUE (
            project_id,
            slug
        ),

    /*
     * Ensures project belongs to the same organization.
     */
    CONSTRAINT fk_applications_project_organization
        FOREIGN KEY (
            project_id,
            organization_id
        )
        REFERENCES projects (
            id,
            organization_id
        )
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    INDEX idx_applications_organization_id (
        organization_id
    ),

    INDEX idx_applications_project_id (
        project_id
    ),

    INDEX idx_applications_organization_project (
        organization_id,
        project_id
    ),

    INDEX idx_applications_organization_status (
        organization_id,
        status
    ),

    INDEX idx_applications_organization_project_status (
        organization_id,
        project_id,
        status
    ),

    INDEX idx_applications_organization_deleted_at (
        organization_id,
        deleted_at
    )

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;