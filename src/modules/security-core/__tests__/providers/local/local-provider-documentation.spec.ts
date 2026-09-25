import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Phase 8.17 - Local Provider Documentation", () => {
  const documentationPath = resolve(
    process.cwd(),
    "docs/security-core/local-provider.md",
  );

  it("should contain the Local Provider documentation", () => {
    expect(existsSync(documentationPath)).toBe(true);
  });

  it("should document the provider architecture", () => {
    const content = readFileSync(documentationPath, "utf8");

    expect(content).toContain("# TraceMind Local Security Provider");
    expect(content).toContain("## 2. Architecture");
  });

  it("should document provider capabilities", () => {
    const content = readFileSync(documentationPath, "utf8");

    expect(content).toContain("KEY_MANAGEMENT");
    expect(content).toContain("KEY_MATERIAL");
    expect(content).toContain("ENCRYPTION");
    expect(content).toContain("DECRYPTION");
    expect(content).toContain("HASHING");
    expect(content).toContain("SIGNING");
    expect(content).toContain("HMAC");
  });

  it("should document cryptographic algorithms", () => {
    const content = readFileSync(documentationPath, "utf8");

    expect(content).toContain("AES-256-GCM");
    expect(content).toContain("SHA-256");
    expect(content).toContain("Argon2id");
    expect(content).toContain("Ed25519");
    expect(content).toContain("HMAC-SHA-256");
  });

  it("should document security boundaries", () => {
    const content = readFileSync(documentationPath, "utf8");

    expect(content).toContain("## 13. Security Boundaries");
    expect(content).toContain("Security scope");
    expect(content).toContain("Hierarchy");
  });

  it("should document isolation and concurrency", () => {
    const content = readFileSync(documentationPath, "utf8");

    expect(content).toContain("## 14. Isolation and Concurrency");
  });

  it("should document known Local Provider limitations", () => {
    const content = readFileSync(documentationPath, "utf8");

    expect(content).toContain("## 17. Known Limitations");
    expect(content).toContain("In-memory key state");
    expect(content).toContain("External KMS");
  });

  it("should document the signing context-binding limitation", () => {
    const content = readFileSync(documentationPath, "utf8");

    expect(content).toContain("Signing Context Binding");
  });

  it("should not document raw secret material as provider metadata", () => {
    const content = readFileSync(documentationPath, "utf8");

    expect(content).not.toContain("raw encryption key in metadata");

    expect(content).not.toContain("private signing key in metadata");
  });
});
