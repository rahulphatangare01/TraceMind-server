// async encrypt(
//   plaintext: string,
//   context: SecurityContext,
// ): Promise<string> {
//   validateSecurityContext(context);

//   const key = await this.keyProvider.resolveActiveKey({
//     ...context,
//     purpose: KeyPurpose.ENCRYPTION,
//   });

//   const result = await this.cryptoProvider.encrypt({
//     plaintext,
//     algorithm: EncryptionAlgorithm.AES_256_GCM,
//     context,
//   });

//   const envelope: EncryptionEnvelope = {
//     version: ENCRYPTION_ENVELOPE_VERSION,
//     algorithm: result.algorithm,
//     encoding: result.encoding,
//     keyId: result.keyId,
//     keyVersion: result.keyVersion,
//     iv: result.iv,
//     authTag: result.authTag,
//     ciphertext: result.ciphertext,
//   };

//   return JSON.stringify(envelope);
// }

// Decryption service

// async decrypt(
//   serializedEnvelope: string,
//   context: SecurityContext,
// ): Promise<string> {
//   const envelope =
//     parseEncryptionEnvelope(serializedEnvelope);

//   validateSecurityContext(context);

//   const key = await this.keyProvider.getKeyVersion({
//     keyId: envelope.keyId,
//     version: envelope.keyVersion,
//   });

//   if (!key) {
//     throw new KeyNotFoundError(
//       envelope.keyId,
//       envelope.keyVersion,
//     );
//   }

//   return this.cryptoProvider.decrypt({
//     ciphertext: envelope.ciphertext,
//     algorithm: envelope.algorithm,
//     encoding: envelope.encoding,
//     iv: envelope.iv,
//     authTag: envelope.authTag,
//     keyId: envelope.keyId,
//     keyVersion: envelope.keyVersion,
//     context,
//   });
// }
