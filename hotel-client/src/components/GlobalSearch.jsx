import React, { useState, useEffect, useRef } from 'react';
import { getAllBookings, getAllCustomers, getAllRooms } from '../api';

export default function GlobalSearch({ onNavigate, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    Promise.all([getAllBookings(), getAllCustomers(), getAllRooms()])
      .then(([b, c, r]) => { setBookings(b.data); setCustomers(c.data); setRooms(r.data); })
      .catch(() => {});
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const res = [];

    customers.filter(c => c.fullName?.toLowerCase().includes(q) || c.email?.includes(q) || c.phone?.includes(q))
      .slice(0, 3).forEach(c => res.push({ type: 'customer', icon: '👤', label: c.fullName, sub: c.email, page: 'customers' }));

    rooms.filter(r => r.roomNumber?.includes(q) || r.type?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
      .slice(0, 3).forEach(r => res.push({ type: 'room', icon: '🛏️', label: `חדר ${r.roomNumber}`, sub: `${r.type} · ₪${r.pricePerNight}/לילה`, page: 'rooms' }));

    bookings.filter(b => b.customerName?.toLowerCase().includes(q) || b.roomNumber?.includes(q) || String(b.id) === q)
      .slice(0, 3).forEach(b => res.push({ type: 'booking', icon: '📋', label: `הזמנה #${b.id} - ${b.customerName}`, sub: `חדר ${b.roomNumber} · ${b.checkIn} → ${b.checkOut}`, page: 'bookings' }));

    setResults(res);
  }, [query, bookings, customers, rooms]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9500, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80 }}
      onClick={onClose}>
      <div style={{ width: 560, background: 'linear-gradient(135deg, #1a1025, #0f0f1a)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', animation: 'popIn 0.2s ease' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '1.1rem' }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="חפש לקוח, חדר, הזמנה..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '1rem', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}
          />
          <kbd style={{ fontSize: '0.7rem', color: '#64748b', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '2px 8px' }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {results.length === 0 && query && (
            <div style={{ padding: 32, textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>לא נמצאו תוצאות עבור "{query}"</div>
          )}
          {results.length === 0 && !query && (
            <div style={{ padding: 24 }}>
              {[{ icon: '👤', text: 'חפש לפי שם לקוח' }, { icon: '🛏️', text: 'חפש לפי מספר חדר' }, { icon: '📋', text: 'חפש לפי מספר הזמנה' }].map(h => (
                <div key={h.text} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', color: '#64748b', fontSize: '0.82rem' }}>
                  <span>{h.icon}</span><span>{h.text}</span>
                </div>
              ))}
            </div>
          )}
          {results.map((r, i) => (
            <div key={i}
              style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 20px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onClick={() => { onNavigate(r.page); onClose(); }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{r.icon}</div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{r.label}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{r.sub}</div>
              </div>
              <div style={{ marginRight: 'auto', fontSize: '0.68rem', color: '#475569', background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '2px 8px' }}>
                {r.type === 'customer' ? 'לקוח' : r.type === 'room' ? 'חדר' : 'הזמנה'}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes popIn { from { opacity:0; transform:scale(0.96) translateY(-12px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}
