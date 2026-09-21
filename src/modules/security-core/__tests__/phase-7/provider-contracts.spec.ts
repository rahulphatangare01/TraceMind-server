import { describe, expect, it } from "vitest";

import type { SecurityProvider } from "../../application/interfaces/security.provider.interface.js";

import {
  SecurityProviderCapability,
  SecurityProviderStatus,
  SecurityProviderType,
} from "../../types/provider.types.js";

describe("Phase 7.1 - Provider Contracts", () => {
  it("should define supported provider types", () => {
    expect(SecurityProviderType.LOCAL).toBe("LOCAL");
    expect(SecurityProviderType.AWS_KMS).toBe("AWS_KMS");
    expect(SecurityProviderType.AZURE_KEY_VAULT).toBe("AZURE_KEY_VAULT");
    expect(SecurityProviderType.GCP_KMS).toBe("GCP_KMS");
    expect(SecurityProviderType.HASHICORP_VAULT).toBe("HASHICORP_VAULT");
    expect(SecurityProviderType.CUSTOM).toBe("CUSTOM");
  });

  it("should define provider capabilities", () => {
    expect(SecurityProviderCapability.KEY_MANAGEMENT).toBe("KEY_MANAGEMENT");

    expect(SecurityProviderCapability.KEY_MATERIAL).toBe("KEY_MATERIAL");

    expect(SecurityProviderCapability.ENCRYPTION).toBe("ENCRYPTION");

    expect(SecurityProviderCapability.DECRYPTION).toBe("DECRYPTION");

    expect(SecurityProviderCapability.HASHING).toBe("HASHING");

    expect(SecurityProviderCapability.SIGNING).toBe("SIGNING");

    expect(SecurityProviderCapability.HMAC).toBe("HMAC");
  });

  it("should define provider lifecycle states", () => {
    expect(SecurityProviderStatus.REGISTERED).toBe("REGISTERED");

    expect(SecurityProviderStatus.INITIALIZING).toBe("INITIALIZING");

    expect(SecurityProviderStatus.READY).toBe("READY");

    expect(SecurityProviderStatus.UNHEALTHY).toBe("UNHEALTHY");

    expect(SecurityProviderStatus.DISABLED).toBe("DISABLED");
  });

  it("should represent a valid provider metadata contract", () => {
    const metadata: SecurityProvider["getMetadata"] extends (
      ...args: never[]
    ) => infer TResult
      ? TResult
      : never = {
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

    expect(metadata.id).toBe("provider-local");
    expect(metadata.type).toBe(SecurityProviderType.LOCAL);
    expect(metadata.version).toBe("1.0.0");
    expect(metadata.capabilities).toHaveLength(7);
  });

  it("should allow a provider implementation to satisfy the contract", () => {
    const provider: SecurityProvider = {
      getMetadata: () => ({
        id: "provider-local",
        name: "Local Security Provider",
        type: SecurityProviderType.LOCAL,
        version: "1.0.0",
        capabilities: [SecurityProviderCapability.ENCRYPTION],
      }),

      getStatus: () => SecurityProviderStatus.READY,
    };

    expect(provider.getMetadata().type).toBe(SecurityProviderType.LOCAL);

    expect(provider.getStatus()).toBe(SecurityProviderStatus.READY);
  });

  it("should keep provider metadata independent from provider status", () => {
    const provider: SecurityProvider = {
      getMetadata: () => ({
        id: "provider-local",
        name: "Local Security Provider",
        type: SecurityProviderType.LOCAL,
        version: "1.0.0",
        capabilities: [SecurityProviderCapability.ENCRYPTION],
      }),

      getStatus: () => SecurityProviderStatus.INITIALIZING,
    };

    expect(provider.getMetadata().type).toBe(SecurityProviderType.LOCAL);

    expect(provider.getStatus()).toBe(SecurityProviderStatus.INITIALIZING);
  });

  it("should support a provider with a subset of capabilities", () => {
    const provider: SecurityProvider = {
      getMetadata: () => ({
        id: "provider-signing",
        name: "Signing Provider",
        type: SecurityProviderType.CUSTOM,
        version: "1.0.0",
        capabilities: [SecurityProviderCapability.SIGNING],
      }),

      getStatus: () => SecurityProviderStatus.READY,
    };

    expect(provider.getMetadata().capabilities).toEqual([
      SecurityProviderCapability.SIGNING,
    ]);
  });
});
