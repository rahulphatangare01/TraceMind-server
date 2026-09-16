export interface KeyMaterialProvider {
  getKeyMaterial(keyId: string, version: number): Promise<Buffer>;
}
