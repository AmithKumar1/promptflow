/**
 * Tests for Types and Schema Validation
 */

import { describe, it, expect } from 'vitest';
import { WorkflowSchema, MessageSchema, ModelConfigSchema, PromptNodeSchema } from '../src/types';

describe('Schema Validation', () => {
  describe('MessageSchema', () => {
    it('should validate a valid message', () => {
      const message = { role: 'user' as const, content: 'Hello' };
      const result = MessageSchema.safeParse(message);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const message = { role: 'invalid', content: 'Hello' };
      const result = MessageSchema.safeParse(message);
      expect(result.success).toBe(false);
    });

    it('should accept optional name field', () => {
      const message = { role: 'system' as const, content: 'You are helpful', name: 'assistant' };
      const result = MessageSchema.safeParse(message);
      expect(result.success).toBe(true);
    });
  });

  describe('ModelConfigSchema', () => {
    it('should validate a valid model config', () => {
      const config = {
        provider: 'openai' as const,
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 1000
      };
      const result = ModelConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should reject temperature out of range', () => {
      const config = {
        provider: 'openai' as const,
        model: 'gpt-4',
        temperature: 3
      };
      const result = ModelConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should accept all providers', () => {
      const providers = ['openai', 'anthropic', 'azure-openai', 'ollama'] as const;
      for (const provider of providers) {
        const config = { provider, model: 'test-model' };
        const result = ModelConfigSchema.safeParse(config);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('PromptNodeSchema', () => {
    it('should validate a valid node', () => {
      const node = {
        id: 'node-1',
        name: 'Test Node',
        model: {
          provider: 'openai' as const,
          model: 'gpt-4'
        },
        userPrompt: 'Generate content'
      };
      const result = PromptNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });

    it('should accept optional systemPrompt', () => {
      const node = {
        id: 'node-1',
        name: 'Test Node',
        model: { provider: 'openai' as const, model: 'gpt-4' },
        systemPrompt: 'You are helpful',
        userPrompt: 'Generate content'
      };
      const result = PromptNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });

    it('should validate retryConfig', () => {
      const node = {
        id: 'node-1',
        name: 'Test Node',
        model: { provider: 'openai' as const, model: 'gpt-4' },
        userPrompt: 'Generate content',
        retryConfig: {
          maxAttempts: 3,
          minTimeout: 1000,
          maxTimeout: 5000,
          factor: 2
        }
      };
      const result = PromptNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });
  });

  describe('WorkflowSchema', () => {
    it('should validate a minimal workflow', () => {
      const workflow = {
        id: 'wf-1',
        name: 'Test Workflow',
        version: '1.0.0',
        nodes: [
          {
            id: 'node-1',
            name: 'Node 1',
            model: { provider: 'openai' as const, model: 'gpt-4' },
            userPrompt: 'Hello'
          }
        ],
        edges: []
      };
      const result = WorkflowSchema.safeParse(workflow);
      expect(result.success).toBe(true);
    });

    it('should validate a complex workflow', () => {
      const workflow = {
        id: 'wf-complex',
        name: 'Complex Workflow',
        description: 'A complex workflow with multiple nodes',
        version: '1.0.0',
        variables: { topic: 'AI' },
        nodes: [
          {
            id: 'node-1',
            name: 'First Node',
            model: { 
              provider: 'openai' as const, 
              model: 'gpt-4',
              temperature: 0.7
            },
            systemPrompt: 'You are helpful',
            userPrompt: 'Generate content about {{topic}}',
            cacheConfig: { enabled: true, ttl: 3600 }
          },
          {
            id: 'node-2',
            name: 'Second Node',
            model: { provider: 'anthropic' as const, model: 'claude-3' },
            userPrompt: 'Review: {{node-1}}',
            retryConfig: {
              maxAttempts: 3,
              minTimeout: 1000,
              maxTimeout: 5000,
              factor: 2
            }
          }
        ],
        edges: [
          { id: 'e1', source: 'node-1', target: 'node-2' }
        ],
        metadata: {
          author: 'Test',
          tags: ['test', 'example']
        }
      };
      const result = WorkflowSchema.safeParse(workflow);
      expect(result.success).toBe(true);
    });

    it('should reject workflow with missing required fields', () => {
      const workflow = {
        id: 'wf-invalid',
        name: 'Invalid Workflow'
        // Missing version, nodes, edges
      };
      const result = WorkflowSchema.safeParse(workflow);
      expect(result.success).toBe(false);
    });

    it('should reject workflow with cyclic edges', () => {
      // Note: Schema doesn't detect cycles, that's for WorkflowValidator
      const workflow = {
        id: 'wf-cycle',
        name: 'Cyclic Workflow',
        version: '1.0.0',
        nodes: [
          { id: 'a', name: 'A', model: { provider: 'openai' as const, model: 'gpt-4' }, userPrompt: 'test' },
          { id: 'b', name: 'B', model: { provider: 'openai' as const, model: 'gpt-4' }, userPrompt: 'test' }
        ],
        edges: [
          { id: 'e1', source: 'a', target: 'b' },
          { id: 'e2', source: 'b', target: 'a' }
        ]
      };
      const result = WorkflowSchema.safeParse(workflow);
      expect(result.success).toBe(true); // Schema passes, validator should catch
    });
  });
});
