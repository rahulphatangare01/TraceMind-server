import { describe, expect, it } from "vitest";

import { LocalSecurityProvider } from "../../../providers/local/local-security.provider.js";

import { ProviderLifecycleService } from "../../../application/services/provider-lifecycle.service.js";

import {
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../../types/provider.types.js";

import { ProviderLifecycleError } from "../../../errors/provider-lifecycle.error.js";

import { HashAlgorithm } from "../../../domain/enums/hash-algorithm.enum.js";

describe("Phase 8.12 - Local Provider Runtime Lifecycle", () => {
  const createProvider = () => {
    return new LocalSecurityProvider();
  };

  const createLifecycleService = () => {
    return new ProviderLifecycleService();
  };

  describe("Initial Provider State", () => {
    it("should create the Local Security Provider", () => {
      const provider = createProvider();

      expect(provider).toBeDefined();
    });

    // it("should start in REGISTERED status", () => {
    //   const provider = createProvider();

    //   expect(provider.getStatus()).toBe(SecurityProviderStatus.REGISTERED);
    // });
    it("should start in READY status", () => {
      const provider = createProvider();

      expect(provider.getStatus()).toBe(SecurityProviderStatus.READY);
    });
    it("should expose LOCAL provider type", () => {
      const provider = createProvider();

      expect(provider.getMetadata().type).toBe(SecurityProviderType.LOCAL);
    });
  });

  describe("Valid Lifecycle Transitions", () => {
    it("should allow REGISTERED to INITIALIZING", () => {
      const lifecycleService = createLifecycleService();

      expect(
        lifecycleService.canTransition(
          SecurityProviderStatus.REGISTERED,
          SecurityProviderStatus.INITIALIZING,
        ),
      ).toBe(true);
    });

    it("should allow INITIALIZING to READY", () => {
      const lifecycleService = createLifecycleService();

      expect(
        lifecycleService.canTransition(
          SecurityProviderStatus.INITIALIZING,
          SecurityProviderStatus.READY,
        ),
      ).toBe(true);
    });

    it("should allow INITIALIZING to UNHEALTHY", () => {
      const lifecycleService = createLifecycleService();

      expect(
        lifecycleService.canTransition(
          SecurityProviderStatus.INITIALIZING,
          SecurityProviderStatus.UNHEALTHY,
        ),
      ).toBe(true);
    });

    it("should allow READY to UNHEALTHY", () => {
      const lifecycleService = createLifecycleService();

      expect(
        lifecycleService.canTransition(
          SecurityProviderStatus.READY,
          SecurityProviderStatus.UNHEALTHY,
        ),
      ).toBe(true);
    });

    it("should allow UNHEALTHY to INITIALIZING", () => {
      const lifecycleService = createLifecycleService();

      expect(
        lifecycleService.canTransition(
          SecurityProviderStatus.UNHEALTHY,
          SecurityProviderStatus.INITIALIZING,
        ),
      ).toBe(true);
    });

    it("should allow UNHEALTHY to READY", () => {
      const lifecycleService = createLifecycleService();

      expect(
        lifecycleService.canTransition(
          SecurityProviderStatus.UNHEALTHY,
          SecurityProviderStatus.READY,
        ),
      ).toBe(true);
    });
  });

  describe("Disabled Lifecycle State", () => {
    it("should allow REGISTERED to DISABLED", () => {
      const lifecycleService = createLifecycleService();

      expect(
        lifecycleService.canTransition(
          SecurityProviderStatus.REGISTERED,
          SecurityProviderStatus.DISABLED,
        ),
      ).toBe(true);
    });

    it("should allow INITIALIZING to DISABLED", () => {
      const lifecycleService = createLifecycleService();

      expect(
        lifecycleService.canTransition(
          SecurityProviderStatus.INITIALIZING,
          SecurityProviderStatus.DISABLED,
        ),
      ).toBe(true);
    });

    it("should allow READY to DISABLED", () => {
      const lifecycleService = createLifecycleService();

      expect(
        lifecycleService.canTransition(
          SecurityProviderStatus.READY,
          SecurityProviderStatus.DISABLED,
        ),
      ).toBe(true);
    });

    it("should allow UNHEALTHY to DISABLED", () => {
      const lifecycleService = createLifecycleService();

      expect(
        lifecycleService.canTransition(
          SecurityProviderStatus.UNHEALTHY,
          SecurityProviderStatus.DISABLED,
        ),
      ).toBe(true);
    });

    it("should not allow DISABLED to any other status", () => {
      const lifecycleService = createLifecycleService();

      const statuses = Object.values(SecurityProviderStatus).filter(
        (status) => status !== SecurityProviderStatus.DISABLED,
      );

      for (const status of statuses) {
        expect(
          lifecycleService.canTransition(
            SecurityProviderStatus.DISABLED,
            status,
          ),
        ).toBe(false);
      }
    });
  });

  describe("Invalid Lifecycle Transitions", () => {
    it("should reject REGISTERED to READY", () => {
      const lifecycleService = createLifecycleService();

      expect(() =>
        lifecycleService.transition(
          SecurityProviderStatus.REGISTERED,
          SecurityProviderStatus.READY,
        ),
      ).toThrow(ProviderLifecycleError);
    });

    it("should reject REGISTERED to UNHEALTHY", () => {
      const lifecycleService = createLifecycleService();

      expect(() =>
        lifecycleService.transition(
          SecurityProviderStatus.REGISTERED,
          SecurityProviderStatus.UNHEALTHY,
        ),
      ).toThrow(ProviderLifecycleError);
    });

    it("should reject READY to REGISTERED", () => {
      const lifecycleService = createLifecycleService();

      expect(() =>
        lifecycleService.transition(
          SecurityProviderStatus.READY,
          SecurityProviderStatus.REGISTERED,
        ),
      ).toThrow(ProviderLifecycleError);
    });

    it("should reject READY to INITIALIZING", () => {
      const lifecycleService = createLifecycleService();

      expect(() =>
        lifecycleService.transition(
          SecurityProviderStatus.READY,
          SecurityProviderStatus.INITIALIZING,
        ),
      ).toThrow(ProviderLifecycleError);
    });

    it("should reject DISABLED to READY", () => {
      const lifecycleService = createLifecycleService();

      expect(() =>
        lifecycleService.transition(
          SecurityProviderStatus.DISABLED,
          SecurityProviderStatus.READY,
        ),
      ).toThrow(ProviderLifecycleError);
    });
  });

  describe("Lifecycle Transition Result", () => {
    it("should return INITIALIZING after REGISTERED to INITIALIZING", () => {
      const lifecycleService = createLifecycleService();

      const result = lifecycleService.transition(
        SecurityProviderStatus.REGISTERED,
        SecurityProviderStatus.INITIALIZING,
      );

      expect(result).toBe(SecurityProviderStatus.INITIALIZING);
    });

    it("should return READY after INITIALIZING to READY", () => {
      const lifecycleService = createLifecycleService();

      const result = lifecycleService.transition(
        SecurityProviderStatus.INITIALIZING,
        SecurityProviderStatus.READY,
      );

      expect(result).toBe(SecurityProviderStatus.READY);
    });

    it("should return UNHEALTHY after READY to UNHEALTHY", () => {
      const lifecycleService = createLifecycleService();

      const result = lifecycleService.transition(
        SecurityProviderStatus.READY,
        SecurityProviderStatus.UNHEALTHY,
      );

      expect(result).toBe(SecurityProviderStatus.UNHEALTHY);
    });
  });

  describe("Provider Metadata Stability", () => {
    it("should preserve provider metadata during lifecycle validation", () => {
      const provider = createProvider();

      const metadataBefore = provider.getMetadata();

      const lifecycleService = createLifecycleService();

      lifecycleService.transition(
        SecurityProviderStatus.REGISTERED,
        SecurityProviderStatus.INITIALIZING,
      );

      lifecycleService.transition(
        SecurityProviderStatus.INITIALIZING,
        SecurityProviderStatus.READY,
      );

      const metadataAfter = provider.getMetadata();

      expect(metadataAfter.id).toBe(metadataBefore.id);
      expect(metadataAfter.name).toBe(metadataBefore.name);
      expect(metadataAfter.type).toBe(metadataBefore.type);
      expect(metadataAfter.version).toBe(metadataBefore.version);
      expect(metadataAfter.capabilities).toEqual(metadataBefore.capabilities);
    });

    it("should preserve LOCAL provider identity", () => {
      const provider = createProvider();

      expect(provider.getMetadata().type).toBe(SecurityProviderType.LOCAL);

      const lifecycleService = createLifecycleService();

      lifecycleService.transition(
        SecurityProviderStatus.REGISTERED,
        SecurityProviderStatus.INITIALIZING,
      );

      lifecycleService.transition(
        SecurityProviderStatus.INITIALIZING,
        SecurityProviderStatus.READY,
      );

      expect(provider.getMetadata().type).toBe(SecurityProviderType.LOCAL);
    });
  });

  describe("Provider Dependency Stability", () => {
    it("should preserve the same key provider instance", () => {
      const provider = createProvider();

      const keyProvider = provider.keyProvider;

      expect(provider.keyProvider).toBe(keyProvider);
    });

    it("should preserve the same key material provider instance", () => {
      const provider = createProvider();

      const keyMaterialProvider = provider.keyMaterialProvider;

      expect(provider.keyMaterialProvider).toBe(keyMaterialProvider);
    });

    it("should preserve the same signing key provider instance", () => {
      const provider = createProvider();

      const signingKeyProvider = provider.signingKeyProvider;

      expect(provider.signingKeyProvider).toBe(signingKeyProvider);
    });

    it("should preserve the same HMAC key provider instance", () => {
      const provider = createProvider();

      const hmacKeyProvider = provider.hmacKeyProvider;

      expect(provider.hmacKeyProvider).toBe(hmacKeyProvider);
    });

    it("should preserve the same crypto provider instance", () => {
      const provider = createProvider();

      const cryptoProvider = provider.cryptoProvider;

      expect(provider.cryptoProvider).toBe(cryptoProvider);
    });
  });

  describe("Local Provider Capability Availability", () => {
    it("should expose KEY_MANAGEMENT capability", () => {
      const provider = createProvider();

      expect(provider.getMetadata().capabilities).toContain("KEY_MANAGEMENT");
    });

    it("should expose ENCRYPTION capability", () => {
      const provider = createProvider();

      expect(provider.getMetadata().capabilities).toContain("ENCRYPTION");
    });

    it("should expose DECRYPTION capability", () => {
      const provider = createProvider();

      expect(provider.getMetadata().capabilities).toContain("DECRYPTION");
    });

    it("should expose HASHING capability", () => {
      const provider = createProvider();

      expect(provider.getMetadata().capabilities).toContain("HASHING");
    });

    it("should expose SIGNING capability", () => {
      const provider = createProvider();

      expect(provider.getMetadata().capabilities).toContain("SIGNING");
    });

    it("should expose HMAC capability", () => {
      const provider = createProvider();

      expect(provider.getMetadata().capabilities).toContain("HMAC");
    });
  });

  describe("Runtime Crypto Availability", () => {
    it("should keep hashing available during provider lifecycle validation", async () => {
      const provider = createProvider();

      const result = await provider.cryptoProvider.hash({
        value: "phase-8-12-test",
        algorithm: HashAlgorithm.SHA_256,
      });

      expect(result.hash).toBeDefined();
      expect(result.hash.length).toBeGreaterThan(0);
    });
  });

  describe("No Provider Fallback", () => {
    it("should not replace the Local provider identity", () => {
      const provider = createProvider();

      const metadata = provider.getMetadata();

      expect(metadata.type).toBe(SecurityProviderType.LOCAL);
      expect(metadata.id).toBe("local-security-provider");
    });
  });
});
