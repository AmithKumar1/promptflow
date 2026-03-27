/**
 * Workflow Executor - Executes prompt workflows with caching and retry support
 */

import { Workflow, WorkflowResult, NodeResult, ExecutionContext, Message, RetryConfig } from '../types';
import { ProviderRegistry } from '../providers/registry';
import NodeCache from 'node-cache';
import pRetry from 'p-retry';
import { createHash } from 'crypto';

export class WorkflowExecutor {
  private cache: NodeCache;

  constructor() {
    // Default cache: check every 60 seconds, items expire after 5 minutes
    this.cache = new NodeCache({ 
      stdTTL: 300,
      checkperiod: 60,
      useClones: false
    });
  }

  /**
   * Execute a complete workflow
   */
  async execute(
    workflow: Workflow,
    initialVariables: Record<string, unknown> = {}
  ): Promise<WorkflowResult> {
    const startTime = Date.now();
    const context: ExecutionContext = {
      workflow,
      variables: { ...workflow.variables, ...initialVariables },
      results: new Map(),
      startTime
    };

    // Topological sort to determine execution order
    const sortedNodes = this.topologicalSort(workflow.nodes, workflow.edges);
    
    let workflowStatus: 'success' | 'error' | 'partial' = 'success';
    let workflowError: string | undefined;

    try {
      for (const node of sortedNodes) {
        try {
          const result = await this.executeNode(node, context);
          context.results.set(node.id, result);

          // Update variables with node output
          context.variables[node.id] = result.output;
          context.variables[`nodes.${node.id}.output`] = result.output;

          if (result.status === 'error') {
            workflowStatus = 'partial';
          }
        } catch (error) {
          workflowStatus = 'partial';
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          context.results.set(node.id, {
            nodeId: node.id,
            status: 'error',
            output: '',
            error: errorMessage
          });
        }
      }
    } catch (error) {
      workflowStatus = 'error';
      workflowError = error instanceof Error ? error.message : 'Unknown workflow error';
    }

    return {
      workflowId: workflow.id,
      status: workflowStatus,
      results: context.results,
      variables: context.variables,
      duration: Date.now() - startTime,
      error: workflowError
    };
  }

  /**
   * Execute a single node with retry and caching
   */
  private async executeNode(
    node: Workflow['nodes'][0],
    context: ExecutionContext
  ): Promise<NodeResult> {
    const startTime = Date.now();

    // Check cache first
    if (node.cacheConfig?.enabled) {
      const cacheKey = this.getCacheKey(node, context.variables);
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        return {
          nodeId: node.id,
          status: 'cached',
          output: cached as string,
          cached: true,
          duration: 0
        };
      }
    }

    // Build messages with variable substitution
    const userPrompt = this.substituteVariables(node.userPrompt, context.variables);
    const systemPrompt = node.systemPrompt 
      ? this.substituteVariables(node.systemPrompt, context.variables)
      : undefined;

    const messages: Message[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: userPrompt });

    // Execute with retry
    const retryConfig: Required<RetryConfig> = {
      maxAttempts: node.retryConfig?.maxAttempts ?? 3,
      minTimeout: node.retryConfig?.minTimeout ?? 1000,
      maxTimeout: node.retryConfig?.maxTimeout ?? 10000,
      factor: node.retryConfig?.factor ?? 2
    };

    try {
      const provider = ProviderRegistry.getForConfig(node.model);
      
      const response = await pRetry(
        () => provider.complete(messages, node.model),
        {
          retries: retryConfig.maxAttempts - 1,
          minTimeout: retryConfig.minTimeout,
          maxTimeout: retryConfig.maxTimeout,
          factor: retryConfig.factor,
          shouldRetry: (error) => {
            // Retry on rate limit or network errors
            return error instanceof Error && 
              (error.message.includes('rate limit') || 
               error.message.includes('timeout') ||
               error.message.includes('network'));
          }
        }
      );

      const duration = Date.now() - startTime;

      const result: NodeResult = {
        nodeId: node.id,
        status: 'success',
        output: response.content,
        tokens: response.tokens,
        duration
      };

      // Cache the result
      if (node.cacheConfig?.enabled) {
        const cacheKey = this.getCacheKey(node, context.variables);
        const ttl = node.cacheConfig.ttl;
        this.cache.set(cacheKey, response.content, ttl);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        nodeId: node.id,
        status: 'error',
        output: '',
        error: errorMessage,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Substitute variables in a prompt string
   */
  private substituteVariables(prompt: string, variables: Record<string, unknown>): string {
    return prompt.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      
      // Support nested access with dot notation
      const value = this.getNestedValue(variables, trimmedKey);
      
      if (value === undefined) {
        return match; // Keep original if not found
      }
      
      return String(value);
    });
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;
    
    for (const key of keys) {
      if (typeof current !== 'object' || current === null) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }
    
    return current;
  }

  /**
   * Generate cache key from node and variables
   */
  private getCacheKey(
    node: Workflow['nodes'][0],
    variables: Record<string, unknown>
  ): string {
    const prefix = node.cacheConfig?.keyPrefix || node.id;
    const content = JSON.stringify({
      node: {
        id: node.id,
        systemPrompt: node.systemPrompt,
        userPrompt: node.userPrompt,
        model: node.model
      },
      variables
    });
    
    const hash = createHash('sha256').update(content).digest('hex');
    return `${prefix}:${hash}`;
  }

  /**
   * Topological sort of nodes based on edges
   */
  private topologicalSort(
    nodes: Workflow['nodes'],
    edges: Workflow['edges']
  ): Workflow['nodes'] {
    const nodeMap = new Map<string, Workflow['nodes'][0]>(nodes.map((n: Workflow['nodes'][0]) => [n.id, n]));
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();

    // Initialize
    for (const node of nodes) {
      inDegree.set(node.id, 0);
      adjacency.set(node.id, []);
    }

    // Build graph
    for (const edge of edges) {
      const targets = adjacency.get(edge.source) || [];
      targets.push(edge.target);
      adjacency.set(edge.source, targets);
      
      const current = inDegree.get(edge.target) || 0;
      inDegree.set(edge.target, current + 1);
    }

    // Kahn's algorithm
    const queue: string[] = [];
    const result: Workflow['nodes'] = [];

    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentNode = nodeMap.get(currentId);
      
      if (currentNode) {
        result.push(currentNode);
      }

      const neighbors = adjacency.get(currentId) || [];
      for (const neighborId of neighbors) {
        const currentDegree = inDegree.get(neighborId) || 0;
        inDegree.set(neighborId, currentDegree - 1);
        
        if (currentDegree - 1 === 0) {
          queue.push(neighborId);
        }
      }
    }

    // Check for cycles
    if (result.length !== nodes.length) {
      throw new Error('Workflow contains cycles - cannot determine execution order');
    }

    return result;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.flushAll();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { keys: number; hits: number; misses: number } {
    return {
      keys: this.cache.keys().length,
      hits: this.cache.getStats().hits,
      misses: this.cache.getStats().misses
    };
  }
}
