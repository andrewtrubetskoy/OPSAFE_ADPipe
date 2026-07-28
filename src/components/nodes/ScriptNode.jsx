import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Code2, Sliders, FileType, Plus, Trash2 } from 'lucide-react';
import { useSchemeStore } from '../../store/useSchemeStore';

export function ScriptNode({ id, data, selected }) {
  const { setSelectedNodeId, updateNodeData } = useSchemeStore();

  const inputs = data.input_data_elem_list || [{ data_type: 'geojson' }];
  // All inputs share the same uniform data type
  const sharedInputDataType = inputs[0]?.data_type || 'geojson';
  const outputDataType = data.output_data_elem?.data_type || 'geojson';
  const paramsCount = data.script_params_list?.length || 0;

  const isOutputGeoJSON = outputDataType === 'geojson';

  // Helper to add a new input data element (inherits the shared input data type)
  const handleAddInputElem = (e) => {
    e.stopPropagation();
    const updatedInputs = [...inputs, { data_type: sharedInputDataType }];
    updateNodeData(id, { input_data_elem_list: updatedInputs });
  };

  // Helper to toggle the shared input data type for ALL inputs on this script node
  const handleToggleSharedInputType = (e) => {
    e.stopPropagation();
    const newType = sharedInputDataType === 'geojson' ? 'csv' : 'geojson';
    const updatedInputs = inputs.map((inp) => ({ ...inp, data_type: newType }));
    updateNodeData(id, { input_data_elem_list: updatedInputs });
  };

  // Helper to remove an input data element
  const handleRemoveInputElem = (idx, e) => {
    e.stopPropagation();
    if (inputs.length <= 1) return;
    const updatedInputs = inputs.filter((_, i) => i !== idx);
    updateNodeData(id, { input_data_elem_list: updatedInputs });
  };

  const isSharedGeoJSON = sharedInputDataType === 'geojson';

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      style={{
        width: '340px',
        padding: '14px',
        borderRadius: '14px',
        background: 'rgba(18, 24, 38, 0.95)',
        backdropFilter: 'blur(16px)',
        border: selected ? '2px solid #f59e0b' : '1px solid rgba(245, 158, 11, 0.35)',
        boxShadow: selected ? '0 0 24px rgba(245, 158, 11, 0.45)' : '0 6px 20px rgba(0, 0, 0, 0.5)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '8px', color: '#fbbf24' }}>
            <Code2 className="w-4 h-4" />
          </div>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#fbbf24', letterSpacing: '0.03em' }}>
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
            fontWeight: 700,
          }}
        >
          {data.type || 'python'}
        </span>
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.94rem', color: '#f8fafc', marginBottom: '4px' }}>
        {data.name || 'Скрипт обробки'}
      </div>

      {data.desc && (
        <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: '10px', lineHeight: '1.3' }}>
          {data.desc}
        </div>
      )}

      {/* Script Params count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '12px', padding: '4px 8px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '6px' }}>
        <Sliders className="w-3.5 h-3.5 text-amber-400" />
        <span>Параметрів скрипта: <strong>{paramsCount}</strong></span>
      </div>

      {/* DISTINCT DATA ELEMENTS SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px', alignItems: 'start', paddingTop: '8px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
        {/* INPUT DATA ELEMENTS LIST */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Вхідні ({inputs.length})
              </span>
              {/* Single Shared Input Type Selector Toggle */}
              <button
                onClick={handleToggleSharedInputType}
                style={{
                  fontSize: '0.64rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: isSharedGeoJSON ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)',
                  color: isSharedGeoJSON ? '#34d399' : '#60a5fa',
                  border: `1px solid ${isSharedGeoJSON ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
                  cursor: 'pointer',
                }}
                title="Змінити єдиний тип вхідних даних для всіх входів цього скрипта"
              >
                {sharedInputDataType}
              </button>
            </div>
            <button
              onClick={handleAddInputElem}
              className="btn-secondary"
              style={{ padding: '2px 6px', fontSize: '0.68rem', gap: '2px', background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}
              title="Додати ще один вхідний елемент даних"
            >
              <Plus className="w-3 h-3" /> Додати
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {inputs.map((_, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: isSharedGeoJSON ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                  border: `1px solid ${isSharedGeoJSON ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {/* Handle attached directly to this specific input data element block */}
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`in-${idx}`}
                  style={{
                    left: '-7px',
                    width: '12px',
                    height: '12px',
                    background: isSharedGeoJSON ? '#10b981' : '#3b82f6',
                    borderColor: '#0a0d14',
                    borderWidth: '2px',
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileType className={`w-3.5 h-3.5 ${isSharedGeoJSON ? 'text-emerald-400' : 'text-blue-400'}`} />
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: isSharedGeoJSON ? '#34d399' : '#60a5fa',
                    }}
                  >
                    {sharedInputDataType} #{idx + 1}
                  </span>
                </div>

                {inputs.length > 1 && (
                  <button
                    onClick={(e) => handleRemoveInputElem(idx, e)}
                    style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                    title="Видалити цей вхідний елемент"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* OUTPUT DATA ELEMENT BLOCK */}
        <div>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
            Вихідний елемент
          </div>
          <div
            style={{
              position: 'relative',
              padding: '6px 8px',
              borderRadius: '6px',
              background: isOutputGeoJSON ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
              border: `1px solid ${isOutputGeoJSON ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileType className={`w-3.5 h-3.5 ${isOutputGeoJSON ? 'text-emerald-400' : 'text-blue-400'}`} />
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: isOutputGeoJSON ? '#34d399' : '#60a5fa',
                }}
              >
                {outputDataType}
              </span>
            </div>

            {/* Handle attached directly to the output data element block */}
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
