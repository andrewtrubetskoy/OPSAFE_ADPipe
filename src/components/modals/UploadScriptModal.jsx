import React, { useState } from 'react';
import { X, Upload, FileCode, FolderPlus, Save } from 'lucide-react';
import { useScriptLibraryStore } from '../../store/useScriptLibraryStore';

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

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!name) {
        setName(file.name.replace(/\.py$/, ''));
      }
      // Read text content
      const reader = new FileReader();
      reader.onload = (evt) => {
        setCodeText(evt.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('name', name);
        formData.append('description', description);
        if (folderId) formData.append('folderId', folderId);
        await uploadScript(formData);
      } else {
        await createScript({
          name,
          description: description || 'Скрипт з бібліотеки',
          code: codeText || '# Python script code\npass',
          inputType,
          outputType,
          folderId: folderId ? parseInt(folderId, 10) : null,
        });
      }
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setSelectedFile(null);
      setCodeText('');
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
          width: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* File Upload Box */}
          <div
            style={{
              border: '2px dashed rgba(245, 158, 11, 0.35)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              background: 'rgba(245, 158, 11, 0.05)',
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
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'або введіть код вручну нижче'}
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
              placeholder="напр. Фільтрація шару буфером"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Опис</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Короткий опис роботи алгоритму..."
              rows={2}
              style={inputStyle}
            />
          </div>

          {/* Folder selection */}
          <div>
            <label style={labelStyle}>Папка в бібліотеці</label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              style={inputStyle}
            >
              <option value="">(Корінь бібліотеки)</option>
              {scriptFolders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Code Text editor */}
          <div>
            <label style={labelStyle}>Код Python</label>
            <textarea
              value={codeText}
              onChange={(e) => setCodeText(e.target.value)}
              rows={6}
              placeholder="# Напишіть Python код тут..."
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.78rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Збереження...' : 'Зберегти до бібліотеки'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: '0.76rem',
  fontWeight: 600,
  color: '#94a3b8',
  marginBottom: '4px',
  display: 'block',
};

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: '#f1f5f9',
  fontSize: '0.84rem',
};
