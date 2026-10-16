import type { CreateKeyRequest } from "./key.provider.interface.js";
import type { KeyStatus } from "../../domain/enums/key-status.enum.js";
import type {
  SecurityKey,
  SecurityKeyVersion,
} from "../../domain/models/index.js";
import type { KeyReference } from "../../types/key.types.js";

/**
 * Stable key-lifecycle contract exposed by Security Core.
 *
 * This interface describes operations only. Persistence and provider selection
 * remain implementation details owned by the relevant composition boundary.
 */
export interface SecurityKeyManagementService {
  createKey(request: CreateKeyRequest): Promise<SecurityKey>;

  getKey(keyId: string): Promise<SecurityKey | null>;

  getKeyVersion(reference: KeyReference): Promise<SecurityKeyVersion | null>;

  getActiveKeyVersion(keyId: string): Promise<SecurityKeyVersion | null>;

  rotateKey(keyId: string): Promise<SecurityKeyVersion>;

  changeKeyStatus(
    reference: KeyReference,
    status: KeyStatus,
  ): Promise<SecurityKeyVersion>;
}
