import React from 'react';
import { Database, RefreshCw, Code2, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useSchemeStore } from '../../store/useSchemeStore';

export function CanvasToolbar() {
  const addNode = useSchemeStore((state) => state.addNode);

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '8px',
        borderRadius: '14px',
        zIndex: 20,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '2px 6px', textAlign: 'center' }}>
        Інструменти
      </div>

      {/* 1. STREAM OUT BUTTON AT THE TOP (ВИДАЧА ДАНИХ) */}
      <button
        onClick={() => addNode('streamOutNode')}
        className="btn-secondary"
        style={{
          padding: '8px 12px',
          fontSize: '0.8rem',
          justifyContent: 'flex-start',
          background: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.25)',
          color: '#34d399',
        }}
        title="Створити потік видачі даних (direction: out)"
      >
        <Plus className="w-4 h-4 text-emerald-400" />
        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
        <span>Потік (видача даних)</span>
      </button>

      {/* 2. CONVERTER BUTTON */}
      <button
        onClick={() => addNode('converterNode')}
        className="btn-secondary"
        style={{
          padding: '8px 12px',
          fontSize: '0.8rem',
          justifyContent: 'flex-start',
          background: 'rgba(139, 92, 246, 0.1)',
          borderColor: 'rgba(139, 92, 246, 0.25)',
          color: '#a78bfa',
        }}
        title="Створити конвертер даних"
      >
        <Plus className="w-4 h-4 text-purple-400" />
        <RefreshCw className="w-4 h-4 text-purple-400" />
        <span>Конвертер</span>
      </button>

      {/* 3. SCRIPT BUTTON */}
      <button
        onClick={() => addNode('scriptNode')}
        className="btn-secondary"
        style={{
          padding: '8px 12px',
          fontSize: '0.8rem',
          justifyContent: 'flex-start',
          background: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.25)',
          color: '#fbbf24',
        }}
        title="Створити новий Python скрипт"
      >
        <Plus className="w-4 h-4 text-amber-400" />
        <Code2 className="w-4 h-4 text-amber-400" />
        <span>Скрипт</span>
      </button>

      {/* 4. STREAM IN BUTTON AT THE BOTTOM (ПРИЙОМ ДАНИХ) */}
      <button
        onClick={() => addNode('streamInNode')}
        className="btn-secondary"
        style={{
          padding: '8px 12px',
          fontSize: '0.8rem',
          justifyContent: 'flex-start',
          background: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.25)',
          color: '#60a5fa',
        }}
        title="Створити потік прийому даних (direction: in)"
      >
        <Plus className="w-4 h-4 text-blue-400" />
        <ArrowDownRight className="w-4 h-4 text-blue-400" />
        <span>Потік (прийом даних)</span>
      </button>
    </div>
  );
}
