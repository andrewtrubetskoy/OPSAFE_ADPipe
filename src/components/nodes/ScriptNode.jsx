import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Code2, Sliders, Play } from 'lucide-react';
import { useSchemeStore } from '../../store/useSchemeStore';

export function ScriptNode({ id, data, selected }) {
  const setSelectedNodeId = useSchemeStore((state) => state.setSelectedNodeId);

  const inputs = data.input_data_elem_list || [{ data_type: 'geojson' }];
  const outputDataType = data.output_data_elem?.data_type || 'geojson';
  const paramsCount = data.script_params_list?.length || 0;

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      style={{
        minWidth: '240px',
        padding: '12px 14px',
        borderRadius: '12px',
        background: 'rgba(20, 28, 44, 0.94)',
        backdropFilter: 'blur(12px)',
        border: selected ? '2px solid #f59e0b' : '1px solid rgba(245, 158, 11, 0.3)',
        boxShadow: selected ? '0 0 20px rgba(245, 158, 11, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      {/* Target Handles for multiple inputs */}
      {inputs.map((inp, idx) => {
        const topOffset = inputs.length === 1 ? 50 : 35 + idx * 25;
        return (
          <Handle
            key={`in-${idx}`}
            type="target"
            position={Position.Left}
            id={`in-${idx}`}
            style={{
              top: `${topOffset}%`,
              width: '12px',
              height: '12px',
              background: inp.data_type === 'geojson' ? '#10b981' : '#3b82f6',
              borderColor: '#0a0d14',
              borderWidth: '2px',
            }}
          />
        );
      })}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '8px', color: '#fbbf24' }}>
            <Code2 className="w-4 h-4" />
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: '#fbbf24' }}>
            Python Скрипт
          </span>
        </div>
        <span
          style={{
            fontSize: '0.68rem',
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'rgba(245, 158, 11, 0.2)',
            color: '#fcd34d',
            fontFamily: 'monospace',
            fontWeight: 600,
          }}
        >
          {data.type || 'python'}
        </span>
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#f1f5f9', marginBottom: '4px' }}>
        {data.name || 'Скрипт обробки'}
      </div>

      {data.desc && (
        <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: '8px', lineHeight: '1.3' }}>
          {data.desc}
        </div>
      )}

      {/* Script Params count indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#cbd5e1', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Sliders className="w-3.5 h-3.5 text-amber-400" />
        <span>Параметрів: {paramsCount}</span>
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
