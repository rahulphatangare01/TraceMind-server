// import { generateKeyPairSync } from "node:crypto";

// import type { KeyReference } from "../../types";

// import type {
//   SigningKeyMaterial,
//   SigningKeyProvider,
// } from "../interfaces/signing-key.provider.interface.js";
// import { SecurityContext } from "../../domain/models";

// export class LocalSigningKeyProvider implements SigningKeyProvider {
//   private readonly keyStore = new Map<string, SigningKeyMaterial>();

//   //   async getSigningKey(reference: KeyReference): Promise<SigningKeyMaterial> {
//   async getSigningKey(context: SecurityContext): Promise<SigningKeyMaterial> {
//     const storageKey = `${reference.keyId}:v${reference.version}`;

//     const existingKey = this.keyStore.get(storageKey);

//     if (existingKey) {
//       return {
//         privateKey: Buffer.from(existingKey.privateKey),
//         publicKey: Buffer.from(existingKey.publicKey),
//       };
//     }

//     const { privateKey, publicKey } = generateKeyPairSync("ed25519", {
//       privateKeyEncoding: {
//         type: "pkcs8",
//         format: "der",
//       },
//       publicKeyEncoding: {
//         type: "spki",
//         format: "der",
//       },
//     });

//     const keyMaterial: SigningKeyMaterial = {
//       privateKey: Buffer.from(privateKey),
//       publicKey: Buffer.from(publicKey),
//     };

//     this.keyStore.set(storageKey, keyMaterial);

//     return {
//       privateKey: Buffer.from(keyMaterial.privateKey),
//       publicKey: Buffer.from(keyMaterial.publicKey),
//     };
//   }
// }

import { generateKeyPairSync } from "node:crypto";

import type { SecurityContext } from "../../domain/models/security-context.js";

import type {
  SigningKeyMaterial,
  SigningKeyProvider,
} from "../interfaces/signing-key.provider.interface.js";

export class LocalSigningKeyProvider implements SigningKeyProvider {
  private readonly keyStore = new Map<string, SigningKeyMaterial>();

  async getSigningKey(context: SecurityContext): Promise<SigningKeyMaterial> {
    const storageKey = this.createStorageKey(context);

    const existingKey = this.keyStore.get(storageKey);

    if (existingKey) {
      return {
        privateKey: Buffer.from(existingKey.privateKey),
        publicKey: Buffer.from(existingKey.publicKey),
        keyId: existingKey.keyId,
        keyVersion: existingKey.keyVersion,
      };
    }

    const { privateKey, publicKey } = generateKeyPairSync("ed25519", {
      privateKeyEncoding: {
        type: "pkcs8",
        format: "der",
      },
      publicKeyEncoding: {
        type: "spki",
        format: "der",
      },
    });

    const keyMaterial: SigningKeyMaterial = {
      privateKey: Buffer.from(privateKey),
      publicKey: Buffer.from(publicKey),
      keyId: storageKey,
      keyVersion: 1,
    };

    this.keyStore.set(storageKey, keyMaterial);

    return {
      privateKey: Buffer.from(keyMaterial.privateKey),
      publicKey: Buffer.from(keyMaterial.publicKey),
      keyId: keyMaterial.keyId,
      keyVersion: keyMaterial.keyVersion,
    };
  }
  async getVerificationKey(keyId: string, keyVersion: number): Promise<Buffer> {
    const storageKey = `${keyId}`;

    const keyMaterial = this.keyStore.get(storageKey);

    if (!keyMaterial || keyMaterial.keyVersion !== keyVersion) {
      throw new Error(`Signing key not found: ${keyId}:v${keyVersion}`);
    }

    return Buffer.from(keyMaterial.publicKey);
  }
  private createStorageKey(context: SecurityContext): string {
    return [
      context.scope,
      context.organizationId ?? "",
      context.projectId ?? "",
      context.applicationId ?? "",
      context.environmentId ?? "",
    ].join(":");
  }
}
