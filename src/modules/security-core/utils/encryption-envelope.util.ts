import { InvalidCiphertextError } from "../errors";
import { EncryptionEnvelope } from "../types";

export const parseEncryptionEnvelope = (value: string): EncryptionEnvelope => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new InvalidCiphertextError();
  }

  // Validate using the project's Zod schema here.

  return parsed as EncryptionEnvelope;
};
