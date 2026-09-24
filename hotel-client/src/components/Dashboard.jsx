import React, { useEffect, useState } from 'react';
import { getBookingStats, getAllRooms, getRevenueByRoomType, getUpcomingCheckIns, getTopCustomers, getOccupancyByMonth, getDailyRevenue } from '../api';

const typeLabels = { SINGLE: 'יחיד', DOUBLE: 'זוגי', SUITE: 'סוויטה' };
const typeColors = { SINGLE: '#22c55e', DOUBLE: '#a855f7', SUITE: '#f59e0b' };
const typeBadge = { SINGLE: 'badge-single', DOUBLE: 'badge-double', SUITE: 'badge-suite' };
const vipColors = { GOLD: '#f59e0b', SILVER: '#94a3b8', BRONZE: '#cd7f32' };
const vipLabels = { GOLD: '👑 זהב', SILVER: '🥈 כסף', BRONZE: '🥉 ארד', NONE: '' };

const roomImages = {
  SINGLE: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
  DOUBLE: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80',
  SUITE: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
};

// ─── Mini Bar Chart (SVG) ───
function BarChart({ data, valueKey, labelKey, color = '#7c3aed', height = 120 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  const w = 100 / data.length;
  return (
    <div style={{ position: 'relative', height }}>
      <svg width="100%" height={height} style={{ overflow: 'visible' }}>
        {data.map((d, i) => {
          const barH = (d[valueKey] / max) * (height - 24);
          const x = i * w + w * 0.15;
          const barW = w * 0.7;
          return (
            <g key={i}>
              <rect
                x={`${x}%`} y={height - 20 - barH}
                width={`${barW}%`} height={barH}
                rx={3}
                fill={color}
                opacity={0.7 + (d[valueKey] / max) * 0.3}
              />
              <text
                x={`${x + barW / 2}%`} y={height - 4}
                textAnchor="middle"
                fontSize={9} fill="rgba(148,163,184,0.6)"
              >
                {d[labelKey]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Line Chart (SVG) ───
function LineChart({ data, valueKey, height = 100 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - 16 - (d[valueKey] / max) * (height - 24);
    return `${x},${y}`;
  });
  const area = `0,${height - 16} ${pts.join(' ')} 100,${height - 16}`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#lineGrad)" />
      <polyline points={pts.join(' ')} fill="none" stroke="#a855f7" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = height - 16 - (d[valueKey] / max) * (height - 24);
        return <circle key={i} cx={x} cy={y} r="1.5" fill="#c4b5fd" vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}

export default function Dashboard({ setPage }) {
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [revenueByType, setRevenueByType] = useState(null);
  const [upcomingCheckIns, setUpcomingCheckIns] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const year = new Date().getFullYear();
    Promise.all([
      getBookingStats(),
      getAllRooms(),
      getRevenueByRoomType(),
      getUpcomingCheckIns(7),
      getTopCustomers(5),
      getOccupancyByMonth(year),
      getDailyRevenue(14),
    ]).then(([s, r, rev, ci, tc, occ, dr]) => {
      setStats(s.data);
      setRooms(r.data);
      setRevenueByType(rev.data);
      setUpcomingCheckIns(ci.data);
      setTopCustomers(tc.data.topCustomers || []);
      setOccupancy(occ.data);
      setDailyRevenue(dr.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, color: 'rgba(148,163,184,0.5)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>⏳</div>
      <p style={{ fontSize: '0.9rem' }}>טוען נתונים...</p>
    </div>
  );

  if (!stats) return (
    <div className="alert alert-info">⚠️ לא ניתן להתחבר לשרת. ודאי שהשרת רץ על פורט 8080.</div>
  );

  const availableRooms = rooms.filter(r => r.available).length;
  const occupiedRooms = rooms.length - availableRooms;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
  const maxRevenue = revenueByType ? Math.max(...Object.values(revenueByType), 1) : 1;
  const avgNightsNum = Number(stats.averageNights) || 0;

  return (
    <div>
      {/* Hero */}
      <div className="hero-banner">
        <div className="hero-content">
          <div className="hero-title">ברוך הבא, Grand Hotel 🏨</div>
          <div className="hero-sub">לוח בקרה · {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-top">
            <div className="stat-icon-wrap blue">📋</div>
            <span className="stat-trend neutral">{stats.activeBookings} פעילות</span>
          </div>
          <div className="stat-value">{stats.totalBookings}</div>
          <div className="stat-label">סה"כ הזמנות</div>
        </div>
        <div className="stat-card green">
          <div className="stat-top">
            <div className="stat-icon-wrap green">💰</div>
            <span className="stat-trend up">↑ פעיל</span>
          </div>
          <div className="stat-value">₪{Number(stats.totalRevenue).toLocaleString('he-IL', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">סה"כ הכנסות</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-top">
            <div className="stat-icon-wrap amber">🛏️</div>
            <span className="stat-trend neutral">{occupiedRooms}/{rooms.length}</span>
          </div>
          <div className="stat-value">{occupancyRate}%</div>
          <div className="stat-label">אחוז תפוסה</div>
        </div>
        <div className="stat-card red">
          <div className="stat-top">
            <div className="stat-icon-wrap red">📅</div>
            <span className="stat-trend neutral">היום</span>
          </div>
          <div className="stat-value">{stats.checkInsToday ?? 0}</div>
          <div className="stat-label">צ'ק-אין היום</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📊 תפוסה חודשית {new Date().getFullYear()}</div>
              <div className="card-subtitle">אחוז תפוסה לפי חודש</div>
            </div>
          </div>
          <div className="card-body">
            <BarChart data={occupancy} valueKey="occupancyRate" labelKey="month" color="#7c3aed" height={130} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.5)' }}>0%</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.5)' }}>100%</span>
            </div>
          </div>
        </div>

        {/* Daily revenue */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">💹 הכנסה יומית (14 ימים)</div>
              <div className="card-subtitle">הכנסה יומית מהזמנות פעילות</div>
            </div>
          </div>
          <div className="card-body">
            <LineChart data={dailyRevenue} valueKey="revenue" height={130} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              {dailyRevenue.filter((_, i) => i % 7 === 0 || i === dailyRevenue.length - 1).map((d, i) => (
                <span key={i} style={{ fontSize: '0.68rem', color: 'rgba(148,163,184,0.5)' }}>{d.date?.slice(5)}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Room type cards */}
      <div className="room-type-cards">
        {Object.entries(roomImages).map(([type, img]) => (
          <div key={type} className="room-type-card" onClick={() => setPage('rooms')}>
            <img src={img} alt={typeLabels[type]} />
            <div className="overlay">
              <h3>{typeLabels[type]}</h3>
              <p>{rooms.filter(r => r.type === type).length} חדרים · {rooms.filter(r => r.type === type && r.available).length} פנויים</p>
            </div>
          </div>
        ))}
      </div>

      <div className="two-col-grid">
        {/* Revenue by type */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📊 הכנסות לפי סוג חדר</div>
              <div className="card-subtitle">פירוט הכנסות מהזמנות פעילות</div>
            </div>
          </div>
          <div className="card-body">
            {revenueByType && Object.keys(revenueByType).length > 0 ? (
              Object.entries(revenueByType).map(([type, val]) => (
                <div className="revenue-row" key={type}>
                  <div className="revenue-label">
                    <span className={`badge ${typeBadge[type]}`}>{typeLabels[type] || type}</span>
                  </div>
                  <div className="revenue-track">
                    <div className="revenue-fill" style={{ width: `${(val / maxRevenue) * 100}%`, background: typeColors[type] }} />
                  </div>
                  <div className="revenue-val">₪{Number(val).toLocaleString('he-IL', { maximumFractionDigits: 0 })}</div>
                </div>
              ))
            ) : (
              <div className="empty-state"><div className="icon">📭</div><p>אין נתונים עדיין</p></div>
            )}
          </div>
        </div>

        {/* Room status */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">🛏️ סטטוס חדרים</div>
              <div className="card-subtitle">זמינות בזמן אמת</div>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              {[
                { val: availableRooms, label: 'פנויים', color: '#4ade80', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)' },
                { val: occupiedRooms, label: 'תפוסים', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
                { val: stats.checkOutsToday ?? 0, label: "צ'ק-אאוט היום", color: '#a5b4fc', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.15)' },
                { val: stats.totalGuests ?? 0, label: 'אורחים פעילים', color: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
              ].map(item => (
                <div key={item.label} style={{ flex: 1, background: item.bg, borderRadius: 10, padding: '10px 12px', border: `1px solid ${item.border}` }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: item.color }}>{item.val}</div>
                  <div style={{ fontSize: '0.65rem', color: item.color, opacity: 0.7, fontWeight: 600, marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div className="occ-bar-wrap">
              <div className="occ-bar-track">
                <div className="occ-bar-fill" style={{ width: `${occupancyRate}%` }} />
              </div>
              <div className="occ-labels">
                <span>0%</span>
                <span>תפוסה {occupancyRate}%</span>
                <span>100%</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'ממוצע לילות', val: avgNightsNum.toFixed(1) },
                { label: 'חדר מבוקש', val: stats.mostBookedRoom || '—' },
              ].map(item => (
                <div key={item.label} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>{item.val}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(148,163,184,0.6)', marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="two-col-grid">
        {/* Upcoming check-ins */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">🗓️ צ'ק-אין קרוב (7 ימים)</div>
              <div className="card-subtitle">{upcomingCheckIns.length} הזמנות מתקרבות</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {upcomingCheckIns.length === 0 ? (
              <div className="empty-state"><div className="icon">🗓️</div><p>אין צ'ק-אין קרוב</p></div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <tbody>
                  {upcomingCheckIns.slice(0, 6).map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.72rem' }}>{b.customerName?.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{b.customerName}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>חדר {b.roomNumber} · {b.nights} לילות</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 18px', textAlign: 'left' }}>
                        <span style={{ fontSize: '0.75rem', color: '#c4b5fd', fontWeight: 600 }}>{b.checkIn}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top customers */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">🏆 לקוחות מובילים</div>
              <div className="card-subtitle">לפי סך הכנסות</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {topCustomers.length === 0 ? (
              <div className="empty-state"><div className="icon">🏆</div><p>אין נתונים עדיין</p></div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <tbody>
                  {topCustomers.map((c, i) => (
                    <tr key={c.customerId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 18px', width: 32 }}>
                        <span style={{ fontSize: '1rem' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                      </td>
                      <td style={{ padding: '10px 4px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{c.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{c.totalBookings} הזמנות</div>
                      </td>
                      <td style={{ padding: '10px 18px', textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#4ade80' }}>₪{Number(c.totalSpent).toLocaleString('he-IL', { maximumFractionDigits: 0 })}</div>
                        {c.vipTier !== 'NONE' && (
                          <div style={{ fontSize: '0.68rem', color: vipColors[c.vipTier], fontWeight: 700 }}>{vipLabels[c.vipTier]}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <div className="card-header"><div className="card-title">⚡ פעולות מהירות</div></div>
        <div className="card-body">
          <div className="quick-actions">
            <button className="btn btn-primary" onClick={() => setPage('bookings')}>➕ הזמנה חדשה</button>
            <button className="btn btn-info" onClick={() => setPage('rooms')}>🛏️ ניהול חדרים</button>
            <button className="btn btn-secondary" onClick={() => setPage('customers')}>👥 ניהול לקוחות</button>
            <button className="btn btn-warning" onClick={() => setPage('reports')}>📈 דוחות</button>
          </div>
        </div>
      </div>
    </div>
  );
}
