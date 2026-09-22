import type {
  SecurityProvider,
  SecurityProviderType,
} from "../../types/provider.types.js";

export interface ProviderFactory {
  create(type: SecurityProviderType): SecurityProvider;
}
