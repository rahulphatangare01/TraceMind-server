import { describe, expect, it } from "vitest";

import {
  SecurityProviderCapability,
  SecurityProviderType,
} from "../../types/provider.types.js";

import type { SecurityProviderMetadata } from "../../types/provider.types.js";

import { ProviderMetadataService } from "../../application/services/provider-metadata.service.js";

describe("Phase 7.3 - Provider Metadata", () => {
  const service = new ProviderMetadataService();

  const validMetadata: SecurityProviderMetadata = {
    id: "provider-local",
    name: "Local Security Provider",
    type: SecurityProviderType.LOCAL,
    version: "1.0.0",
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

  it("should validate valid provider metadata", () => {
    const result = service.validate(validMetadata);

    expect(result).toEqual(validMetadata);
  });

  it("should normalize provider metadata strings", () => {
    const result = service.validate({
      ...validMetadata,
      id: "  provider-local  ",
      name: "  Local Security Provider  ",
      version: " 1.0.0 ",
    });

    expect(result.id).toBe("provider-local");

    expect(result.name).toBe("Local Security Provider");

    expect(result.version).toBe("1.0.0");
  });

  it("should reject empty provider id", () => {
    expect(() =>
      service.validate({
        ...validMetadata,
        id: "   ",
      }),
    ).toThrow();
  });

  it("should reject empty provider name", () => {
    expect(() =>
      service.validate({
        ...validMetadata,
        name: "   ",
      }),
    ).toThrow();
  });

  it("should reject empty provider version", () => {
    expect(() =>
      service.validate({
        ...validMetadata,
        version: "   ",
      }),
    ).toThrow();
  });

  it("should reject invalid provider type", () => {
    expect(() =>
      service.validate({
        ...validMetadata,
        type: "INVALID_PROVIDER" as SecurityProviderType,
      }),
    ).toThrow();
  });

  it("should reject empty capabilities", () => {
    expect(() =>
      service.validate({
        ...validMetadata,
        capabilities: [],
      }),
    ).toThrow();
  });

  it("should reject duplicate capabilities", () => {
    expect(() =>
      service.validate({
        ...validMetadata,
        capabilities: [
          SecurityProviderCapability.ENCRYPTION,
          SecurityProviderCapability.ENCRYPTION,
        ],
      }),
    ).toThrow();
  });

  it("should reject invalid capability", () => {
    expect(() =>
      service.validate({
        ...validMetadata,
        // capabilities: ["INVALID_CAPABILITY"] as SecurityProviderCapability[],
        capabilities: [
          "INVALID_CAPABILITY",
        ] as unknown as SecurityProviderCapability[],
      }),
    ).toThrow();
  });

  it("should preserve valid capability definitions", () => {
    const result = service.validate(validMetadata);

    expect(result.capabilities).toEqual(validMetadata.capabilities);
  });
});
