/**
 * Core types and interfaces for PromptFlow
 */

import { z } from 'zod';

/**
 * Supported LLM providers
 */
export enum Provider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  AZURE_OPENAI = 'azure-openai',
  OLLAMA = 'ollama'
}

/**
 * Message role in a conversation
 */
export enum MessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant'
}

/**
 * Single message in a conversation
 */
export interface Message {
  role: MessageRole;
  content: string;
  name?: string;
}

/**
 * Provider-specific configuration
 */
export interface ProviderConfig {
  apiKey?: string;
  baseURL?: string;
  organization?: string;
  [key: string]: unknown;
}

/**
 * Model configuration for a prompt
 */
export interface ModelConfig {
  provider: Provider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  config?: ProviderConfig;
}

/**
 * Prompt node in a workflow
 */
export interface PromptNode {
  id: string;
  name: string;
  description?: string;
  model: ModelConfig;
  systemPrompt?: string;
  userPrompt: string;
  variables?: string[];
  retryConfig?: RetryConfig;
  cacheConfig?: CacheConfig;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  minTimeout: number;
  maxTimeout: number;
  factor: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled: boolean;
  ttl?: number; // Time to live in seconds
  keyPrefix?: string;
}

/**
 * Connection between nodes in a workflow
 */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  mapping?: Record<string, string>;
}

/**
 * Complete workflow definition
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: string;
  nodes: PromptNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, unknown>;
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    author?: string;
    tags?: string[];
  };
}

/**
 * Execution result from a node
 */
export interface NodeResult {
  nodeId: string;
  status: 'success' | 'error' | 'cached';
  output: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  duration?: number;
  error?: string;
  cached?: boolean;
}

/**
 * Complete workflow execution result
 */
export interface WorkflowResult {
  workflowId: string;
  status: 'success' | 'error' | 'partial';
  results: Map<string, NodeResult>;
  variables: Record<string, unknown>;
  duration: number;
  error?: string;
}

/**
 * Workflow execution context
 */
export interface ExecutionContext {
  workflow: Workflow;
  variables: Record<string, unknown>;
  results: Map<string, NodeResult>;
  startTime: number;
}

/**
 * LLM Provider interface
 */
export interface LLMProvider {
  name: Provider;
  complete(prompt: Message[], config: ModelConfig): Promise<CompletionResponse>;
  validateConfig(config: ModelConfig): Promise<boolean>;
}

/**
 * Completion response from LLM
 */
export interface CompletionResponse {
  content: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  finishReason?: string;
  raw?: unknown;
}

/**
 * Workflow validation error
 */
export interface ValidationError {
  node?: string;
  field: string;
  message: string;
}

// Zod schemas for validation
export const MessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
  name: z.string().optional()
});

export const ModelConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'azure-openai', 'ollama']),
  model: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  stopSequences: z.array(z.string()).optional(),
  config: z.record(z.string(), z.unknown()).optional()
});

export const PromptNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  model: ModelConfigSchema,
  systemPrompt: z.string().optional(),
  userPrompt: z.string(),
  variables: z.array(z.string()).optional(),
  retryConfig: z.object({
    maxAttempts: z.number().positive(),
    minTimeout: z.number().positive(),
    maxTimeout: z.number().positive(),
    factor: z.number().positive()
  }).optional(),
  cacheConfig: z.object({
    enabled: z.boolean(),
    ttl: z.number().positive().optional(),
    keyPrefix: z.string().optional()
  }).optional()
});

export const WorkflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  mapping: z.record(z.string(), z.string()).optional()
});

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string(),
  nodes: z.array(PromptNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
  variables: z.record(z.string(), z.unknown()).optional(),
  metadata: z.object({
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional()
});
