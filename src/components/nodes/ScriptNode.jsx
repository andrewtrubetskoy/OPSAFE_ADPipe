import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Code2, Sliders, FileType, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useSchemeStore } from '../../store/useSchemeStore';
import { useScriptLibraryStore } from '../../store/useScriptLibraryStore';
import { parseConfigSchema } from '../../utils/configSchemaParser';

export function ScriptNode({ id, data, selected }) {
  const { setSelectedNodeId, updateNodeData } = useSchemeStore();
  const scriptItems = useScriptLibraryStore((state) => state.scriptItems);

  const currentScript = scriptItems.find((s) => s.id === data.libraryScriptId);
  const scriptCode = currentScript?.code || data.script_text || '';
  const isScriptSelected = Boolean(data.libraryScriptId && scriptCode);

  const inputs = data.input_data_elem_list || [{ data_type: isScriptSelected ? (currentScript?.inputType || 'geojson') : null }];
  const sharedInputDataType = isScriptSelected ? (currentScript?.inputType || 'geojson') : null;
  const outputDataType = isScriptSelected ? (currentScript?.outputType || 'geojson') : null;

  const parsedConfigSchemaFields = parseConfigSchema(scriptCode);
  const paramsCount = parsedConfigSchemaFields.length;

  const isOutputGeoJSON = outputDataType === 'geojson';
  const isSharedGeoJSON = sharedInputDataType === 'geojson';

  // Helper to add a new input data element
  const handleAddInputElem = (e) => {
    e.stopPropagation();
    if (!isScriptSelected) return;
    const updatedInputs = [...inputs, { data_type: sharedInputDataType }];
    updateNodeData(id, { input_data_elem_list: updatedInputs });
  };

  // Helper to remove an input data element
  const handleRemoveInputElem = (idx, e) => {
    e.stopPropagation();
    if (inputs.length <= 1) return;
    const updatedInputs = inputs.filter((_, i) => i !== idx);
    updateNodeData(id, { input_data_elem_list: updatedInputs });
  };

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      style={{
        width: '340px',
        padding: '14px',
        borderRadius: '14px',
        background: 'rgba(18, 24, 38, 0.95)',
        backdropFilter: 'blur(16px)',
        border: selected ? '2px solid #f59e0b' : isScriptSelected ? '1px solid rgba(245, 158, 11, 0.35)' : '1px dashed rgba(244, 63, 94, 0.5)',
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
            background: isScriptSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(244, 63, 94, 0.2)',
            color: isScriptSelected ? '#fcd34d' : '#fecdd3',
            fontFamily: 'monospace',
            fontWeight: 700,
          }}
        >
          {isScriptSelected ? (currentScript?.name || 'обрано') : 'не обрано'}
        </span>
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.94rem', color: '#f8fafc', marginBottom: '6px' }}>
        {data.name || 'Скрипт обробки'}
      </div>

      {/* Script Library Quick Selector on Node Card */}
      <div style={{ marginBottom: '10px' }} onClick={(e) => e.stopPropagation()}>
        <select
          value={data.libraryScriptId || ''}
          onChange={(e) => {
            const selectedId = parseInt(e.target.value, 10);
            const scriptItem = scriptItems.find((s) => s.id === selectedId);
            if (scriptItem) {
              const parsedSchema = parseConfigSchema(scriptItem.code);
              const defaultValues = {};
              parsedSchema.forEach((field) => {
                defaultValues[field.name] = field.default;
              });

              updateNodeData(id, {
                libraryScriptId: scriptItem.id,
                name: scriptItem.name,
                desc: scriptItem.description,
                script_text: scriptItem.code,
                input_data_elem_list: (data.input_data_elem_list || [{}]).map((inp) => ({
                  ...inp,
                  data_type: scriptItem.inputType,
                })),
                output_data_elem: { data_type: scriptItem.outputType },
                script_params_values: defaultValues,
              });
            } else {
              updateNodeData(id, {
                libraryScriptId: null,
                script_text: '',
                input_data_elem_list: [{ data_type: null }],
                output_data_elem: { data_type: null },
                script_params_values: {},
              });
            }
          }}
          style={{
            width: '100%',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.74rem',
            background: isScriptSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(244, 63, 94, 0.12)',
            border: isScriptSelected ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(244, 63, 94, 0.4)',
            color: isScriptSelected ? '#fbbf24' : '#fecdd3',
            cursor: 'pointer',
          }}
          title="Обрати реалізацію скрипта з БД Бібліотеки"
        >
          <option value="">-- Оберіть скрипт з бібліотеки --</option>
          {scriptItems.map((s) => (
            <option key={s.id} value={s.id}>
              📄 {s.name} ({s.inputType} → {s.outputType})
            </option>
          ))}
        </select>
      </div>

      {/* Warning if script is unassigned */}
      {!isScriptSelected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#f43f5e', marginBottom: '10px', padding: '4px 8px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '6px' }}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Скрипт не вказано! Приєднання заблоковано.</span>
        </div>
      )}

      {/* Script Params count from ConfigSchema */}
      {isScriptSelected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '12px', padding: '4px 8px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '6px' }}>
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Параметрів (ConfigSchema): <strong>{paramsCount}</strong></span>
        </div>
      )}

      {/* INPUT / OUTPUT DATA ELEMENTS SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px', alignItems: 'start', paddingTop: '8px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
        {/* INPUT DATA ELEMENTS LIST */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Вхідні ({inputs.length})
            </span>
            {isScriptSelected && (
              <button
                onClick={handleAddInputElem}
                className="btn-secondary"
                style={{ padding: '2px 6px', fontSize: '0.68rem', gap: '2px', background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}
                title="Додати ще один вхідний елемент даних"
              >
                <Plus className="w-3 h-3" /> Додати
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {inputs.map((_, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: !isScriptSelected
                    ? 'rgba(71, 85, 105, 0.15)'
                    : isSharedGeoJSON
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(59, 130, 246, 0.12)',
                  border: !isScriptSelected
                    ? '1px dashed rgba(148, 163, 184, 0.3)'
                    : `1px solid ${isSharedGeoJSON ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {/* Handle attached directly to this input element */}
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`in-${idx}`}
                  isConnectable={isScriptSelected}
                  style={{
                    left: '-7px',
                    width: '12px',
                    height: '12px',
                    background: !isScriptSelected ? '#475569' : isSharedGeoJSON ? '#10b981' : '#3b82f6',
                    borderColor: '#0a0d14',
                    borderWidth: '2px',
                    cursor: isScriptSelected ? 'crosshair' : 'not-allowed',
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileType className={`w-3.5 h-3.5 ${!isScriptSelected ? 'text-slate-500' : isSharedGeoJSON ? 'text-emerald-400' : 'text-blue-400'}`} />
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: !isScriptSelected ? '#64748b' : isSharedGeoJSON ? '#34d399' : '#60a5fa',
                    }}
                  >
                    {isScriptSelected ? `${sharedInputDataType} #${idx + 1}` : 'не визначено'}
                  </span>
                </div>

                {isScriptSelected && inputs.length > 1 && (
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
              background: !isScriptSelected
                ? 'rgba(71, 85, 105, 0.15)'
                : isOutputGeoJSON
                ? 'rgba(16, 185, 129, 0.12)'
                : 'rgba(59, 130, 246, 0.12)',
              border: !isScriptSelected
                ? '1px dashed rgba(148, 163, 184, 0.3)'
                : `1px solid ${isOutputGeoJSON ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileType className={`w-3.5 h-3.5 ${!isScriptSelected ? 'text-slate-500' : isOutputGeoJSON ? 'text-emerald-400' : 'text-blue-400'}`} />
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: !isScriptSelected ? '#64748b' : isOutputGeoJSON ? '#34d399' : '#60a5fa',
                }}
              >
                {isScriptSelected ? outputDataType : 'не визначено'}
              </span>
            </div>

            {/* Handle attached directly to the output element */}
            <Handle
              type="source"
              position={Position.Right}
              id="out"
              isConnectable={isScriptSelected}
              style={{
                right: '-7px',
                width: '12px',
                height: '12px',
                background: !isScriptSelected ? '#475569' : isOutputGeoJSON ? '#10b981' : '#3b82f6',
                borderColor: '#0a0d14',
                borderWidth: '2px',
                cursor: isScriptSelected ? 'crosshair' : 'not-allowed',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
