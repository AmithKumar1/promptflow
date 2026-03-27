/**
 * Anthropic Provider Implementation
 */

import { Provider, ModelConfig, Message, CompletionResponse } from '../types.js';
import { BaseProvider } from './base.js';

export class AnthropicProvider extends BaseProvider {
  readonly name = Provider.ANTHROPIC;

  private apiKey: string;
  private baseURL: string;

  constructor(apiKey?: string, baseURL?: string) {
    super();
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.baseURL = baseURL || 'https://api.anthropic.com';
  }

  getDefaultModel(): string {
    return 'claude-3-sonnet-20240229';
  }

  async validateConfig(config: ModelConfig): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    if (!config.model || config.model.trim() === '') {
      throw new Error('Model name is required');
    }

    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 1)) {
      throw new Error('Temperature must be between 0 and 1 for Anthropic');
    }

    return true;
  }

  async complete(messages: Message[], config: ModelConfig): Promise<CompletionResponse> {
    await this.validateConfig(config);

    const url = `${this.baseURL}/v1/messages`;

    // Anthropic requires system prompt separate from messages
    const systemMessage = messages.find(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    const body = {
      model: config.model,
      max_tokens: config.maxTokens || 1024,
      system: systemMessage?.content,
      messages: nonSystemMessages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: config.temperature ?? 1,
      top_p: config.topP,
      stop_sequences: config.stopSequences
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({ error: response.statusText }))) as { error?: { message?: string } };
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data = (await response.json()) as {
      content: [{ text: string }];
      usage?: { input_tokens: number; output_tokens: number };
      stop_reason?: string;
    };
    
    const content = data.content[0]?.text || '';
    const usage = data.usage;

    return {
      content,
      tokens: usage ? {
        prompt: usage.input_tokens,
        completion: usage.output_tokens,
        total: (usage.input_tokens || 0) + (usage.output_tokens || 0)
      } : this.estimateTokens(content),
      finishReason: data.stop_reason,
      raw: data
    };
  }
}
