import React from 'react';
import { X, Trash2, Plus, Sliders, Code2, Save, FileType } from 'lucide-react';
import { useSchemeStore } from '../../store/useSchemeStore';

export function NodeInspector() {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNodeData, deleteNode } = useSchemeStore();

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const data = node.data || {};

  const handleFieldChange = (field, value) => {
    updateNodeData(selectedNodeId, { [field]: value });
  };

  const handleNestedFieldChange = (parentField, childField, value) => {
    updateNodeData(selectedNodeId, {
      [parentField]: {
        ...(data[parentField] || {}),
        [childField]: value,
      },
    });
  };

  // Script inputs helper (all inputs share uniform data type)
  const currentInputs = data.input_data_elem_list || [{ data_type: 'geojson' }];
  const sharedInputDataType = currentInputs[0]?.data_type || 'geojson';

  const handleAddInputElem = () => {
    updateNodeData(selectedNodeId, { input_data_elem_list: [...currentInputs, { data_type: sharedInputDataType }] });
  };

  const handleSharedInputTypeChange = (newDataType) => {
    const updatedInputs = currentInputs.map((inp) => ({ ...inp, data_type: newDataType }));
    updateNodeData(selectedNodeId, { input_data_elem_list: updatedInputs });
  };

  const handleDeleteInputElem = (idx) => {
    if (currentInputs.length <= 1) return;
    const updatedInputs = currentInputs.filter((_, i) => i !== idx);
    updateNodeData(selectedNodeId, { input_data_elem_list: updatedInputs });
  };

  // Script parameters helper
  const handleAddParam = () => {
    const params = data.script_params_list || [];
    const newParam = {
      name: `param_${params.length + 1}`,
      desc: 'Опис параметру',
      type: 'float',
      default: 0.0,
      min: 0.0,
      max: 100.0,
    };
    updateNodeData(selectedNodeId, { script_params_list: [...params, newParam] });
  };

  const handleParamChange = (idx, key, value) => {
    const params = [...(data.script_params_list || [])];
    params[idx] = { ...params[idx], [key]: value };
    updateNodeData(selectedNodeId, { script_params_list: params });
  };

  const handleDeleteParam = (idx) => {
    const params = [...(data.script_params_list || [])];
    params.splice(idx, 1);
    updateNodeData(selectedNodeId, { script_params_list: params });
  };

  return (
    <aside
      className="glass-panel"
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '320px',
        maxHeight: 'calc(100% - 40px)',
        overflowY: 'auto',
        borderRadius: '16px',
        padding: '16px',
        zIndex: 30,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>Параметри ноди</h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>ID: {node.id}</span>
        </div>
        <button onClick={() => setSelectedNodeId(null)} className="btn-icon">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Name */}
        <div>
          <label style={labelStyle}>Назва сутності</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Опис</label>
          <textarea
            value={data.desc || ''}
            onChange={(e) => handleFieldChange('desc', e.target.value)}
            rows={2}
            style={inputStyle}
          />
        </div>

        {/* STREAM NODE FIELDS */}
        {node.type === 'streamNode' && (
          <>
            <div>
              <label style={labelStyle}>Напрямок (direction)</label>
              <select
                value={data.direction || 'out'}
                onChange={(e) => handleFieldChange('direction', e.target.value)}
                style={inputStyle}
              >
                <option value="out">out (Видача даних)</option>
                <option value="in">in (Прийом даних)</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Тип потоку (type)</label>
              <select
                value={data.type || 'file'}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                style={inputStyle}
              >
                <option value="file">file (Файл)</option>
                <option value="db">db (База даних)</option>
                <option value="layer">layer (Векторний шар)</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Тип даних (data_type)</label>
              <select
                value={data.data_element?.data_type || 'geojson'}
                onChange={(e) => handleNestedFieldChange('data_element', 'data_type', e.target.value)}
                style={inputStyle}
              >
                <option value="geojson">geojson</option>
                <option value="csv">csv</option>
              </select>
            </div>
          </>
        )}

        {/* CONVERTER NODE FIELDS */}
        {node.type === 'converterNode' && (
          <>
            <div>
              <label style={labelStyle}>Вхідний тип даних</label>
              <select
                value={data.input_data_element?.data_type || 'geojson'}
                onChange={(e) => handleNestedFieldChange('input_data_element', 'data_type', e.target.value)}
                style={inputStyle}
              >
                <option value="geojson">geojson</option>
                <option value="csv">csv</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Вихідний тип даних</label>
              <select
                value={data.output_data_element?.data_type || 'csv'}
                onChange={(e) => handleNestedFieldChange('output_data_element', 'data_type', e.target.value)}
                style={inputStyle}
              >
                <option value="geojson">geojson</option>
                <option value="csv">csv</option>
              </select>
            </div>
          </>
        )}

        {/* SCRIPT NODE FIELDS */}
        {node.type === 'scriptNode' && (
          <>
            {/* Uniform Input Data Type & List Management */}
            <div style={{ paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#38bdf8' }}>
                  Вхідні елементи ({ currentInputs.length })
                </span>
                <button onClick={handleAddInputElem} className="btn-secondary" style={{ fontSize: '0.7rem', padding: '3px 6px' }}>
                  <Plus className="w-3 h-3 text-emerald-400" /> + Вхід
                </button>
              </div>

              {/* Shared Single Input Data Type Selector */}
              <div style={{ marginBottom: '8px' }}>
                <label style={labelStyle}>Єдиний тип вхідних даних</label>
                <select
                  value={sharedInputDataType}
                  onChange={(e) => handleSharedInputTypeChange(e.target.value)}
                  style={{ ...inputStyle, borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.08)' }}
                >
                  <option value="geojson">geojson (Всі входи)</option>
                  <option value="csv">csv (Всі входи)</option>
                </select>
              </div>

              {currentInputs.map((_, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.25)', padding: '6px 8px', borderRadius: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', fontFamily: 'monospace' }}>
                    Вхід #{idx + 1}: {sharedInputDataType}
                  </span>

                  {currentInputs.length > 1 && (
                    <button onClick={() => handleDeleteInputElem(idx)} className="btn-icon" style={{ width: '22px', height: '22px' }}>
                      <Trash2 className="w-3 h-3 text-rose-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label style={labelStyle}>Вихідний тип даних (output_data_elem)</label>
              <select
                value={data.output_data_elem?.data_type || 'geojson'}
                onChange={(e) => handleNestedFieldChange('output_data_elem', 'data_type', e.target.value)}
                style={inputStyle}
              >
                <option value="geojson">geojson</option>
                <option value="csv">csv</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Код Python скрипта</label>
              <textarea
                value={data.script_text || ''}
                onChange={(e) => handleFieldChange('script_text', e.target.value)}
                rows={4}
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.78rem' }}
              />
            </div>

            {/* Script parameters section */}
            <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fbbf24' }}>
                  Параметри скрипта
                </span>
                <button onClick={handleAddParam} className="btn-secondary" style={{ fontSize: '0.7rem', padding: '3px 6px' }}>
                  <Plus className="w-3 h-3" /> Додати
                </button>
              </div>

              {(data.script_params_list || []).map((p, idx) => (
                <div key={idx} style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '8px', borderRadius: '8px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => handleParamChange(idx, 'name', e.target.value)}
                      placeholder="Назва"
                      style={{ ...inputStyle, padding: '3px 6px', fontSize: '0.75rem', width: '60%' }}
                    />
                    <select
                      value={p.type}
                      onChange={(e) => handleParamChange(idx, 'type', e.target.value)}
                      style={{ ...inputStyle, padding: '3px 6px', fontSize: '0.72rem', width: '35%' }}
                    >
                      <option value="float">float</option>
                      <option value="int">int</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    <input
                      type="number"
                      value={p.default}
                      onChange={(e) => handleParamChange(idx, 'default', parseFloat(e.target.value))}
                      placeholder="Default"
                      title="Default"
                      style={{ ...inputStyle, padding: '2px 4px', fontSize: '0.72rem' }}
                    />
                    <input
                      type="number"
                      value={p.min}
                      onChange={(e) => handleParamChange(idx, 'min', parseFloat(e.target.value))}
                      placeholder="Min"
                      title="Min"
                      style={{ ...inputStyle, padding: '2px 4px', fontSize: '0.72rem' }}
                    />
                    <input
                      type="number"
                      value={p.max}
                      onChange={(e) => handleParamChange(idx, 'max', parseFloat(e.target.value))}
                      placeholder="Max"
                      title="Max"
                      style={{ ...inputStyle, padding: '2px 4px', fontSize: '0.72rem' }}
                    />
                    <button onClick={() => handleDeleteParam(idx)} className="btn-icon" style={{ width: '22px', height: '22px' }}>
                      <Trash2 className="w-3 h-3 text-rose-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Delete Node Button */}
        <button
          onClick={() => deleteNode(selectedNodeId)}
          className="btn-secondary"
          style={{ marginTop: '8px', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', justifyContent: 'center' }}
        >
          <Trash2 className="w-4 h-4" /> Видалити ноду
        </button>
      </div>
    </aside>
  );
}

const labelStyle = {
  fontSize: '0.74rem',
  fontWeight: 600,
  color: '#94a3b8',
  marginBottom: '4px',
  display: 'block',
};

const inputStyle = {
  width: '100%',
  padding: '6px 10px',
  borderRadius: '6px',
  background: 'rgba(0, 0, 0, 0.35)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: '#f1f5f9',
  fontSize: '0.82rem',
};
