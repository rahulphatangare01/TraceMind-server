// import { InvalidCiphertextError } from "../errors";
// import { EncryptionEnvelope } from "../types";

// export const parseEncryptionEnvelope = (value: string): EncryptionEnvelope => {
//   let parsed: unknown;

//   try {
//     parsed = JSON.parse(value);
//   } catch {
//     throw new InvalidCiphertextError();
//   }

//   // Validate using the project's Zod schema here.

//   return parsed as EncryptionEnvelope;
// };
import { ENCRYPTION_ENVELOPE_VERSION } from "../constants/encryption.constants.js";

import { InvalidCiphertextError } from "../errors/index.js";

import { encryptionEnvelopeSchema } from "../schemas/encryption-envelope.schema.js";

import type { EncryptionEnvelope } from "../types/encryption-envelope.types.js";

export const serializeEncryptionEnvelope = (
  envelope: EncryptionEnvelope,
): string => {
  const validation = encryptionEnvelopeSchema.safeParse(envelope);

  if (!validation.success) {
    throw new InvalidCiphertextError("Invalid encryption envelope");
  }

  return JSON.stringify(validation.data);
};

export const parseEncryptionEnvelope = (value: string): EncryptionEnvelope => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new InvalidCiphertextError("Invalid encryption envelope format");
  }

  const validation = encryptionEnvelopeSchema.safeParse(parsed);

  if (!validation.success) {
    throw new InvalidCiphertextError("Invalid encryption envelope");
  }

  if (validation.data.version !== ENCRYPTION_ENVELOPE_VERSION) {
    throw new InvalidCiphertextError(
      `Unsupported encryption envelope version: ${validation.data.version}`,
    );
  }

  return validation.data;
};
