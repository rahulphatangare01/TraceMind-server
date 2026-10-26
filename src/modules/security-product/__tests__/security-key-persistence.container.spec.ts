import { describe, expect, it } from "vitest";

import { securityProduct } from "../security-product.container.js";

import { SecurityKeyPersistenceService } from "../application/services/security-key-persistence.service.js";

describe("Security Product container wiring", () => {
  it("exposes the security key persistence service", () => {
    expect(securityProduct.securityKeyPersistence).toBeInstanceOf(
      SecurityKeyPersistenceService,
    );
  });

  it("returns the same persistence service instance", () => {
    expect(securityProduct.securityKeyPersistence).toBe(
      securityProduct.securityKeyPersistence,
    );
  });

  it("preserves the existing Security Core integration", () => {
    expect(securityProduct.securityCore).toBeDefined();
    expect(securityProduct.securityCore.keyManagement).toBeDefined();
    expect(securityProduct.securityCore.operations).toBeDefined();
  });

  it("preserves the tenant resource ownership service", () => {
    expect(securityProduct.tenantResourceOwnership).toBeDefined();
  });
});
