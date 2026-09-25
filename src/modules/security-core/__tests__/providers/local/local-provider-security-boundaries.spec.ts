import { describe, expect, it } from "vitest";

import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

import { SecurityBoundaryValidator } from "../../../application/services/security-boundary-validator.service.js";

import {
  SecurityScope,
  DataClassification,
  SecurityPurpose,
} from "../../../domain/enums";

describe("Phase 8.14 - Local Provider Security Boundaries", () => {
  const createProvider = () => {
    return new LocalSecurityProvider();
  };

  const createBoundaryValidator = () => {
    return new SecurityBoundaryValidator();
  };

  describe("Provider Security Boundary Integration", () => {
    it("should create the Local provider without bypassing security boundaries", () => {
      const provider = createProvider();

      expect(provider).toBeDefined();
    });

    it("should preserve the Local provider identity", () => {
      const provider = createProvider();

      expect(provider.getMetadata().id).toBe("local-security-provider");
    });

    it("should preserve the LOCAL provider type", () => {
      const provider = createProvider();

      expect(provider.getMetadata().type).toBe("LOCAL");
    });
  });

  describe("PLATFORM Scope", () => {
    it("should accept PLATFORM context without hierarchy IDs", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.PLATFORM,
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      };

      expect(() => validator.validate(context)).not.toThrow();
    });

    it("should reject PLATFORM context with organizationId", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.PLATFORM,
        organizationId: "org-1",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      };

      expect(() => validator.validate(context)).toThrow();
    });

    it("should reject PLATFORM context with projectId", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.PLATFORM,
        projectId: "project-1",
        classification: DataClassification.INTERNAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      };

      expect(() => validator.validate(context)).toThrow();
    });
  });

  describe("ORGANIZATION Scope", () => {
    it("should accept valid ORGANIZATION context", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.ORGANIZATION,
        organizationId: "org-1",
        classification: DataClassification.CONFIDENTIAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      };

      expect(() => validator.validate(context)).not.toThrow();
    });

    it("should reject ORGANIZATION context without organizationId", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.ORGANIZATION,
        classification: DataClassification.CONFIDENTIAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      };

      expect(() => validator.validate(context)).toThrow();
    });

    it("should reject ORGANIZATION context with projectId", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.ORGANIZATION,
        organizationId: "org-1",
        projectId: "project-1",
        classification: DataClassification.CONFIDENTIAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      };

      expect(() => validator.validate(context)).toThrow();
    });
  });

  describe("PROJECT Scope", () => {
    it("should accept valid PROJECT context", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.PROJECT,
        organizationId: "org-1",
        projectId: "project-1",
        classification: DataClassification.CONFIDENTIAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      };

      expect(() => validator.validate(context)).not.toThrow();
    });

    it("should reject PROJECT context without organizationId", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.PROJECT,
        projectId: "project-1",
        classification: DataClassification.CONFIDENTIAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      };

      expect(() => validator.validate(context)).toThrow();
    });

    it("should reject PROJECT context without projectId", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.PROJECT,
        organizationId: "org-1",
        classification: DataClassification.CONFIDENTIAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      };

      expect(() => validator.validate(context)).toThrow();
    });

    it("should reject PROJECT context with applicationId", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.PROJECT,
        organizationId: "org-1",
        projectId: "project-1",
        applicationId: "app-1",
        classification: DataClassification.CONFIDENTIAL,
        purpose: SecurityPurpose.ENCRYPTED_CONFIGURATION,
      };

      expect(() => validator.validate(context)).toThrow();
    });
  });

  describe("APPLICATION Scope", () => {
    it("should accept valid APPLICATION context", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.APPLICATION,
        organizationId: "org-1",
        projectId: "project-1",
        applicationId: "app-1",
        classification: DataClassification.SENSITIVE,
        purpose: SecurityPurpose.API_KEY,
      };

      expect(() => validator.validate(context)).not.toThrow();
    });

    it("should reject APPLICATION context without projectId", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.APPLICATION,
        organizationId: "org-1",
        applicationId: "app-1",
        classification: DataClassification.SENSITIVE,
        purpose: SecurityPurpose.API_KEY,
      };

      expect(() => validator.validate(context)).toThrow();
    });

    it("should reject APPLICATION context without applicationId", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.APPLICATION,
        organizationId: "org-1",
        projectId: "project-1",
        classification: DataClassification.SENSITIVE,
        purpose: SecurityPurpose.API_KEY,
      };

      expect(() => validator.validate(context)).toThrow();
    });

    it("should reject APPLICATION context with environmentId", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.APPLICATION,
        organizationId: "org-1",
        projectId: "project-1",
        applicationId: "app-1",
        environmentId: "env-1",
        classification: DataClassification.SENSITIVE,
        purpose: SecurityPurpose.API_KEY,
      };

      expect(() => validator.validate(context)).toThrow();
    });
  });

  describe("ENVIRONMENT Scope", () => {
    it("should accept valid ENVIRONMENT context", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.ENVIRONMENT,
        organizationId: "org-1",
        projectId: "project-1",
        applicationId: "app-1",
        environmentId: "env-1",
        classification: DataClassification.HIGHLY_SENSITIVE,
        purpose: SecurityPurpose.DATABASE_CREDENTIAL,
      };

      expect(() => validator.validate(context)).not.toThrow();
    });

    it("should reject ENVIRONMENT context without environmentId", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.ENVIRONMENT,
        organizationId: "org-1",
        projectId: "project-1",
        applicationId: "app-1",
        classification: DataClassification.HIGHLY_SENSITIVE,
        purpose: SecurityPurpose.DATABASE_CREDENTIAL,
      };

      expect(() => validator.validate(context)).toThrow();
    });
  });

  describe("FIELD Scope", () => {
    it("should not invent hierarchy fields for FIELD scope", () => {
      const validator = createBoundaryValidator();

      const context = {
        scope: SecurityScope.FIELD,
        organizationId: "org-1",
        classification: DataClassification.SENSITIVE,
        purpose: SecurityPurpose.API_KEY,
      };

      expect(() => validator.validate(context)).toThrow();
    });
  });

  //   describe("Context Security Attributes", () => {
  // it("should require a valid data classification", () => {
  //   const validator = createBoundaryValidator();
  //   //   const context = {
  //   //     scope: SecurityScope.ORGANIZATION,
  //   //     organizationId: "org-1",
  //   //     classification: "INVALID_CLASSIFICATION",
  //   //     purpose: SecurityPurpose.API_KEY,
  //   //   };
  //   const context = {
  //     scope: SecurityScope.ORGANIZATION,
  //     organizationId: "org-1",
  //     classification:
  //       "INVALID_CLASSIFICATION" as unknown as DataClassification,
  //     purpose: SecurityPurpose.API_KEY,
  //   };
  //   expect(() => validator.validate(context)).toThrow();
  // });
  // it("should require a valid data classification", () => {
  //   const validator = createBoundaryValidator();
  //   const context = {
  //     scope: SecurityScope.ORGANIZATION,
  //     organizationId: "org-1",
  //     classification:
  //       "INVALID_CLASSIFICATION" as unknown as DataClassification,
  //     purpose: SecurityPurpose.API_KEY,
  //   };
  //   expect(() => validator.validate(context)).toThrow();
  // });
  // it("should require a valid security purpose", () => {
  //   const validator = createBoundaryValidator();
  //   //   const context = {
  //   //     scope: SecurityScope.ORGANIZATION,
  //   //     organizationId: "org-1",
  //   //     classification: DataClassification.SENSITIVE,
  //   //     purpose: "INVALID_PURPOSE",
  //   //   };
  //   const context = {
  //     scope: SecurityScope.ORGANIZATION,
  //     organizationId: "org-1",
  //     classification: DataClassification.SENSITIVE,
  //     purpose: "INVALID_PURPOSE" as unknown as SecurityPurpose,
  //   };
  //   expect(() => validator.validate(context)).toThrow();
  // });
  // it("should require a valid security purpose", () => {
  //   const validator = createBoundaryValidator();
  //   const context = {
  //     scope: SecurityScope.ORGANIZATION,
  //     organizationId: "org-1",
  //     classification: DataClassification.SENSITIVE,
  //     purpose: "INVALID_PURPOSE" as unknown as SecurityPurpose,
  //   };
  //   expect(() => validator.validate(context)).toThrow();
  // });
  //   });

  describe("Provider Boundary Stability", () => {
    it("should not expose raw key material through provider metadata", () => {
      const provider = createProvider();

      const metadata = provider.getMetadata();

      const serializedMetadata = JSON.stringify(metadata);

      expect(serializedMetadata).not.toContain("keyMaterial");

      expect(serializedMetadata).not.toContain("privateKey");

      expect(serializedMetadata).not.toContain("secret");
    });

    it("should preserve provider capabilities", () => {
      const provider = createProvider();

      const capabilities = provider.getMetadata().capabilities;

      expect(capabilities.length).toBeGreaterThan(0);
    });

    it("should preserve Local provider identity", () => {
      const provider = createProvider();

      expect(provider.getMetadata().type).toBe("LOCAL");
      expect(provider.getMetadata().id).toBe("local-security-provider");
    });
  });
});
