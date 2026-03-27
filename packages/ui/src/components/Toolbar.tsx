/**
 * Toolbar Component - Top toolbar for workflow actions
 */

import React from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { Plus, Download, Upload, Trash2, Play, FileJson } from 'lucide-react';

interface ToolbarProps {
  onAddNode: (provider: string) => void;
  onRun: () => void;
  onSave: () => void;
  onLoad: () => void;
  onExport: (format: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onRun,
  onSave,
  onLoad,
  onExport
}) => {
  const workflowName = useWorkflowStore((state) => state.workflowName);
  
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{workflowName}</h1>
          <p className="text-xs text-gray-500">Visual Workflow Editor</p>
        </div>
        
        <div className="h-8 w-px bg-gray-200" />
        
        {/* Add Node Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddNode('openai')}
            className="btn-primary flex items-center gap-2"
            title="Add OpenAI node"
          >
            <Plus className="w-4 h-4" />
            OpenAI
          </button>
          <button
            onClick={() => onAddNode('anthropic')}
            className="btn-secondary flex items-center gap-2"
            title="Add Anthropic node"
          >
            <Plus className="w-4 h-4" />
            Anthropic
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onRun}
          className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
          title="Run workflow"
        >
          <Play className="w-4 h-4" />
          Run
        </button>
        
        <button
          onClick={onSave}
          className="btn-secondary flex items-center gap-2"
          title="Save workflow"
        >
          <Download className="w-4 h-4" />
          Save
        </button>
        
        <button
          onClick={onLoad}
          className="btn-secondary flex items-center gap-2"
          title="Load workflow"
        >
          <Upload className="w-4 h-4" />
          Load
        </button>
        
        <div className="relative group">
          <button className="btn-secondary flex items-center gap-2">
            <FileJson className="w-4 h-4" />
            Export
          </button>
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <button
              onClick={() => onExport('json')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              JSON
            </button>
            <button
              onClick={() => onExport('yaml')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              YAML
            </button>
            <button
              onClick={() => onExport('mermaid')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              Mermaid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
