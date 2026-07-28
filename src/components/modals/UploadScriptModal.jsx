import React, { useState } from 'react';
import { X, Upload, FileCode, Save, AlertTriangle } from 'lucide-react';
import { useScriptLibraryStore } from '../../store/useScriptLibraryStore';
import { validatePythonScript } from '../../utils/scriptValidator';

export function UploadScriptModal({ isOpen, onClose }) {
  const { scriptFolders, uploadScript, createScript } = useScriptLibraryStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState('');
  const [inputType, setInputType] = useState('geojson');
  const [outputType, setOutputType] = useState('geojson');
  const [selectedFile, setSelectedFile] = useState(null);
  const [codeText, setCodeText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setValidationErrors([]);
      if (!name) {
        setName(file.name.replace(/\.py$/, ''));
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target.result || '';
        setCodeText(text);
        const validation = validatePythonScript(text);
        if (!validation.isValid) {
          setValidationErrors(validation.errors);
        } else {
          setValidationErrors([]);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const codeToValidate = codeText || '';
    const validation = validatePythonScript(codeToValidate);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    setIsSubmitting(true);

    try {
      const scriptPayload = {
        name,
        description: description || 'Скрипт з бібліотеки',
        code: codeText,
        inputType,
        outputType,
        folderId: folderId ? parseInt(folderId, 10) : null,
      };

      if (selectedFile) {
        await uploadScript(scriptPayload, codeText);
      } else {
        await createScript(scriptPayload);
      }

      onClose();
      // Reset form
      setName('');
      setDescription('');
      setSelectedFile(null);
      setCodeText('');
      setValidationErrors([]);
    } catch (err) {
      console.error('Failed to save script:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '10px', color: '#fbbf24' }}>
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Завантажити скрипт до бібліотеки
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Збереження Python (.py) файлу в базі даних проєкту
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Validation Errors Alert Banner */}
        {validationErrors.length > 0 && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fecdd3',
              fontSize: '0.82rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#f43f5e', marginBottom: '6px' }}>
              <AlertTriangle className="w-4 h-4" />
              ВІДМОВА У ДОДАВАННІ! Скрипт не відповідає вимогам:
            </div>
            <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* File Upload Box */}
          <div
            style={{
              border: validationErrors.length > 0 ? '2px dashed rgba(244, 63, 94, 0.5)' : '2px dashed rgba(245, 158, 11, 0.35)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              background: validationErrors.length > 0 ? 'rgba(244, 63, 94, 0.05)' : 'rgba(245, 158, 11, 0.05)',
            }}
          >
            <input
              type="file"
              accept=".py,.txt"
              onChange={handleFileChange}
              id="file-upload-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <Upload className="w-7 h-7 text-amber-400" />
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f1f5f9' }}>
                {selectedFile ? selectedFile.name : 'Вибрати .py файл з комп’ютера'}
              </span>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'або введіть код вручну'}
              </span>
            </label>
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>Назва скрипта *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Наприклад: Буферний фільтр геометрій"
              style={inputStyle}
            />
          </div>

          {/* Folder */}
          <div>
            <label style={labelStyle}>Папка в бібліотеці</label>
            <select value={folderId} onChange={(e) => setFolderId(e.target.value)} style={inputStyle}>
              <option value="">(Без папки / Корінь)</option>
              {scriptFolders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Types */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Вхідний тип</label>
              <select value={inputType} onChange={(e) => setInputType(e.target.value)} style={inputStyle}>
                <option value="geojson">GeoJSON</option>
                <option value="csv">CSV / Data</option>
                <option value="shapefile">Shapefile</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Вихідний тип</label>
              <select value={outputType} onChange={(e) => setOutputType(e.target.value)} style={inputStyle}>
                <option value="geojson">GeoJSON</option>
                <option value="csv">CSV / Data</option>
                <option value="shapefile">Shapefile</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Опис</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Короткий опис призначенню та алгоритму"
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {/* Code Textarea if no file selected */}
          {!selectedFile && (
            <div>
              <label style={labelStyle}>Код Python (має відповідати script_template.py)</label>
              <textarea
                rows={5}
                value={codeText}
                onChange={(e) => {
                  setCodeText(e.target.value);
                  const val = validatePythonScript(e.target.value);
                  setValidationErrors(val.isValid ? [] : val.errors);
                }}
                placeholder="Введіть Python код..."
                style={{
                  ...inputStyle,
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  resize: 'vertical',
                }}
              />
            </div>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isSubmitting || validationErrors.length > 0}
              className="btn-primary"
              style={{
                background: validationErrors.length > 0 ? '#475569' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                cursor: validationErrors.length > 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Збереження...' : 'Зберегти в бібліотеку'}
            </button>
          </div>
        </form>
      </div>
    </div>
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
