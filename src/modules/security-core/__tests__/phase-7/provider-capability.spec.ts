import { describe, expect, it } from "vitest";

import { SecurityProviderCapability } from "../../types/provider.types.js";

import type { ProviderCapabilitySet } from "../../types/provider-capability.types.js";

import { ProviderCapabilityService } from "../../application/services/provider-capability.service.js";

import { ProviderCapabilityError } from "../../errors/provider-capability.error.js";

describe("Phase 7.2 - Provider Capability Model", () => {
  const service = new ProviderCapabilityService();

  const fullCapabilitySet: ProviderCapabilitySet = {
    capabilities: [
      SecurityProviderCapability.KEY_MANAGEMENT,
      SecurityProviderCapability.KEY_MATERIAL,
      SecurityProviderCapability.ENCRYPTION,
      SecurityProviderCapability.DECRYPTION,
      SecurityProviderCapability.HASHING,
      SecurityProviderCapability.SIGNING,
      SecurityProviderCapability.HMAC,
    ],
  };

  const encryptionOnlyCapabilitySet: ProviderCapabilitySet = {
    capabilities: [SecurityProviderCapability.ENCRYPTION],
  };

  it("should identify a supported capability", () => {
    expect(
      service.supports(
        fullCapabilitySet,
        SecurityProviderCapability.ENCRYPTION,
      ),
    ).toBe(true);
  });

  it("should identify an unsupported capability", () => {
    expect(
      service.supports(
        encryptionOnlyCapabilitySet,
        SecurityProviderCapability.SIGNING,
      ),
    ).toBe(false);
  });

  it("should return capability check result", () => {
    const result = service.check(
      fullCapabilitySet,
      SecurityProviderCapability.HMAC,
    );

    expect(result).toEqual({
      capability: SecurityProviderCapability.HMAC,
      supported: true,
    });
  });

  it("should return false for unsupported capability check", () => {
    const result = service.check(
      encryptionOnlyCapabilitySet,
      SecurityProviderCapability.HMAC,
    );

    expect(result).toEqual({
      capability: SecurityProviderCapability.HMAC,
      supported: false,
    });
  });

  it("should allow require for supported capability", () => {
    expect(() =>
      service.require(fullCapabilitySet, SecurityProviderCapability.DECRYPTION),
    ).not.toThrow();
  });

  it("should reject require for unsupported capability", () => {
    expect(() =>
      service.require(
        encryptionOnlyCapabilitySet,
        SecurityProviderCapability.DECRYPTION,
      ),
    ).toThrow(ProviderCapabilityError);
  });

  it("should support providers with partial capabilities", () => {
    const result = service.check(
      encryptionOnlyCapabilitySet,
      SecurityProviderCapability.ENCRYPTION,
    );

    expect(result.supported).toBe(true);

    expect(
      service.supports(
        encryptionOnlyCapabilitySet,
        SecurityProviderCapability.HMAC,
      ),
    ).toBe(false);
  });

  it("should not mutate the capability set", () => {
    const capabilities = [
      SecurityProviderCapability.ENCRYPTION,
      SecurityProviderCapability.DECRYPTION,
    ];

    const capabilitySet: ProviderCapabilitySet = {
      capabilities,
    };

    service.supports(capabilitySet, SecurityProviderCapability.ENCRYPTION);

    expect(capabilitySet.capabilities).toEqual(capabilities);
  });
});
