import { useState, useEffect } from 'react';
import { FiChevronRight, FiChevronLeft, FiX } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import api from '../../api/client';

const STATUS_MAP = {
  pending: { label: 'معلق', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  approved: { label: 'موافق', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  active: { label: 'نشط', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  completed: { label: 'مكتمل', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  cancelled: { label: 'ملغي', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  overdue: { label: 'متأخر', color: '#dc2626', bg: 'rgba(220,38,38,0.2)' },
};

const DAYS_AR = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

export default function CalendarView() {
  const [reservations, setReservations] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRes, setSelectedRes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    try {
      const { data } = await api.get('/api/reservations', { params: { page_size: 500 } });
      setReservations(data.items || []);
    } catch { setReservations([]); }
    finally { setLoading(false); }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  // Saturday = 0 in our grid
  let startOffset = firstDay.getDay() + 1;
  if (startOffset === 7) startOffset = 0;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const getResForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reservations.filter(r => {
      if (!r.start_date || !r.end_date) return false;
      if (r.status === 'cancelled' || r.status === 'completed') return false;
      return r.start_date <= dateStr && r.end_date >= dateStr;
    });
  };

  const today = new Date();
  const isToday = (day) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const formatPhone = (p) => p?.startsWith('0') ? `2${p}` : p;

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="page-header"><h1>📅 تقويم الحجوزات</h1><p>عرض شهري لكل الحجوزات النشطة</p></div>

      {/* Month Navigator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: 'var(--bg-card)', padding: '16px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
        <button className="btn btn-sm btn-outline" onClick={prevMonth}><FiChevronRight size={18} /></button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{MONTHS_AR[month]} {year}</h2>
          <button onClick={goToday} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>اليوم</button>
        </div>
        <button className="btn btn-sm btn-outline" onClick={nextMonth}><FiChevronLeft size={18} /></button>
      </div>

      {/* Calendar Grid */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {DAYS_AR.map(d => (
            <div key={d} style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)' }}>{d}</div>
          ))}
        </div>
        {/* Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} style={{ minHeight: '100px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)', borderLeft: '1px solid var(--border-light)' }} />;
            const dayRes = getResForDay(day);
            return (
              <div key={day} style={{ minHeight: '100px', padding: '6px', borderBottom: '1px solid var(--border-light)', borderLeft: '1px solid var(--border-light)', background: isToday(day) ? 'rgba(230,30,90,0.04)' : 'transparent', position: 'relative' }}>
                <div style={{ fontSize: '13px', fontWeight: isToday(day) ? 800 : 600, color: isToday(day) ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isToday(day) && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}/>}
                  {day}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {dayRes.slice(0, 3).map(r => {
                    const st = STATUS_MAP[r.status] || STATUS_MAP.active;
                    return (
                      <div key={r.id} onClick={() => setSelectedRes(r)} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: st.bg, color: st.color, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', border: `1px solid ${st.color}30` }}>
                        🚗 {r.car_name?.split(' ').slice(0,2).join(' ')}
                      </div>
                    );
                  })}
                  {dayRes.length > 3 && <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center' }}>+{dayRes.length - 3} أخرى</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px', padding: '12px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
        {Object.entries(STATUS_MAP).filter(([k]) => !['cancelled','completed'].includes(k)).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: v.color }} />
            {v.label}
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedRes && (
        <div className="modal-overlay" onClick={() => setSelectedRes(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>📋 تفاصيل الحجز</h3>
              <button className="btn-icon" onClick={() => setSelectedRes(null)} style={{ background: 'var(--bg-primary)' }}><FiX size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '16px' }}>🚗 {selectedRes.car_name}</strong>
                  <span className={`badge badge-${selectedRes.status === 'active' ? 'success' : selectedRes.status === 'pending' ? 'warning' : selectedRes.status === 'overdue' ? 'danger' : 'info'}`}>{STATUS_MAP[selectedRes.status]?.label}</span>
                </div>
                {[
                  ['👤 العميل', selectedRes.customer_name],
                  ['📱 الهاتف', selectedRes.customer_phone],
                  ['🎨 اللون', `${selectedRes.car_color} — ${selectedRes.car_plate}`],
                  ['📅 من', selectedRes.start_date],
                  ['📅 إلى', selectedRes.end_date],
                  ['💰 المبلغ', `${Number(selectedRes.total_price).toLocaleString()} ج.م`],
                ].map(([l, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
                {selectedRes.customer_phone && (
                  <a href={`https://wa.me/${formatPhone(selectedRes.customer_phone)}`} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm" style={{ marginTop: '8px' }}>
                    <FaWhatsapp size={16} /> واتساب العميل
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>⏳ جاري التحميل...</div>}

      <style>{`
        @media (max-width: 768px) {
          .page-header h1 { font-size: 18px !important; }
        }
      `}</style>
    </div>
  );
}
