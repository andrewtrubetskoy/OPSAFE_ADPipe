import React from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, Plus, Sliders, AlertCircle, Settings, Lock } from 'lucide-react';
import { useSchemeStore } from '../../store/useSchemeStore';
import { useScriptLibraryStore } from '../../store/useScriptLibraryStore';
import { parseConfigSchema, parseScriptDataType } from '../../utils/configSchemaParser';

export function NodeInspector() {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNodeData, deleteNode } = useSchemeStore();
  const scriptItems = useScriptLibraryStore((state) => state.state?.scriptItems || state.scriptItems);

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

  // Helper for Script Node ConfigSchema parameters & DataType
  const currentScript = (scriptItems || []).find((s) => s.id === data.libraryScriptId);
  const scriptCode = currentScript?.code || data.script_text || '';
  const parsedConfigSchemaFields = parseConfigSchema(scriptCode);
  const declaredDataType = parseScriptDataType(scriptCode) || currentScript?.inputType || 'geojson';
  const paramValues = data.script_params_values || {};

  const handleParamValueChange = (paramName, value) => {
    updateNodeData(selectedNodeId, {
      script_params_values: {
        ...paramValues,
        [paramName]: value,
      },
    });
  };

  // Script inputs helper (all inputs share uniform data type from script)
  const isScriptSelected = Boolean(data.libraryScriptId && scriptCode);
  const currentInputs = data.input_data_elem_list || [{ data_type: isScriptSelected ? declaredDataType : null }];
  const sharedInputDataType = isScriptSelected ? declaredDataType : null;

  const handleAddInputElem = () => {
    updateNodeData(selectedNodeId, {
      input_data_elem_list: [...currentInputs, { data_type: sharedInputDataType }],
    });
  };

  const handleDeleteInputElem = (idx) => {
    if (currentInputs.length <= 1) return;
    const updatedInputs = currentInputs.filter((_, i) => i !== idx);
    updateNodeData(selectedNodeId, { input_data_elem_list: updatedInputs });
  };

  const getNodeTypeBadge = () => {
    if (node.type === 'streamNode') {
      return { title: 'Потік даних', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' };
    }
    if (node.type === 'converterNode') {
      return { title: 'Конвертер типів', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
    }
    if (node.type === 'scriptNode') {
      return { title: 'Python Скрипт', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    }
    return { title: 'Нода', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
  };

  const badge = getNodeTypeBadge();

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '24px',
      }}
      onClick={() => setSelectedNodeId(null)}
    >
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '580px',
          maxHeight: '88vh',
          overflowY: 'auto',
          borderRadius: '18px',
          padding: '24px',
          background: '#0f172a',
          border: `1px solid ${badge.color}66`,
          boxShadow: `0 20px 60px rgba(0, 0, 0, 0.85), 0 0 30px ${badge.color}22`,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '14px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                padding: '10px',
                borderRadius: '12px',
                background: badge.bg,
                color: badge.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                  Налаштування параметрів ноди
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: badge.bg,
                    color: badge.color,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}
                >
                  {badge.title}
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>
                ID: {node.id}
              </span>
            </div>
          </div>

          <button onClick={() => setSelectedNodeId(null)} className="btn-icon">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Назва сутності</label>
            <input
              type="text"
              value={data.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Введіть назву ноди..."
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
              placeholder="Опис призначення цієї ноди..."
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {/* STREAM NODE FIELDS */}
          {node.type === 'streamNode' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <label style={labelStyle}>Напрямок (direction)</label>
                <select
                  value={data.direction || 'out'}
                  onChange={(e) => handleFieldChange('direction', e.target.value)}
                  style={inputStyle}
                >
                  <option value="out">out (Видача даних / Джерело)</option>
                  <option value="in">in (Прийом даних / Приймач)</option>
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
            </div>
          )}

          {/* CONVERTER NODE FIELDS */}
          {node.type === 'converterNode' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
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
            </div>
          )}

          {/* SCRIPT NODE FIELDS */}
          {node.type === 'scriptNode' && (
            <>
              {/* Script Library Selector */}
              <div>
                <label style={{ ...labelStyle, color: '#fbbf24' }}>Обрати скрипт з бібліотеки (БД)</label>
                <select
                  value={data.libraryScriptId || ''}
                  onChange={(e) => {
                    const selectedId = parseInt(e.target.value, 10);
                    const scriptItem = (scriptItems || []).find((s) => s.id === selectedId);
                    if (scriptItem) {
                      const parsedSchema = parseConfigSchema(scriptItem.code);
                      const scriptType = parseScriptDataType(scriptItem.code) || scriptItem.inputType || 'geojson';
                      const defaultValues = {};
                      parsedSchema.forEach((field) => {
                        defaultValues[field.name] = field.default;
                      });

                      updateNodeData(selectedNodeId, {
                        libraryScriptId: scriptItem.id,
                        name: scriptItem.name,
                        desc: scriptItem.description,
                        script_text: scriptItem.code,
                        input_data_elem_list: (data.input_data_elem_list || [{}]).map((inp) => ({
                          ...inp,
                          data_type: scriptType,
                        })),
                        output_data_elem: { data_type: scriptType },
                        script_params_values: defaultValues,
                      });
                    } else {
                      updateNodeData(selectedNodeId, {
                        libraryScriptId: null,
                        script_text: '',
                        input_data_elem_list: [{ data_type: null }],
                        output_data_elem: { data_type: null },
                        script_params_values: {},
                      });
                    }
                  }}
                  style={{ ...inputStyle, borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.1)', color: '#fcd34d' }}
                >
                  <option value="">-- Оберіть скрипт з БД --</option>
                  {(scriptItems || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      📄 {s.name} ({parseScriptDataType(s.code) || s.inputType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Unassigned Script Warning Banner */}
              {!isScriptSelected && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(244, 63, 94, 0.12)',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    color: '#fecdd3',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>
                    Скрипт не обрано! Входи та виходи ноди мають невизначений тип. Приєднання ліній зв'язку до ноди заблоковано до вибору скрипта.
                  </span>
                </div>
              )}

              {/* Inputs & Outputs (Strictly derived from Script's DataType = Literal["..."], read-only) */}
              {isScriptSelected && (
                <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  {/* Readonly Type Notification */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#fbbf24', marginBottom: '10px', padding: '6px 10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      Тип даних входу/виходу задекларовано в скрипті (<strong>DataType = Literal["{declaredDataType}"]</strong>) і зафіксовано для цієї ноди.
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {/* Inputs */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>
                          Вхідні елементи ({currentInputs.length})
                        </span>
                        <button onClick={handleAddInputElem} className="btn-secondary" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                          <Plus className="w-3.5 h-3.5 text-emerald-400" /> + Вхід
                        </button>
                      </div>

                      {currentInputs.map((_, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.3)', padding: '6px 10px', borderRadius: '6px', marginBottom: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', fontFamily: 'monospace' }}>
                            Вхід #{idx + 1}: {declaredDataType}
                          </span>

                          {currentInputs.length > 1 && (
                            <button onClick={() => handleDeleteInputElem(idx)} className="btn-icon" style={{ width: '22px', height: '22px' }}>
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Output */}
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', display: 'block', marginBottom: '8px' }}>
                        Вихідний елемент
                      </span>

                      <div
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#34d399',
                          fontFamily: 'monospace',
                        }}
                      >
                        Вихід: {declaredDataType}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC CONFIGSCHEMA PARAMETERS */}
              {isScriptSelected && (
                <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Sliders className="w-4.5 h-4.5 text-amber-400" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24' }}>
                      Параметри скрипта (з ConfigSchema)
                    </span>
                  </div>

                  {parsedConfigSchemaFields.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                      У ConfigSchema даного скрипта відсутні параметри.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {parsedConfigSchemaFields.map((field) => {
                        const val = paramValues[field.name] ?? field.default;

                        return (
                          <div
                            key={field.name}
                            style={{
                              padding: '12px',
                              background: 'rgba(0, 0, 0, 0.32)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '10px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f1f5f9' }}>
                                {field.title}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace', fontWeight: 600 }}>
                                {field.type}
                              </span>
                            </div>

                            {field.desc && (
                              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '8px' }}>
                                {field.desc}
                              </div>
                            )}

                            {/* GUI Controls */}
                            {(field.type === 'float' || field.type === 'int') ? (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                  <input
                                    type="range"
                                    min={field.min}
                                    max={field.max}
                                    step={field.step}
                                    value={val}
                                    onChange={(e) =>
                                      handleParamValueChange(
                                        field.name,
                                        field.type === 'int' ? parseInt(e.target.value, 10) : parseFloat(e.target.value)
                                      )
                                    }
                                    style={{ flex: 1, accentColor: '#f59e0b', cursor: 'pointer', height: '6px' }}
                                  />
                                  <input
                                    type="number"
                                    min={field.min}
                                    max={field.max}
                                    step={field.step}
                                    value={val}
                                    onChange={(e) =>
                                      handleParamValueChange(
                                        field.name,
                                        field.type === 'int' ? parseInt(e.target.value, 10) : parseFloat(e.target.value)
                                      )
                                    }
                                    style={{ ...inputStyle, width: '74px', padding: '4px 8px', textAlign: 'center', fontSize: '0.82rem', fontFamily: 'monospace' }}
                                  />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                                  <span>Мін: {field.min}</span>
                                  <span>Крок: {field.step}</span>
                                  <span>Макс: {field.max}</span>
                                </div>
                              </div>
                            ) : field.type === 'bool' ? (
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: '#cbd5e1' }}>
                                <input
                                  type="checkbox"
                                  checked={Boolean(val)}
                                  onChange={(e) => handleParamValueChange(field.name, e.target.checked)}
                                  style={{ accentColor: '#f59e0b', width: '18px', height: '18px' }}
                                />
                                Увімкнено / Вимкнено
                              </label>
                            ) : (
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => handleParamValueChange(field.name, e.target.value)}
                                style={inputStyle}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Delete node button */}
          <div style={{ marginTop: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => {
                deleteNode(selectedNodeId);
                setSelectedNodeId(null);
              }}
              className="btn-secondary"
              style={{
                width: '100%',
                justifyContent: 'center',
                color: '#f43f5e',
                borderColor: 'rgba(244, 63, 94, 0.3)',
                background: 'rgba(244, 63, 94, 0.08)',
                padding: '10px 16px',
                fontSize: '0.85rem',
              }}
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              Видалити ноду зі схеми
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#cbd5e1',
  marginBottom: '4px',
};

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
};
