import React, { useEffect, useState } from 'react';
import { getAllBookings, getAllRooms } from '../api';

const DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const typeColors = { SINGLE: '#22c55e', DOUBLE: '#a855f7', SUITE: '#f59e0b' };

export default function CalendarView() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [date, setDate] = useState(new Date());
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getAllBookings().then(r => setBookings(r.data)).catch(() => {});
    getAllRooms().then(r => setRooms(r.data)).catch(() => {});
  }, []);

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const toDateStr = (val) => {
    if (!val) return '';
    if (Array.isArray(val)) {
      const [y, m, d] = val;
      return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    }
    return String(val).slice(0, 10);
  };

  const getBookingsForDay = (day) => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => {
      if (b.cancelled) return false;
      const ci = toDateStr(b.checkIn);
      const co = toDateStr(b.checkOut);
      return ci <= d && co > d;
    });
  };

  const getCheckInsForDay = (day) => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => !b.cancelled && toDateStr(b.checkIn) === d);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedBookings = selected ? getBookingsForDay(selected) : [];

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div>
            <div className="card-title">📅 לוח שנה - הזמנות</div>
            <div className="card-subtitle">תצוגת תפוסה חודשית</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setDate(new Date(year, month - 1, 1))}>‹</button>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', minWidth: 140, textAlign: 'center' }}>
              {MONTHS[month]} {year}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={() => setDate(new Date(year, month + 1, 1))}>›</button>
            <button className="btn btn-primary btn-sm" onClick={() => setDate(new Date())}>היום</button>
          </div>
        </div>
        <div className="card-body">
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            {[{ color: '#22c55e', label: 'יחיד' }, { color: '#a855f7', label: 'זוגי' }, { color: '#f59e0b', label: 'סוויטה' }, { color: '#3b82f6', label: 'צ\'ק-אין היום' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#94a3b8' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(139,92,246,0.6)', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dayBookings = getBookingsForDay(day);
              const checkIns = getCheckInsForDay(day);
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const isSelected = selected === day;

              return (
                <div key={day}
                  onClick={() => setSelected(isSelected ? null : day)}
                  style={{
                    minHeight: 64, borderRadius: 10, padding: '6px 8px', cursor: 'pointer',
                    background: isSelected ? 'rgba(139,92,246,0.2)' : isToday ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)',
                    border: isSelected ? '1.5px solid rgba(139,92,246,0.5)' : isToday ? '1.5px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)'; }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: isToday ? 800 : 500, color: isToday ? '#c4b5fd' : '#94a3b8', marginBottom: 4 }}>{day}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {checkIns.slice(0, 1).map(b => (
                      <div key={`ci-${b.id}`} style={{ fontSize: '0.6rem', background: '#3b82f620', color: '#60a5fa', borderRadius: 3, padding: '1px 4px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        🛬 {b.customerName?.split(' ')[0]}
                      </div>
                    ))}
                    {dayBookings.slice(0, 2).map(b => (
                      <div key={b.id} style={{ fontSize: '0.6rem', background: `${typeColors[b.roomType]}20`, color: typeColors[b.roomType], borderRadius: 3, padding: '1px 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.roomNumber}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div style={{ fontSize: '0.58rem', color: '#64748b' }}>+{dayBookings.length - 2} עוד</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected day details */}
      {selected && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 {selected} {MONTHS[month]} {year} — {selectedBookings.length} הזמנות פעילות</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {selectedBookings.length === 0 ? (
              <div className="empty-state"><div className="icon">🏖️</div><p>אין הזמנות ביום זה</p></div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(139,92,246,0.05)' }}>
                    {['לקוח', 'חדר', 'סוג', 'כניסה', 'יציאה', 'מחיר'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'right', fontSize: '0.68rem', color: 'rgba(139,92,246,0.7)', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedBookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600 }}>{b.customerName}</td>
                      <td style={{ padding: '10px 16px' }}>{b.roomNumber}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: typeColors[b.roomType] }}>{b.roomType}</span>
                      </td>
                      <td style={{ padding: '10px 16px', color: '#64748b', fontSize: '0.8rem' }}>{toDateStr(b.checkIn)}</td>
                      <td style={{ padding: '10px 16px', color: '#64748b', fontSize: '0.8rem' }}>{toDateStr(b.checkOut)}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 700, color: '#4ade80' }}>₪{b.totalPrice?.toLocaleString('he-IL', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
