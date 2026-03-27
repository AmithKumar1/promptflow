/**
 * Prompt Node Component - Custom node for prompt workflows
 */

import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { useWorkflowStore, PromptFlowNode } from '../store/workflowStore';
import { Trash2, Settings, Zap } from 'lucide-react';

type PromptNodeData = PromptFlowNode['data'];

function PromptNodeComponent({ id, data, selected }: NodeProps<PromptFlowNode>) {
  const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  
  const handleSelect = useCallback(() => {
    setSelectedNode({ id, data, position: { x: 0, y: 0 }, type: 'prompt' });
  }, [id, data, setSelectedNode]);
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  }, [id, deleteNode]);
  
  const providerColors: Record<string, string> = {
    openai: 'bg-green-500',
    anthropic: 'bg-orange-500',
    'azure-openai': 'bg-blue-500',
    ollama: 'bg-purple-500'
  };
  
  const providerColor = providerColors[data.provider] || 'bg-gray-500';
  
  return (
    <div
      className={`bg-white rounded-lg shadow-lg border-2 min-w-[280px] max-w-[320px] ${
        selected ? 'border-blue-500' : 'border-gray-200'
      } hover:shadow-xl transition-shadow cursor-pointer`}
      onClick={handleSelect}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-t-md border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${providerColor}`} />
          <span className="font-semibold text-gray-800">{data.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-4 h-4 text-yellow-500" />
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 rounded transition-colors"
            title="Delete node"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
      
      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <div className="text-xs text-gray-500">
          <span className="font-medium">Provider:</span> {data.provider}
        </div>
        <div className="text-xs text-gray-500">
          <span className="font-medium">Model:</span> {data.model}
        </div>
        {data.temperature !== undefined && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">Temperature:</span> {data.temperature}
          </div>
        )}
        {data.userPrompt && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 line-clamp-3">
            {data.userPrompt}
          </div>
        )}
      </div>
      
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-400 !w-3 !h-3"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-400 !w-3 !h-3"
      />
    </div>
  );
}

export default memo(PromptNodeComponent);
