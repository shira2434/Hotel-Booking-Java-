import React, { useEffect, useState } from 'react';
import { getAllCustomers, addCustomer, updateCustomer, deleteCustomer, getTopCustomers } from '../api';
import { useToastContext } from '../App';
import ConfirmDialog from './ConfirmDialog';
const vipColors = { GOLD: '#f59e0b', SILVER: '#94a3b8', BRONZE: '#cd7f32', NONE: '#475569' };
const vipBg = { GOLD: 'rgba(245,158,11,0.1)', SILVER: 'rgba(148,163,184,0.1)', BRONZE: 'rgba(205,127,50,0.1)', NONE: 'rgba(71,85,105,0.1)' };
const vipLabels = { GOLD: '👑 זהב', SILVER: '🥈 כסף', BRONZE: '🥉 ארד', NONE: 'רגיל' };

export default function Customers() {
  const toast = useToastContext();
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ id: 0, fullName: '', email: '', phone: '' });
  const [editing, setEditing] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [topData, setTopData] = useState({});
  const [search, setSearch] = useState('');

  const load = () => getAllCustomers().then(r => setCustomers(r.data));

  useEffect(() => {
    load();
    getTopCustomers(100)
      .then(r => {
        const map = {};
        (r.data.topCustomers || []).forEach(c => { map[c.customerId] = c; });
        setTopData(map);
      }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await updateCustomer(form);
      else await addCustomer(form);
      setForm({ id: 0, fullName: '', email: '', phone: '' });
      setEditing(false);
      load();
      toast.success(editing ? 'פרטי הלקוח עודכנו' : 'הלקוח נוסף בהצלחה', 'לקוחות');
    } catch (err) { toast.error(err.response?.data || 'שגיאה', 'שגיאה'); }
  };

  const handleEdit = (c) => { setForm(c); setEditing(true); window.scrollTo(0, 0); };
  const handleDelete = async (id) => {
    await deleteCustomer(id);
    load();
    toast.warning('הלקוח נמחק מהמערכת', 'מחיקה');
  };

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  const filtered = customers.filter(c =>
    !search || c.fullName?.toLowerCase().includes(search.toLowerCase()) || c.email?.includes(search)
  );

  return (
    <div>
      <ConfirmDialog
        isOpen={confirmId !== null}
        title="מחיקת לקוח"
        message="האם אתה בטוח שברצונך למחוק את הלקוח? כל הנתונים יימחקו לצמיתות."
        onConfirm={() => { handleDelete(confirmId); setConfirmId(null); }}
        onCancel={() => setConfirmId(null)}
      />
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div className="card-title">{editing ? '✏️ עריכת לקוח' : '➕ הוספת לקוח חדש'}</div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) auto', gap: 12, alignItems: 'flex-end' }}>
              <div className="form-group">
                <label className="form-label">שם מלא</label>
                <input placeholder="ישראל ישראלי" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">אימייל</label>
                <input placeholder="example@email.com" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">טלפון</label>
                <input placeholder="050-0000000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary">{editing ? 'עדכן' : 'הוסף'}</button>
                {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setForm({ id: 0, fullName: '', email: '', phone: '' }); }}>ביטול</button>}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">רשימת לקוחות</div>
            <div className="card-subtitle">{filtered.length} מתוך {customers.length} לקוחות רשומים</div>
          </div>
          <input
            placeholder="🔍 חיפוש לקוח..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 220, padding: '6px 12px', fontSize: '0.8rem' }}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>לקוח</th><th>אימייל</th><th>טלפון</th><th>VIP</th><th>סך הוצאות</th><th>פעולות</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="icon">👤</div><p>אין לקוחות רשומים</p></div></td></tr>
              ) : filtered.map((c, i) => {
                const td = topData[c.id];
                const tier = td?.vipTier || 'NONE';
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ background: `linear-gradient(135deg, ${colors[i % colors.length]}22, ${colors[i % colors.length]}44)`, color: colors[i % colors.length] }}>
                          {c.fullName.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{c.fullName}</span>
                      </div>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.83rem' }}>{c.email}</td>
                    <td style={{ color: '#64748b', fontSize: '0.83rem' }}>{c.phone}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', borderRadius: 6,
                        fontSize: '0.7rem', fontWeight: 700,
                        background: vipBg[tier],
                        color: vipColors[tier],
                        border: `1px solid ${vipColors[tier]}33`,
                      }}>
                        {vipLabels[tier]}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: td ? '#4ade80' : '#475569' }}>
                      {td ? `₪${Number(td.totalSpent).toLocaleString('he-IL', { maximumFractionDigits: 0 })}` : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-info btn-sm" onClick={() => handleEdit(c)}>עריכה</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(c.id)}>מחיקה</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
