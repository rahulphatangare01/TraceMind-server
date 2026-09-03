CREATE TABLE organizations (
    id CHAR(36) NOT NULL,

    name VARCHAR(150) NOT NULL,
    display_name VARCHAR(150) NULL,

    code VARCHAR(50) NOT NULL,
    slug VARCHAR(150) NOT NULL,

    type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,

    timezone VARCHAR(100) NULL,
    country_code CHAR(2) NULL,

    settings JSON NULL,

    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),

    deleted_at DATETIME(3) NULL,

    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    deleted_by CHAR(36) NULL,

    PRIMARY KEY (id),

    CONSTRAINT uq_organizations_code
        UNIQUE (code),

    CONSTRAINT uq_organizations_slug
        UNIQUE (slug),

    INDEX idx_organizations_status (status),

    INDEX idx_organizations_deleted_at (deleted_at),

    INDEX idx_organizations_created_at (created_at)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;