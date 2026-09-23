import React, { useState, useEffect } from 'react';
import { getMonthlyReport, getOccupancyByMonth, getDailyRevenue, getTopCustomers, getAllBookings, getAllCustomers } from '../api';
import { exportToCSV } from '../utils/exportCSV';

function BarChart({ data, valueKey, labelKey, color = '#7c3aed', color2, height = 160, formatVal }) {
  if (!data || data.length === 0) return <div className="empty-state"><p>אין נתונים</p></div>;
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  const w = 100 / data.length;
  return (
    <div style={{ position: 'relative', height }}>
      <svg width="100%" height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`barGrad-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color2 || color} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const barH = Math.max((d[valueKey] / max) * (height - 30), d[valueKey] > 0 ? 3 : 0);
          const x = i * w + w * 0.1;
          const barW = w * 0.8;
          return (
            <g key={i}>
              <rect x={`${x}%`} y={height - 22 - barH} width={`${barW}%`} height={barH} rx={4}
                fill={`url(#barGrad-${valueKey})`} />
              <text x={`${x + barW / 2}%`} y={height - 6} textAnchor="middle" fontSize={9} fill="rgba(148,163,184,0.6)">
                {d[labelKey]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const months = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const vipColors = { GOLD: '#f59e0b', SILVER: '#94a3b8', BRONZE: '#cd7f32', NONE: '#475569' };
const vipLabels = { GOLD: '👑 זהב', SILVER: '🥈 כסף', BRONZE: '🥉 ארד', NONE: 'רגיל' };

export default function Reports() {
  const year = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [occupancy, setOccupancy] = useState([]);
  const [occupancyPrev, setOccupancyPrev] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [dailyDays, setDailyDays] = useState(14);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    getOccupancyByMonth(year).then(r => setOccupancy(r.data)).catch(() => {});
    getOccupancyByMonth(year - 1).then(r => setOccupancyPrev(r.data)).catch(() => {});
    getTopCustomers(10).then(r => setTopCustomers(r.data.topCustomers || [])).catch(() => {});
  }, [year]);

  useEffect(() => {
    getDailyRevenue(dailyDays).then(r => setDailyRevenue(r.data)).catch(() => {});
  }, [dailyDays]);

  const loadMonthly = async () => {
    setLoadingMonthly(true);
    try { const res = await getMonthlyReport(year, selectedMonth); setMonthlyReport(res.data); }
    catch { setMonthlyReport(null); }
    finally { setLoadingMonthly(false); }
  };

  const handleExportBookings = async () => {
    const res = await getAllBookings();
    exportToCSV(res.data.map(b => ({
      'מזהה': b.id, 'לקוח': b.customerName, 'חדר': b.roomNumber, 'סוג': b.roomType,
      'כניסה': b.checkIn, 'יציאה': b.checkOut, 'לילות': b.nights,
      'אורחים': b.guestsCount, 'מחיר': b.totalPrice, 'סטטוס': b.cancelled ? 'בוטל' : 'פעיל',
    })), `הזמנות-${year}`);
  };

  const handleExportCustomers = async () => {
    const res = await getAllCustomers();
    exportToCSV(res.data.map(c => ({
      'מזהה': c.id, 'שם': c.fullName, 'אימייל': c.email, 'טלפון': c.phone,
    })), `לקוחות-${year}`);
  };

  const handleExportRevenue = () => {
    exportToCSV(occupancy.map(m => ({
      'חודש': m.monthFull || m.month, 'תפוסה %': m.occupancyRate,
      'הכנסות': m.revenue, 'הזמנות': m.bookings,
    })), `הכנסות-${year}`);
  };

  const totalYearRevenue = occupancy.reduce((s, m) => s + (m.revenue || 0), 0);
  const totalPrevRevenue = occupancyPrev.reduce((s, m) => s + (m.revenue || 0), 0);
  const revenueGrowth = totalPrevRevenue > 0 ? ((totalYearRevenue - totalPrevRevenue) / totalPrevRevenue * 100).toFixed(1) : null;
  const avgOccupancy = occupancy.length > 0 ? (occupancy.reduce((s, m) => s + m.occupancyRate, 0) / occupancy.length).toFixed(1) : 0;
  const bestMonth = occupancy.reduce((best, m) => m.revenue > (best?.revenue || 0) ? m : best, null);

  return (
    <div>
      {/* Export buttons */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div className="card-title">📤 יצוא נתונים</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-success btn-sm" onClick={handleExportBookings}>⬇️ יצוא הזמנות CSV</button>
            <button className="btn btn-info btn-sm" onClick={handleExportCustomers}>⬇️ יצוא לקוחות CSV</button>
            <button className="btn btn-warning btn-sm" onClick={handleExportRevenue}>⬇️ יצוא הכנסות CSV</button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card green">
          <div className="stat-top">
            <div className="stat-icon-wrap green">💰</div>
            {revenueGrowth !== null && (
              <span className={`stat-trend ${+revenueGrowth >= 0 ? 'up' : 'neutral'}`}>
                {+revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth)}%
              </span>
            )}
          </div>
          <div className="stat-value">₪{Number(totalYearRevenue).toLocaleString('he-IL', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">הכנסות {year}</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-top"><div className="stat-icon-wrap amber">📊</div><span className="stat-trend neutral">ממוצע</span></div>
          <div className="stat-value">{avgOccupancy}%</div>
          <div className="stat-label">תפוסה ממוצעת</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-top"><div className="stat-icon-wrap blue">🏆</div><span className="stat-trend neutral">שיא</span></div>
          <div className="stat-value">{bestMonth?.month || '—'}</div>
          <div className="stat-label">חודש הכנסות שיא</div>
        </div>
        <div className="stat-card red">
          <div className="stat-top"><div className="stat-icon-wrap red">👥</div><span className="stat-trend neutral">VIP</span></div>
          <div className="stat-value">{topCustomers.filter(c => c.vipTier !== 'NONE').length}</div>
          <div className="stat-label">לקוחות VIP</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📊 תפוסה חודשית</div>
              <div className="card-subtitle">אחוז תפוסה לפי חודש</div>
            </div>
            <button className={`btn btn-sm ${compareMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCompareMode(v => !v)}>
              השוואה {year - 1}
            </button>
          </div>
          <div className="card-body">
            <BarChart data={occupancy} valueKey="occupancyRate" labelKey="month" color="#7c3aed" color2="#a855f7" height={160} formatVal={v => `${v}%`} />
            {compareMode && occupancyPrev.length > 0 && (
              <>
                <div style={{ fontSize: '0.72rem', color: '#64748b', margin: '8px 0 4px', textAlign: 'center' }}>{year - 1}</div>
                <BarChart data={occupancyPrev} valueKey="occupancyRate" labelKey="month" color="#475569" height={80} formatVal={v => `${v}%`} />
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">💰 הכנסות חודשיות</div>
              <div className="card-subtitle">הכנסות לפי חודש</div>
            </div>
          </div>
          <div className="card-body">
            <BarChart data={occupancy} valueKey="revenue" labelKey="month" color="#22c55e" color2="#10b981" height={160} />
            {compareMode && occupancyPrev.length > 0 && (
              <>
                <div style={{ fontSize: '0.72rem', color: '#64748b', margin: '8px 0 4px', textAlign: 'center' }}>{year - 1}</div>
                <BarChart data={occupancyPrev} valueKey="revenue" labelKey="month" color="#475569" height={80} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Daily revenue */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div>
            <div className="card-title">💹 הכנסה יומית</div>
            <div className="card-subtitle">הכנסה יומית מהזמנות פעילות</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[7, 14, 30].map(d => (
              <button key={d} className={`btn btn-sm ${dailyDays === d ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setDailyDays(d)}>
                {d} ימים
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <BarChart data={dailyRevenue} valueKey="revenue" labelKey="day" color="#a855f7" color2="#ec4899" height={140} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {dailyRevenue.length > 0 && <>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{dailyRevenue[0]?.date}</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{dailyRevenue[dailyRevenue.length - 1]?.date}</span>
            </>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Monthly report */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📋 דוח חודשי מפורט</div>
              <div className="card-subtitle">נתונים מפורטים לחודש נבחר</div>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">חודש</label>
                <select value={selectedMonth} onChange={e => setSelectedMonth(+e.target.value)}>
                  {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={loadMonthly} disabled={loadingMonthly}>
                {loadingMonthly ? '⏳' : 'הצג דוח'}
              </button>
            </div>
            {monthlyReport ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'חודש', val: monthlyReport.month },
                  { label: 'סה"כ הזמנות', val: monthlyReport.totalBookings },
                  { label: 'הזמנות פעילות', val: monthlyReport.activeBookings },
                  { label: 'ביטולים', val: monthlyReport.cancelledBookings },
                  { label: 'הכנסות', val: `₪${Number(monthlyReport.revenue).toLocaleString('he-IL', { maximumFractionDigits: 0 })}` },
                  { label: 'ממוצע לילות', val: monthlyReport.averageNights },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{item.label}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0' }}>{item.val}</span>
                  </div>
                ))}
                {monthlyReport.bookingsByRoomType && Object.entries(monthlyReport.bookingsByRoomType).map(([type, count]) => (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{type === 'SINGLE' ? 'יחיד' : type === 'DOUBLE' ? 'זוגי' : 'סוויטה'}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c4b5fd' }}>{count} הזמנות</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><div className="icon">📋</div><p>בחר חודש והצג דוח</p></div>
            )}
          </div>
        </div>

        {/* Top customers */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">🏆 לקוחות מובילים</div>
              <div className="card-subtitle">Top 10 לפי סך הכנסות</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {topCustomers.length === 0 ? (
              <div className="empty-state"><div className="icon">🏆</div><p>אין נתונים עדיין</p></div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(139,92,246,0.05)' }}>
                    {['#', 'לקוח', 'הזמנות', 'VIP', 'סך הוצאות'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'right', fontSize: '0.68rem', color: 'rgba(139,92,246,0.7)', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c, i) => (
                    <tr key={c.customerId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 16px' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</td>
                      <td style={{ padding: '10px 4px' }}>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{c.email}</div>
                      </td>
                      <td style={{ padding: '10px 16px', color: '#94a3b8' }}>{c.totalBookings}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: vipColors[c.vipTier] }}>{vipLabels[c.vipTier]}</span>
                      </td>
                      <td style={{ padding: '10px 16px', fontWeight: 700, color: '#4ade80' }}>
                        ₪{Number(c.totalSpent).toLocaleString('he-IL', { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
