import React, { useEffect } from 'react';

const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
const colors = {
  success: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', color: '#4ade80', bar: '#22c55e' },
  error:   { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', color: '#f87171', bar: '#ef4444' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', color: '#fbbf24', bar: '#f59e0b' },
  info:    { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', color: '#a5b4fc', bar: '#6366f1' },
};

export default function Toast({ toasts, removeToast }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const c = colors[toast.type] || colors.info;

  useEffect(() => {
    const timer = setTimeout(onRemove, 3500);
    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 14,
      padding: '12px 16px',
      minWidth: 280,
      maxWidth: 360,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      animation: 'slideIn 0.25s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icons[toast.type]}</span>
      <div style={{ flex: 1 }}>
        {toast.title && <div style={{ fontWeight: 700, fontSize: '0.85rem', color: c.color, marginBottom: 2 }}>{toast.title}</div>}
        <div style={{ fontSize: '0.8rem', color: 'rgba(226,232,240,0.8)', lineHeight: 1.4 }}>{toast.message}</div>
      </div>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.5)', fontSize: '1rem', padding: 0, flexShrink: 0 }}>×</button>
      <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, height: 2, background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ height: '100%', background: c.bar, animation: 'shrink 3.5s linear forwards', borderRadius: 2, opacity: 0.7 }} />
      </div>
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  );
}
