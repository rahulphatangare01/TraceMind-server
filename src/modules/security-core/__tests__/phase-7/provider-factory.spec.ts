import { describe, expect, it } from "vitest";

import {
  SecurityProviderCapability,
  SecurityProviderType,
} from "../../types/provider.types.js";

import { ProviderFactoryService } from "../../application/services/provider-factory.service.js";

import { ProviderFactoryError } from "../../errors/provider-factory.error.js";

import { LocalSecurityProvider } from "../../providers/local/local-security.provider.js";

describe("ProviderFactoryService", () => {
  const factory = new ProviderFactoryService();

  it("should create a Local provider", () => {
    const provider = factory.create(SecurityProviderType.LOCAL);

    expect(provider).toBeInstanceOf(LocalSecurityProvider);
  });

  it("should create provider with LOCAL metadata", () => {
    const provider = factory.create(SecurityProviderType.LOCAL);

    expect(provider.getMetadata().type).toBe(SecurityProviderType.LOCAL);
  });

  it("should create provider with valid metadata", () => {
    const provider = factory.create(SecurityProviderType.LOCAL);

    const metadata = provider.getMetadata();

    expect(metadata.id).toBeTruthy();
    expect(metadata.name).toBeTruthy();
    expect(metadata.version).toBeTruthy();
    expect(metadata.capabilities.length).toBeGreaterThan(0);
  });

  it("should expose expected Local capabilities", () => {
    const provider = factory.create(SecurityProviderType.LOCAL);

    const capabilities = provider.getMetadata().capabilities;

    expect(capabilities).toContain(SecurityProviderCapability.KEY_MANAGEMENT);

    expect(capabilities).toContain(SecurityProviderCapability.KEY_MATERIAL);

    expect(capabilities).toContain(SecurityProviderCapability.ENCRYPTION);

    expect(capabilities).toContain(SecurityProviderCapability.DECRYPTION);

    expect(capabilities).toContain(SecurityProviderCapability.HASHING);

    expect(capabilities).toContain(SecurityProviderCapability.SIGNING);

    expect(capabilities).toContain(SecurityProviderCapability.HMAC);
  });

  it("should reject AWS KMS when implementation is unavailable", () => {
    expect(() => factory.create(SecurityProviderType.AWS_KMS)).toThrow(
      ProviderFactoryError,
    );
  });

  it("should reject Azure Key Vault when implementation is unavailable", () => {
    expect(() => factory.create(SecurityProviderType.AZURE_KEY_VAULT)).toThrow(
      ProviderFactoryError,
    );
  });

  it("should reject GCP KMS when implementation is unavailable", () => {
    expect(() => factory.create(SecurityProviderType.GCP_KMS)).toThrow(
      ProviderFactoryError,
    );
  });

  it("should reject HashiCorp Vault when implementation is unavailable", () => {
    expect(() => factory.create(SecurityProviderType.HASHICORP_VAULT)).toThrow(
      ProviderFactoryError,
    );
  });

  it("should reject Custom provider when implementation is unavailable", () => {
    expect(() => factory.create(SecurityProviderType.CUSTOM)).toThrow(
      ProviderFactoryError,
    );
  });

  it("should not silently fallback to Local provider", () => {
    expect(() => factory.create(SecurityProviderType.AWS_KMS)).toThrow(
      ProviderFactoryError,
    );
  });

  it("should create independent Local provider instances", () => {
    const first = factory.create(SecurityProviderType.LOCAL);

    const second = factory.create(SecurityProviderType.LOCAL);

    expect(first).not.toBe(second);
    expect(first.getMetadata().type).toBe(SecurityProviderType.LOCAL);
    expect(second.getMetadata().type).toBe(SecurityProviderType.LOCAL);
  });

  it("should expose the Local provider contract", () => {
    const provider = factory.create(SecurityProviderType.LOCAL);

    expect(typeof provider.getMetadata).toBe("function");

    expect(typeof provider.getStatus).toBe("function");
  });
});
