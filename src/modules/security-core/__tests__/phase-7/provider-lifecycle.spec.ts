import { describe, expect, it } from "vitest";

import { SecurityProviderStatus } from "../../types/provider.types.js";

import { ProviderLifecycleService } from "../../application/services/provider-lifecycle.service.js";

import { ProviderLifecycleError } from "../../errors/provider-lifecycle.error.js";

describe("ProviderLifecycleService", () => {
  const service = new ProviderLifecycleService();

  it("should allow REGISTERED -> INITIALIZING", () => {
    expect(
      service.canTransition(
        SecurityProviderStatus.REGISTERED,
        SecurityProviderStatus.INITIALIZING,
      ),
    ).toBe(true);
  });

  it("should allow INITIALIZING -> READY", () => {
    expect(
      service.canTransition(
        SecurityProviderStatus.INITIALIZING,
        SecurityProviderStatus.READY,
      ),
    ).toBe(true);
  });

  it("should allow INITIALIZING -> UNHEALTHY", () => {
    expect(
      service.canTransition(
        SecurityProviderStatus.INITIALIZING,
        SecurityProviderStatus.UNHEALTHY,
      ),
    ).toBe(true);
  });

  it("should allow READY -> UNHEALTHY", () => {
    expect(
      service.canTransition(
        SecurityProviderStatus.READY,
        SecurityProviderStatus.UNHEALTHY,
      ),
    ).toBe(true);
  });

  it("should allow UNHEALTHY -> READY", () => {
    expect(
      service.canTransition(
        SecurityProviderStatus.UNHEALTHY,
        SecurityProviderStatus.READY,
      ),
    ).toBe(true);
  });

  it("should allow provider to transition to DISABLED", () => {
    expect(
      service.canTransition(
        SecurityProviderStatus.READY,
        SecurityProviderStatus.DISABLED,
      ),
    ).toBe(true);
  });

  it("should reject REGISTERED -> READY", () => {
    expect(
      service.canTransition(
        SecurityProviderStatus.REGISTERED,
        SecurityProviderStatus.READY,
      ),
    ).toBe(false);
  });

  it("should reject DISABLED -> READY", () => {
    expect(
      service.canTransition(
        SecurityProviderStatus.DISABLED,
        SecurityProviderStatus.READY,
      ),
    ).toBe(false);
  });

  it("should reject invalid transition through transition()", () => {
    expect(() =>
      service.transition(
        SecurityProviderStatus.REGISTERED,
        SecurityProviderStatus.READY,
      ),
    ).toThrow(ProviderLifecycleError);
  });

  it("should return the target status for a valid transition", () => {
    expect(
      service.transition(
        SecurityProviderStatus.REGISTERED,
        SecurityProviderStatus.INITIALIZING,
      ),
    ).toBe(SecurityProviderStatus.INITIALIZING);
  });

  it("should prevent any transition from DISABLED", () => {
    expect(
      service.canTransition(
        SecurityProviderStatus.DISABLED,
        SecurityProviderStatus.REGISTERED,
      ),
    ).toBe(false);

    expect(
      service.canTransition(
        SecurityProviderStatus.DISABLED,
        SecurityProviderStatus.INITIALIZING,
      ),
    ).toBe(false);

    expect(
      service.canTransition(
        SecurityProviderStatus.DISABLED,
        SecurityProviderStatus.READY,
      ),
    ).toBe(false);

    expect(
      service.canTransition(
        SecurityProviderStatus.DISABLED,
        SecurityProviderStatus.UNHEALTHY,
      ),
    ).toBe(false);
  });
});
