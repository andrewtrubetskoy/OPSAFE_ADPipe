import React, { useState } from 'react';
import { RefreshCw, FolderPlus, FilePlus, Edit2, MoreVertical, Folder, FolderOpen, FileCode, ChevronRight, ChevronDown, Trash2, Plus } from 'lucide-react';
import { useSchemeStore } from '../../store/useSchemeStore';

export function LeftWidePanel() {
  const {
    folders,
    schemes,
    activeSchemeId,
    setActiveScheme,
    createFolder,
    renameFolder,
    deleteFolder,
    createScheme,
    renameScheme,
    deleteScheme,
  } = useSchemeStore();

  const [expandedFolders, setExpandedFolders] = useState({ 'f-1': true });
  const [activeMenuId, setActiveMenuId] = useState(null); // { type: 'folder'|'scheme', id: string }

  // Modal / prompt inline state
  const [editingItem, setEditingItem] = useState(null); // { type, id, currentName }
  const [newNameInput, setNewNameInput] = useState('');

  const toggleFolderExpand = (folderId, e) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleRefreshList = () => {
    // Re-trigger layout sync / notification
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
      renameFolder(editingItem.id, newNameInput.trim());
    } else {
      renameScheme(editingItem.id, newNameInput.trim());
    }
    setEditingItem(null);
  };

  const activeScheme = schemes.find((s) => s.id === activeSchemeId);

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
    >
      {/* Top Header Buttons */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Управління схемам
          </span>
          <button onClick={handleRefreshList} className="btn-icon" title="Оновити список схем">
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

        {/* Toolbar Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <button
            onClick={() => {
              const name = prompt('Введіть назву нової папки:');
              if (name) createFolder(name);
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

      {/* Selected Scheme Indicator / Quick Dropdown */}
      <div style={{ padding: '10px 14px', background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>Поточна обрана схема:</div>
        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeScheme ? activeScheme.name : 'Схему не обрано'}
        </div>
      </div>

      {/* Folder Hierarchy Tree */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', padding: '0 8px 6px', textTransform: 'uppercase' }}>
          Ієрархія папок та схем
        </div>

        {/* Root Level Folders & Schemes */}
        {renderTree(null, folders, schemes, expandedFolders, toggleFolderExpand, activeSchemeId, setActiveScheme, activeMenuId, setActiveMenuId, handleStartRename, deleteFolder, deleteScheme, createScheme, editingItem, newNameInput, setNewNameInput, handleSaveRename)}
      </div>

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

// Recursive Helper for Tree Rendering
function renderTree(
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
  editingItem,
  newNameInput,
  setNewNameInput,
  handleSaveRename
) {
  const currentFolders = folders.filter((f) => f.parentId === parentId);
  const currentSchemes = schemes.filter((s) => s.folderId === parentId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {currentFolders.map((folder) => {
        const isExpanded = !!expandedFolders[folder.id];
        const isMenuOpen = activeMenuId?.type === 'folder' && activeMenuId?.id === folder.id;

        return (
          <div key={folder.id} style={{ marginLeft: parentId ? '12px' : '0' }}>
            {/* Folder Row */}
            <div
              onClick={(e) => toggleFolderExpand(folder.id, e)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: '#cbd5e1',
                transition: 'background 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Folder className="w-4 h-4 text-cyan-400" />
                )}
                <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {folder.name}
                </span>
              </div>

              {/* 3-dots context menu trigger */}
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

              {/* Folder Context Menu Dropdown */}
              {isMenuOpen && (
                <div
                  style={{
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
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                      const name = prompt('Введіть назву схеми:');
                      if (name) createScheme(name, folder.id);
                    }}
                    style={menuButtonStyle}
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" /> Створити схему тут
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

            {/* Render children if expanded */}
            {isExpanded &&
              renderTree(
                folder.id,
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
                editingItem,
                newNameInput,
                setNewNameInput,
                handleSaveRename
              )}
          </div>
        );
      })}

      {/* Schemes at current level */}
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
              transition: 'all 0.15s ease',
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

            {/* Scheme Context Menu */}
            {isMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '28px',
                  right: '8px',
                  background: '#161e2e',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  padding: '4px',
                  zIndex: 60,
                  width: '160px',
                }}
              >
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
