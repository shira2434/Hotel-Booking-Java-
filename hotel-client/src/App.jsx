import React, { useState, createContext, useContext, useEffect } from 'react';
import Rooms from './components/Rooms';
import Customers from './components/Customers';
import Bookings from './components/Bookings';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import CalendarView from './components/CalendarView';
import Housekeeping from './components/Housekeeping';
import Toast from './components/Toast';
import Notifications from './components/Notifications';
import GlobalSearch from './components/GlobalSearch';
import useToast from './useToast';
import { getBookingStats } from './api';

export const ToastContext = createContext(null);
export const useToastContext = () => useContext(ToastContext);

const pages = [
  { id: 'dashboard',   label: 'לוח בקרה',   icon: '📊' },
  { id: 'bookings',    label: 'הזמנות',      icon: '📋' },
  { id: 'calendar',   label: 'לוח שנה',     icon: '📅' },
  { id: 'rooms',      label: 'חדרים',        icon: '🛏️' },
  { id: 'housekeeping', label: 'ניקיון',     icon: '🧹' },
  { id: 'customers',  label: 'לקוחות',       icon: '👥' },
  { id: 'reports',    label: 'דוחות',        icon: '📈' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const { toasts, removeToast, toast } = useToast();
  const [user] = useState({ name: 'מנהל המלון', role: 'ADMIN' });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const current = pages.find(p => p.id === page);

  // ספירת התראות
  useEffect(() => {
    getBookingStats().then(r => {
      const count = (r.data.checkInsToday || 0) + (r.data.checkOutsToday || 0);
      setNotifCount(count);
    }).catch(() => {});
  }, []);

  // קיצור מקלדת לחיפוש
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); }
      if (e.key === 'Escape') { setShowSearch(false); setShowNotifications(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">🏨</div>
              <div className="logo-text">
                <h1>Grand Hotel</h1>
                <p>מערכת ניהול</p>
              </div>
            </div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section-label">ניווט</div>
            {pages.map(p => (
              <button key={p.id} className={`nav-item ${page === p.id ? 'active' : ''}`} onClick={() => setPage(p.id)}>
                <span className="nav-icon">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="status-dot"><div className="dot" />מערכת פעילה</div>
          </div>
        </aside>

        <div className="main-content">
          <div className="topbar">
            <div className="topbar-left">
              <span className="breadcrumb">Grand Hotel</span>
              <span className="breadcrumb-sep">/</span>
              <span className="topbar-page">{current?.label}</span>
            </div>
            <div className="topbar-right">
              {/* Search button */}
              <button
                onClick={() => setShowSearch(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '6px 14px', cursor: 'pointer', color: '#64748b', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}
              >
                🔍 חיפוש
                <kbd style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '1px 5px' }}>Ctrl+K</kbd>
              </button>

              <div className="topbar-pill"><span>●</span> מחובר לשרת</div>

              {/* Notifications bell */}
              <button
                onClick={() => setShowNotifications(v => !v)}
                style={{ position: 'relative', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}
              >
                🔔
                {notifCount > 0 && (
                  <span style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, background: '#ef4444', borderRadius: '50%', fontSize: '0.6rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {notifCount}
                  </span>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '6px 14px 6px 10px' }}>
                <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>👤</div>
                <span style={{ fontSize: '0.82rem', color: '#c4b5fd', fontWeight: 600 }}>{user?.name}</span>
              </div>
            </div>
          </div>

          <div className="page">
            {page === 'dashboard'    && <Dashboard setPage={setPage} />}
            {page === 'bookings'     && <Bookings />}
            {page === 'calendar'     && <CalendarView />}
            {page === 'rooms'        && <Rooms />}
            {page === 'housekeeping' && <Housekeeping />}
            {page === 'customers'    && <Customers />}
            {page === 'reports'      && <Reports />}
          </div>
        </div>
      </div>

      {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}
      {showSearch && <GlobalSearch onNavigate={setPage} onClose={() => setShowSearch(false)} />}
      <Toast toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}
