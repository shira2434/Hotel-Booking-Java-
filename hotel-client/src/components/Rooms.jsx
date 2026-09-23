import React, { useEffect, useState } from 'react';
import { getAllRooms, addRoom, updateRoom, deleteRoom, getAvailableRooms, getRoomStats } from '../api';
import { useToastContext } from '../App';
import ConfirmDialog from './ConfirmDialog';

const typeClass = { SINGLE: 'badge-single', DOUBLE: 'badge-double', SUITE: 'badge-suite' };
const typeLabel = { SINGLE: 'יחיד', DOUBLE: 'זוגי', SUITE: 'סוויטה' };

export default function Rooms() {
  const toast = useToastContext();
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ id: 0, roomNumber: '', type: 'SINGLE', pricePerNight: 0, available: true, floor: 1, maxGuests: 2, description: '', amenities: '' });
  const [editing, setEditing] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [confirmId, setConfirmId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [statsRoom, setStatsRoom] = useState(null);
  const [statsData, setStatsData] = useState(null);

  const load = () => { setSearching(false); getAllRooms().then(r => setRooms(r.data)); };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await updateRoom(form);
      else await addRoom(form);
      setForm({ id: 0, roomNumber: '', type: 'SINGLE', pricePerNight: 0, available: true, floor: 1, maxGuests: 2, description: '', amenities: '' });
      setEditing(false);
      load();
      toast.success(editing ? 'החדר עודכן בהצלחה' : 'החדר נוסף בהצלחה', 'חדרים');
    } catch (err) { toast.error(err.response?.data || 'שגיאה', 'שגיאה'); }
  };

  const handleEdit = (r) => {
    setForm({ ...r, floor: r.floor || 1, maxGuests: r.maxGuests || 2, description: r.description || '', amenities: r.amenities || '' });
    setEditing(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => { await deleteRoom(id); load(); toast.warning('החדר נמחק', 'מחיקה'); };

  const searchAvailable = async () => {
    if (!checkIn || !checkOut) return toast.warning('יש למלא תאריכים');
    const res = await getAvailableRooms(checkIn, checkOut);
    setRooms(res.data); setSearchCount(res.data.length); setSearching(true);
    toast.info(`נמצאו ${res.data.length} חדרים פנויים`, 'תוצאות חיפוש');
  };

  const handleShowStats = async (room) => {
    if (statsRoom?.id === room.id) { setStatsRoom(null); setStatsData(null); return; }
    try {
      const res = await getRoomStats(room.id);
      setStatsRoom(room); setStatsData(res.data);
    } catch { toast.error('שגיאה בטעינת סטטיסטיקות'); }
  };

  const filtered = rooms
    .filter(r => typeFilter === 'ALL' || r.type === typeFilter)
    .filter(r => statusFilter === 'ALL' || (statusFilter === 'available' ? r.available : !r.available));

  const amenityList = form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : [];
  const commonAmenities = ['WiFi', 'TV', 'מרפסת', 'ג\'קוזי', 'מיני-בר', 'כספת', 'מזגן', 'נוף לים'];

  return (
    <div>
      <ConfirmDialog
        isOpen={confirmId !== null}
        title="מחיקת חדר"
        message="האם אתה בטוח שברצונך למחוק את החדר? פעולה זו אינה ניתנת לביטול."
        onConfirm={() => { handleDelete(confirmId); setConfirmId(null); }}
        onCancel={() => setConfirmId(null)}
      />

      {/* Availability search */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div>
            <div className="card-title">🔍 בדיקת זמינות חדרים</div>
            <div className="card-subtitle">חפש חדרים פנויים לפי תאריכי שהייה</div>
          </div>
          {searching && <button className="btn btn-secondary btn-sm" onClick={load}>הצג הכל</button>}
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
              <label className="form-label">תאריך כניסה</label>
              <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
              <label className="form-label">תאריך יציאה</label>
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={searchAvailable}>חפש</button>
          </div>
          {searching && <div className="alert alert-success" style={{ marginTop: 12, marginBottom: 0 }}>✅ נמצאו {searchCount} חדרים פנויים</div>}
        </div>
      </div>

      {/* Form */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div className="card-title">{editing ? '✏️ עריכת חדר' : '➕ הוספת חדר חדש'}</div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 12, alignItems: 'flex-end', marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label">מספר חדר</label>
                <input placeholder="101" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">סוג חדר</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="SINGLE">יחיד</option>
                  <option value="DOUBLE">זוגי</option>
                  <option value="SUITE">סוויטה</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">מחיר ללילה (₪)</label>
                <input type="number" placeholder="0" value={form.pricePerNight || ''} onChange={e => setForm({ ...form, pricePerNight: +e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">קומה</label>
                <input type="number" min={0} max={50} value={form.floor || ''} onChange={e => setForm({ ...form, floor: +e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary">{editing ? 'עדכן' : 'הוסף'}</button>
                {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setForm({ id: 0, roomNumber: '', type: 'SINGLE', pricePerNight: 0, available: true, floor: 1, maxGuests: 2, description: '', amenities: '' }); }}>ביטול</button>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
              <div className="form-group">
                <label className="form-label">קיבולת אורחים</label>
                <input type="number" min={1} max={10} value={form.maxGuests || ''} onChange={e => setForm({ ...form, maxGuests: +e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">תיאור</label>
                <input placeholder="תיאור קצר של החדר..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">מתקנים (מופרדים בפסיק)</label>
                <input placeholder="WiFi, TV, מרפסת..." value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">סטטוס</label>
                <label className="checkbox-label" style={{ paddingTop: 6 }}>
                  <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} />
                  פנוי
                </label>
              </div>
            </div>
            {/* Amenity quick-add */}
            <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {commonAmenities.map(a => (
                <button key={a} type="button"
                  className={`btn btn-sm ${amenityList.includes(a) ? 'btn-info' : 'btn-secondary'}`}
                  style={{ fontSize: '0.72rem', padding: '3px 10px' }}
                  onClick={() => {
                    const list = amenityList.includes(a) ? amenityList.filter(x => x !== a) : [...amenityList, a];
                    setForm({ ...form, amenities: list.join(', ') });
                  }}
                >{a}</button>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">רשימת חדרים</div>
            <div className="card-subtitle">{filtered.length} מתוך {rooms.length} חדרים</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 'auto', padding: '5px 10px', fontSize: '0.8rem' }}>
              <option value="ALL">כל הסוגים</option>
              <option value="SINGLE">יחיד</option>
              <option value="DOUBLE">זוגי</option>
              <option value="SUITE">סוויטה</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto', padding: '5px 10px', fontSize: '0.8rem' }}>
              <option value="ALL">כל הסטטוסים</option>
              <option value="available">פנויים</option>
              <option value="occupied">תפוסים</option>
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>חדר</th><th>סוג</th><th>קומה</th><th>קיבולת</th><th>מחיר ללילה</th><th>מתקנים</th><th>סטטוס</th><th>פעולות</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="icon">🛏️</div><p>אין חדרים</p></div></td></tr>
              ) : filtered.map(r => (
                <React.Fragment key={r.id}>
                  <tr>
                    <td>
                      <div style={{ fontWeight: 700 }}>{r.roomNumber}</div>
                      {r.description && <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{r.description}</div>}
                    </td>
                    <td><span className={`badge ${typeClass[r.type]}`}>{typeLabel[r.type]}</span></td>
                    <td style={{ color: '#94a3b8' }}>{r.floor ? `קומה ${r.floor}` : '—'}</td>
                    <td style={{ color: '#94a3b8' }}>{r.maxGuests ? `${r.maxGuests} אורחים` : '—'}</td>
                    <td style={{ fontWeight: 600 }}>₪{r.pricePerNight.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {r.amenities ? r.amenities.split(',').slice(0, 3).map(a => (
                          <span key={a} style={{ fontSize: '0.65rem', background: 'rgba(139,92,246,0.1)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 4, padding: '1px 6px' }}>{a.trim()}</span>
                        )) : '—'}
                        {r.amenities && r.amenities.split(',').length > 3 && (
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>+{r.amenities.split(',').length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td><span className={`badge ${r.available ? 'badge-available' : 'badge-occupied'}`}>{r.available ? '● פנוי' : '● תפוס'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleShowStats(r)} title="סטטיסטיקות">📊</button>
                        <button className="btn btn-info btn-sm" onClick={() => handleEdit(r)}>עריכה</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(r.id)}>מחיקה</button>
                      </div>
                    </td>
                  </tr>
                  {statsRoom?.id === r.id && statsData && (
                    <tr>
                      <td colSpan={8} style={{ background: 'rgba(139,92,246,0.04)', padding: '12px 24px' }}>
                        <div style={{ display: 'flex', gap: 24, fontSize: '0.82rem' }}>
                          {[
                            { label: 'סה"כ הזמנות', val: statsData.totalBookings },
                            { label: 'הזמנות פעילות', val: statsData.activeBookings },
                            { label: 'סה"כ הכנסות', val: `₪${Number(statsData.totalRevenue).toLocaleString('he-IL', { maximumFractionDigits: 0 })}` },
                            { label: 'ממוצע לילות', val: statsData.averageNights },
                          ].map(item => (
                            <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div style={{ fontWeight: 700, color: '#c4b5fd', fontSize: '1rem' }}>{item.val}</div>
                              <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: 2 }}>{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
