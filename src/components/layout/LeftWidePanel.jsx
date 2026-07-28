import React, { useState, useEffect } from 'react';
import { RefreshCw, FolderPlus, FilePlus, Edit2, MoreVertical, Folder, FolderOpen, FileCode, ChevronRight, ChevronDown, Trash2, Plus, Code2, Upload, GripVertical } from 'lucide-react';
import { useSchemeStore } from '../../store/useSchemeStore';
import { useScriptLibraryStore } from '../../store/useScriptLibraryStore';
import { PythonCodeModal } from '../modals/PythonCodeModal';

export function LeftWidePanel() {
  const {
    folders,
    schemes,
    activeSchemeId,
    setActiveScheme,
    createFolder: createSchemeFolder,
    renameFolder: renameSchemeFolder,
    deleteFolder: deleteSchemeFolder,
    moveFolder: moveSchemeFolder,
    createScheme,
    renameScheme,
    deleteScheme,
  } = useSchemeStore();

  const {
    activePanelTab,
    scriptFolders,
    scriptItems,
    selectedScriptId,
    setSelectedScriptId,
    fetchLibrary,
    createFolder: createScriptFolder,
    deleteFolder: deleteScriptFolder,
    moveFolderToFolder: moveScriptFolder,
    deleteScript,
    moveScriptToFolder,
    updateScriptCode,
    setUploadModalOpen,
  } = useScriptLibraryStore();

  const [expandedFolders, setExpandedFolders] = useState({ 1: true, 2: true, 'f-1': true });
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newNameInput, setNewNameInput] = useState('');
  const [editingLibraryScript, setEditingLibraryScript] = useState(null);

  // Close 3-dots context menu on click outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const toggleFolderExpand = (folderId, e) => {
    e?.stopPropagation();
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleStartRename = (type, id, currentName, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setEditingItem({ type, id });
    setNewNameInput(currentName);
  };

  const handleSaveRename = () => {
    if (!newNameInput.trim()) return;
    if (editingItem.type === 'folder') {
      renameSchemeFolder(editingItem.id, newNameInput.trim());
    } else if (editingItem.type === 'scheme') {
      renameScheme(editingItem.id, newNameInput.trim());
    }
    setEditingItem(null);
  };

  const activeScheme = schemes.find((s) => s.id === activeSchemeId);
  const selectedScript = scriptItems.find((s) => s.id === selectedScriptId);

  return (
    <aside
      className="glass-panel"
      style={{
        width: '320px',
        height: 'calc(100vh - 52px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 25,
        position: 'relative',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. SCHEMES VIEW */}
      {activePanelTab === 'schemes' && (
        <>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Управління схемам
              </span>
              <button className="btn-icon" title="Оновити список схем">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => {
                  const name = prompt('Введіть назву нової папки схем:');
                  if (name) createSchemeFolder(name);
                }}
                className="btn-secondary"
                style={{ justifyContent: 'center', fontSize: '0.78rem', padding: '6px 8px' }}
              >
                <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
                + Папка
              </button>
              <button
                onClick={() => {
                  const name = prompt('Введіть назву нової схеми:');
                  if (name) createScheme(name);
                }}
                className="btn-primary"
                style={{ justifyContent: 'center', fontSize: '0.78rem', padding: '6px 8px' }}
              >
                <FilePlus className="w-3.5 h-3.5" />
                + Схема
              </button>
            </div>
          </div>

          <div style={{ padding: '10px 14px', background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>Поточна обрана схема:</div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeScheme ? activeScheme.name : 'Схему не обрано'}
            </div>
          </div>

          <div
            style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              try {
                const raw = e.dataTransfer.getData('text/plain');
                if (raw) {
                  const data = JSON.parse(raw);
                  if (data?.type === 'schemeFolder') {
                    moveSchemeFolder(data.folderId, null);
                  }
                }
              } catch (err) {}
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', padding: '0 8px 6px', textTransform: 'uppercase' }}>
              Ієрархія папок та схем
            </div>
            {renderSchemeTree(null, folders, schemes, expandedFolders, toggleFolderExpand, activeSchemeId, setActiveScheme, activeMenuId, setActiveMenuId, handleStartRename, deleteSchemeFolder, deleteScheme, createScheme, createSchemeFolder, moveSchemeFolder)}
          </div>
        </>
      )}

      {/* 2. SCRIPT LIBRARY VIEW */}
      {activePanelTab === 'scripts' && (
        <>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code2 className="w-4 h-4 text-amber-400" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Бібліотека скриптів
                </span>
              </div>
              <button onClick={fetchLibrary} className="btn-icon" title="Оновити бібліотеку">
                <RefreshCw className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '6px' }}>
              <button
                onClick={() => {
                  const name = prompt('Введіть назву нової папки скриптів:');
                  if (name) createScriptFolder(name);
                }}
                className="btn-secondary"
                style={{ justifyContent: 'center', fontSize: '0.78rem', padding: '6px 8px' }}
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                + Папка
              </button>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="btn-primary"
                style={{
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  padding: '6px 8px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                }}
              >
                <Upload className="w-3.5 h-3.5" />
                + Скрипт (.py)
              </button>
            </div>
          </div>

          <div style={{ padding: '10px 14px', background: 'rgba(245, 158, 11, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>Обраний скрипт у бібліотеці:</div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fbbf24', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedScript ? selectedScript.name : '(Двійний клік для редагування коду)'}
            </div>
          </div>

          {/* Script Folder & Items Tree with Drag and Drop */}
          <div
            style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              try {
                const raw = e.dataTransfer.getData('text/plain');
                if (raw) {
                  const data = JSON.parse(raw);
                  if (data?.type === 'script') {
                    moveScriptToFolder(data.scriptId, null);
                  } else if (data?.type === 'scriptFolder') {
                    moveScriptFolder(data.folderId, null);
                  }
                }
              } catch (err) {}
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', padding: '0 8px 6px', textTransform: 'uppercase' }}>
              Ієрархія (Двійний клік — редагування)
            </div>
            {renderScriptTree(null, scriptFolders, scriptItems, expandedFolders, toggleFolderExpand, selectedScriptId, setSelectedScriptId, activeMenuId, setActiveMenuId, deleteScriptFolder, deleteScript, setUploadModalOpen, moveScriptToFolder, createScriptFolder, moveScriptFolder, (script) => setEditingLibraryScript(script))}
          </div>
        </>
      )}

      {/* Edit modal for library script code */}
      {editingLibraryScript && (
        <PythonCodeModal
          isOpen={!!editingLibraryScript}
          onClose={() => setEditingLibraryScript(null)}
          initialCode={editingLibraryScript.code || ''}
          scriptName={editingLibraryScript.name || 'Скрипт з бібліотеки'}
          onSave={(newCode) => {
            updateScriptCode(editingLibraryScript.id, newCode);
          }}
        />
      )}

      {/* Edit modal / Inline dialog if renaming */}
      {editingItem && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            padding: '12px',
            background: '#182030',
            border: '1px solid #3b82f6',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            zIndex: 50,
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '6px' }}>
            Перейменувати {editingItem.type === 'folder' ? 'папку' : 'схему'}
          </div>
          <input
            type="text"
            value={newNameInput}
            onChange={(e) => setNewNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
            autoFocus
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontSize: '0.85rem',
              marginBottom: '8px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
            <button onClick={() => setEditingItem(null)} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
              Скасувати
            </button>
            <button onClick={handleSaveRename} className="btn-primary" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
              Зберегти
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

// Tree Renderer for Schemes
function renderSchemeTree(
  parentId,
  folders,
  schemes,
  expandedFolders,
  toggleFolderExpand,
  activeSchemeId,
  setActiveScheme,
  activeMenuId,
  setActiveMenuId,
  handleStartRename,
  deleteFolder,
  deleteScheme,
  createScheme,
  createSchemeFolder,
  moveSchemeFolder
) {
  const currentFolders = folders.filter((f) => String(f.parentId || null) === String(parentId || null));
  const currentSchemes = schemes.filter((s) => String(s.folderId || null) === String(parentId || null));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {currentFolders.map((folder) => {
        const isExpanded = !!expandedFolders[folder.id];
        const isMenuOpen = activeMenuId?.type === 'folder' && activeMenuId?.id === folder.id;

        return (
          <div key={folder.id} style={{ marginLeft: parentId ? '12px' : '0' }}>
            <div
              draggable={true}
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'schemeFolder', folderId: folder.id }));
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)';
                e.currentTarget.style.border = '1px dashed #3b82f6';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.border = 'none';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.border = 'none';
                try {
                  const raw = e.dataTransfer.getData('text/plain');
                  if (raw) {
                    const data = JSON.parse(raw);
                    if (data?.type === 'schemeFolder' && data.folderId !== folder.id) {
                      moveSchemeFolder(data.folderId, folder.id);
                    }
                  }
                } catch (err) {}
              }}
              onClick={(e) => toggleFolderExpand(folder.id, e)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '6px',
                cursor: 'grab',
                fontSize: '0.85rem',
                color: '#cbd5e1',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                <GripVertical className="w-3.5 h-3.5 text-slate-500 cursor-grab" />
                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                {isExpanded ? <FolderOpen className="w-4 h-4 text-cyan-400" /> : <Folder className="w-4 h-4 text-cyan-400" />}
                <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {folder.name}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(isMenuOpen ? null : { type: 'folder', id: folder.id });
                }}
                className="btn-icon"
                style={{ width: '24px', height: '24px' }}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {isMenuOpen && (
                <div style={dropdownMenuStyle} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                      const name = prompt('Введіть назву нової підпапки:');
                      if (name) createSchemeFolder(name, folder.id);
                    }}
                    style={menuButtonStyle}
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-cyan-400" /> Додати папку
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                      const name = prompt('Введіть назву схеми:');
                      if (name) createScheme(name, folder.id);
                    }}
                    style={menuButtonStyle}
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" /> Створити схему
                  </button>
                  <button onClick={(e) => handleStartRename('folder', folder.id, folder.name, e)} style={menuButtonStyle}>
                    <Edit2 className="w-3.5 h-3.5 text-blue-400" /> Перейменувати
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                      if (confirm(`Видалити папку "${folder.name}"?`)) deleteFolder(folder.id);
                    }}
                    style={{ ...menuButtonStyle, color: '#f43f5e' }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Видалити папку
                  </button>
                </div>
              )}
            </div>

            {isExpanded && renderSchemeTree(folder.id, folders, schemes, expandedFolders, toggleFolderExpand, activeSchemeId, setActiveScheme, activeMenuId, setActiveMenuId, handleStartRename, deleteFolder, deleteScheme, createScheme, createSchemeFolder, moveSchemeFolder)}
          </div>
        );
      })}

      {currentSchemes.map((scheme) => {
        const isActive = scheme.id === activeSchemeId;
        const isMenuOpen = activeMenuId?.type === 'scheme' && activeMenuId?.id === scheme.id;

        return (
          <div
            key={scheme.id}
            onClick={() => setActiveScheme(scheme.id)}
            style={{
              marginLeft: parentId ? '24px' : '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.83rem',
              background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: isActive ? '#60a5fa' : '#94a3b8',
              border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              <FileCode className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span style={{ fontWeight: isActive ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {scheme.name}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(isMenuOpen ? null : { type: 'scheme', id: scheme.id });
              }}
              className="btn-icon"
              style={{ width: '24px', height: '24px' }}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div style={dropdownMenuStyle} onClick={(e) => e.stopPropagation()}>
                <button onClick={(e) => handleStartRename('scheme', scheme.id, scheme.name, e)} style={menuButtonStyle}>
                  <Edit2 className="w-3.5 h-3.5 text-blue-400" /> Перейменувати
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(null);
                    if (confirm(`Видалити схему "${scheme.name}"?`)) deleteScheme(scheme.id);
                  }}
                  style={{ ...menuButtonStyle, color: '#f43f5e' }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Видалити схему
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Tree Renderer for Script Library with Drag & Drop into folders
function renderScriptTree(
  parentId,
  scriptFolders,
  scriptItems,
  expandedFolders,
  toggleFolderExpand,
  selectedScriptId,
  setSelectedScriptId,
  activeMenuId,
  setActiveMenuId,
  deleteScriptFolder,
  deleteScript,
  setUploadModalOpen,
  moveScriptToFolder,
  createScriptFolder,
  moveScriptFolder,
  onOpenScriptEditor
) {
  const currentFolders = scriptFolders.filter((f) => String(f.parentId || null) === String(parentId || null));
  const currentScripts = scriptItems.filter((s) => String(s.folderId || null) === String(parentId || null));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {currentFolders.map((folder) => {
        const isExpanded = !!expandedFolders[folder.id];
        const isMenuOpen = activeMenuId?.type === 'scriptFolder' && activeMenuId?.id === folder.id;

        return (
          <div key={folder.id} style={{ marginLeft: parentId ? '12px' : '0' }}>
            <div
              draggable={true}
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'scriptFolder', folderId: folder.id }));
              }}
              onClick={(e) => toggleFolderExpand(folder.id, e)}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)';
                e.currentTarget.style.border = '1px dashed #f59e0b';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.border = 'none';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.border = 'none';
                try {
                  const raw = e.dataTransfer.getData('text/plain');
                  if (raw) {
                    const data = JSON.parse(raw);
                    if (data?.type === 'script') {
                      moveScriptToFolder(data.scriptId, folder.id);
                    } else if (data?.type === 'scriptFolder' && data.folderId !== folder.id) {
                      moveScriptFolder(data.folderId, folder.id);
                    }
                  }
                } catch (err) {}
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '6px',
                cursor: 'grab',
                fontSize: '0.85rem',
                color: '#cbd5e1',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                <GripVertical className="w-3.5 h-3.5 text-slate-500 cursor-grab" />
                {isExpanded ? <ChevronDown className="w-4 h-4 text-amber-400" /> : <ChevronRight className="w-4 h-4 text-amber-400" />}
                {isExpanded ? <FolderOpen className="w-4 h-4 text-amber-400" /> : <Folder className="w-4 h-4 text-amber-400" />}
                <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#f1f5f9' }}>
                  {folder.name}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(isMenuOpen ? null : { type: 'scriptFolder', id: folder.id });
                }}
                className="btn-icon"
                style={{ width: '24px', height: '24px' }}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {isMenuOpen && (
                <div style={dropdownMenuStyle} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                      const name = prompt('Введіть назву нової підпапки скриптів:');
                      if (name) createScriptFolder(name, folder.id);
                    }}
                    style={menuButtonStyle}
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-amber-400" /> Додати папку
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                      setUploadModalOpen(true);
                    }}
                    style={menuButtonStyle}
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" /> Завантажити .py сюди
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                      if (confirm(`Видалити папку скриптів "${folder.name}"?`)) deleteScriptFolder(folder.id);
                    }}
                    style={{ ...menuButtonStyle, color: '#f43f5e' }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Видалити папку
                  </button>
                </div>
              )}
            </div>

            {isExpanded &&
              renderScriptTree(
                folder.id,
                scriptFolders,
                scriptItems,
                expandedFolders,
                toggleFolderExpand,
                selectedScriptId,
                setSelectedScriptId,
                activeMenuId,
                setActiveMenuId,
                deleteScriptFolder,
                deleteScript,
                setUploadModalOpen,
                moveScriptToFolder,
                createScriptFolder,
                moveScriptFolder,
                onOpenScriptEditor
              )}
          </div>
        );
      })}

      {currentScripts.map((script) => {
        const isSelected = script.id === selectedScriptId;
        const isMenuOpen = activeMenuId?.type === 'script' && activeMenuId?.id === script.id;

        return (
          <div
            key={script.id}
            draggable={true}
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'script', scriptId: script.id }));
            }}
            onClick={() => setSelectedScriptId(script.id)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (onOpenScriptEditor) onOpenScriptEditor(script);
            }}
            style={{
              marginLeft: parentId ? '24px' : '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'grab',
              fontSize: '0.83rem',
              background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              color: isSelected ? '#fbbf24' : '#94a3b8',
              border: isSelected ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
            title="Двійний клік для відкриття редактора коду. Перетягуйте мишкою у будь-яку папку"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
              <GripVertical className="w-3.5 h-3.5 text-slate-500 cursor-grab" />
              <Code2 className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
              <span style={{ fontWeight: isSelected ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {script.name}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(isMenuOpen ? null : { type: 'script', id: script.id });
              }}
              className="btn-icon"
              style={{ width: '24px', height: '24px' }}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div style={dropdownMenuStyle} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(null);
                    if (onOpenScriptEditor) onOpenScriptEditor(script);
                  }}
                  style={menuButtonStyle}
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" /> Редагувати код
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(null);
                    if (confirm(`Видалити скрипт "${script.name}" з бібліотеки?`)) deleteScript(script.id);
                  }}
                  style={{ ...menuButtonStyle, color: '#f43f5e' }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Видалити з бібліотеки
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const dropdownMenuStyle = {
  position: 'absolute',
  top: '28px',
  right: '8px',
  background: '#161e2e',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '8px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
  padding: '4px',
  zIndex: 60,
  width: '180px',
};

const menuButtonStyle = {
  width: '100%',
  padding: '6px 10px',
  background: 'transparent',
  border: 'none',
  borderRadius: '4px',
  color: '#f1f5f9',
  fontSize: '0.78rem',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  textAlign: 'left',
};
