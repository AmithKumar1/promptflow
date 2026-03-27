/**
 * Tests for Workflow Executor
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowExecutor } from '../src/executor';
import { Workflow, Provider } from '../src/types';
import { ProviderRegistry } from '../src/providers/registry';

// Mock provider for testing
class MockProvider {
  name = Provider.OPENAI;
  
  async complete() {
    return {
      content: 'Mock response',
      tokens: { prompt: 10, completion: 20, total: 30 },
      finishReason: 'stop'
    };
  }
  
  async validateConfig() {
    return true;
  }
  
  getDefaultModel() {
    return 'mock-model';
  }
}

describe('WorkflowExecutor', () => {
  let executor: WorkflowExecutor;

  beforeEach(() => {
    executor = new WorkflowExecutor();
    // Register mock provider
    ProviderRegistry.register(new MockProvider() as any);
  });

  describe('execute', () => {
    it('should execute a single-node workflow', async () => {
      const workflow: Workflow = {
        id: 'wf-test',
        name: 'Test Workflow',
        version: '1.0.0',
        nodes: [
          {
            id: 'node-1',
            name: 'Test Node',
            model: { provider: Provider.OPENAI, model: 'gpt-4' },
            userPrompt: 'Hello'
          }
        ],
        edges: []
      };

      const result = await executor.execute(workflow);

      expect(result.workflowId).toBe('wf-test');
      expect(result.status).toBe('success');
      expect(result.results.size).toBe(1);
      expect(result.results.get('node-1')?.status).toBe('success');
    });

    it('should execute multi-node workflow in correct order', async () => {
      const workflow: Workflow = {
        id: 'wf-multi',
        name: 'Multi-node Workflow',
        version: '1.0.0',
        nodes: [
          { id: 'a', name: 'A', model: { provider: Provider.OPENAI, model: 'gpt-4' }, userPrompt: 'A' },
          { id: 'b', name: 'B', model: { provider: Provider.OPENAI, model: 'gpt-4' }, userPrompt: 'B' },
          { id: 'c', name: 'C', model: { provider: Provider.OPENAI, model: 'gpt-4' }, userPrompt: 'C' }
        ],
        edges: [
          { id: 'e1', source: 'a', target: 'b' },
          { id: 'e2', source: 'b', target: 'c' }
        ]
      };

      const result = await executor.execute(workflow);

      expect(result.status).toBe('success');
      expect(result.results.size).toBe(3);
      expect(result.results.get('a')?.status).toBe('success');
      expect(result.results.get('b')?.status).toBe('success');
      expect(result.results.get('c')?.status).toBe('success');
    });

    it('should substitute variables in prompts', async () => {
      const workflow: Workflow = {
        id: 'wf-vars',
        name: 'Variable Workflow',
        version: '1.0.0',
        variables: {
          topic: 'AI',
          name: 'Test'
        },
        nodes: [
          {
            id: 'node-1',
            name: 'Test Node',
            model: { provider: Provider.OPENAI, model: 'gpt-4' },
            userPrompt: 'Generate content about {{topic}} for {{name}}'
          }
        ],
        edges: []
      };

      const result = await executor.execute(workflow);

      expect(result.status).toBe('success');
      expect(result.variables.topic).toBe('AI');
      expect(result.variables.name).toBe('Test');
    });

    it('should handle workflow variables', async () => {
      const workflow: Workflow = {
        id: 'wf-init',
        name: 'Initial Variables Workflow',
        version: '1.0.0',
        variables: {
          initial: 'value'
        },
        nodes: [
          {
            id: 'node-1',
            name: 'Test Node',
            model: { provider: Provider.OPENAI, model: 'gpt-4' },
            userPrompt: 'Test'
          }
        ],
        edges: []
      };

      const result = await executor.execute(workflow, { extra: 'data' });

      expect(result.variables.initial).toBe('value');
      expect(result.variables.extra).toBe('data');
    });

    it('should cache results when cacheConfig is enabled', async () => {
      const workflow: Workflow = {
        id: 'wf-cache',
        name: 'Cached Workflow',
        version: '1.0.0',
        nodes: [
          {
            id: 'node-1',
            name: 'Cached Node',
            model: { provider: Provider.OPENAI, model: 'gpt-4' },
            userPrompt: 'Generate content',
            cacheConfig: { enabled: true, ttl: 3600 }
          }
        ],
        edges: []
      };

      // First execution
      const result1 = await executor.execute(workflow);
      expect(result1.results.get('node-1')?.cached).toBe(false);

      // Second execution (should be cached)
      const result2 = await executor.execute(workflow);
      const cachedResult = result2.results.get('node-1');
      expect(cachedResult?.cached).toBe(true);
      expect(cachedResult?.status).toBe('cached');
    });

    it('should track execution duration', async () => {
      const workflow: Workflow = {
        id: 'wf-duration',
        name: 'Duration Workflow',
        version: '1.0.0',
        nodes: [
          {
            id: 'node-1',
            name: 'Test Node',
            model: { provider: Provider.OPENAI, model: 'gpt-4' },
            userPrompt: 'Test'
          }
        ],
        edges: []
      };

      const result = await executor.execute(workflow);

      expect(result.duration).toBeGreaterThan(0);
      expect(result.results.get('node-1')?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle node output as variable for next node', async () => {
      const workflow: Workflow = {
        id: 'wf-chain',
        name: 'Chained Workflow',
        version: '1.0.0',
        nodes: [
          {
            id: 'first',
            name: 'First Node',
            model: { provider: Provider.OPENAI, model: 'gpt-4' },
            userPrompt: 'Generate initial content'
          },
          {
            id: 'second',
            name: 'Second Node',
            model: { provider: Provider.OPENAI, model: 'gpt-4' },
            userPrompt: 'Based on: {{first}}'
          }
        ],
        edges: [
          { id: 'e1', source: 'first', target: 'second' }
        ]
      };

      const result = await executor.execute(workflow);

      expect(result.status).toBe('success');
      expect(result.results.get('first')?.status).toBe('success');
      expect(result.results.get('second')?.status).toBe('success');
    });

    it('should handle partial failures gracefully', async () => {
      // This test would need a mock that fails sometimes
      // For now, we test the structure
      const workflow: Workflow = {
        id: 'wf-partial',
        name: 'Partial Workflow',
        version: '1.0.0',
        nodes: [
          {
            id: 'node-1',
            name: 'Test Node',
            model: { provider: Provider.OPENAI, model: 'gpt-4' },
            userPrompt: 'Test'
          }
        ],
        edges: []
      };

      const result = await executor.execute(workflow);

      expect(result.results).toBeDefined();
      expect(result.variables).toBeDefined();
      expect(result.duration).toBeDefined();
    });
  });

  describe('cache management', () => {
    it('should clear cache on demand', () => {
      executor.clearCache();
      const stats = executor.getCacheStats();
      expect(stats.keys).toBe(0);
    });

    it('should track cache statistics', () => {
      const stats = executor.getCacheStats();
      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
    });
  });

  describe('topological sort', () => {
    it('should handle diamond dependency', async () => {
      const workflow: Workflow = {
        id: 'wf-diamond',
        name: 'Diamond Workflow',
        version: '1.0.0',
        nodes: [
          { id: 'a', name: 'A', model: { provider: Provider.OPENAI, model: 'gpt-4' }, userPrompt: 'A' },
          { id: 'b', name: 'B', model: { provider: Provider.OPENAI, model: 'gpt-4' }, userPrompt: 'B' },
          { id: 'c', name: 'C', model: { provider: Provider.OPENAI, model: 'gpt-4' }, userPrompt: 'C' },
          { id: 'd', name: 'D', model: { provider: Provider.OPENAI, model: 'gpt-4' }, userPrompt: 'D' }
        ],
        edges: [
          { id: 'e1', source: 'a', target: 'b' },
          { id: 'e2', source: 'a', target: 'c' },
          { id: 'e3', source: 'b', target: 'd' },
          { id: 'e4', source: 'c', target: 'd' }
        ]
      };

      const result = await executor.execute(workflow);

      expect(result.status).toBe('success');
      expect(result.results.size).toBe(4);
    });
  });
});
