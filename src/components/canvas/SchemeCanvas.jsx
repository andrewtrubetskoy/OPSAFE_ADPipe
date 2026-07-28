import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '../nodes';
import { edgeTypes } from '../edges';
import { useSchemeStore } from '../../store/useSchemeStore';
import { CanvasToolbar } from './CanvasToolbar';
import { NodeInspector } from './NodeInspector';

export function SchemeCanvas() {
  const { nodes, edges, setNodes, setEdges, selectedNodeId, setSelectedNodeId } = useSchemeStore();

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
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

  const isValidConnection = useCallback(
    (connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return false;

      // Block connection if scriptNode has no script assigned
      if (sourceNode.type === 'scriptNode' && (!sourceNode.data?.libraryScriptId || !sourceNode.data?.script_text)) {
        return false;
      }
      if (targetNode.type === 'scriptNode' && (!targetNode.data?.libraryScriptId || !targetNode.data?.script_text)) {
        return false;
      }

      return true;
    },
    [nodes]
  );

  const onConnect = useCallback(
    (connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return;

      // Block connections if scriptNode has no script assigned
      if (sourceNode.type === 'scriptNode' && (!sourceNode.data?.libraryScriptId || !sourceNode.data?.script_text)) {
        return;
      }
      if (targetNode.type === 'scriptNode' && (!targetNode.data?.libraryScriptId || !targetNode.data?.script_text)) {
        return;
      }

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
        const handleIdxStr = connection.targetHandle ? connection.targetHandle.replace('in-', '') : '0';
        const idx = parseInt(handleIdxStr, 10) || 0;
        targetDataType = targetNode.data?.input_data_elem_list?.[idx]?.data_type || 'geojson';
      }

      if (!sourceDataType || !targetDataType) return;

      // Type matching validation
      const isTypeMatch = sourceDataType === targetDataType;
      const strokeColor = isTypeMatch ? (sourceDataType === 'geojson' ? '#10b981' : '#3b82f6') : '#f43f5e';

      const newEdge = {
        ...connection,
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        type: 'customDeletable',
        animated: isTypeMatch,
        style: { stroke: strokeColor, strokeWidth: isTypeMatch ? 2.5 : 3 },
      };

      setEdges((eds) => {
        // Enforce 1 connection per input handle rule
        const filteredEdges = eds.filter(
          (e) => !(e.target === connection.target && e.targetHandle === connection.targetHandle)
        );
        return addEdge(newEdge, filteredEdges);
      });
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
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <CanvasToolbar />
      <NodeInspector />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        colorMode="dark"
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'streamNode') return '#06b6d4';
            if (n.type === 'scriptNode') return '#f59e0b';
            if (n.type === 'converterNode') return '#8b5cf6';
            return '#3b82f6';
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
          style={{ background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px' }}
        />
      </ReactFlow>
    </div>
  );
}
