import { z } from "zod";

import { CryptoEncoding, EncryptionAlgorithm } from "../domain/enums/index.js";

export const encryptionEnvelopeSchema = z.object({
  version: z.number().int().positive(),

  algorithm: z.nativeEnum(EncryptionAlgorithm),

  encoding: z.nativeEnum(CryptoEncoding),

  keyId: z.string().trim().min(1),

  keyVersion: z.number().int().positive(),

  iv: z.string().trim().min(1),

  authTag: z.string().trim().min(1),

  ciphertext: z.string().trim().min(1),
});

export type EncryptionEnvelopeInput = z.infer<typeof encryptionEnvelopeSchema>;
