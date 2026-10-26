import { describe, expect, it } from "vitest";

import { securityProduct } from "../security-product.container.js";

describe("Security Product Security Core integration boundary", () => {
  const port = securityProduct.securityCore;

  it("exposes the existing cryptographic operation contract", () => {
    expect(typeof port.operations.encrypt).toBe("function");
    expect(typeof port.operations.decrypt).toBe("function");
    expect(typeof port.operations.hash).toBe("function");
    expect(typeof port.operations.verifyHash).toBe("function");
    expect(typeof port.operations.sign).toBe("function");
    expect(typeof port.operations.verifySignature).toBe("function");
    expect(typeof port.operations.createHmac).toBe("function");
    expect(typeof port.operations.verifyHmac).toBe("function");
  });

  it("exposes key lifecycle operations through a separate contract", () => {
    expect(typeof port.keyManagement.createKey).toBe("function");
    expect(typeof port.keyManagement.getKey).toBe("function");
    expect(typeof port.keyManagement.getKeyVersion).toBe("function");
    expect(typeof port.keyManagement.getActiveKeyVersion).toBe("function");
    expect(typeof port.keyManagement.rotateKey).toBe("function");
    expect(typeof port.keyManagement.changeKeyStatus).toBe("function");
  });

  it("does not expose concrete provider instances through the product port", () => {
    expect(Object.keys(port).sort()).toEqual(["keyManagement", "operations"]);
    expect("cryptoProvider" in port).toBe(false);
    expect("keyProvider" in port).toBe(false);
    expect("keyMaterialProvider" in port).toBe(false);
  });

  it("does not expose the Security Core container as a port member", () => {
    // expect(Object.keys(securityProduct).sort()).toEqual(["securityCore"]);
    // expect(Object.keys(securityProduct).sort()).toEqual([
    //   "securityCore",
    //   "tenantResourceOwnership",
    // ]);
    expect(Object.keys(securityProduct).sort()).toEqual([
      "securityCore",
      "securityKeyPersistence",
      "tenantResourceOwnership",
    ]);
    expect("securityService" in port).toBe(false);
    expect("securityServiceKeyManagementApi" in port).toBe(false);
  });
});
