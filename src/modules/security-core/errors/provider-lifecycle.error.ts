export class ProviderLifecycleError extends Error {
  public readonly code = "INVALID_PROVIDER_LIFECYCLE_TRANSITION";

  constructor(
    public readonly from: string,
    public readonly to: string,
  ) {
    super(`Invalid provider lifecycle transition: ${from} -> ${to}`);

    this.name = "ProviderLifecycleError";
  }
}
