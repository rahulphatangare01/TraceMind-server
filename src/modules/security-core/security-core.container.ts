import { EncryptionService } from "./application/services/encryption.service.js";
import { LocalKeyProvider } from "./providers/local/local-key.provider.js";
import { LocalKeyMaterialProvider } from "./providers/local/local-key-material.provider.js";
import { LocalCryptoProvider } from "./providers/local/local-crypto.provider.js";

const keyProvider = new LocalKeyProvider();

const keyMaterialProvider = new LocalKeyMaterialProvider();

const cryptoProvider = new LocalCryptoProvider();

export const securityCore = {
  keyProvider,
  keyMaterialProvider,
  cryptoProvider,

  encryptionService: new EncryptionService(
    keyProvider,
    keyMaterialProvider,
    cryptoProvider,
  ),
};
