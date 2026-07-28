import React, { useState } from 'react';
import { Workflow, Lock, User, KeyRound, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function AuthModal() {
  const { login, authError } = useAuthStore();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(username, password);
    setLoading(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at center, #111827 0%, #030712 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '380px',
          borderRadius: '24px',
          padding: '32px 28px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
            }}
          >
            <Workflow className="w-7 h-7 text-white" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f1f5f9' }}>Авторизація ADPipe</h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
            Введіть облікові дані для входу у систему
          </p>
        </div>

        {authError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '8px 12px', borderRadius: '8px', color: '#f43f5e', fontSize: '0.82rem', marginBottom: '16px' }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Логін</label>
            <div style={{ position: 'relative' }}>
              <User className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ваш логін"
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Пароль</label>
            <div style={{ position: 'relative' }}>
              <KeyRound className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ваш пароль"
                style={inputStyle}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '10px' }}
          >
            {loading ? 'Авторизація...' : 'Увійти в систему'}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#94a3b8',
  marginBottom: '6px',
  display: 'block',
};

const inputStyle = {
  width: '100%',
  padding: '8px 10px 8px 34px',
  borderRadius: '8px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#fff',
  fontSize: '0.85rem',
};
