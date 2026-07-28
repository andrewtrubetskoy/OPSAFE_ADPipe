import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { useSchemeStore } from '../../store/useSchemeStore';

export function ConverterNode({ id, data, selected }) {
  const setSelectedNodeId = useSchemeStore((state) => state.setSelectedNodeId);

  const inputDataType = data.input_data_element?.data_type || 'geojson';
  const outputDataType = data.output_data_element?.data_type || 'csv';

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      style={{
        minWidth: '220px',
        padding: '12px 14px',
        borderRadius: '12px',
        background: 'rgba(24, 30, 48, 0.92)',
        backdropFilter: 'blur(12px)',
        border: selected ? '2px solid #8b5cf6' : '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: selected ? '0 0 20px rgba(139, 92, 246, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{
          width: '12px',
          height: '12px',
          background: inputDataType === 'geojson' ? '#10b981' : '#3b82f6',
          borderColor: '#0a0d14',
          borderWidth: '2px',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ padding: '6px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '8px', color: '#a78bfa' }}>
          <RefreshCw className="w-4 h-4" />
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: '#a78bfa' }}>
          Конвертер даних
        </span>
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#f1f5f9', marginBottom: '8px' }}>
        {data.name || 'Конвертер'}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.25)', padding: '6px 10px', borderRadius: '8px' }}>
        <span
          style={{
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            fontWeight: 600,
            color: inputDataType === 'geojson' ? '#34d399' : '#60a5fa',
          }}
        >
          {inputDataType}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
        <span
          style={{
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            fontWeight: 600,
            color: outputDataType === 'geojson' ? '#34d399' : '#60a5fa',
          }}
        >
          {outputDataType}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{
          width: '12px',
          height: '12px',
          background: outputDataType === 'geojson' ? '#10b981' : '#3b82f6',
          borderColor: '#0a0d14',
          borderWidth: '2px',
        }}
      />
    </div>
  );
}
