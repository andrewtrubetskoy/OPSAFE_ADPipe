import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '../nodes';
import { useSchemeStore } from '../../store/useSchemeStore';
import { CanvasToolbar } from './CanvasToolbar';
import { NodeInspector } from './NodeInspector';

export function SchemeCanvas() {
  const { nodes, edges, setNodes, setEdges, selectedNodeId, setSelectedNodeId } = useSchemeStore();

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        // apply changes manually or via reactflow helper
        return nds.map((node) => {
          const change = changes.find((c) => c.id === node.id);
          if (!change) return node;
          if (change.type === 'position' && change.position) {
            return { ...node, position: change.position };
          }
          if (change.type === 'select') {
            return { ...node, selected: change.selected };
          }
          return node;
        });
      });
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        return eds.filter((edge) => !changes.some((c) => c.id === edge.id && c.type === 'remove'));
      });
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (connection) => {
      // Validate data element type matching between source & target nodes!
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return;

      // Extract source data type
      let sourceDataType = 'geojson';
      if (sourceNode.type === 'streamNode') {
        sourceDataType = sourceNode.data?.data_element?.data_type;
      } else if (sourceNode.type === 'converterNode') {
        sourceDataType = sourceNode.data?.output_data_element?.data_type;
      } else if (sourceNode.type === 'scriptNode') {
        sourceDataType = sourceNode.data?.output_data_elem?.data_type;
      }

      // Extract target data type
      let targetDataType = 'geojson';
      if (targetNode.type === 'streamNode') {
        targetDataType = targetNode.data?.data_element?.data_type;
      } else if (targetNode.type === 'converterNode') {
        targetDataType = targetNode.data?.input_data_element?.data_type;
      } else if (targetNode.type === 'scriptNode') {
        // match target handle index if available
        targetDataType = targetNode.data?.input_data_elem_list?.[0]?.data_type || 'geojson';
      }

      // If data types don't match, set stroke color warning or reject
      const isTypeMatch = sourceDataType === targetDataType;
      const strokeColor = isTypeMatch ? (sourceDataType === 'geojson' ? '#10b981' : '#3b82f6') : '#f43f5e';

      const newEdge = {
        ...connection,
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        animated: isTypeMatch,
        style: { stroke: strokeColor, strokeWidth: isTypeMatch ? 2.5 : 3 },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes, setEdges]
  );

  const onNodeClick = useCallback(
    (_, node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div style={{ flex: 1, height: 'calc(100vh - 52px)', position: 'relative', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'streamNode') return '#10b981';
            if (n.type === 'converterNode') return '#8b5cf6';
            if (n.type === 'scriptNode') return '#f59e0b';
            return '#3b82f6';
          }}
        />
      </ReactFlow>

      {/* Vertical Floating Canvas Toolbar */}
      <CanvasToolbar />

      {/* Node Inspector Panel when a node is selected */}
      {selectedNodeId && <NodeInspector />}
    </div>
  );
}
