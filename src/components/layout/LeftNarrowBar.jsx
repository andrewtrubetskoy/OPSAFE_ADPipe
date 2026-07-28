import React from 'react';
import { GitFork, Shield, Settings, HelpCircle } from 'lucide-react';
import { useSchemeStore } from '../../store/useSchemeStore';
import { useAuthStore } from '../../store/useAuthStore';

export function LeftNarrowBar({ onOpenAdmin }) {
  const { activeLeftTab, isLeftPanelOpen, toggleLeftPanel } = useSchemeStore();
  const { user } = useAuthStore();

  return (
    <aside
      style={{
        width: '48px',
        height: 'calc(100vh - 52px)',
        background: '#0d111a',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0',
        gap: '12px',
        zIndex: 30,
      }}
    >
      <button
        onClick={() => toggleLeftPanel('scheme')}
        className={`btn-icon ${activeLeftTab === 'scheme' && isLeftPanelOpen ? 'active' : ''}`}
        title="Схеми та папки"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
        }}
      >
        <GitFork className="w-5 h-5" />
      </button>

      {user?.role === 'admin' && (
        <button
          onClick={onOpenAdmin}
          className="btn-icon"
          title="Адміністрування користувачів"
          style={{ width: '38px', height: '38px', borderRadius: '10px' }}
        >
          <Shield className="w-5 h-5 text-purple-400" />
        </button>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="btn-icon" title="Налаштування" style={{ width: '38px', height: '38px' }}>
          <Settings className="w-4 h-4" />
        </button>
        <button className="btn-icon" title="Довідка" style={{ width: '38px', height: '38px' }}>
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
