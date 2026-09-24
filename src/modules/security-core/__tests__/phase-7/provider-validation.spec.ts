import { describe, expect, it } from "vitest";

import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../types/provider.types.js";

import type { SecurityProvider } from "../../types/provider.types.js";

import { ProviderValidationService } from "../../application/services/provider-validation.service.js";

import { ProviderValidationError } from "../../errors/provider-validation.error.js";

const createProvider = (
  metadataOverrides: Partial<ReturnType<SecurityProvider["getMetadata"]>> = {},
  status: SecurityProviderStatus = SecurityProviderStatus.READY,
): SecurityProvider => {
  return {
    getMetadata: () => ({
      id: "test-provider",
      name: "Test Provider",
      type: SecurityProviderType.LOCAL,
      version: "1.0.0",
      capabilities: [
        SecurityProviderCapability.KEY_MANAGEMENT,
        SecurityProviderCapability.ENCRYPTION,
      ],
      ...metadataOverrides,
    }),

    getStatus: () => status,
  };
};

describe("ProviderValidationService", () => {
  const service = new ProviderValidationService();

  it("should validate a valid provider", () => {
    const provider = createProvider();

    const result = service.validate(provider);

    expect(result.valid).toBe(true);
    expect(result.metadata.id).toBe("test-provider");
    expect(result.status).toBe(SecurityProviderStatus.READY);
  });

  it("should return provider metadata", () => {
    const provider = createProvider();

    const result = service.validate(provider);

    expect(result.metadata).toEqual(provider.getMetadata());
  });

  it("should return provider status", () => {
    const provider = createProvider({}, SecurityProviderStatus.READY);

    const result = service.validate(provider);

    expect(result.status).toBe(SecurityProviderStatus.READY);
  });

  it("should reject missing provider", () => {
    expect(() => service.validate(null as unknown as SecurityProvider)).toThrow(
      ProviderValidationError,
    );
  });

  it("should reject invalid provider metadata", () => {
    const provider = createProvider({
      id: "",
    });

    expect(() => service.validate(provider)).toThrow(ProviderValidationError);
  });

  it("should reject provider metadata with invalid type", () => {
    const provider = createProvider({
      type: "INVALID_PROVIDER",
    } as never);

    expect(() => service.validate(provider)).toThrow(ProviderValidationError);
  });

  it("should reject provider metadata with invalid capability", () => {
    const provider = createProvider({
      capabilities: ["INVALID_CAPABILITY"],
    } as never);

    expect(() => service.validate(provider)).toThrow(ProviderValidationError);
  });

  it("should reject duplicate provider capabilities", () => {
    const provider = createProvider({
      capabilities: [
        SecurityProviderCapability.ENCRYPTION,
        SecurityProviderCapability.ENCRYPTION,
      ],
    });

    expect(() => service.validate(provider)).toThrow(ProviderValidationError);
  });

  it("should reject invalid provider status", () => {
    const provider = createProvider(
      {},
      "INVALID_STATUS" as SecurityProviderStatus,
    );

    expect(() => service.validate(provider)).toThrow(ProviderValidationError);
  });

  it("should accept all valid provider statuses", () => {
    for (const status of Object.values(SecurityProviderStatus)) {
      const provider = createProvider({}, status);

      const result = service.validate(provider);

      expect(result.valid).toBe(true);
      expect(result.status).toBe(status);
    }
  });

  it("should normalize provider id with leading whitespace", () => {
    const provider = createProvider({
      id: " test-provider",
    });

    const result = service.validate(provider);

    expect(result.valid).toBe(true);
    expect(result.metadata.id).toBe("test-provider");
  });

  it("should normalize provider id with trailing whitespace", () => {
    const provider = createProvider({
      id: "test-provider ",
    });

    const result = service.validate(provider);

    expect(result.valid).toBe(true);
    expect(result.metadata.id).toBe("test-provider");
  });

  it("should preserve valid capabilities", () => {
    const provider = createProvider({
      capabilities: [
        SecurityProviderCapability.KEY_MANAGEMENT,
        SecurityProviderCapability.ENCRYPTION,
        SecurityProviderCapability.HASHING,
      ],
    });

    const result = service.validate(provider);

    expect(result.metadata.capabilities).toEqual([
      SecurityProviderCapability.KEY_MANAGEMENT,
      SecurityProviderCapability.ENCRYPTION,
      SecurityProviderCapability.HASHING,
    ]);
  });

  it("should not modify the provider during validation", () => {
    const provider = createProvider();

    const metadataBefore = provider.getMetadata();
    const statusBefore = provider.getStatus();

    service.validate(provider);

    expect(provider.getMetadata()).toEqual(metadataBefore);

    expect(provider.getStatus()).toBe(statusBefore);
  });
});
