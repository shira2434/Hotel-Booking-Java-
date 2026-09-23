import React, { useEffect, useState } from 'react';
import { getAllRooms } from '../api';
import { useToastContext } from '../App';

const statusConfig = {
  clean:    { label: 'נקי',      color: '#4ade80', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)',   icon: '✅' },
  dirty:    { label: 'מלוכלך',  color: '#f87171', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   icon: '🧹' },
  cleaning: { label: 'בניקיון', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  icon: '⏳' },
  maintenance: { label: 'תחזוקה', color: '#a5b4fc', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', icon: '🔧' },
};

const typeLabel = { SINGLE: 'יחיד', DOUBLE: 'זוגי', SUITE: 'סוויטה' };
const typeClass = { SINGLE: 'badge-single', DOUBLE: 'badge-double', SUITE: 'badge-suite' };

export default function Housekeeping() {
  const toast = useToastContext();
  const [rooms, setRooms] = useState([]);
  // שמירת סטטוס ניקיון ב-localStorage (כי אין שדה ב-DB)
  const [cleanStatus, setCleanStatus] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cleanStatus') || '{}'); } catch { return {}; }
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getAllRooms().then(r => setRooms(r.data)).catch(() => {});
  }, []);

  const setStatus = (roomId, status) => {
    const updated = { ...cleanStatus, [roomId]: status };
    setCleanStatus(updated);
    localStorage.setItem('cleanStatus', JSON.stringify(updated));
    toast.success(`חדר עודכן ל"${statusConfig[status].label}"`, 'ניהול ניקיון');
  };

  const getStatus = (roomId) => cleanStatus[roomId] || 'clean';

  const filtered = rooms.filter(r => filter === 'all' || getStatus(r.id) === filter);

  const counts = Object.keys(statusConfig).reduce((acc, s) => {
    acc[s] = rooms.filter(r => getStatus(r.id) === s).length;
    return acc;
  }, {});

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="stat-card" style={{ cursor: 'pointer', border: filter === key ? `1.5px solid ${cfg.color}44` : undefined }}
            onClick={() => setFilter(filter === key ? 'all' : key)}>
            <div className="stat-top">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{cfg.icon}</div>
              {filter === key && <span style={{ fontSize: '0.65rem', color: cfg.color, fontWeight: 700 }}>מסונן</span>}
            </div>
            <div className="stat-value" style={{ fontSize: '1.6rem', color: cfg.color }}>{counts[key]}</div>
            <div className="stat-label">{cfg.label}</div>
          </div>
        ))}
      </div>

      {/* Rooms grid */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">🧹 ניהול ניקיון חדרים</div>
            <div className="card-subtitle">{filtered.length} חדרים</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setFilter('all')}>הצג הכל</button>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {filtered.map(r => {
              const status = getStatus(r.id);
              const cfg = statusConfig[status];
              return (
                <div key={r.id} style={{
                  background: cfg.bg, border: `1.5px solid ${cfg.border}`,
                  borderRadius: 14, padding: 16, transition: 'transform 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#e2e8f0' }}>{r.roomNumber}</div>
                      <span className={`badge ${typeClass[r.type]}`} style={{ marginTop: 4 }}>{typeLabel[r.type]}</span>
                    </div>
                    <div style={{ fontSize: '1.4rem' }}>{cfg.icon}</div>
                  </div>
                  {r.floor && <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 10 }}>קומה {r.floor}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    {Object.entries(statusConfig).map(([key, c]) => (
                      <button key={key}
                        onClick={() => setStatus(r.id, key)}
                        style={{
                          padding: '4px 6px', borderRadius: 6, border: `1px solid ${c.border}`,
                          background: status === key ? c.bg : 'rgba(255,255,255,0.03)',
                          color: status === key ? c.color : '#64748b',
                          fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        {c.icon} {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
