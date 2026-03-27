/**
 * Workflow Validator - Validates workflow definitions
 */

import { Workflow, ValidationError, WorkflowSchema } from '../types';
import { ProviderRegistry } from '../providers/registry';

export class WorkflowValidator {
  /**
   * Validate a workflow definition
   */
  static validate(workflow: unknown): { valid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    // Schema validation
    const schemaResult = WorkflowSchema.safeParse(workflow);
    if (!schemaResult.success) {
      for (const issue of schemaResult.error.issues) {
        errors.push({
          field: issue.path.join('.'),
          message: issue.message
        });
      }
      return { valid: false, errors };
    }

    const typedWorkflow = schemaResult.data as Workflow;

    // Check for duplicate node IDs
    const nodeIds = new Set<string>();
    for (const node of typedWorkflow.nodes) {
      if (nodeIds.has(node.id)) {
        errors.push({
          node: node.id,
          field: 'id',
          message: `Duplicate node ID: ${node.id}`
        });
      }
      nodeIds.add(node.id);
    }

    // Validate edges reference existing nodes
    for (const edge of typedWorkflow.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push({
          field: `edges.${edge.id}.source`,
          message: `Edge source '${edge.source}' references non-existent node`
        });
      }
      if (!nodeIds.has(edge.target)) {
        errors.push({
          field: `edges.${edge.id}.target`,
          message: `Edge target '${edge.target}' references non-existent node`
        });
      }
    }

    // Check for cycles in the workflow
    const hasCycle = this.detectCycle(typedWorkflow.nodes, typedWorkflow.edges);
    if (hasCycle) {
      errors.push({
        field: 'edges',
        message: 'Workflow contains cycles - must be a DAG (Directed Acyclic Graph)'
      });
    }

    // Validate node configurations
    for (const node of typedWorkflow.nodes) {
      // Check for duplicate variable names
      if (node.variables) {
        const varNames = new Set<string>();
        for (const variable of node.variables) {
          if (varNames.has(variable)) {
            errors.push({
              node: node.id,
              field: 'variables',
              message: `Duplicate variable name: ${variable}`
            });
          }
          varNames.add(variable);
        }
      }

      // Validate model configuration
      const provider = ProviderRegistry.get(node.model.provider);
      if (!provider) {
        errors.push({
          node: node.id,
          field: 'model.provider',
          message: `Unknown provider: ${node.model.provider}`
        });
      }

      // Validate retry config
      if (node.retryConfig) {
        if (node.retryConfig.maxAttempts < 1) {
          errors.push({
            node: node.id,
            field: 'retryConfig.maxAttempts',
            message: 'maxAttempts must be at least 1'
          });
        }
        if (node.retryConfig.minTimeout < 0) {
          errors.push({
            node: node.id,
            field: 'retryConfig.minTimeout',
            message: 'minTimeout must be non-negative'
          });
        }
        if (node.retryConfig.maxTimeout < node.retryConfig.minTimeout) {
          errors.push({
            node: node.id,
            field: 'retryConfig',
            message: 'maxTimeout must be >= minTimeout'
          });
        }
      }

      // Validate cache config
      if (node.cacheConfig) {
        if (node.cacheConfig.ttl !== undefined && node.cacheConfig.ttl < 1) {
          errors.push({
            node: node.id,
            field: 'cacheConfig.ttl',
            message: 'cache TTL must be at least 1 second'
          });
        }
      }
    }

    // Validate edge mappings reference valid variables
    for (const edge of typedWorkflow.edges) {
      if (edge.mapping) {
        const sourceNode = typedWorkflow.nodes.find((n: Workflow['nodes'][0]) => n.id === edge.source);
        if (sourceNode && edge.mapping) {
          for (const [key, value] of Object.entries(edge.mapping)) {
            // Check if mapping references valid source outputs
            if (typeof value !== 'string' || !value.startsWith('{{') || !value.endsWith('}}')) {
              continue; // Not a variable reference
            }
            
            const varName = value.slice(2, -2).trim();
            if (varName !== 'output' && !sourceNode.variables?.includes(varName)) {
              errors.push({
                node: edge.source,
                field: `edges.${edge.id}.mapping.${key}`,
                message: `Mapping references undefined variable: ${varName}`
              });
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Detect cycles in the workflow graph using DFS
   */
  private static detectCycle(
    nodes: Workflow['nodes'],
    edges: Workflow['edges']
  ): boolean {
    const nodeIds = nodes.map((n: Workflow['nodes'][0]) => n.id);
    const adjacency = new Map<string, string[]>();
    
    // Build adjacency list
    for (const nodeId of nodeIds) {
      adjacency.set(nodeId, []);
    }
    
    for (const edge of edges) {
      const targets = adjacency.get(edge.source) || [];
      targets.push(edge.target);
      adjacency.set(edge.source, targets);
    }

    // DFS with coloring
    const WHITE = 0; // Not visited
    const GRAY = 1;  // Being processed
    const BLACK = 2; // Fully processed
    
    const color = new Map<string, number>();
    for (const nodeId of nodeIds) {
      color.set(nodeId, WHITE);
    }

    const hasCycleFromNode = (nodeId: string): boolean => {
      color.set(nodeId, GRAY);
      
      const neighbors = adjacency.get(nodeId) || [];
      for (const neighbor of neighbors) {
        const neighborColor = color.get(neighbor) || WHITE;
        
        if (neighborColor === GRAY) {
          return true; // Back edge found - cycle!
        }
        
        if (neighborColor === WHITE && hasCycleFromNode(neighbor)) {
          return true;
        }
      }
      
      color.set(nodeId, BLACK);
      return false;
    };

    for (const nodeId of nodeIds) {
      if (color.get(nodeId) === WHITE) {
        if (hasCycleFromNode(nodeId)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Quick validation - returns true if valid, throws if invalid
   */
  static validateOrThrow(workflow: unknown): workflow is Workflow {
    const result = this.validate(workflow);
    if (!result.valid) {
      const errorMessages = result.errors.map(e => 
        `${e.node ? `[${e.node}] ` : ''}${e.field}: ${e.message}`
      ).join('\n');
      throw new Error(`Workflow validation failed:\n${errorMessages}`);
    }
    return true;
  }
}
