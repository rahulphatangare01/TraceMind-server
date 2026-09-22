import { describe, expect, it } from "vitest";

import { SecurityProviderType } from "../../types/provider.types.js";

import type { SecurityProviderConfiguration } from "../../types/provider-configuration.types.js";

import { ProviderConfigurationService } from "../../application/services/provider-configuration.service.js";

import { ProviderConfigurationSanitizerService } from "../../application/services/provider-configuration-sanitizer.service.js";

describe("ProviderConfigurationService", () => {
  const service = new ProviderConfigurationService();

  const validConfiguration: SecurityProviderConfiguration = {
    providerId: "local-security-provider",
    type: SecurityProviderType.LOCAL,
    settings: {},
  };

  it("should validate valid provider configuration", () => {
    expect(service.validate(validConfiguration)).toEqual(validConfiguration);
  });

  it("should trim provider id", () => {
    const configuration = {
      ...validConfiguration,
      providerId: "  local-security-provider  ",
    };

    const result = service.validate(configuration);

    expect(result.providerId).toBe("local-security-provider");
  });

  it("should reject empty provider id", () => {
    expect(() =>
      service.validate({
        ...validConfiguration,
        providerId: "",
      }),
    ).toThrow();
  });

  it("should reject whitespace-only provider id", () => {
    expect(() =>
      service.validate({
        ...validConfiguration,
        providerId: "   ",
      }),
    ).toThrow();
  });

  it("should reject invalid provider type", () => {
    expect(() =>
      service.validate({
        ...validConfiguration,
        type: "INVALID_PROVIDER",
      } as unknown as SecurityProviderConfiguration),
    ).toThrow();
  });

  it("should accept arbitrary provider-neutral settings", () => {
    const configuration = {
      ...validConfiguration,
      settings: {
        region: "ap-south-1",
        keyReference: "reference-001",
        endpoint: "https://example.internal",
      },
    };

    const result = service.validate(configuration);

    expect(result.settings).toEqual(configuration.settings);
  });

  it("should accept empty settings", () => {
    expect(
      service.validate({
        ...validConfiguration,
        settings: {},
      }).settings,
    ).toEqual({});
  });

  it("should reject missing settings", () => {
    expect(() =>
      service.validate({
        providerId: "local-security-provider",
        type: SecurityProviderType.LOCAL,
      } as SecurityProviderConfiguration),
    ).toThrow();
  });

  it("should preserve nested configuration values", () => {
    const settings = {
      region: "ap-south-1",
      options: {
        timeout: 5000,
        retry: 3,
      },
    };

    const result = service.validate({
      ...validConfiguration,
      settings,
    });

    expect(result.settings).toEqual(settings);
  });

  it("should not require provider registration during validation", () => {
    const result = service.validate({
      providerId: "provider-not-yet-registered",
      type: SecurityProviderType.LOCAL,
      settings: {},
    });

    expect(result.providerId).toBe("provider-not-yet-registered");
  });
});

describe("ProviderConfigurationSanitizerService", () => {
  const sanitizer = new ProviderConfigurationSanitizerService();

  it("should sanitize provider id whitespace", () => {
    const configuration: SecurityProviderConfiguration = {
      providerId: "  local-provider  ",
      type: SecurityProviderType.LOCAL,
      settings: {},
    };

    const result = sanitizer.sanitize(configuration);

    expect(result.providerId).toBe("local-provider");
  });

  it("should preserve provider type", () => {
    const configuration: SecurityProviderConfiguration = {
      providerId: "local-provider",
      type: SecurityProviderType.LOCAL,
      settings: {},
    };

    const result = sanitizer.sanitize(configuration);

    expect(result.type).toBe(SecurityProviderType.LOCAL);
  });

  it("should preserve configuration settings", () => {
    const settings = {
      region: "ap-south-1",
      keyReference: "key-ref-001",
    };

    const configuration: SecurityProviderConfiguration = {
      providerId: "aws-provider",
      type: SecurityProviderType.AWS_KMS,
      settings,
    };

    const result = sanitizer.sanitize(configuration);

    expect(result.settings).toEqual(settings);
  });

  it("should not mutate the original settings object", () => {
    const settings = {
      region: "ap-south-1",
    };

    const configuration: SecurityProviderConfiguration = {
      providerId: "aws-provider",
      type: SecurityProviderType.AWS_KMS,
      settings,
    };

    const result = sanitizer.sanitize(configuration);

    expect(result.settings).not.toBe(configuration.settings);

    expect(configuration.settings).toEqual(settings);
  });
});
