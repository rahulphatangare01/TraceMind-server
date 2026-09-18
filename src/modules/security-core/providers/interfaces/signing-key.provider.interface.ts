import { SecurityContext } from "../../domain/models";
import type { KeyReference } from "../../types";

export interface SigningKeyMaterial {
  privateKey: Buffer;
  publicKey: Buffer;
  keyId: string;
  keyVersion: number;
}

// export interface SigningKeyProvider {
//   getSigningKey(reference: KeyReference): Promise<SigningKeyMaterial>;
// }

export interface SigningKeyProvider {
  getSigningKey(context: SecurityContext): Promise<SigningKeyMaterial>;
  getVerificationKey(keyId: string, keyVersion: number): Promise<Buffer>;
}
