/**
 * Workflow Editor - Main canvas component
 */

import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore';
import { nodeTypes } from '../components/nodeTypes';

export const WorkflowEditor: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect: onConnectStore
  } = useWorkflowStore();
  
  const onConnect = useCallback(
    (params: Connection) => {
      onConnectStore(params);
    },
    [onConnectStore]
  );
  
  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true
        }}
      >
        <Background color="#aaa" gap={20} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.data.provider) {
              case 'openai':
                return '#22c55e';
              case 'anthropic':
                return '#f97316';
              default:
                return '#6b7280';
            }
          }}
          className="bg-white border border-gray-200"
        />
      </ReactFlow>
    </div>
  );
};
