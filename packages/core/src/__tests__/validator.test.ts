/**
 * Tests for Workflow Validator
 */

import { describe, it, expect } from 'vitest';
import { WorkflowValidator } from '../src/validator';

describe('WorkflowValidator', () => {
  describe('validate', () => {
    it('should validate a correct workflow', () => {
      const workflow = {
        id: 'wf-1',
        name: 'Test Workflow',
        version: '1.0.0' as const,
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

      const result = WorkflowValidator.validate(workflow);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate node IDs', () => {
      const workflow = {
        id: 'wf-1',
        name: 'Test Workflow',
        version: '1.0.0' as const,
        nodes: [
          { id: 'node-1', name: 'Node 1', model: { provider: 'openai' as const, model: 'gpt-4' }, userPrompt: 'Hello' },
          { id: 'node-1', name: 'Node 2', model: { provider: 'openai' as const, model: 'gpt-4' }, userPrompt: 'World' }
        ],
        edges: []
      };

      const result = WorkflowValidator.validate(workflow);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Duplicate'))).toBe(true);
    });

    it('should detect edges referencing non-existent nodes', () => {
      const workflow = {
        id: 'wf-1',
        name: 'Test Workflow',
        version: '1.0.0' as const,
        nodes: [
          { id: 'node-1', name: 'Node 1', model: { provider: 'openai' as const, model: 'gpt-4' }, userPrompt: 'Hello' }
        ],
        edges: [
          { id: 'e1', source: 'node-1', target: 'non-existent' }
        ]
      };

      const result = WorkflowValidator.validate(workflow);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('non-existent'))).toBe(true);
    });

    it('should detect cycles in workflow', () => {
      const workflow = {
        id: 'wf-cycle',
        name: 'Cyclic Workflow',
        version: '1.0.0' as const,
        nodes: [
          { id: 'a', name: 'A', model: { provider: 'openai' as const, model: 'gpt-4' }, userPrompt: 'test' },
          { id: 'b', name: 'B', model: { provider: 'openai' as const, model: 'gpt-4' }, userPrompt: 'test' }
        ],
        edges: [
          { id: 'e1', source: 'a', target: 'b' },
          { id: 'e2', source: 'b', target: 'a' }
        ]
      };

      const result = WorkflowValidator.validate(workflow);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('cycle'))).toBe(true);
    });

    it('should validate linear workflow correctly', () => {
      const workflow = {
        id: 'wf-linear',
        name: 'Linear Workflow',
        version: '1.0.0' as const,
        nodes: [
          { id: 'a', name: 'A', model: { provider: 'openai' as const, model: 'gpt-4' }, userPrompt: 'test' },
          { id: 'b', name: 'B', model: { provider: 'openai' as const, model: 'gpt-4' }, userPrompt: 'test' },
          { id: 'c', name: 'C', model: { provider: 'openai' as const, model: 'gpt-4' }, userPrompt: 'test' }
        ],
        edges: [
          { id: 'e1', source: 'a', target: 'b' },
          { id: 'e2', source: 'b', target: 'c' }
        ]
      };

      const result = WorkflowValidator.validate(workflow);
      expect(result.valid).toBe(true);
    });

    it('should validate workflow with variables', () => {
      const workflow = {
        id: 'wf-vars',
        name: 'Workflow with Variables',
        version: '1.0.0' as const,
        variables: {
          topic: 'AI',
          count: 5
        },
        nodes: [
          {
            id: 'node-1',
            name: 'Node 1',
            model: { provider: 'openai' as const, model: 'gpt-4' },
            userPrompt: 'Generate {{topic}} content',
            variables: ['topic']
          }
        ],
        edges: []
      };

      const result = WorkflowValidator.validate(workflow);
      expect(result.valid).toBe(true);
    });

    it('should detect invalid retryConfig', () => {
      const workflow = {
        id: 'wf-retry',
        name: 'Workflow with Invalid Retry',
        version: '1.0.0' as const,
        nodes: [
          {
            id: 'node-1',
            name: 'Node 1',
            model: { provider: 'openai' as const, model: 'gpt-4' },
            userPrompt: 'test',
            retryConfig: {
              maxAttempts: 0, // Invalid: must be at least 1
              minTimeout: 1000,
              maxTimeout: 5000,
              factor: 2
            }
          }
        ],
        edges: []
      };

      const result = WorkflowValidator.validate(workflow);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field.includes('retryConfig'))).toBe(true);
    });

    it('should detect invalid cacheConfig', () => {
      const workflow = {
        id: 'wf-cache',
        name: 'Workflow with Invalid Cache',
        version: '1.0.0' as const,
        nodes: [
          {
            id: 'node-1',
            name: 'Node 1',
            model: { provider: 'openai' as const, model: 'gpt-4' },
            userPrompt: 'test',
            cacheConfig: {
              enabled: true,
              ttl: 0 // Invalid: must be at least 1
            }
          }
        ],
        edges: []
      };

      const result = WorkflowValidator.validate(workflow);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field.includes('cacheConfig'))).toBe(true);
    });
  });

  describe('validateOrThrow', () => {
    it('should not throw for valid workflow', () => {
      const workflow = {
        id: 'wf-1',
        name: 'Test Workflow',
        version: '1.0.0' as const,
        nodes: [
          { id: 'node-1', name: 'Node', model: { provider: 'openai' as const, model: 'gpt-4' }, userPrompt: 'test' }
        ],
        edges: []
      };

      expect(() => WorkflowValidator.validateOrThrow(workflow)).not.toThrow();
    });

    it('should throw for invalid workflow', () => {
      const workflow = {
        id: 'wf-invalid',
        name: 'Invalid'
        // Missing required fields
      };

      expect(() => WorkflowValidator.validateOrThrow(workflow)).toThrow();
    });
  });
});
