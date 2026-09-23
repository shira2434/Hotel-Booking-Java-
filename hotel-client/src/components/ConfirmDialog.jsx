import React from 'react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.15s ease',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1025, #0f0f1a)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 20,
        padding: '28px 28px 24px',
        width: 380,
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        animation: 'popIn 0.2s ease',
      }}>
        <div style={{
          width: 52, height: 52,
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem',
          marginBottom: 18,
        }}>🗑️</div>

        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'rgba(148,163,184,0.8)', lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px 0',
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
              fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
          >
            ביטול
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px 0',
              borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            מחק
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
