/**
 * Tests for Providers
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProviderRegistry } from '../src/providers/registry';
import { OpenAIProvider } from '../src/providers/openai';
import { AnthropicProvider } from '../src/providers/anthropic';
import { Provider } from '../src/types';

describe('Providers', () => {
  beforeEach(() => {
    ProviderRegistry.clear();
  });

  describe('OpenAIProvider', () => {
    let provider: OpenAIProvider;

    beforeEach(() => {
      provider = new OpenAIProvider('test-key');
    });

    it('should have correct provider name', () => {
      expect(provider.name).toBe(Provider.OPENAI);
    });

    it('should return default model', () => {
      const model = provider.getDefaultModel();
      expect(model).toBe('gpt-4-turbo-preview');
    });

    it('should validate correct config', async () => {
      const config = {
        provider: Provider.OPENAI,
        model: 'gpt-4',
        temperature: 0.7
      };

      const result = await provider.validateConfig(config);
      expect(result).toBe(true);
    });

    it('should reject invalid temperature', async () => {
      const config = {
        provider: Provider.OPENAI,
        model: 'gpt-4',
        temperature: 3
      };

      await expect(provider.validateConfig(config)).rejects.toThrow('Temperature');
    });

    it('should reject missing API key', async () => {
      const providerNoKey = new OpenAIProvider('');
      const config = {
        provider: Provider.OPENAI,
        model: 'gpt-4'
      };

      await expect(providerNoKey.validateConfig(config)).rejects.toThrow('API key');
    });

    it('should build messages with system prompt', () => {
      const messages = (provider as any).buildMessages(
        'You are helpful',
        'Hello'
      );

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toBe('You are helpful');
      expect(messages[1].role).toBe('user');
    });

    it('should build messages without system prompt', () => {
      const messages = (provider as any).buildMessages(
        undefined,
        'Hello'
      );

      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe('user');
    });
  });

  describe('AnthropicProvider', () => {
    let provider: AnthropicProvider;

    beforeEach(() => {
      provider = new AnthropicProvider('test-key');
    });

    it('should have correct provider name', () => {
      expect(provider.name).toBe(Provider.ANTHROPIC);
    });

    it('should return default model', () => {
      const model = provider.getDefaultModel();
      expect(model).toBe('claude-3-sonnet-20240229');
    });

    it('should validate correct config', async () => {
      const config = {
        provider: Provider.ANTHROPIC,
        model: 'claude-3',
        temperature: 0.5
      };

      const result = await provider.validateConfig(config);
      expect(result).toBe(true);
    });

    it('should reject temperature > 1', async () => {
      const config = {
        provider: Provider.ANTHROPIC,
        model: 'claude-3',
        temperature: 1.5
      };

      await expect(provider.validateConfig(config)).rejects.toThrow('Temperature');
    });

    it('should reject missing API key', async () => {
      const providerNoKey = new AnthropicProvider('');
      const config = {
        provider: Provider.ANTHROPIC,
        model: 'claude-3'
      };

      await expect(providerNoKey.validateConfig(config)).rejects.toThrow('API key');
    });
  });

  describe('ProviderRegistry', () => {
    it('should register and retrieve providers', () => {
      const mockProvider = new OpenAIProvider('test');
      ProviderRegistry.register(mockProvider);

      const retrieved = ProviderRegistry.get(Provider.OPENAI);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe(Provider.OPENAI);
    });

    it('should return undefined for unregistered provider', () => {
      const retrieved = ProviderRegistry.get(Provider.ANTHROPIC);
      expect(retrieved).toBeUndefined();
    });

    it('should create provider if not exists', () => {
      const provider = ProviderRegistry.getOrCreate(Provider.OPENAI, { apiKey: 'test' });
      expect(provider).toBeDefined();
      expect(provider.name).toBe(Provider.OPENAI);
    });

    it('should return existing provider on subsequent calls', () => {
      const mockProvider = new OpenAIProvider('test');
      ProviderRegistry.register(mockProvider);

      const first = ProviderRegistry.getOrCreate(Provider.OPENAI);
      const second = ProviderRegistry.getOrCreate(Provider.OPENAI);

      expect(first).toBe(second);
    });

    it('should get provider for config', () => {
      const config = { provider: Provider.OPENAI, model: 'gpt-4' };
      const provider = ProviderRegistry.getForConfig(config);
      expect(provider).toBeDefined();
    });

    it('should list all registered providers', () => {
      ProviderRegistry.register(new OpenAIProvider('test'));
      ProviderRegistry.register(new AnthropicProvider('test'));

      const providers = ProviderRegistry.list();
      expect(providers).toContain(Provider.OPENAI);
      expect(providers).toContain(Provider.ANTHROPIC);
    });

    it('should clear all providers', () => {
      ProviderRegistry.register(new OpenAIProvider('test'));
      ProviderRegistry.clear();

      const providers = ProviderRegistry.list();
      expect(providers).toHaveLength(0);
    });
  });

  describe('Token estimation', () => {
    it('should estimate tokens from text length', () => {
      const provider = new OpenAIProvider('test');
      const text = 'Hello world! This is a test.';
      const tokens = (provider as any).estimateTokens(text);

      expect(tokens.completion).toBeGreaterThan(0);
      expect(tokens.total).toBe(tokens.completion);
    });
  });
});
