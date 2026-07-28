import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, FileText, Layers, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useSchemeStore } from '../../store/useSchemeStore';

export function StreamNode({ id, data, selected }) {
  const setSelectedNodeId = useSchemeStore((state) => state.setSelectedNodeId);

  const isInput = data.direction === 'in';
  const dataType = data.data_element?.data_type || 'geojson';
  const streamType = data.type || 'file';

  const getTypeIcon = () => {
    switch (streamType) {
      case 'db':
        return <Database className="w-4 h-4 text-cyan-400" />;
      case 'layer':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'file':
      default:
        return <FileText className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      style={{
        minWidth: '220px',
        padding: '12px 14px',
        borderRadius: '12px',
        background: 'rgba(18, 24, 38, 0.92)',
        backdropFilter: 'blur(12px)',
        border: selected ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: selected ? '0 0 20px rgba(59, 130, 246, 0.35)' : '0 4px 16px rgba(0, 0, 0, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Target Handle if Stream Direction is 'in' */}
      {isInput && (
        <Handle
          type="target"
          position={Position.Left}
          id="in"
          style={{
            width: '12px',
            height: '12px',
            background: dataType === 'geojson' ? '#10b981' : '#3b82f6',
            borderColor: '#0a0d14',
            borderWidth: '2px',
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
            {getTypeIcon()}
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Потік ({isInput ? 'Вхідний' : 'Вихідний'})
          </span>
        </div>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: 600,
            background: isInput ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: isInput ? '#60a5fa' : '#34d399',
            border: `1px solid ${isInput ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {isInput ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
          {data.direction}
        </span>
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#f1f5f9', marginBottom: '4px' }}>
        {data.name || 'Потік даних'}
      </div>

      {data.desc && (
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '8px', lineHeight: '1.3' }}>
          {data.desc}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed rgba(255, 255, 255, 0.08)' }}>
        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Тип даних:</span>
        <span
          style={{
            fontSize: '0.72rem',
            fontFamily: 'monospace',
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: '4px',
            background: dataType === 'geojson' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
            color: dataType === 'geojson' ? '#34d399' : '#60a5fa',
          }}
        >
          {dataType}
        </span>
      </div>

      {/* Source Handle if Stream Direction is 'out' */}
      {!isInput && (
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          style={{
            width: '12px',
            height: '12px',
            background: dataType === 'geojson' ? '#10b981' : '#3b82f6',
            borderColor: '#0a0d14',
            borderWidth: '2px',
          }}
        />
      )}
    </div>
  );
}
