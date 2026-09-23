import React, { useState } from 'react';
import axios from 'axios';

const BASE = 'http://localhost:8080';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${BASE}/admin/login`, null, {
        params: { username: form.username, password: form.password }
      });
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data || 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.bgOverlay} />

      {/* Left - branding */}
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.stars}>⭐⭐⭐⭐⭐</div>
          <h1 style={s.heroTitle}>Grand Hotel</h1>
          <p style={s.heroSub}>מערכת ניהול פנימית לצוות המלון</p>
          <div style={s.featureList}>
            {[
              { icon: '📊', text: 'לוח בקרה בזמן אמת' },
              { icon: '🛏️', text: 'ניהול חדרים ותפוסה' },
              { icon: '📋', text: 'ניהול הזמנות מלא' },
              { icon: '👥', text: 'ניהול לקוחות ו-VIP' },
              { icon: '💰', text: 'דוחות הכנסות' },
            ].map(f => (
              <div key={f.text} style={s.featureItem}>
                <span style={s.featureIcon}>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - login form */}
      <div style={s.right}>
        <div style={s.card}>
          <div style={s.logoWrap}>
            <div style={s.logoIcon}>🏨</div>
            <h2 style={s.logoTitle}>Grand Hotel</h2>
            <p style={s.logoSub}>כניסה למערכת ניהול</p>
          </div>

          <div style={s.adminBadge}>
            <span style={{ opacity: 0.6 }}>🔐</span> גישה לצוות מורשה בלבד
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <div className="form-group">
              <label className="form-label">שם משתמש</label>
              <input
                placeholder="admin"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">סיסמה</label>
              <div style={{ position: 'relative' }}>
                <input
                  placeholder="••••••••"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                  required
                  style={{ paddingLeft: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={s.eyeBtn}
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <div style={s.error}>⚠️ {error}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: '0.9rem', marginTop: 4 }}
              disabled={loading}
            >
              {loading ? '⏳ מתחבר...' : '🔑 כניסה למערכת'}
            </button>
          </form>

          <div style={s.footer}>
            Grand Hotel Management System &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', position: 'relative',
    overflow: 'hidden', background: '#0a0a0f',
  },
  bgOverlay: {
    position: 'absolute', inset: 0,
    background: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80) center/cover',
    opacity: 0.12,
  },
  left: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', zIndex: 1, padding: 56,
  },
  leftContent: { maxWidth: 440 },
  stars: { fontSize: '1.1rem', marginBottom: 18, letterSpacing: 4 },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '3.8rem', fontWeight: 800, color: '#fff',
    lineHeight: 1.1, marginBottom: 14,
    textShadow: '0 4px 30px rgba(139,92,246,0.5)',
  },
  heroSub: {
    fontSize: '1rem', color: 'rgba(255,255,255,0.5)',
    marginBottom: 36, lineHeight: 1.6,
  },
  featureList: { display: 'flex', flexDirection: 'column', gap: 10 },
  featureItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: '11px 16px',
    backdropFilter: 'blur(10px)',
  },
  featureIcon: { fontSize: '1.1rem', width: 24, textAlign: 'center' },
  right: {
    width: 460, display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', zIndex: 1, padding: 36,
    background: 'rgba(10,10,15,0.75)', backdropFilter: 'blur(24px)',
    borderRight: '1px solid rgba(139,92,246,0.15)',
  },
  card: { width: '100%', maxWidth: 380 },
  logoWrap: { textAlign: 'center', marginBottom: 24 },
  logoIcon: {
    width: 64, height: 64,
    background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
    borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.8rem', margin: '0 auto 14px',
    boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
  },
  logoTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc',
  },
  logoSub: {
    fontSize: '0.72rem', color: 'rgba(139,92,246,0.7)',
    marginTop: 4, letterSpacing: 2, textTransform: 'uppercase',
  },
  adminBadge: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    background: 'rgba(139,92,246,0.08)',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 10, padding: '8px 16px',
    fontSize: '0.75rem', color: 'rgba(196,181,253,0.7)',
    marginBottom: 24, fontWeight: 500,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  eyeBtn: {
    position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '0.9rem', padding: 0, lineHeight: 1,
  },
  error: {
    background: 'rgba(239,68,68,0.1)', color: '#f87171',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem',
  },
  footer: {
    textAlign: 'center', marginTop: 28,
    fontSize: '0.68rem', color: 'rgba(148,163,184,0.3)',
  },
};
