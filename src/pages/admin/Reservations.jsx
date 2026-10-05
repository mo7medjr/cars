import { useState, useEffect, useRef, useMemo } from 'react';
import { FaWhatsapp, FaPrint, FaCalendarAlt, FaCheckCircle, FaClock, FaExclamationTriangle, FaMoneyBillWave } from 'react-icons/fa';
import { FiPhone, FiPrinter, FiFileText, FiMessageSquare, FiSearch } from 'react-icons/fi';
import api from '../../api/client';
import toast from 'react-hot-toast';
import config, { waLink, telLink } from '../../config/siteConfig';

const STATUS_MAP = { pending: { label: 'معلق', class: 'badge-warning' }, approved: { label: 'موافق', class: 'badge-info' }, active: { label: 'نشط', class: 'badge-success' }, completed: { label: 'مكتمل', class: 'badge-primary' }, cancelled: { label: 'ملغي', class: 'badge-danger' }, overdue: { label: 'متأخر', class: 'badge-danger' } };
const RENTAL_TYPE_MAP = { daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري' };

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRes, setSelectedRes] = useState(null);
  const [returnModal, setReturnModal] = useState({ show: false, resId: null, mileage: '' });

  const summary = useMemo(() => {
    const total = reservations.length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const active = reservations.filter(r => r.status === 'active').length;
    const overdue = reservations.filter(r => r.status === 'overdue').length;
    const monthlyRev = reservations.reduce((sum, r) => sum + (Number(r.total_price) || 0), 0);
    return { total, pending, active, overdue, monthlyRev };
  }, [reservations]);

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    try {
      const { data } = await api.get('/api/reservations', { params: { page_size: 100 } });
      setReservations(data.items || []);
    } catch {
      setReservations([]);
    } finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/api/reservations/${id}/approve`);
      toast.success('تمت الموافقة على الحجز');
      fetchReservations();
    } catch (err) { toast.error(err.response?.data?.detail || 'خطأ'); }
  };

  const handleCancel = async (id) => {
    try {
      await api.patch(`/api/reservations/${id}/cancel`);
      toast.success('تم إلغاء الحجز');
      fetchReservations();
    } catch (err) { toast.error(err.response?.data?.detail || 'خطأ'); }
  };

  const handleActivate = async (id) => {
    try {
      await api.patch(`/api/reservations/${id}/activate`);
      toast.success('تم تسليم السيارة للعميل 🚗');
      fetchReservations();
    } catch (err) { toast.error(err.response?.data?.detail || 'خطأ'); }
  };

  const handleReturn = (id) => {
    setReturnModal({ show: true, resId: id, mileage: '' });
  };

  const confirmReturn = async () => {
    const km = parseInt(returnModal.mileage);
    if (isNaN(km) || km < 0) { toast.error('أدخل رقم صحيح للكيلومترات'); return; }
    try {
      await api.patch(`/api/reservations/${returnModal.resId}/return?return_mileage=${km}`);
      toast.success('تم إرجاع السيارة وتحديث الكيلومترات ✅');
      setReturnModal({ show: false, resId: null, mileage: '' });
      fetchReservations();
    } catch (err) { toast.error(err.response?.data?.detail || 'خطأ'); }
  };

  const handleGenerateContract = async (resId) => {
    try {
      await api.post(`/api/contracts/${resId}/generate`);
      toast.success('تم توليد العقد');
    } catch (err) { toast.error(err.response?.data?.detail || 'خطأ في توليد العقد'); }
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    if (phone.startsWith('0')) return `+2${phone}`;
    return phone;
  };

  const handlePrintReceipt = (reservation) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const receiptHTML = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>إيصال حجز - ${reservation.id}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', sans-serif; background: #f5f5f8; padding: 20px; color: #1a1a2e; direction: rtl; }
    .receipt { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .receipt-header { background: linear-gradient(135deg, #1a1a3e, #2e2a5e); color: white; padding: 30px; text-align: center; }
    .receipt-header h1 { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
    .receipt-header p { font-size: 13px; opacity: 0.7; }
    .receipt-header .logo { font-size: 40px; margin-bottom: 12px; }
    .receipt-id { display: inline-block; background: rgba(230,30,90,0.2); color: #ff3d7f; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 10px; }
    .receipt-body { padding: 30px; }
    .receipt-section { margin-bottom: 24px; }
    .receipt-section h3 { font-size: 14px; font-weight: 800; color: #1a1a3e; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #f0f0f5; }
    .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f8f8fc; }
    .receipt-row:last-child { border: none; }
    .receipt-row .label { color: #64748b; }
    .receipt-row .value { font-weight: 700; }
    .receipt-total { background: linear-gradient(135deg, #1a1a3e, #e61e5a); color: white; margin: 0 -30px; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; }
    .receipt-total .total-label { font-size: 16px; font-weight: 700; }
    .receipt-total .total-value { font-size: 28px; font-weight: 900; }
    .receipt-total .total-currency { font-size: 14px; opacity: 0.7; }
    .receipt-footer { padding: 20px 30px; text-align: center; border-top: 2px dashed #e0e0e0; margin-top: 24px; }
    .receipt-footer p { font-size: 11px; color: #94a3b8; line-height: 1.8; }
    .receipt-stamp { display: inline-block; border: 3px solid #e61e5a; border-radius: 8px; padding: 6px 20px; color: #e61e5a; font-weight: 800; font-size: 14px; margin-bottom: 12px; transform: rotate(-3deg); }
    @media print { body { background: white; padding: 0; } .receipt { box-shadow: none; border-radius: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="receipt-header">
      <div class="logo">🚗</div>
      <h1>${config.companyName} ${config.companySlogan}</h1>
      <p>${config.companyNameEn} Car Rental</p>
      <div class="receipt-id">إيصال رقم: ${String(reservation.id).substring(0, 8).toUpperCase()}</div>
    </div>
    <div class="receipt-body">
      <div class="receipt-section">
        <h3>👤 بيانات العميل</h3>
        <div class="receipt-row"><span class="label">الاسم</span><span class="value">${reservation.customer_name}</span></div>
        <div class="receipt-row"><span class="label">رقم الهاتف</span><span class="value" style="direction:ltr">${reservation.customer_phone}</span></div>
      </div>
      <div class="receipt-section">
        <h3>🚗 بيانات السيارة</h3>
        <div class="receipt-row"><span class="label">السيارة</span><span class="value">${reservation.car_name || '—'}</span></div>
        <div class="receipt-row"><span class="label">اللون</span><span class="value">${reservation.car_color || '—'}</span></div>
        <div class="receipt-row"><span class="label">رقم اللوحة</span><span class="value">${reservation.car_plate || '—'}</span></div>
      </div>
      <div class="receipt-section">
        <h3>📅 تفاصيل الحجز</h3>
        <div class="receipt-row"><span class="label">نوع الإيجار</span><span class="value">${RENTAL_TYPE_MAP[reservation.rental_type] || 'يومي'}</span></div>
        <div class="receipt-row"><span class="label">المدة</span><span class="value">${reservation.rental_duration || 1} ${reservation.rental_type === 'weekly' ? 'أسبوع' : reservation.rental_type === 'monthly' ? 'شهر' : 'يوم'}</span></div>
        <div class="receipt-row"><span class="label">من</span><span class="value">${reservation.start_date || '—'}</span></div>
        <div class="receipt-row"><span class="label">إلى</span><span class="value">${reservation.end_date || '—'}</span></div>
        <div class="receipt-row"><span class="label">الحالة</span><span class="value">${STATUS_MAP[reservation.status]?.label || reservation.status}</span></div>
      </div>
      <div class="receipt-total">
        <span class="total-label">الإجمالي</span>
        <div><span class="total-value">${Number(reservation.total_price).toLocaleString()}</span><span class="total-currency"> ج.م</span></div>
      </div>
      <div class="receipt-footer">
        <div class="receipt-stamp">إيصال رسمي</div>
        <p>شكراً لاختيارك ${config.companyName} ${config.companySlogan}</p>
        <p>للاستفسار: ${config.whatsapp1} | ${config.email}</p>
      </div>
    </div>
  </div>
  <div class="no-print" style="text-align:center; margin-top:20px;">
    <button onclick="window.print()" style="background:#e61e5a; color:white; border:none; padding:12px 40px; border-radius:10px; font-size:16px; font-weight:700; cursor:pointer; font-family:'Cairo',sans-serif;">🖨️ طباعة الإيصال</button>
  </div>
</body>
</html>`;
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  const handlePrintTrustReceipt = (reservation) => {
    const w = window.open('', '_blank', 'width=850,height=700');
    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">
<title>وصل أمانة - ${reservation.customer_name}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Cairo',sans-serif;background:#f5f5f8;padding:20px;color:#1a1a2e;direction:rtl}
.doc{max-width:700px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)}
.doc-header{background:linear-gradient(135deg,#1a1a3e,#2e2a5e);color:white;padding:28px;text-align:center}
.doc-header h1{font-size:20px;font-weight:900}
.doc-header p{font-size:12px;opacity:0.7;margin-top:2px}
.doc-type{display:inline-block;background:rgba(230,30,90,0.2);color:#ff3d7f;padding:4px 20px;border-radius:20px;font-size:14px;font-weight:800;margin-top:10px}
.doc-body{padding:28px}
.section{margin-bottom:20px}
.section h3{font-size:14px;font-weight:800;color:#1a1a3e;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #f0f0f5}
.row{display:flex;justify-content:space-between;padding:7px 0;font-size:13px;border-bottom:1px solid #f8f8fc}
.row:last-child{border:none}
.row .lbl{color:#64748b}
.row .val{font-weight:700}
[contenteditable]{outline:none;border-bottom:1px dashed #cbd5e1;min-width:60px;display:inline-block;padding:0 4px}
[contenteditable]:focus{border-bottom-color:#e61e5a;background:rgba(230,30,90,0.03)}
.terms{background:#f8f9fb;border-radius:12px;padding:20px;margin:20px 0;font-size:13px;line-height:2}
.sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:24px}
.sig-box{text-align:center;padding:16px;border:2px dashed #e2e8f0;border-radius:12px}
.sig-box .sig-label{font-size:12px;color:#64748b;margin-bottom:30px;display:block}
.sig-box .sig-line{border-top:2px solid #1a1a2e;margin-top:40px;padding-top:6px;font-size:11px;color:#94a3b8}
.doc-footer{padding:16px 28px;text-align:center;border-top:2px dashed #e0e0e0;font-size:10px;color:#94a3b8}
.edit-hint{background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:8px;padding:8px 16px;text-align:center;font-size:11px;color:#3b82f6;margin-bottom:16px}
@media print{body{background:white;padding:0}.doc{box-shadow:none;border-radius:0}.no-print{display:none !important}.edit-hint{display:none}}
</style></head><body>
<div class="edit-hint no-print">💡 اضغط على أي نص مظلل لتعديله قبل الطباعة</div>
<div class="doc">
  <div class="doc-header">
    <div style="font-size:32px;margin-bottom:8px">🚗</div>
    <h1>${config.companyName} ${config.companySlogan}</h1>
    <p>Car Rental</p>
    <div class="doc-type">وصل أمانة</div>
  </div>
  <div class="doc-body">
    <div style="text-align:left;font-size:11px;color:#94a3b8;margin-bottom:16px">التاريخ: ${new Date().toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric' })}</div>
    
    <div class="section">
      <h3>◆ الطرف الأول (المؤجر)</h3>
      <div class="row"><span class="lbl">الاسم</span><span class="val" contenteditable="true">${config.companyName} ${config.companySlogan}</span></div>
      <div class="row"><span class="lbl">الهاتف</span><span class="val" contenteditable="true">${config.whatsapp1}</span></div>
      <div class="row"><span class="lbl">العنوان</span><span class="val" contenteditable="true">${config.address}</span></div>
    </div>

    <div class="section">
      <h3>◆ الطرف الثاني (المستأجر)</h3>
      <div class="row"><span class="lbl">الاسم</span><span class="val" contenteditable="true">${reservation.customer_name}</span></div>
      <div class="row"><span class="lbl">رقم الهاتف</span><span class="val" contenteditable="true" style="direction:ltr">${reservation.customer_phone}</span></div>
      <div class="row"><span class="lbl">الرقم القومي</span><span class="val" contenteditable="true">${reservation.customer_national_id || '_______________'}</span></div>
      <div class="row"><span class="lbl">العنوان</span><span class="val" contenteditable="true">_______________</span></div>
    </div>

    <div class="section">
      <h3>◆ بيانات السيارة</h3>
      <div class="row"><span class="lbl">السيارة</span><span class="val">${reservation.car_name || '—'}</span></div>
      <div class="row"><span class="lbl">اللون</span><span class="val">${reservation.car_color || '—'}</span></div>
      <div class="row"><span class="lbl">رقم اللوحة</span><span class="val">${reservation.car_plate || '—'}</span></div>
      <div class="row"><span class="lbl">رقم الشاسيه</span><span class="val" contenteditable="true">_______________</span></div>
    </div>

    <div class="section">
      <h3>◆ تفاصيل الإيجار</h3>
      <div class="row"><span class="lbl">نوع الإيجار</span><span class="val">${RENTAL_TYPE_MAP[reservation.rental_type] || 'يومي'} (${reservation.rental_duration || 1})</span></div>
      <div class="row"><span class="lbl">من تاريخ</span><span class="val">${reservation.start_date || '___/___/______'}</span></div>
      <div class="row"><span class="lbl">إلى تاريخ</span><span class="val">${reservation.end_date || '___/___/______'}</span></div>
      <div class="row"><span class="lbl">قيمة الإيجار</span><span class="val" contenteditable="true">${Number(reservation.total_price).toLocaleString()} ج.م</span></div>
      <div class="row"><span class="lbl">مبلغ التأمين</span><span class="val" contenteditable="true">${reservation.deposit_amount > 0 ? Number(reservation.deposit_amount).toLocaleString() + ' ج.م ✅' : '__________ ج.م'}</span></div>
    </div>

    <div class="terms" contenteditable="true">
      <strong>◆ إقرار وتعهد:</strong><br>
      أقر أنا الموقع أدناه / <strong>${reservation.customer_name}</strong> / بحمل الرقم القومي المذكور أعلاه، باستلام السيارة المذكورة بحالة سليمة وأتعهد بالآتي:<br>
      1. إرجاع السيارة في الموعد المحدد بنفس الحالة التي استلمتها بها.<br>
      2. عدم استخدام السيارة في أي أعمال مخالفة للقانون.<br>
      3. تحمل كافة المخالفات المرورية خلال فترة الإيجار.<br>
      4. في حالة عدم إرجاع السيارة في الموعد المحدد، يعتبر هذا الإيصال بمثابة وصل أمانة يحق للمؤجر المطالبة بقيمة السيارة قانونياً.<br>
      5. في حالة حدوث أي تلف أو حادث، يتحمل المستأجر كافة تكاليف الإصلاح.
    </div>

    <div class="sig-grid">
      <div class="sig-box">
        <span class="sig-label">توقيع المؤجر (الطرف الأول)</span>
        <div class="sig-line">الاسم: ${config.companyName}</div>
      </div>
      <div class="sig-box">
        <span class="sig-label">توقيع المستأجر (الطرف الثاني)</span>
        <div class="sig-line">الاسم: ${reservation.customer_name}</div>
      </div>
    </div>

    <div style="margin-top:20px;text-align:center">
      <div style="display:inline-block;border:3px solid #e61e5a;border-radius:8px;padding:6px 24px;color:#e61e5a;font-weight:800;font-size:14px;transform:rotate(-2deg)">وصل أمانة رسمي</div>
    </div>
  </div>
  <div class="doc-footer">${config.companyName} ${config.companySlogan} — ${config.whatsapp1}</div>
</div>
<div class="no-print" style="text-align:center;margin-top:20px;display:flex;gap:10px;justify-content:center">
  <button onclick="window.print()" style="background:#e61e5a;color:white;border:none;padding:12px 40px;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;font-family:'Cairo',sans-serif">🖨️ طباعة وصل الأمانة</button>
</div>
</body></html>`;
    w.document.write(html);
    w.document.close();
  };

  const tabs = [
    { key: 'all', label: 'الكل' },
    { key: 'pending', label: 'معلقة' },
    { key: 'approved', label: 'موافقة' },
    { key: 'active', label: 'نشطة' },
    { key: 'completed', label: 'مكتملة' },
    { key: 'cancelled', label: 'ملغاة' },
  ];

  const filtered = (tab === 'all' ? reservations : reservations.filter(r => r.status === tab))
    .filter(r => !search || `${r.customer_name} ${r.customer_phone} ${r.car_name} ${r.car_plate}`.toLowerCase().includes(search.toLowerCase()));

  const tabCount = (key) => key === 'all' ? reservations.length : reservations.filter(r => r.status === key).length;

  return (
    <div>
      <div className="page-header"><h1>📋 الحجوزات</h1><p>إدارة حجوزات العملاء</p></div>

      {/* Summary cards */}
      <div className="admin-summary">
        <div className="admin-summary-card">
          <div className="admin-summary-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><FaCalendarAlt /></div>
          <div className="admin-summary-info">
            <div className="admin-summary-value">{summary.total}</div>
            <div className="admin-summary-label">إجمالي الحجوزات</div>
          </div>
        </div>
        <div className="admin-summary-card">
          <div className="admin-summary-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><FaClock /></div>
          <div className="admin-summary-info">
            <div className="admin-summary-value">{summary.pending}</div>
            <div className="admin-summary-label">بانتظار الموافقة</div>
          </div>
        </div>
        <div className="admin-summary-card">
          <div className="admin-summary-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><FaCheckCircle /></div>
          <div className="admin-summary-info">
            <div className="admin-summary-value">{summary.active}</div>
            <div className="admin-summary-label">حجوزات نشطة</div>
          </div>
        </div>
        <div className="admin-summary-card">
          <div className="admin-summary-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><FaExclamationTriangle /></div>
          <div className="admin-summary-info">
            <div className="admin-summary-value">{summary.overdue}</div>
            <div className="admin-summary-label">متأخرة</div>
          </div>
        </div>
        <div className="admin-summary-card">
          <div className="admin-summary-icon" style={{ background: 'rgba(230,30,90,0.12)', color: 'var(--accent)' }}><FaMoneyBillWave /></div>
          <div className="admin-summary-info">
            <div className="admin-summary-value" style={{ fontSize: 16 }}>{Number(summary.monthlyRev).toLocaleString()} ج.م</div>
            <div className="admin-summary-label">إجمالي القيمة</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <FiSearch />
          <input type="text" placeholder="بحث بالعميل، السيارة، الهاتف، اللوحة..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-pills">
          {tabs.map(t => (
            <button key={t.key} className={`filter-pill ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
              <span className="count">{tabCount(t.key)}</span>
            </button>
          ))}
        </div>
        <div className="admin-toolbar-spacer" />
        <span className="admin-toolbar-meta">{filtered.length} نتيجة</span>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>العميل</th><th>السيارة</th><th>نوع الإيجار</th><th>التواريخ</th><th>المبلغ</th><th>الحالة</th><th>ملاحظات</th><th>إجراءات</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center" style={{ padding: '40px' }}>⏳</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>لا توجد حجوزات</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.customer_name}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', direction: 'ltr' }}>{r.customer_phone}</span>
                      <a href={`https://wa.me/${formatPhone(r.customer_phone).replace('+', '')}`} target="_blank" rel="noopener noreferrer" title="واتساب" style={{ color: '#25d366', display: 'inline-flex', alignItems: 'center' }}>
                        <FaWhatsapp size={15} />
                      </a>
                      <a href={`tel:${formatPhone(r.customer_phone)}`} title="اتصال" style={{ color: 'var(--info)', display: 'inline-flex', alignItems: 'center' }}>
                        <FiPhone size={13} />
                      </a>
                    </div>
                    {r.customer_phone2 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', direction: 'ltr' }}>📱 {r.customer_phone2}</span>
                        <a href={`https://wa.me/${formatPhone(r.customer_phone2).replace('+', '')}`} target="_blank" rel="noopener noreferrer" title="واتساب احتياطي" style={{ color: '#25d366', display: 'inline-flex', alignItems: 'center' }}>
                          <FaWhatsapp size={13} />
                        </a>
                        <a href={`tel:${formatPhone(r.customer_phone2)}`} title="اتصال احتياطي" style={{ color: 'var(--info)', display: 'inline-flex', alignItems: 'center' }}>
                          <FiPhone size={11} />
                        </a>
                      </div>
                    )}
                  </td>
                  <td>
                    {r.car_name}<br />
                    <code style={{ fontSize: '11px', background: 'var(--bg-primary)', padding: '1px 6px', borderRadius: '3px' }}>{r.car_plate}</code>
                    {r.car_color && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '4px' }}> · {r.car_color}</span>}
                  </td>
                  <td>
                    <span className="badge badge-info">{RENTAL_TYPE_MAP[r.rental_type] || 'يومي'}</span>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{r.rental_duration || 1} {r.rental_type === 'weekly' ? 'أسبوع' : r.rental_type === 'monthly' ? 'شهر' : 'يوم'} ({r.rental_days} يوم)</div>
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    <div>{r.start_date}</div>
                    <div style={{ color: 'var(--text-muted)' }}>→ {r.end_date}</div>
                  </td>
                  <td>
                    <strong>{Number(r.total_price).toLocaleString()}</strong> ج.م
                    {r.deposit_amount > 0 && (
                      <div style={{ marginTop: '3px' }}>
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', fontWeight: 700 }}>💳 عربون {Number(r.deposit_amount).toLocaleString()}</span>
                      </div>
                    )}
                  </td>
                  <td><span className={`badge ${STATUS_MAP[r.status]?.class}`}>{STATUS_MAP[r.status]?.label}</span></td>
                  <td>
                    {r.notes ? (
                      <button className="btn btn-sm btn-outline" onClick={() => setSelectedRes(r)} title={r.notes} style={{ minWidth: 'auto' }}>
                        <FiMessageSquare size={13} />
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {r.status === 'pending' && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => handleApprove(r.id)}>✅ موافقة</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleCancel(r.id)}>❌</button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => handleActivate(r.id)}>🚗 تسليم</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleCancel(r.id)}>❌</button>
                        </>
                      )}
                      {r.status === 'active' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleReturn(r.id)}>🏁 إرجاع</button>
                      )}
                      {(r.status === 'approved' || r.status === 'active') && (
                        <button className="btn btn-sm btn-outline" onClick={() => handleGenerateContract(r.id)} title="توليد عقد">
                          <FiFileText size={13} /> عقد
                        </button>
                      )}
                      <button className="btn btn-sm btn-outline" onClick={() => handlePrintReceipt(r)} title="طباعة إيصال" style={{ minWidth: 'auto' }}>
                        <FiPrinter size={13} />
                      </button>
                      <button className="btn btn-sm btn-gold" onClick={() => handlePrintTrustReceipt(r)} title="وصل أمانة" style={{ minWidth: 'auto', fontSize: '11px' }}>
                        📜 وصل
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Modal */}
      {selectedRes && (
        <div className="modal-overlay" onClick={() => setSelectedRes(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>📝 ملاحظات الحجز</h3>
              <button className="btn-icon" onClick={() => setSelectedRes(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '12px', borderRight: '4px solid var(--info)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>العميل: {selectedRes.customer_name} — {selectedRes.car_name}</div>
                <p style={{ fontSize: '14px', lineHeight: 1.8 }}>{selectedRes.notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Mileage Modal */}
      {returnModal.show && (
        <div className="modal-overlay" onClick={() => setReturnModal({ show: false, resId: null, mileage: '' })}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>🏁 إرجاع السيارة</h3>
              <button className="btn-icon" onClick={() => setReturnModal({ show: false, resId: null, mileage: '' })} style={{ background: 'var(--bg-primary)' }}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>📏</div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>أدخل عداد الكيلومترات الحالي عند إرجاع السيارة.<br/><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>سيتم تحديث كيلومترات السيارة تلقائياً</span></p>
              </div>
              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>عداد الكيلومترات</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="مثال: 85000"
                  value={returnModal.mileage}
                  onChange={e => setReturnModal({ ...returnModal, mileage: e.target.value })}
                  autoFocus
                  min="0"
                  style={{ fontSize: '18px', fontWeight: 700, textAlign: 'center', direction: 'ltr', letterSpacing: '2px' }}
                  onKeyDown={e => { if (e.key === 'Enter') confirmReturn(); }}
                />
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button className="btn btn-primary" onClick={confirmReturn} disabled={!returnModal.mileage}>
                ✅ تأكيد الإرجاع
              </button>
              <button className="btn btn-outline" onClick={() => setReturnModal({ show: false, resId: null, mileage: '' })}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
