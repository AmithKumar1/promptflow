/**
 * Provider Registry - Factory for creating provider instances
 */

import { Provider, ModelConfig } from '../types.js';
import { BaseProvider } from './base.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';

export class ProviderRegistry {
  private static providers: Map<Provider, BaseProvider> = new Map();

  /**
   * Register a provider instance
   */
  static register(provider: BaseProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Get a provider by name
   */
  static get(provider: Provider): BaseProvider | undefined {
    return this.providers.get(provider);
  }

  /**
   * Get or create a provider instance
   */
  static getOrCreate(provider: Provider, config?: { apiKey?: string; baseURL?: string }): BaseProvider {
    const existing = this.providers.get(provider);
    if (existing) {
      return existing;
    }

    let newProvider: BaseProvider;

    switch (provider) {
      case Provider.OPENAI:
        newProvider = new OpenAIProvider(config?.apiKey, config?.baseURL);
        break;
      case Provider.ANTHROPIC:
        newProvider = new AnthropicProvider(config?.apiKey, config?.baseURL);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    this.providers.set(provider, newProvider);
    return newProvider;
  }

  /**
   * Get provider for a model config
   */
  static getForConfig(config: ModelConfig): BaseProvider {
    const provider = this.getOrCreate(config.provider);
    if (!provider) {
      throw new Error(`Provider ${config.provider} not available`);
    }
    return provider;
  }

  /**
   * List all registered providers
   */
  static list(): Provider[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Clear all registered providers (useful for testing)
   */
  static clear(): void {
    this.providers.clear();
  }
}

// Auto-register default providers
ProviderRegistry.register(new OpenAIProvider());
ProviderRegistry.register(new AnthropicProvider());
