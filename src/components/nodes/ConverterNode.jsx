import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { RefreshCw, ArrowRight, FileType } from 'lucide-react';
import { useSchemeStore } from '../../store/useSchemeStore';

export function ConverterNode({ id, data, selected }) {
  const setSelectedNodeId = useSchemeStore((state) => state.setSelectedNodeId);

  const inputDataType = data.input_data_element?.data_type || 'geojson';
  const outputDataType = data.output_data_element?.data_type || 'csv';

  const isInputGeoJSON = inputDataType === 'geojson';
  const isOutputGeoJSON = outputDataType === 'geojson';

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      style={{
        width: '310px',
        padding: '14px',
        borderRadius: '14px',
        background: 'rgba(20, 24, 40, 0.95)',
        backdropFilter: 'blur(16px)',
        border: selected ? '2px solid #8b5cf6' : '1px solid rgba(139, 92, 246, 0.35)',
        boxShadow: selected ? '0 0 24px rgba(139, 92, 246, 0.45)' : '0 6px 20px rgba(0, 0, 0, 0.5)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Converter Node Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ padding: '6px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '8px', color: '#a78bfa' }}>
          <RefreshCw className="w-4 h-4" />
        </div>
        <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', letterSpacing: '0.03em' }}>
          Конвертер даних
        </span>
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.94rem', color: '#f8fafc', marginBottom: '12px' }}>
        {data.name || 'Конвертер'}
      </div>

      {/* DISTINCT DATA ELEMENTS SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'center' }}>
        {/* INPUT DATA ELEMENT BLOCK */}
        <div>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>
            Вхідний елемент
          </div>
          <div
            style={{
              position: 'relative',
              padding: '8px',
              borderRadius: '8px',
              background: isInputGeoJSON ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
              border: `1px solid ${isInputGeoJSON ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
              textAlign: 'center',
            }}
          >
            {/* Input Handle directly on Input Data Element block */}
            <Handle
              type="target"
              position={Position.Left}
              id="in"
              style={{
                left: '-7px',
                width: '12px',
                height: '12px',
                background: isInputGeoJSON ? '#10b981' : '#3b82f6',
                borderColor: '#0a0d14',
                borderWidth: '2px',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <FileType className={`w-3.5 h-3.5 ${isInputGeoJSON ? 'text-emerald-400' : 'text-blue-400'}`} />
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: isInputGeoJSON ? '#34d399' : '#60a5fa',
                }}
              >
                {inputDataType}
              </span>
            </div>
          </div>
        </div>

        {/* Transition Arrow */}
        <div style={{ paddingTop: '14px' }}>
          <ArrowRight className="w-4 h-4 text-purple-400" />
        </div>

        {/* OUTPUT DATA ELEMENT BLOCK */}
        <div>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>
            Вихідний елемент
          </div>
          <div
            style={{
              position: 'relative',
              padding: '8px',
              borderRadius: '8px',
              background: isOutputGeoJSON ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
              border: `1px solid ${isOutputGeoJSON ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <FileType className={`w-3.5 h-3.5 ${isOutputGeoJSON ? 'text-emerald-400' : 'text-blue-400'}`} />
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: isOutputGeoJSON ? '#34d399' : '#60a5fa',
                }}
              >
                {outputDataType}
              </span>
            </div>

            {/* Output Handle directly on Output Data Element block */}
            <Handle
              type="source"
              position={Position.Right}
              id="out"
              style={{
                right: '-7px',
                width: '12px',
                height: '12px',
                background: isOutputGeoJSON ? '#10b981' : '#3b82f6',
                borderColor: '#0a0d14',
                borderWidth: '2px',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
