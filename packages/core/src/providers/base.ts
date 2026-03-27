/**
 * Base provider interface for LLM providers
 */

import { Provider, ModelConfig, Message, CompletionResponse, MessageRole } from '../types';

export abstract class BaseProvider {
  abstract readonly name: Provider;

  /**
   * Generate a completion from the LLM
   */
  abstract complete(messages: Message[], config: ModelConfig): Promise<CompletionResponse>;

  /**
   * Validate that the provider configuration is correct
   */
  abstract validateConfig(config: ModelConfig): Promise<boolean>;

  /**
   * Get the default model for this provider
   */
  abstract getDefaultModel(): string;

  /**
   * Build messages array from system and user prompts
   */
  protected buildMessages(
    systemPrompt: string | undefined,
    userPrompt: string
  ): Message[] {
    const messages: Message[] = [];
    
    if (systemPrompt) {
      messages.push({
        role: MessageRole.SYSTEM,
        content: systemPrompt
      });
    }
    
    messages.push({
      role: MessageRole.USER,
      content: userPrompt
    });
    
    return messages;
  }

  /**
   * Calculate token usage from response
   */
  protected estimateTokens(text: string): { prompt: number; completion: number; total: number } {
    // Rough estimation: ~4 characters per token
    const completionTokens = Math.ceil(text.length / 4);
    return {
      prompt: 0, // Will be calculated by actual provider
      completion: completionTokens,
      total: completionTokens
    };
  }
}
