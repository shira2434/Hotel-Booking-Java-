import React, { useEffect, useState, useCallback } from 'react';
import { getAllBookings, getUpcomingCheckIns, getUpcomingCheckOuts } from '../api';

export default function Notifications({ onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [bookings, checkIns, checkOuts] = await Promise.all([
        getAllBookings(),
        getUpcomingCheckIns(1),
        getUpcomingCheckOuts(1),
      ]);

      const notes = [];

      // צ'ק-אין היום
      checkIns.data.forEach(b => notes.push({
        id: `ci-${b.id}`, type: 'checkin',
        icon: '🛬', color: '#4ade80',
        title: `צ'ק-אין היום`,
        msg: `${b.customerName} · חדר ${b.roomNumber}`,
      }));

      // צ'ק-אאוט היום
      checkOuts.data.forEach(b => notes.push({
        id: `co-${b.id}`, type: 'checkout',
        icon: '🛫', color: '#f87171',
        title: `צ'ק-אאוט היום`,
        msg: `${b.customerName} · חדר ${b.roomNumber}`,
      }));

      // הזמנות שבוטלו לאחרונה (7 ימים)
      const recent = new Date(); recent.setDate(recent.getDate() - 7);
      bookings.data.filter(b => b.cancelled).slice(0, 3).forEach(b => notes.push({
        id: `cancel-${b.id}`, type: 'cancel',
        icon: '❌', color: '#f87171',
        title: 'הזמנה בוטלה',
        msg: `${b.customerName} · חדר ${b.roomNumber}`,
      }));

      // צ'ק-אין מחר
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      bookings.data.filter(b => !b.cancelled && b.checkIn === tomorrowStr).forEach(b => notes.push({
        id: `tmr-${b.id}`, type: 'tomorrow',
        icon: '📅', color: '#fbbf24',
        title: `צ'ק-אין מחר`,
        msg: `${b.customerName} · חדר ${b.roomNumber}`,
      }));

      if (notes.length === 0) notes.push({
        id: 'none', type: 'info', icon: '✅', color: '#4ade80',
        title: 'הכל תקין', msg: 'אין התראות חדשות',
      });

      setItems(notes);
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{
      position: 'fixed', top: 72, left: 32, zIndex: 9000,
      width: 340, background: 'linear-gradient(135deg, #1a1025, #0f0f1a)',
      border: '1px solid rgba(139,92,246,0.25)', borderRadius: 16,
      boxShadow: '0 24px 60px rgba(0,0,0,0.6)', overflow: 'hidden',
      animation: 'popIn 0.2s ease',
    }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#e2e8f0' }}>🔔 התראות</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
      </div>
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>טוען...</div>
        ) : items.map(item => (
          <div key={item.id} style={{
            display: 'flex', gap: 12, padding: '12px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}18`, border: `1px solid ${item.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: item.color }}>{item.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{item.msg}</div>
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes popIn { from { opacity:0; transform:scale(0.95) translateY(-8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}
