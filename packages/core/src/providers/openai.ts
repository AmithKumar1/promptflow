/**
 * OpenAI Provider Implementation
 */

import { Provider, ModelConfig, Message, CompletionResponse } from '../types.js';
import { BaseProvider } from './base.js';

export class OpenAIProvider extends BaseProvider {
  readonly name = Provider.OPENAI;

  private apiKey: string;
  private baseURL: string;

  constructor(apiKey?: string, baseURL?: string) {
    super();
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.baseURL = baseURL || 'https://api.openai.com/v1';
  }

  getDefaultModel(): string {
    return 'gpt-4-turbo-preview';
  }

  async validateConfig(config: ModelConfig): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // Validate model name format
    if (!config.model || config.model.trim() === '') {
      throw new Error('Model name is required');
    }

    // Validate temperature range
    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
      throw new Error('Temperature must be between 0 and 2');
    }

    return true;
  }

  async complete(messages: Message[], config: ModelConfig): Promise<CompletionResponse> {
    await this.validateConfig(config);

    const url = `${this.baseURL}/chat/completions`;
    
    const body = {
      model: config.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        name: m.name
      })),
      temperature: config.temperature ?? 1,
      max_tokens: config.maxTokens,
      top_p: config.topP,
      frequency_penalty: config.frequencyPenalty,
      presence_penalty: config.presencePenalty,
      stop: config.stopSequences
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...(config.config?.organization ? { 'OpenAI-Organization': config.config.organization } : {})
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({ error: response.statusText }))) as { error?: { message?: string } };
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = (await response.json()) as {
      choices: [{ message: { content: string }; finish_reason?: string }];
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };
    
    const content = data.choices[0]?.message?.content || '';
    const usage = data.usage;

    return {
      content,
      tokens: usage ? {
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.total_tokens
      } : this.estimateTokens(content),
      finishReason: data.choices[0]?.finish_reason,
      raw: data
    };
  }
}
