/**
 * Node Properties Panel - Side panel for editing node properties
 */

import React, { useCallback } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { X } from 'lucide-react';

export const NodePropertiesPanel: React.FC = () => {
  const selectedNode = useWorkflowStore((state) => state.selectedNode);
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
  
  const handleChange = useCallback((field: string, value: string | number | undefined) => {
    if (selectedNode) {
      updateNode(selectedNode.id, { [field]: value });
    }
  }, [selectedNode, updateNode]);
  
  if (!selectedNode) {
    return null;
  }
  
  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Node Properties</h2>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={selectedNode.data.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provider
          </label>
          <select
            value={selectedNode.data.provider}
            onChange={(e) => handleChange('provider', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="azure-openai">Azure OpenAI</option>
            <option value="ollama">Ollama</option>
          </select>
        </div>
        
        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <input
            type="text"
            value={selectedNode.data.model}
            onChange={(e) => handleChange('model', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., gpt-4-turbo-preview"
          />
        </div>
        
        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperature: {selectedNode.data.temperature ?? 0.7}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={selectedNode.data.temperature ?? 0.7}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>
        
        {/* Max Tokens */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Tokens
          </label>
          <input
            type="number"
            value={selectedNode.data.maxTokens || ''}
            onChange={(e) => handleChange('maxTokens', parseInt(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 1000"
          />
        </div>
        
        {/* System Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            System Prompt
          </label>
          <textarea
            value={selectedNode.data.systemPrompt || ''}
            onChange={(e) => handleChange('systemPrompt', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            placeholder="You are a helpful assistant..."
          />
        </div>
        
        {/* User Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User Prompt
          </label>
          <textarea
            value={selectedNode.data.userPrompt}
            onChange={(e) => handleChange('userPrompt', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
            placeholder="Enter your prompt here. Use {{variables}} for dynamic content."
          />
        </div>
      </div>
    </div>
  );
};
