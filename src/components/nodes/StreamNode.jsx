import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, FileText, Layers, ArrowDownRight, ArrowUpRight, HardDrive } from 'lucide-react';
import { useSchemeStore } from '../../store/useSchemeStore';

export function StreamNode({ id, data, selected }) {
  const setSelectedNodeId = useSchemeStore((state) => state.setSelectedNodeId);

  const isInput = data.direction === 'in';
  const dataType = data.data_element?.data_type || 'geojson';
  const payloadData = data.data_element?.data || 'data_payload';
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

  const isGeoJSON = dataType === 'geojson';

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      style={{
        width: '260px',
        padding: '14px',
        borderRadius: '14px',
        background: 'rgba(15, 21, 32, 0.95)',
        backdropFilter: 'blur(16px)',
        border: selected ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: selected ? '0 0 24px rgba(59, 130, 246, 0.4)' : '0 6px 20px rgba(0, 0, 0, 0.5)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Stream Node Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '8px' }}>
            {getTypeIcon()}
          </div>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.03em' }}>
            Потік ({isInput ? 'Прийом' : 'Видача'})
          </span>
        </div>
        <span
          style={{
            fontSize: '0.68rem',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 700,
            background: isInput ? 'rgba(59, 130, 246, 0.18)' : 'rgba(16, 185, 129, 0.18)',
            color: isInput ? '#60a5fa' : '#34d399',
            border: `1px solid ${isInput ? 'rgba(59, 130, 246, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {isInput ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
          {data.direction}
        </span>
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.94rem', color: '#f8fafc', marginBottom: '4px' }}>
        {data.name || 'Потік даних'}
      </div>

      {data.desc && (
        <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: '12px', lineHeight: '1.3' }}>
          {data.desc}
        </div>
      )}

      {/* DISTINCT DATA ELEMENT BLOCK */}
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>
        Елемент даних (Data Element)
      </div>

      <div
        style={{
          position: 'relative',
          padding: '10px 12px',
          borderRadius: '10px',
          background: isGeoJSON ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
          border: `1px solid ${isGeoJSON ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Handle directly attached to this data element block */}
        {isInput && (
          <Handle
            type="target"
            position={Position.Left}
            id="in"
            style={{
              left: '-7px',
              width: '12px',
              height: '12px',
              background: isGeoJSON ? '#10b981' : '#3b82f6',
              borderColor: '#0a0d14',
              borderWidth: '2px',
            }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <HardDrive className={`w-4 h-4 ${isGeoJSON ? 'text-emerald-400' : 'text-blue-400'}`} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {payloadData}
          </span>
        </div>

        <span
          style={{
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            background: isGeoJSON ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)',
            color: isGeoJSON ? '#34d399' : '#60a5fa',
            textTransform: 'lowercase',
          }}
        >
          {dataType}
        </span>

        {!isInput && (
          <Handle
            type="source"
            position={Position.Right}
            id="out"
            style={{
              right: '-7px',
              width: '12px',
              height: '12px',
              background: isGeoJSON ? '#10b981' : '#3b82f6',
              borderColor: '#0a0d14',
              borderWidth: '2px',
            }}
          />
        )}
      </div>
    </div>
  );
}
