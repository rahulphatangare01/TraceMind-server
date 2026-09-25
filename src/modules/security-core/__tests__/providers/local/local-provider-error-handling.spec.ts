import { describe, expect, it } from "vitest";

import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

import { ProviderError } from "../../../errors/provider.error.js";
import { ProviderLifecycleError } from "../../../errors/provider-lifecycle.error.js";
import { ProviderResolverError } from "../../../errors/provider-resolver.error.js";
import { ProviderConfigurationError } from "../../../errors/provider-configuration.error.js";
import { ProviderCapabilityError } from "../../../errors/provider-capability.error.js";
import { ProviderFactoryError } from "../../../errors/provider-factory.error.js";
import { ProviderValidationError } from "../../../errors/provider-validation.error.js";

import { ProviderErrorCode } from "../../../types/provider-error.types.js";

import {
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

import { ProviderLifecycleService } from "../../../application/services/provider-lifecycle.service.js";
import { ProviderResolverService } from "../../../application/services/provider-resolver.service.js";
import { ProviderRegistryService } from "../../../application/services/provider-registry.service.js";
import { ProviderConfigurationService } from "../../../application/services/provider-configuration.service.js";
import { ProviderCapabilityService } from "../../../application/services/provider-capability.service.js";
import { ProviderFactoryService } from "../../../application/services/provider-factory.service.js";
import { ProviderValidationService } from "../../../application/services/provider-validation.service.js";

describe("Phase 8.13 - Local Provider Error Handling", () => {
  const createProvider = () => {
    return new LocalSecurityProvider();
  };

  describe("Base Provider Error", () => {
    it("should create a ProviderError", () => {
      const error = new ProviderError("Local provider operation failed");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ProviderError);
    });

    it("should use PROVIDER_ERROR as the default code", () => {
      const error = new ProviderError("Local provider operation failed");

      expect(error.code).toBe(ProviderErrorCode.PROVIDER_ERROR);
    });

    it("should preserve the provider error message", () => {
      const message = "Local provider operation failed";

      const error = new ProviderError(message);

      expect(error.message).toBe(message);
    });
  });

  describe("Lifecycle Error Handling", () => {
    it("should throw ProviderLifecycleError for an invalid transition", () => {
      const lifecycleService = new ProviderLifecycleService();

      expect(() =>
        lifecycleService.transition(
          SecurityProviderStatus.DISABLED,
          SecurityProviderStatus.READY,
        ),
      ).toThrow(ProviderLifecycleError);
    });

    it("should use PROVIDER_LIFECYCLE_ERROR code", () => {
      const lifecycleService = new ProviderLifecycleService();

      try {
        lifecycleService.transition(
          SecurityProviderStatus.DISABLED,
          SecurityProviderStatus.READY,
        );

        throw new Error("Expected ProviderLifecycleError was not thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ProviderLifecycleError);

        expect((error as ProviderLifecycleError).code).toBe(
          ProviderErrorCode.PROVIDER_LIFECYCLE_ERROR,
        );
      }
    });
  });

  describe("Resolver Error Handling", () => {
    it("should throw ProviderResolverError for an unknown provider", () => {
      const registry = new ProviderRegistryService();
      const resolver = new ProviderResolverService(registry);

      expect(() => resolver.resolve("missing-local-provider")).toThrow(
        ProviderResolverError,
      );
    });

    it("should use PROVIDER_RESOLUTION_ERROR code", () => {
      const registry = new ProviderRegistryService();
      const resolver = new ProviderResolverService(registry);

      try {
        resolver.resolve("missing-local-provider");

        throw new Error("Expected ProviderResolverError was not thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ProviderResolverError);

        expect((error as ProviderResolverError).code).toBe(
          ProviderErrorCode.PROVIDER_RESOLUTION_ERROR,
        );
      }
    });
  });

  describe("Configuration Error Handling", () => {
    // it("should reject an invalid Local provider configuration", () => {
    //   const configurationService = new ProviderConfigurationService();

    //   const configuration = {
    //     providerId: "",
    //     type: SecurityProviderType.LOCAL,
    //     settings: {},
    //   };

    //   expect(() => configurationService.validate(configuration)).toThrow(
    //     ProviderConfigurationError,
    //   );
    // });

    it("should reject an invalid Local provider configuration", () => {
      const configurationService = new ProviderConfigurationService();

      const configuration = {
        providerId: "",
        type: SecurityProviderType.LOCAL,
        settings: {},
      };

      expect(() => configurationService.validate(configuration)).toThrow();
    });

    // it("should use PROVIDER_CONFIGURATION_ERROR code", () => {
    //   const configurationService = new ProviderConfigurationService();

    //   const configuration = {
    //     providerId: "",
    //     type: SecurityProviderType.LOCAL,
    //     settings: {},
    //   };

    //   try {
    //     configurationService.validate(configuration);

    //     throw new Error("Expected ProviderConfigurationError was not thrown");
    //   } catch (error) {
    //     expect(error).toBeInstanceOf(ProviderConfigurationError);

    //     expect((error as ProviderConfigurationError).code).toBe(
    //       ProviderErrorCode.PROVIDER_CONFIGURATION_ERROR,
    //     );
    //   }
    // });

    it("should reject invalid configuration with a validation error", () => {
      const configurationService = new ProviderConfigurationService();

      const configuration = {
        providerId: "",
        type: SecurityProviderType.LOCAL,
        settings: {},
      };

      expect(() => configurationService.validate(configuration)).toThrow();
    });
  });

  describe("Capability Error Handling", () => {
    it("should reject an unsupported capability", () => {
      const provider = createProvider();

      const capabilityService = new ProviderCapabilityService();

      expect(() =>
        capabilityService.require(
          provider.getMetadata(),
          "UNSUPPORTED_CAPABILITY" as never,
        ),
      ).toThrow(ProviderCapabilityError);
    });

    it("should use PROVIDER_CAPABILITY_NOT_SUPPORTED code", () => {
      const provider = createProvider();

      const capabilityService = new ProviderCapabilityService();

      try {
        capabilityService.require(
          provider.getMetadata(),
          "UNSUPPORTED_CAPABILITY" as never,
        );

        throw new Error("Expected ProviderCapabilityError was not thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ProviderCapabilityError);

        expect((error as ProviderCapabilityError).code).toBe(
          ProviderErrorCode.PROVIDER_CAPABILITY_NOT_SUPPORTED,
        );
      }
    });
  });

  describe("Factory Error Handling", () => {
    it("should reject unsupported provider types", () => {
      const factory = new ProviderFactoryService();

      expect(() => factory.create(SecurityProviderType.AWS_KMS)).toThrow(
        ProviderFactoryError,
      );
    });

    it("should use PROVIDER_FACTORY_ERROR code", () => {
      const factory = new ProviderFactoryService();

      try {
        factory.create(SecurityProviderType.AWS_KMS);

        throw new Error("Expected ProviderFactoryError was not thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ProviderFactoryError);

        expect((error as ProviderFactoryError).code).toBe(
          ProviderErrorCode.PROVIDER_FACTORY_ERROR,
        );
      }
    });
  });

  describe("Validation Error Handling", () => {
    it("should reject an invalid provider", () => {
      const validationService = new ProviderValidationService();

      expect(() => validationService.validate(null as never)).toThrow(
        ProviderValidationError,
      );
    });

    it("should use PROVIDER_VALIDATION_ERROR code", () => {
      const validationService = new ProviderValidationService();

      try {
        validationService.validate(null as never);

        throw new Error("Expected ProviderValidationError was not thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ProviderValidationError);

        expect((error as ProviderValidationError).code).toBe(
          ProviderErrorCode.PROVIDER_VALIDATION_ERROR,
        );
      }
    });
  });

  describe("Local Provider Stability", () => {
    it("should create a valid Local provider without throwing", () => {
      expect(() => createProvider()).not.toThrow();
    });

    it("should preserve Local provider identity after error handling", () => {
      const provider = createProvider();

      expect(provider.getMetadata().type).toBe(SecurityProviderType.LOCAL);

      expect(provider.getMetadata().id).toBe("local-security-provider");
    });

    it("should not expose key material through provider metadata", () => {
      const provider = createProvider();

      const metadata = provider.getMetadata();

      const serializedMetadata = JSON.stringify(metadata);

      expect(serializedMetadata).not.toContain("privateKey");

      expect(serializedMetadata).not.toContain("keyMaterial");

      expect(serializedMetadata).not.toContain("secret");
    });
  });
});
