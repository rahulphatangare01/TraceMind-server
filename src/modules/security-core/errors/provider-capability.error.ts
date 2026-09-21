export class ProviderCapabilityError extends Error {
  public readonly code = "PROVIDER_CAPABILITY_NOT_SUPPORTED";

  constructor(capability: string) {
    super(`Provider does not support capability: ${capability}`);

    this.name = "ProviderCapabilityError";
  }
}
