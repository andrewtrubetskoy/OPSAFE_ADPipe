import React from 'react';
import { Workflow, UserCheck, LogOut, ShieldAlert, Folder } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSchemeStore } from '../../store/useSchemeStore';

export function TopBar({ onOpenAdmin }) {
  const { user, logout } = useAuthStore();
  const { activeSchemeId, schemes, folders } = useSchemeStore();

  const activeScheme = schemes.find((s) => s.id === activeSchemeId);
  const activeFolder = activeScheme ? folders.find((f) => f.id === activeScheme.folderId) : null;

  return (
    <header
      style={{
        height: '52px',
        width: '100%',
        background: 'rgba(10, 13, 20, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 40,
      }}
    >
      {/* Left Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)',
          }}
        >
          <Workflow className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ADPipe
          </h1>
        </div>
      </div>

      {/* Center Breadcrumb */}
      {activeScheme && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.04)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          {activeFolder && (
            <>
              <Folder className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeFolder.name}</span>
              <span>/</span>
            </>
          )}
          <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{activeScheme.name}</span>
        </div>
      )}

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user?.role === 'admin' && (
          <button
            onClick={onOpenAdmin}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'rgba(139, 92, 246, 0.15)', borderColor: 'rgba(139, 92, 246, 0.3)', color: '#c084fc' }}
          >
            <ShieldAlert className="w-4 h-4" />
            Адмін-Панель
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9' }}>{user?.username}</span>
          <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', textTransform: 'uppercase' }}>
            {user?.role}
          </span>
        </div>

        <button onClick={logout} className="btn-icon" title="Вийти з системи">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
