// private getNodeHashEncoding(
//   encoding: CryptoEncoding,
// ): "hex" | "base64" | "base64url" {
//   switch (encoding) {
//     case CryptoEncoding.HEX:
//       return "hex";

//     case CryptoEncoding.BASE64:
//       return "base64";

//     case CryptoEncoding.BASE64URL:
//       return "base64url";

//     default:
//       throw new Error(`Unsupported hash encoding: ${encoding}`);
//   }
// }

// async hash(request: HashRequest): Promise<HashResult> {
//   switch (request.algorithm) {
//     case HashAlgorithm.ARGON2ID: {
//       const hash = await argon2.hash(request.value, {
//         type: argon2.argon2id,
//       });

//       return {
//         hash,
//         algorithm: HashAlgorithm.ARGON2ID,
//         encoding: CryptoEncoding.UTF8,
//       };
//     }

//     case HashAlgorithm.SHA_256: {
//       const encoding = request.encoding ?? CryptoEncoding.HEX;

//       const hash = createHash("sha256")
//         .update(Buffer.from(request.value, "utf8"))
//         .digest(this.getNodeHashEncoding(encoding));

//       return {
//         hash,
//         algorithm: HashAlgorithm.SHA_256,
//         encoding,
//       };
//     }

//     default:
//       throw new Error(`Unsupported hash algorithm: ${request.algorithm}`);
//   }
// }

// async verifyHash(request: VerifyHashRequest): Promise<VerifyHashResult> {
//   switch (request.algorithm) {
//     case HashAlgorithm.ARGON2ID: {
//       try {
//         const valid = await argon2.verify(request.hash, request.value);

//         return { valid };
//       } catch {
//         return { valid: false };
//       }
//     }

//     case HashAlgorithm.SHA_256: {
//       const encoding = request.encoding ?? CryptoEncoding.HEX;

//       const generatedHash = createHash("sha256")
//         .update(Buffer.from(request.value, "utf8"))
//         .digest(this.getNodeHashEncoding(encoding));

//       const expected = Buffer.from(generatedHash, "utf8");

//       const actual = Buffer.from(request.hash, "utf8");

//       if (expected.length !== actual.length) {
//         return { valid: false };
//       }

//       return {
//         valid: timingSafeEqual(expected, actual),
//       };
//     }

//     default:
//       throw new Error(`Unsupported hash algorithm: ${request.algorithm}`);
//   }
// }

// async sign(request: SignRequest): Promise<SignResult> {
//   if (request.algorithm !== SignatureAlgorithm.ED25519) {
//     throw new Error(`Unsupported signature algorithm: ${request.algorithm}`);
//   }

//   const keyMaterial = await this.signingKeyProvider.getSigningKey({
//     keyId: request.keyId,
//     version: request.keyVersion,
//   });

//   const payload = Buffer.from(request.payload, "utf8");

//   const signature = sign(null, payload, {
//     key: createPrivateKey({
//       key: keyMaterial.privateKey,
//       format: "der",
//       type: "pkcs8",
//     }),
//   });

//   const encoding = request.encoding ?? CryptoEncoding.BASE64;

//   return {
//     signature: signature.toString(this.getNodeEncoding(encoding)),
//     algorithm: request.algorithm,
//     encoding,
//     keyId: request.keyId,
//     keyVersion: request.keyVersion,
//   };
// }
