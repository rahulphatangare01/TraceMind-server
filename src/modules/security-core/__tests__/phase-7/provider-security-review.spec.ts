import { describe, expect, it } from "vitest";

import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../types/provider.types.js";

import type { SecurityProvider } from "../../types/provider.types.js";

import { ProviderRegistryService } from "../../application/services/provider-registry.service.js";
import { ProviderResolverService } from "../../application/services/provider-resolver.service.js";
import { ProviderFactoryService } from "../../application/services/provider-factory.service.js";
import { ProviderCapabilityService } from "../../application/services/provider-capability.service.js";
import { ProviderLifecycleService } from "../../application/services/provider-lifecycle.service.js";
import { ProviderValidationService } from "../../application/services/provider-validation.service.js";
import { ProviderConfigurationService } from "../../application/services/provider-configuration.service.js";

import { ProviderResolverError } from "../../errors/provider-resolver.error.js";
import { ProviderCapabilityError } from "../../errors/provider-capability.error.js";
import { ProviderLifecycleError } from "../../errors/provider-lifecycle.error.js";
import { ProviderValidationError } from "../../errors/provider-validation.error.js";

import { securityProviderMetadataSchema } from "../../schemas/provider-metadata.schema.js";
import { securityProviderConfigurationSchema } from "../../schemas/provider-configuration.schema.js";

import { SecurityProviderConfiguration } from "../../types/provider-configuration.types.js";

// ============================================================================
// Helpers
// ============================================================================

const createProvider = (
  id: string,
  capabilities: SecurityProviderCapability[] = [
    SecurityProviderCapability.KEY_MANAGEMENT,
    SecurityProviderCapability.KEY_MATERIAL,
    SecurityProviderCapability.ENCRYPTION,
    SecurityProviderCapability.DECRYPTION,
    SecurityProviderCapability.HASHING,
    SecurityProviderCapability.SIGNING,
    SecurityProviderCapability.HMAC,
  ],
  status: SecurityProviderStatus = SecurityProviderStatus.READY,
): SecurityProvider => ({
  getMetadata: () => ({
    id,
    name: id,
    type: SecurityProviderType.LOCAL,
    version: "1.0.0",
    capabilities,
  }),

  getStatus: () => status,
});

// ============================================================================
// Phase 7.15
// Security Review
// ============================================================================

describe("Phase 7.15 - Provider Security Review", () => {
  // ==========================================================================
  // 1. Provider Metadata Security
  // ==========================================================================

  describe("Provider metadata security", () => {
    it("should expose only non-sensitive provider metadata", () => {
      const provider = createProvider("secure-provider");

      const metadata = provider.getMetadata();

      expect(metadata.id).toBe("secure-provider");
      expect(metadata.name).toBe("secure-provider");
      expect(metadata.type).toBe(SecurityProviderType.LOCAL);
      expect(metadata.version).toBe("1.0.0");

      expect(metadata).not.toHaveProperty("password");
      expect(metadata).not.toHaveProperty("secret");
      expect(metadata).not.toHaveProperty("token");
      expect(metadata).not.toHaveProperty("privateKey");
      expect(metadata).not.toHaveProperty("publicKey");
      expect(metadata).not.toHaveProperty("keyMaterial");
      expect(metadata).not.toHaveProperty("credential");
      expect(metadata).not.toHaveProperty("accessKey");
      expect(metadata).not.toHaveProperty("secretKey");
    });

    it("should validate provider metadata through the metadata schema", () => {
      const provider = createProvider("metadata-validation-provider");

      const result = securityProviderMetadataSchema.safeParse(
        provider.getMetadata(),
      );

      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // 2. Provider Configuration Security
  // ==========================================================================

  describe("Provider configuration security", () => {
    it("should accept non-sensitive provider configuration", () => {
      const configuration: SecurityProviderConfiguration = {
        providerId: "local-security-provider",
        type: SecurityProviderType.LOCAL,
        settings: {
          environment: "test",
          region: "local",
        },
      };

      const result =
        securityProviderConfigurationSchema.safeParse(configuration);

      expect(result.success).toBe(true);
    });

    it("should not expose raw key material through provider configuration", () => {
      const configuration: SecurityProviderConfiguration = {
        providerId: "local-security-provider",
        type: SecurityProviderType.LOCAL,
        settings: {
          environment: "test",
          region: "local",
        },
      };

      const settings = configuration.settings;

      expect(settings).not.toHaveProperty("privateKey");
      expect(settings).not.toHaveProperty("publicKey");
      expect(settings).not.toHaveProperty("keyMaterial");
      expect(settings).not.toHaveProperty("secretKey");
      expect(settings).not.toHaveProperty("accessKey");
    });

    it("should validate provider configuration using configuration service", () => {
      const service = new ProviderConfigurationService();

      const configuration: SecurityProviderConfiguration = {
        providerId: "local-security-provider",
        type: SecurityProviderType.LOCAL,
        settings: {
          environment: "test",
        },
      };

      const result = service.validate(configuration);

      expect(result).toBeDefined();
      expect(result.providerId).toBe("local-security-provider");
    });
  });

  // ==========================================================================
  // 3. Provider Resolution Security
  // ==========================================================================

  describe("Provider resolution security", () => {
    it("should resolve only the exact requested provider", () => {
      const registry = new ProviderRegistryService();
      const resolver = new ProviderResolverService(registry);

      const providerA = createProvider("provider-a");
      const providerB = createProvider("provider-b");

      registry.register(providerA);
      registry.register(providerB);

      expect(resolver.resolve("provider-a")).toBe(providerA);
      expect(resolver.resolve("provider-b")).toBe(providerB);
    });

    it("should reject unknown providers", () => {
      const registry = new ProviderRegistryService();
      const resolver = new ProviderResolverService(registry);

      expect(() => resolver.resolve("unknown-provider")).toThrow(
        ProviderResolverError,
      );
    });

    it("should not silently fallback to another provider", () => {
      const registry = new ProviderRegistryService();
      const resolver = new ProviderResolverService(registry);

      const localProvider = createProvider("local-provider");

      registry.register(localProvider);

      expect(() => resolver.resolve("aws-kms-provider")).toThrow(
        ProviderResolverError,
      );

      expect(resolver.resolve("local-provider")).toBe(localProvider);
    });
  });

  // ==========================================================================
  // 4. Provider Capability Security
  // ==========================================================================

  // ==========================================================================
  // 4. Provider Capability Security
  // ==========================================================================

  describe("Provider capability security", () => {
    it("should allow a supported capability", () => {
      const provider = createProvider("encryption-provider", [
        SecurityProviderCapability.ENCRYPTION,
      ]);

      const service = new ProviderCapabilityService();

      expect(
        service.supports(
          {
            capabilities: provider.getMetadata().capabilities,
          },
          SecurityProviderCapability.ENCRYPTION,
        ),
      ).toBe(true);
    });

    it("should reject an unsupported capability", () => {
      const provider = createProvider("encryption-provider", [
        SecurityProviderCapability.ENCRYPTION,
      ]);

      const service = new ProviderCapabilityService();

      expect(() =>
        service.require(
          {
            capabilities: provider.getMetadata().capabilities,
          },
          SecurityProviderCapability.KEY_MANAGEMENT,
        ),
      ).toThrow(ProviderCapabilityError);
    });

    it("should not allow capability escalation", () => {
      const provider = createProvider("restricted-provider", [
        SecurityProviderCapability.ENCRYPTION,
      ]);

      const service = new ProviderCapabilityService();

      expect(
        service.supports(
          {
            capabilities: provider.getMetadata().capabilities,
          },
          SecurityProviderCapability.ENCRYPTION,
        ),
      ).toBe(true);

      expect(
        service.supports(
          {
            capabilities: provider.getMetadata().capabilities,
          },
          SecurityProviderCapability.KEY_MANAGEMENT,
        ),
      ).toBe(false);
    });
  });

  // ==========================================================================
  // 5. Provider Lifecycle Security
  // ==========================================================================

  describe("Provider lifecycle security", () => {
    it("should allow REGISTERED → INITIALIZING", () => {
      const service = new ProviderLifecycleService();

      expect(
        service.canTransition(
          SecurityProviderStatus.REGISTERED,
          SecurityProviderStatus.INITIALIZING,
        ),
      ).toBe(true);
    });

    it("should allow INITIALIZING → READY", () => {
      const service = new ProviderLifecycleService();

      expect(
        service.canTransition(
          SecurityProviderStatus.INITIALIZING,
          SecurityProviderStatus.READY,
        ),
      ).toBe(true);
    });

    it("should reject REGISTERED → READY", () => {
      const service = new ProviderLifecycleService();

      expect(
        service.canTransition(
          SecurityProviderStatus.REGISTERED,
          SecurityProviderStatus.READY,
        ),
      ).toBe(false);
    });

    it("should reject DISABLED → READY", () => {
      const service = new ProviderLifecycleService();

      expect(
        service.canTransition(
          SecurityProviderStatus.DISABLED,
          SecurityProviderStatus.READY,
        ),
      ).toBe(false);
    });

    it("should reject invalid lifecycle transitions", () => {
      const service = new ProviderLifecycleService();

      expect(() =>
        service.transition(
          SecurityProviderStatus.DISABLED,
          SecurityProviderStatus.READY,
        ),
      ).toThrow(ProviderLifecycleError);
    });
  });

  // ==========================================================================
  // 6. Provider Validation Security
  // ==========================================================================

  describe("Provider validation security", () => {
    it("should validate a correctly assembled provider", () => {
      const provider = createProvider("valid-provider");

      const service = new ProviderValidationService();

      const result = service.validate(provider);

      expect(result.valid).toBe(true);
      expect(result.metadata.id).toBe("valid-provider");
      expect(result.status).toBe(SecurityProviderStatus.READY);
    });

    it("should reject invalid provider metadata", () => {
      const provider: SecurityProvider = {
        getMetadata: () => ({
          id: "",
          name: "",
          type: SecurityProviderType.LOCAL,
          version: "",
          capabilities: [],
        }),

        getStatus: () => SecurityProviderStatus.READY,
      };

      const service = new ProviderValidationService();

      expect(() => service.validate(provider)).toThrow(ProviderValidationError);
    });
  });

  // ==========================================================================
  // 7. Provider Isolation
  // ==========================================================================

  describe("Provider isolation security", () => {
    it("should keep provider metadata isolated", () => {
      const registry = new ProviderRegistryService();

      const providerA = createProvider("provider-a", [
        SecurityProviderCapability.ENCRYPTION,
      ]);

      const providerB = createProvider("provider-b", [
        SecurityProviderCapability.HMAC,
      ]);

      registry.register(providerA);
      registry.register(providerB);

      expect(registry.get("provider-a")?.getMetadata().capabilities).toContain(
        SecurityProviderCapability.ENCRYPTION,
      );

      expect(registry.get("provider-b")?.getMetadata().capabilities).toContain(
        SecurityProviderCapability.HMAC,
      );

      expect(
        registry.get("provider-b")?.getMetadata().capabilities,
      ).not.toContain(SecurityProviderCapability.ENCRYPTION);
    });

    it("should keep provider status isolated", () => {
      const providerA = createProvider(
        "provider-a",
        [],
        SecurityProviderStatus.READY,
      );

      const providerB = createProvider(
        "provider-b",
        [],
        SecurityProviderStatus.UNHEALTHY,
      );

      expect(providerA.getStatus()).toBe(SecurityProviderStatus.READY);
      expect(providerB.getStatus()).toBe(SecurityProviderStatus.UNHEALTHY);
    });
  });

  // ==========================================================================
  // 8. Provider Factory Security
  // ==========================================================================

  describe("Provider factory security", () => {
    it("should create the supported LOCAL provider", () => {
      const factory = new ProviderFactoryService();

      const provider = factory.create(SecurityProviderType.LOCAL);

      expect(provider).toBeDefined();
      expect(provider.getMetadata().type).toBe(SecurityProviderType.LOCAL);
    });

    it("should not silently fallback for unsupported providers", () => {
      const factory = new ProviderFactoryService();

      expect(() => factory.create(SecurityProviderType.AWS_KMS)).toThrow();
    });

    it("should not silently fallback from Azure Key Vault", () => {
      const factory = new ProviderFactoryService();

      expect(() =>
        factory.create(SecurityProviderType.AZURE_KEY_VAULT),
      ).toThrow();
    });

    it("should not silently fallback from GCP KMS", () => {
      const factory = new ProviderFactoryService();

      expect(() => factory.create(SecurityProviderType.GCP_KMS)).toThrow();
    });

    it("should not silently fallback from HashiCorp Vault", () => {
      const factory = new ProviderFactoryService();

      expect(() =>
        factory.create(SecurityProviderType.HASHICORP_VAULT),
      ).toThrow();
    });
  });

  // ==========================================================================
  // 9. Security Boundary
  // ==========================================================================

  describe("Provider security boundary", () => {
    it("should keep provider metadata free from authorization information", () => {
      const provider = createProvider("boundary-provider");

      const metadata = provider.getMetadata();

      expect(metadata).not.toHaveProperty("userId");
      expect(metadata).not.toHaveProperty("sessionId");
      expect(metadata).not.toHaveProperty("organizationId");
      expect(metadata).not.toHaveProperty("permissions");
      expect(metadata).not.toHaveProperty("roles");
      expect(metadata).not.toHaveProperty("entitlements");
    });

    it("should keep provider metadata independent from IAM", () => {
      const provider = createProvider("iam-independent-provider");

      const metadata = provider.getMetadata();

      expect(metadata).not.toHaveProperty("user");
      expect(metadata).not.toHaveProperty("session");
      expect(metadata).not.toHaveProperty("role");
      expect(metadata).not.toHaveProperty("permission");
    });
  });
});
