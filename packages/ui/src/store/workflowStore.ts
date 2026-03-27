/**
 * Workflow Store - Zustand store for workflow state management
 */

import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges
} from '@xyflow/react';

export type PromptFlowNode = Node<{
  label: string;
  provider: string;
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}>;

export interface WorkflowState {
  nodes: PromptFlowNode[];
  edges: Edge[];
  selectedNode: PromptFlowNode | null;
  workflowName: string;
  workflowDescription: string;
  
  // Actions
  onNodesChange: OnNodesChange<PromptFlowNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Omit<PromptFlowNode, 'id' | 'position'>) => void;
  updateNode: (id: string, data: Partial<PromptFlowNode['data']>) => void;
  deleteNode: (id: string) => void;
  setSelectedNode: (node: PromptFlowNode | null) => void;
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (desc: string) => void;
  exportWorkflow: () => object;
  importWorkflow: (workflow: object) => void;
  clearWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  workflowName: 'Untitled Workflow',
  workflowDescription: '',
  
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes)
    });
  },
  
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges)
    });
  },
  
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges)
    });
  },
  
  addNode: (nodeData) => {
    const newNode: PromptFlowNode = {
      id: `node-${Date.now()}`,
      type: 'prompt',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: nodeData.data.label,
        provider: nodeData.data.provider || 'openai',
        model: nodeData.data.model || 'gpt-4-turbo-preview',
        systemPrompt: nodeData.data.systemPrompt,
        userPrompt: nodeData.data.userPrompt || '',
        temperature: nodeData.data.temperature ?? 0.7,
        maxTokens: nodeData.data.maxTokens
      }
    };
    
    set({ nodes: [...get().nodes, newNode] });
  },
  
  updateNode: (id, data) => {
    set({
      nodes: get().nodes.map(node => 
        node.id === id 
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    });
  },
  
  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter(node => node.id !== id),
      edges: get().edges.filter(edge => 
        edge.source !== id && edge.target !== id
      ),
      selectedNode: get().selectedNode?.id === id ? null : get().selectedNode
    });
  },
  
  setSelectedNode: (node) => {
    set({ selectedNode: node });
  },
  
  setWorkflowName: (name) => {
    set({ workflowName: name });
  },
  
  setWorkflowDescription: (desc) => {
    set({ workflowDescription: desc });
  },
  
  exportWorkflow: () => {
    const { nodes, edges, workflowName, workflowDescription } = get();
    
    return {
      id: `workflow-${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      version: '1.0.0',
      nodes: nodes.map(node => ({
        id: node.id,
        name: node.data.label,
        model: {
          provider: node.data.provider,
          model: node.data.model,
          temperature: node.data.temperature,
          maxTokens: node.data.maxTokens
        },
        systemPrompt: node.data.systemPrompt,
        userPrompt: node.data.userPrompt
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target
      }))
    };
  },
  
  importWorkflow: (workflow) => {
    const wf = workflow as Record<string, unknown>;
    
    if (typeof wf.name === 'string') {
      set({ workflowName: wf.name });
    }
    if (typeof wf.description === 'string') {
      set({ workflowDescription: wf.description });
    }
    
    if (Array.isArray(wf.nodes)) {
      const nodes: PromptFlowNode[] = wf.nodes.map((n: Record<string, unknown>) => ({
        id: String(n.id),
        type: 'prompt',
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: {
          label: String(n.name || 'Node'),
          provider: String((n.model as Record<string, unknown>)?.provider || 'openai'),
          model: String((n.model as Record<string, unknown>)?.model || 'gpt-4-turbo-preview'),
          systemPrompt: n.systemPrompt as string,
          userPrompt: String(n.userPrompt || ''),
          temperature: (n.model as Record<string, unknown>)?.temperature as number ?? 0.7
        }
      }));
      set({ nodes });
    }
    
    if (Array.isArray(wf.edges)) {
      const edges: Edge[] = wf.edges.map((e: Record<string, unknown>) => ({
        id: String(e.id),
        source: String(e.source),
        target: String(e.target)
      }));
      set({ edges });
    }
  },
  
  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      workflowName: 'Untitled Workflow',
      workflowDescription: ''
    });
  }
}));
