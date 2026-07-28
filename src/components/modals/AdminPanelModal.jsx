import React, { useState } from 'react';
import { X, ShieldAlert, UserPlus, Trash2, Key, User } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function AdminPanelModal({ isOpen, onClose }) {
  const { usersList, addUser, deleteUser } = useAuthStore();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState('user');

  if (!isOpen) return null;

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput.trim()) return;
    addUser(usernameInput.trim(), passwordInput.trim(), roleInput);
    setUsernameInput('');
    setPasswordInput('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
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
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '10px', color: '#c084fc' }}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>Панель Адміністратора</h2>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Управління користувачами та правами доступу</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form: Create User */}
        <form onSubmit={handleAddUser} style={{ marginBottom: '24px', background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserPlus className="w-4 h-4" /> Додати нового користувача
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <div>
              <label style={labelStyle}>Логін</label>
              <input
                type="text"
                placeholder="юзернейм"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Пароль</label>
              <input
                type="password"
                placeholder="••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Роль</label>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                style={inputStyle}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            + Створити користувача
          </button>
        </form>

        {/* Users List */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '10px' }}>
            Список користувачів системи ({usersList.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
            {usersList.map((u) => (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User className="w-4 h-4 text-cyan-400" />
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f1f5f9' }}>{u.username}</span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: u.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: u.role === 'admin' ? '#c084fc' : '#60a5fa',
                      fontFamily: 'monospace',
                    }}
                  >
                    {u.role}
                  </span>
                </div>

                {/* Delete button (cannot delete main admin) */}
                {u.username !== 'admin' && (
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="btn-icon"
                    style={{ width: '28px', height: '28px', color: '#f43f5e' }}
                    title="Видалити користувача"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: '0.72rem',
  fontWeight: 600,
  color: '#94a3b8',
  marginBottom: '4px',
  display: 'block',
};

const inputStyle = {
  width: '100%',
  padding: '6px 10px',
  borderRadius: '6px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#fff',
  fontSize: '0.82rem',
};
