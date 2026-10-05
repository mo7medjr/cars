import { useState } from 'react';
import { FiSearch, FiClock, FiMapPin } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/client';

const STATUS_MAP = {
  pending: { label: 'بانتظار الموافقة', color: '#f59e0b', icon: '⏳' },
  approved: { label: 'تمت الموافقة', color: '#3b82f6', icon: '✅' },
  active: { label: 'نشط - السيارة مؤجرة', color: '#10b981', icon: '🚗' },
  completed: { label: 'مكتمل', color: '#6b7280', icon: '✔️' },
  cancelled: { label: 'ملغي', color: '#ef4444', icon: '❌' },
  overdue: { label: 'متأخر', color: '#ef4444', icon: '⚠️' },
};

const RENTAL_TYPE_MAP = {
  daily: 'يومي',
  weekly: 'أسبوعي',
  monthly: 'شهري',
};

export default function TrackBooking() {
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const VALID_PREFIXES = ['010', '011', '012', '015'];

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 11) setPhone(val);
  };

  const validatePhone = () => {
    if (!phone || phone.length !== 11) {
      toast.error('رقم الهاتف يجب أن يكون 11 رقم');
      return false;
    }
    if (!VALID_PREFIXES.some(p => phone.startsWith(p))) {
      toast.error('رقم الهاتف يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015');
      return false;
    }
    return true;
  };

  const handleSearch = async () => {
    if (!validatePhone()) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/reservations/track/${phone}`);
      setResult(data);
      if (!data.reservations?.length) toast('لا توجد حجوزات مرتبطة بهذا الرقم');
    } catch {
      toast.error('لا توجد حجوزات مرتبطة بهذا الرقم');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getRemainingDays = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const phoneError = phone.length >= 3 && !VALID_PREFIXES.some(p => phone.startsWith(p));

  return (
    <div className="track-page">
      <div className="container">
        <div className="track-card">
          <div className="track-header">
            <span className="track-icon">📍</span>
            <h1>تتبع حجزك</h1>
            <p>أدخل رقم هاتفك لمعرفة حالة حجوزاتك</p>
          </div>

          <div className="track-search">
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="tel"
                className="form-input"
                placeholder="أدخل رقم الهاتف (11 رقم)..."
                value={phone}
                onChange={handlePhoneChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                maxLength={11}
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
              {phoneError && (
                <span style={{ color: 'var(--danger)', fontSize: '11px', position: 'absolute', bottom: '-18px', right: '0' }}>⚠️ يجب أن يبدأ بـ 010, 011, 012, أو 015</span>
              )}
            </div>
            <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
              {loading ? '⏳' : <FiSearch size={18} />}
              بحث
            </button>
          </div>

          {result && (
            <div className="track-results animate-fade-in">
              {result.customer_name && <h3>مرحباً {result.customer_name} 👋</h3>}

              {result.reservations?.map((res, i) => {
                const status = STATUS_MAP[res.status] || STATUS_MAP.pending;
                const remaining = getRemainingDays(res.end_date);
                return (
                  <div className="track-result-card" key={i}>
                    {/* Status Bar */}
                    <div className="result-top">
                      <span className="result-ref">#{String(res.id).substring(0, 8)}</span>
                      <span className="result-status" style={{ color: status.color, background: `${status.color}15` }}>
                        {status.icon} {status.label}
                      </span>
                    </div>

                    {/* Car Info */}
                    <div className="track-car-info">
                      <div className="track-car-icon"><FaCar size={24} /></div>
                      <div>
                        <strong className="track-car-name">{res.car_name}</strong>
                        <div className="track-car-details">
                          <span>🎨 {res.car_color}</span>
                          <span>📋 {res.car_plate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rental Details Grid */}
                    <div className="track-details-grid">
                      <div className="track-detail-item">
                        <span className="track-detail-label">📅 نوع الإيجار</span>
                        <strong>{RENTAL_TYPE_MAP[res.rental_type] || 'يومي'}</strong>
                      </div>
                      <div className="track-detail-item">
                        <span className="track-detail-label">⏱️ المدة</span>
                        <strong>{res.rental_duration || 1} {res.rental_type === 'weekly' ? 'أسبوع' : res.rental_type === 'monthly' ? 'شهر' : 'يوم'}</strong>
                      </div>
                      <div className="track-detail-item">
                        <span className="track-detail-label">📅 من</span>
                        <strong>{res.start_date ? new Date(res.start_date).toLocaleDateString('ar-EG') : '—'}</strong>
                      </div>
                      <div className="track-detail-item">
                        <span className="track-detail-label">📅 إلى</span>
                        <strong>{res.end_date ? new Date(res.end_date).toLocaleDateString('ar-EG') : '—'}</strong>
                      </div>
                      <div className="track-detail-item">
                        <span className="track-detail-label">💰 الإجمالي</span>
                        <strong style={{ color: 'var(--accent)' }}>{Number(res.total_price).toLocaleString()} ج.م</strong>
                      </div>
                      <div className="track-detail-item">
                        <span className="track-detail-label">📏 الأيام</span>
                        <strong>{res.rental_days} يوم</strong>
                      </div>
                    </div>

                    {/* Remaining Days Banner */}
                    {(res.status === 'active' || res.status === 'approved') && remaining !== null && (
                      <div className={`track-remaining ${remaining < 0 ? 'overdue' : remaining <= 2 ? 'warning' : 'ok'}`}>
                        <FiClock size={16} />
                        {remaining < 0
                          ? `⚠️ متأخر ${Math.abs(remaining)} يوم`
                          : remaining === 0
                            ? '🔔 اليوم آخر يوم!'
                            : `⏰ متبقي ${remaining} يوم`
                        }
                      </div>
                    )}

                    {/* Timeline */}
                    {res.timeline && res.timeline.length > 0 && (
                      <div className="track-timeline">
                        <div className="timeline-title">📍 مسار الحجز</div>
                        <div className="timeline-steps">
                          {res.timeline.map((step, si) => (
                            <div key={si} className={`timeline-step ${step.done ? 'done' : 'pending'}`}>
                              <div className="timeline-dot-wrapper">
                                <div className="timeline-dot">{step.done ? step.icon : '⏳'}</div>
                                {si < res.timeline.length - 1 && <div className="timeline-line" />}
                              </div>
                              <div className="timeline-content">
                                <strong>{step.label}</strong>
                                {step.time && step.done && (
                                  <span className="timeline-time">
                                    {new Date(step.time).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                                    {' '}
                                    {step.time.includes('T') ? new Date(step.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {res.notes && (
                      <div className="track-notes">
                        <span className="track-notes-label">📝 ملاحظاتك:</span>
                        <p>{res.notes}</p>
                      </div>
                    )}

                    <div className="track-created">
                      تم الحجز: {res.created_at ? new Date(res.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .track-page { padding: var(--space-3xl) 0; }
        .track-card {
          max-width: 650px;
          margin: 0 auto;
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-light);
        }
        .track-header { text-align: center; margin-bottom: var(--space-xl); }
        .track-icon { font-size: 48px; display: block; margin-bottom: var(--space-md); }
        .track-header h1 { font-size: var(--font-size-2xl); font-weight: 800; margin-bottom: var(--space-sm); }
        .track-header p { color: var(--text-secondary); }

        .track-search { display: flex; gap: var(--space-sm); margin-bottom: var(--space-xl); }
        .track-search .form-input { flex: 1; }

        .track-results h3 { font-size: var(--font-size-lg); font-weight: 700; margin-bottom: var(--space-lg); }

        .track-result-card {
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          margin-bottom: var(--space-lg);
          border: 1px solid var(--border-light);
          transition: all 0.2s;
        }
        .track-result-card:hover { box-shadow: var(--shadow-md); }

        .result-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); }
        .result-ref { font-size: var(--font-size-xs); color: var(--text-muted); font-family: monospace; background: var(--bg-secondary); padding: 2px 8px; border-radius: 4px; }
        .result-status { padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: 700; }

        .track-car-info { display: flex; align-items: center; gap: 14px; padding: 14px; background: var(--bg-secondary); border-radius: var(--radius-md); margin-bottom: var(--space-md); }
        .track-car-icon { width: 48px; height: 48px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .track-car-name { font-size: var(--font-size-md); display: block; margin-bottom: 4px; }
        .track-car-details { display: flex; gap: 12px; font-size: var(--font-size-xs); color: var(--text-secondary); }

        .track-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: var(--space-md); }
        .track-detail-item { padding: 10px 12px; background: var(--bg-secondary); border-radius: var(--radius-sm); }
        .track-detail-label { display: block; font-size: 11px; color: var(--text-muted); margin-bottom: 2px; }
        .track-detail-item strong { font-size: var(--font-size-sm); }

        .track-remaining { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: var(--radius-md); font-size: var(--font-size-sm); font-weight: 700; margin-bottom: var(--space-md); }
        .track-remaining.ok { background: rgba(16,185,129,0.1); color: #10b981; }
        .track-remaining.warning { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .track-remaining.overdue { background: rgba(239,68,68,0.1); color: #ef4444; }

        .track-notes { padding: 12px; background: rgba(59,130,246,0.06); border-radius: var(--radius-md); border-right: 3px solid var(--info); margin-bottom: var(--space-md); }
        .track-notes-label { font-size: 12px; font-weight: 700; color: var(--info); display: block; margin-bottom: 4px; }
        .track-notes p { font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0; }

        .track-created { font-size: 11px; color: var(--text-muted); text-align: left; }

        .track-timeline { background: var(--bg-secondary); border-radius: var(--radius-md); padding: 16px; margin-bottom: var(--space-md); }
        .timeline-title { font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 14px; }
        .timeline-steps { display: flex; flex-direction: column; gap: 0; }
        .timeline-step { display: flex; gap: 12px; align-items: flex-start; }
        .timeline-dot-wrapper { display: flex; flex-direction: column; align-items: center; }
        .timeline-dot { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; background: var(--bg-primary); border: 2px solid var(--border-light); }
        .timeline-step.done .timeline-dot { background: rgba(16,185,129,0.15); border-color: #10b981; }
        .timeline-step.pending .timeline-dot { opacity: 0.4; }
        .timeline-line { width: 2px; height: 20px; background: var(--border-light); }
        .timeline-step.done .timeline-line { background: #10b981; }
        .timeline-content { padding-bottom: 16px; }
        .timeline-content strong { display: block; font-size: 13px; color: var(--text-primary); }
        .timeline-step.pending .timeline-content strong { color: var(--text-muted); }
        .timeline-time { font-size: 11px; color: var(--text-muted); margin-top: 2px; display: block; }

        @media (max-width: 480px) { .track-details-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
