/**
 * PromptFlow App - Main application component
 */

import React, { useCallback } from 'react';
import { useWorkflowStore } from './store/workflowStore';
import { Toolbar } from './components/Toolbar';
import { WorkflowEditor } from './components/WorkflowEditor';
import { NodePropertiesPanel } from './components/NodePropertiesPanel';
import yaml from 'yaml';

const App: React.FC = () => {
  const addNode = useWorkflowStore((state) => state.addNode);
  const exportWorkflow = useWorkflowStore((state) => state.exportWorkflow);
  const importWorkflow = useWorkflowStore((state) => state.importWorkflow);
  
  const handleAddNode = useCallback((provider: string) => {
    const modelDefaults: Record<string, string> = {
      openai: 'gpt-4-turbo-preview',
      anthropic: 'claude-3-sonnet-20240229',
      'azure-openai': 'gpt-4',
      ollama: 'llama2'
    };
    
    addNode({
      data: {
        label: `${provider === 'openai' ? 'OpenAI' : provider === 'anthropic' ? 'Anthropic' : provider} Node`,
        provider,
        model: modelDefaults[provider] || 'gpt-4-turbo-preview',
        userPrompt: 'Enter your prompt here...',
        temperature: 0.7
      },
      position: { x: 250, y: 150 }
    });
  }, [addNode]);
  
  const handleRun = useCallback(() => {
    const workflow = exportWorkflow();
    console.log('Running workflow:', workflow);
    alert('Workflow execution - integrate with backend API to run workflows');
  }, [exportWorkflow]);
  
  const handleSave = useCallback(() => {
    const workflow = exportWorkflow();
    const yamlStr = yaml.stringify(workflow);
    
    const blob = new Blob([yamlStr], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportWorkflow]);
  
  const handleLoad = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yaml,.yml,.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          let workflow;
          
          if (file.name.endsWith('.json')) {
            workflow = JSON.parse(content);
          } else {
            workflow = yaml.parse(content);
          }
          
          importWorkflow(workflow);
        } catch (error) {
          console.error('Failed to load workflow:', error);
          alert('Failed to load workflow. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }, [importWorkflow]);
  
  const handleExport = useCallback((format: string) => {
    const workflow = exportWorkflow();
    let content: string;
    let mimeType: string;
    let extension: string;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(workflow, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'yaml':
        content = yaml.stringify(workflow);
        mimeType = 'text/yaml';
        extension = 'yaml';
        break;
      case 'mermaid':
        // Simple mermaid export
        content = `graph TD\n${workflow.nodes.map((n: {id: string, name: string}) => `  ${n.id}["${n.name}"]`).join('\n')}`;
        mimeType = 'text/plain';
        extension = 'mmd';
        break;
      default:
        return;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportWorkflow]);
  
  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        onAddNode={handleAddNode}
        onRun={handleRun}
        onSave={handleSave}
        onLoad={handleLoad}
        onExport={handleExport}
      />
      <div className="flex-1 flex overflow-hidden">
        <WorkflowEditor />
        <NodePropertiesPanel />
      </div>
    </div>
  );
};

export default App;
