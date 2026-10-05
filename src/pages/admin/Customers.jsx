import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiSearch, FiX, FiPhone, FiCalendar, FiFileText, FiEdit3, FiSave, FiPrinter, FiTrash2, FiZoomIn, FiZoomOut, FiDownload, FiMaximize2, FiRotateCw, FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi';
import { FaWhatsapp, FaCrown, FaMoneyBillWave } from 'react-icons/fa';
import api from '../../api/client';
import toast from 'react-hot-toast';
import config from '../../config/siteConfig';
import ConfirmModal from '../../components/ConfirmModal';

const STATUS_MAP = {
  normal: { label: 'عادي', class: 'badge-primary', icon: '👤' },
  vip: { label: 'عميل مميز', class: 'badge-gold', icon: '⭐' },
  blacklisted: { label: 'محظور', class: 'badge-danger', icon: '🚫' },
};

const RENTAL_STATUS = {
  pending: { label: 'بانتظار الموافقة', class: 'badge-warning' },
  approved: { label: 'تم الموافقة', class: 'badge-info' },
  active: { label: 'نشط', class: 'badge-success' },
  completed: { label: 'مكتمل', class: 'badge-primary' },
  cancelled: { label: 'ملغي', class: 'badge-danger' },
  overdue: { label: 'متأخر', class: 'badge-danger' },
};

const RENTAL_TYPE_LABELS = { daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري' };

const DOC_TYPE_ICONS = { national_id: '🪪', national_id_back: '🪪', license: '📄', selfie: '🤳', deposit_receipt: '🧾' };

const formatPhone = (phone) => {
  if (!phone) return '';
  if (phone.startsWith('0')) return `+2${phone}`;
  return phone;
};

/* ─── Lightbox Component ─────────────────────────────────────── */
function DocLightbox({ src, label, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 5));
      if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.25));
      if (e.key === 'r') setRotation(r => r + 90);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }}>
      {/* Toolbar */}
      <div onClick={e => e.stopPropagation()} style={{
        position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
        zIndex: 2,
      }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{label}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { icon: <FiZoomOut size={16} />, fn: () => setZoom(z => Math.max(z - 0.25, 0.25)), tip: 'تصغير' },
            { icon: <span style={{ fontSize: 12, fontWeight: 700, color: 'white', minWidth: 40, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>, fn: () => setZoom(1), tip: 'إعادة ضبط' },
            { icon: <FiZoomIn size={16} />, fn: () => setZoom(z => Math.min(z + 0.25, 5)), tip: 'تكبير' },
            { icon: <FiRotateCw size={16} />, fn: () => setRotation(r => r + 90), tip: 'تدوير' },
            { icon: <FiDownload size={16} />, fn: () => { const a = document.createElement('a'); a.href = src; a.download = label; a.click(); }, tip: 'تحميل' },
            { icon: <FiX size={18} />, fn: onClose, tip: 'إغلاق' },
          ].map((btn, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); btn.fn(); }} title={btn.tip}
              style={{
                width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; }}
            >{btn.icon}</button>
          ))}
        </div>
      </div>

      {/* Image */}
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
        <img src={src} alt={label} draggable={false} style={{
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
          transition: 'transform 0.2s ease',
          maxWidth: zoom <= 1 ? '90vw' : 'none',
          maxHeight: zoom <= 1 ? '85vh' : 'none',
          objectFit: 'contain', borderRadius: 8,
          cursor: zoom > 1 ? 'grab' : 'zoom-in',
        }} onClick={(e) => { e.stopPropagation(); setZoom(z => z < 2 ? 2 : 1); }} />
      </div>
    </div>
  );
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const summary = useMemo(() => {
    const total = customers.length;
    const vip = customers.filter(c => c.status === 'vip').length;
    const blacklisted = customers.filter(c => c.status === 'blacklisted').length;
    const totalSpent = customers.reduce((sum, c) => sum + (Number(c.total_spent) || 0), 0);
    return { total, vip, blacklisted, totalSpent };
  }, [customers]);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [docBlobUrls, setDocBlobUrls] = useState({});
  const [docLoadingIds, setDocLoadingIds] = useState({});
  const [lightbox, setLightbox] = useState(null); // { src, label }

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => { Object.values(docBlobUrls).forEach(url => URL.revokeObjectURL(url)); };
  }, [docBlobUrls]);

  // Fetch a KYC doc as blob URL
  const fetchDocBlob = useCallback(async (doc) => {
    if (docBlobUrls[doc.id]) return docBlobUrls[doc.id];
    setDocLoadingIds(prev => ({ ...prev, [doc.id]: true }));
    try {
      const resp = await api.get(doc.view_url, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(resp.data);
      setDocBlobUrls(prev => ({ ...prev, [doc.id]: blobUrl }));
      return blobUrl;
    } catch (err) {
      console.error('Failed to load doc:', err);
      toast.error('فشل في تحميل المستند');
      return null;
    } finally {
      setDocLoadingIds(prev => ({ ...prev, [doc.id]: false }));
    }
  }, [docBlobUrls]);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/api/customers', { params: { page_size: 200 } });
      setCustomers(data.items || []);
    } catch { setCustomers([]); }
    finally { setLoading(false); }
  };

  const openCustomerDetail = async (customer) => {
    setSelectedCustomer(customer);
    setDetailLoading(true);
    setEditMode(false);
    setActiveTab('info');
    try {
      const { data } = await api.get(`/api/customers/${customer.id}/details`);
      setCustomerDetails(data);
      setNotesText(data.customer.admin_notes || '');
    } catch {
      toast.error('حدث خطأ في تحميل بيانات العميل');
      setCustomerDetails(null);
    } finally { setDetailLoading(false); }
  };

  const closeDetail = () => {
    Object.values(docBlobUrls).forEach(url => URL.revokeObjectURL(url));
    setDocBlobUrls({});
    setSelectedCustomer(null);
    setCustomerDetails(null);
    setEditMode(false);
    setLightbox(null);
  };

  const startEdit = () => {
    const c = customerDetails.customer;
    setEditForm({ full_name: c.full_name, phone: c.phone, phone2: c.phone2 || '', address: c.address || '' });
    setEditMode(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/api/customers/${customerDetails.customer.id}`, editForm);
      toast.success('تم حفظ التعديلات ✅');
      setEditMode(false);
      openCustomerDetail({ id: customerDetails.customer.id });
      fetchCustomers();
    } catch (err) { toast.error(err.response?.data?.detail || 'خطأ في الحفظ'); }
    finally { setSaving(false); }
  };

  const changeStatus = async (newStatus) => {
    let reason = '';
    if (newStatus === 'blacklisted') {
      reason = prompt('أدخل سبب الحظر:');
      if (!reason) return;
    }
    try {
      await api.patch(`/api/customers/${customerDetails.customer.id}/status?status=${newStatus}`, { blacklist_reason: reason });
      toast.success('تم تحديث الحالة ✅');
      openCustomerDetail({ id: customerDetails.customer.id });
      fetchCustomers();
    } catch (err) { toast.error(err.response?.data?.detail || 'خطأ'); }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.patch(`/api/customers/${customerDetails.customer.id}/notes`, { admin_notes: notesText });
      toast.success('تم حفظ الملاحظات ✅');
    } catch { toast.error('خطأ في حفظ الملاحظات'); }
    finally { setSavingNotes(false); }
  };

  const printStatement = () => {
    if (!customerDetails) return;
    const c = customerDetails.customer;
    const res = customerDetails.reservations;
    const totalPaid = res.filter(r => r.status !== 'cancelled').reduce((s, r) => s + (r.total_price || 0), 0);

    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">
<title>كشف حساب - ${c.full_name}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Cairo',sans-serif;background:#f5f5f8;padding:20px;color:#1a1a2e;direction:rtl}
.stmt{max-width:800px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)}
.stmt-header{background:linear-gradient(135deg,#1a1a3e,#2e2a5e);color:white;padding:30px;text-align:center}
.stmt-header h1{font-size:22px;font-weight:900;margin-bottom:4px}
.stmt-header p{font-size:12px;opacity:0.7}
.stmt-info{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:24px 30px;background:#f8f9fb;border-bottom:2px solid #e2e8f0}
.stmt-info div{font-size:13px}
.stmt-info .label{color:#64748b;font-size:11px;display:block}
.stmt-info .value{font-weight:700;font-size:14px}
.stmt-body{padding:24px 30px}
.stmt-body h3{font-size:15px;font-weight:800;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #f0f0f5}
table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:12px}
th{background:#f8f9fb;padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#64748b;border-bottom:2px solid #e2e8f0}
td{padding:10px 12px;border-bottom:1px solid #f0f0f5}
.total-row{background:linear-gradient(135deg,#1a1a3e,#e61e5a);color:white;padding:20px 30px;display:flex;justify-content:space-between;align-items:center}
.total-row .total-label{font-size:16px;font-weight:700}
.total-row .total-value{font-size:26px;font-weight:900}
.stmt-footer{padding:20px 30px;text-align:center;border-top:2px dashed #e0e0e0}
.stmt-footer p{font-size:10px;color:#94a3b8;line-height:1.8}
.status{padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700}
.s-active{background:rgba(16,185,129,0.1);color:#10b981}
.s-completed{background:rgba(107,114,128,0.1);color:#6b7280}
.s-cancelled{background:rgba(239,68,68,0.1);color:#ef4444}
.s-pending{background:rgba(245,158,11,0.1);color:#f59e0b}
.s-overdue{background:rgba(220,38,38,0.15);color:#dc2626}
.s-approved{background:rgba(59,130,246,0.1);color:#3b82f6}
@media print{body{background:white;padding:0}.stmt{box-shadow:none;border-radius:0}.no-print{display:none}}
</style></head><body>
<div class="stmt">
  <div class="stmt-header">
    <div style="font-size:36px;margin-bottom:8px">🚗</div>
    <h1>${config.companyName} ${config.companySlogan}</h1>
    <p>كشف حساب عميل</p>
    <div style="margin-top:8px;font-size:11px;opacity:0.5">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>
  <div class="stmt-info">
    <div><span class="label">الاسم</span><span class="value">${c.full_name}</span></div>
    <div><span class="label">رقم الهاتف</span><span class="value" style="direction:ltr;text-align:right">${c.phone}</span></div>
    <div><span class="label">الرقم القومي</span><span class="value">${c.national_id}</span></div>
    <div><span class="label">الحالة</span><span class="value">${STATUS_MAP[c.status]?.icon} ${STATUS_MAP[c.status]?.label}</span></div>
    <div><span class="label">عدد الإيجارات</span><span class="value">${c.total_rentals}</span></div>
    <div><span class="label">تاريخ التسجيل</span><span class="value">${c.created_at ? new Date(c.created_at).toLocaleDateString('ar-EG') : '—'}</span></div>
  </div>
  <div class="stmt-body">
    <h3>📋 سجل الحجوزات (${res.length})</h3>
    <table><thead><tr><th>#</th><th>السيارة</th><th>النوع</th><th>من</th><th>إلى</th><th>المبلغ</th><th>الحالة</th></tr></thead><tbody>
    ${res.map((r, i) => `<tr>
      <td>${i + 1}</td>
      <td><strong>${r.car_name}</strong><br><span style="font-size:10px;color:#94a3b8">${r.car_color} — ${r.car_plate}</span></td>
      <td>${RENTAL_TYPE_LABELS[r.rental_type] || 'يومي'} (${r.rental_duration})</td>
      <td>${r.start_date || '—'}</td>
      <td>${r.end_date || '—'}</td>
      <td><strong>${Number(r.total_price).toLocaleString()}</strong> ج.م</td>
      <td><span class="status s-${r.status}">${RENTAL_STATUS[r.status]?.label || r.status}</span></td>
    </tr>`).join('')}
    </tbody></table>
  </div>
  <div class="total-row">
    <span class="total-label">إجمالي المبالغ</span>
    <div><span class="total-value">${Number(totalPaid).toLocaleString()}</span> <span style="font-size:14px;opacity:0.7">ج.م</span></div>
  </div>
  <div class="stmt-footer">
    <p>${config.companyName} ${config.companySlogan} — للاستفسار: ${config.whatsapp1}</p>
  </div>
</div>
<div class="no-print" style="text-align:center;margin-top:20px">
  <button onclick="window.print()" style="background:#e61e5a;color:white;border:none;padding:12px 40px;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;font-family:'Cairo',sans-serif">🖨️ طباعة كشف الحساب</button>
</div></body></html>`;

    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(html);
    w.document.close();
  };

  const handleDeleteCustomer = async (customerId, customerName) => {
    setConfirmDelete({ id: customerId, name: customerName });
  };

  const confirmDeleteAction = async () => {
    try {
      await api.delete(`/api/customers/${confirmDelete.id}`);
      toast.success('تم حذف العميل 🗑️');
      setConfirmDelete(null);
      setSelectedCustomer(null);
      setCustomerDetails(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'حدث خطأ');
      setConfirmDelete(null);
    }
  };

  const downloadAllCustomersZip = async () => {
    try {
      toast.loading('جاري تجهيز ملف العملاء...', { id: 'zip-export' });
      const resp = await api.get('/api/customers/export/zip', { responseType: 'blob' });
      const url = URL.createObjectURL(resp.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers_export_${new Date().toISOString().slice(0,10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('تم تنزيل ملف العملاء بنجاح 📦', { id: 'zip-export' });
    } catch (err) {
      toast.error('فشل في تنزيل الملف', { id: 'zip-export' });
    }
  };

  const filtered = customers.filter(c => {
    const matchesSearch = `${c.full_name} ${c.phone} ${c.national_id}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCount = (key) => key === 'all' ? customers.length : customers.filter(c => c.status === key).length;

  return (
    <div>
      <div className="page-header flex-between">
        <div><h1>👥 إدارة العملاء</h1><p>ملفات العملاء والـ CRM</p></div>
        <button className="btn btn-sm btn-outline" onClick={downloadAllCustomersZip} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiDownload size={14} /> تنزيل كل العملاء ZIP
        </button>
      </div>

      {/* Summary cards */}
      <div className="admin-summary">
        <div className="admin-summary-card">
          <div className="admin-summary-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><FiUsers size={20} /></div>
          <div className="admin-summary-info">
            <div className="admin-summary-value">{summary.total}</div>
            <div className="admin-summary-label">إجمالي العملاء</div>
          </div>
        </div>
        <div className="admin-summary-card">
          <div className="admin-summary-icon" style={{ background: 'rgba(212,168,67,0.12)', color: '#d4a843' }}><FaCrown /></div>
          <div className="admin-summary-info">
            <div className="admin-summary-value">{summary.vip}</div>
            <div className="admin-summary-label">عملاء مميزون</div>
          </div>
        </div>
        <div className="admin-summary-card">
          <div className="admin-summary-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><FiUserX size={20} /></div>
          <div className="admin-summary-info">
            <div className="admin-summary-value">{summary.blacklisted}</div>
            <div className="admin-summary-label">محظورون</div>
          </div>
        </div>
        <div className="admin-summary-card">
          <div className="admin-summary-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><FaMoneyBillWave /></div>
          <div className="admin-summary-info">
            <div className="admin-summary-value" style={{ fontSize: 16 }}>{Number(summary.totalSpent).toLocaleString()} ج.م</div>
            <div className="admin-summary-label">إجمالي إنفاق العملاء</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <FiSearch />
          <input type="text" placeholder="بحث بالاسم، الهاتف، أو الرقم القومي..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-pills">
          <button className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>الكل<span className="count">{statusCount('all')}</span></button>
          <button className={`filter-pill ${statusFilter === 'normal' ? 'active' : ''}`} onClick={() => setStatusFilter('normal')}>عاديون<span className="count">{statusCount('normal')}</span></button>
          <button className={`filter-pill ${statusFilter === 'vip' ? 'active' : ''}`} onClick={() => setStatusFilter('vip')}>⭐ مميزون<span className="count">{statusCount('vip')}</span></button>
          <button className={`filter-pill ${statusFilter === 'blacklisted' ? 'active' : ''}`} onClick={() => setStatusFilter('blacklisted')}>🚫 محظورون<span className="count">{statusCount('blacklisted')}</span></button>
        </div>
        <div className="admin-toolbar-spacer" />
        <span className="admin-toolbar-meta">{filtered.length} نتيجة</span>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>الاسم</th><th>الهاتف</th><th className="hide-mobile">الهوية</th><th>الحالة</th><th className="hide-mobile">الإيجارات</th><th>الإنفاق</th><th></th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center" style={{ padding: '40px' }}>⏳</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>لا يوجد عملاء</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openCustomerDetail(c)}>
                  <td><strong>{c.full_name}</strong></td>
                  <td style={{ direction: 'ltr', textAlign: 'right', fontSize: '13px' }}>{c.phone}</td>
                  <td className="hide-mobile"><code style={{ fontSize: '11px', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>{c.national_id}</code></td>
                  <td><span className={`badge ${STATUS_MAP[c.status]?.class}`}>{STATUS_MAP[c.status]?.icon} {STATUS_MAP[c.status]?.label}</span></td>
                  <td className="hide-mobile">{c.total_rentals}</td>
                  <td><strong>{Number(c.total_spent || 0).toLocaleString()}</strong> ج.م</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); openCustomerDetail(c); }}>
                        <FiFileText size={14} /> تفاصيل
                      </button>
                      <button className="btn btn-sm" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', minWidth: 'auto' }} onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(c.id, c.full_name); }} title="حذف">
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={closeDetail} style={{ zIndex: 200 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>👤 ملف العميل</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {customerDetails && (
                  <>
                    <button className="btn btn-sm btn-outline" onClick={printStatement} title="كشف حساب"><FiPrinter size={14} /> كشف حساب</button>
                    <button className="btn btn-sm" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }} onClick={() => handleDeleteCustomer(customerDetails.customer.id, customerDetails.customer.full_name)} title="حذف العميل">
                      <FiTrash2 size={14} />
                    </button>
                    {!editMode && <button className="btn btn-sm btn-outline" onClick={startEdit}><FiEdit3 size={14} /> تعديل</button>}
                  </>
                )}
                <button className="btn-icon" onClick={closeDetail} style={{ background: 'var(--bg-primary)' }}><FiX size={18} /></button>
              </div>
            </div>
            <div className="modal-body" style={{ padding: '0' }}>
              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>⏳ جاري التحميل...</div>
              ) : customerDetails ? (
                <>
                  {/* Customer Info Card */}
                  <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', padding: '24px', color: 'white' }}>
                    {editMode ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                          { key: 'full_name', label: 'الاسم الكامل' },
                          { key: 'phone', label: 'الهاتف' },
                          { key: 'phone2', label: 'هاتف احتياطي' },
                          { key: 'address', label: 'العنوان' },
                        ].map(f => (
                          <div key={f.key}>
                            <label style={{ fontSize: '10px', opacity: 0.7, display: 'block', marginBottom: '4px' }}>{f.label}</label>
                            <input value={editForm[f.key] || ''} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '13px', fontFamily: 'inherit' }} />
                          </div>
                        ))}
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-sm" onClick={() => setEditMode(false)} style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>إلغاء</button>
                          <button className="btn btn-sm btn-gold" onClick={saveEdit} disabled={saving}>{saving ? '⏳' : '💾'} حفظ</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 12px' }}>{customerDetails.customer.full_name}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiPhone size={14} />
                                <span style={{ direction: 'ltr' }}>{customerDetails.customer.phone}</span>
                                <a href={`https://wa.me/${formatPhone(customerDetails.customer.phone).replace('+', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25d366' }}><FaWhatsapp size={16} /></a>
                              </div>
                              {customerDetails.customer.phone2 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                                  <FiPhone size={12} />
                                  <span style={{ direction: 'ltr', fontSize: '13px' }}>{customerDetails.customer.phone2} (احتياطي)</span>
                                  <a href={`https://wa.me/${formatPhone(customerDetails.customer.phone2).replace('+', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25d366' }}><FaWhatsapp size={14} /></a>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className={`badge ${STATUS_MAP[customerDetails.customer.status]?.class}`} style={{ fontSize: '13px' }}>
                            {STATUS_MAP[customerDetails.customer.status]?.icon} {STATUS_MAP[customerDetails.customer.status]?.label}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px' }}>
                          {[
                            { label: 'الرقم القومي', value: customerDetails.customer.national_id },
                            { label: 'عدد الإيجارات', value: customerDetails.customer.total_rentals },
                            { label: 'إجمالي الإنفاق', value: `${Number(customerDetails.customer.total_spent).toLocaleString()} ج.م` },
                          ].map((s, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                              <span style={{ fontSize: '10px', opacity: 0.7, display: 'block' }}>{s.label}</span>
                              <strong style={{ fontSize: '15px' }}>{s.value}</strong>
                            </div>
                          ))}
                        </div>
                        {customerDetails.customer.address && (
                          <div style={{ marginTop: '12px', fontSize: '13px', opacity: 0.7 }}>📍 {customerDetails.customer.address}</div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Status Actions */}
                  <div style={{ padding: '12px 24px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>تغيير الحالة:</span>
                    {Object.entries(STATUS_MAP).map(([key, val]) => (
                      <button key={key} className={`btn btn-sm ${customerDetails.customer.status === key ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => customerDetails.customer.status !== key && changeStatus(key)}
                        disabled={customerDetails.customer.status === key}
                        style={{ fontSize: '11px', padding: '4px 12px' }}>
                        {val.icon} {val.label}
                      </button>
                    ))}
                  </div>

                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--border-light)', padding: '0 24px' }}>
                    {[
                      { key: 'info', label: '📋 الحجوزات', count: customerDetails.reservations.length },
                      { key: 'docs', label: '📄 المستندات', count: customerDetails.kyc_documents.filter(d => d.doc_type !== 'deposit_receipt').length },
                      { key: 'deposits', label: '💳 العربون', count: customerDetails.kyc_documents.filter(d => d.doc_type === 'deposit_receipt').length },
                      { key: 'notes', label: '📝 ملاحظات' },
                    ].map(t => (
                      <button key={t.key} onClick={() => setActiveTab(t.key)}
                        style={{ padding: '12px 20px', fontSize: '13px', fontWeight: activeTab === t.key ? 700 : 500, color: activeTab === t.key ? 'var(--accent)' : 'var(--text-secondary)',
                          borderBottom: activeTab === t.key ? '2px solid var(--accent)' : '2px solid transparent', background: 'none', border: 'none', borderBottomStyle: 'solid', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '-2px' }}>
                        {t.label} {t.count != null ? `(${t.count})` : ''}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div style={{ padding: '20px 24px' }}>
                    {activeTab === 'info' && (
                      customerDetails.reservations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', background: 'var(--bg-primary)', borderRadius: '12px', color: 'var(--text-muted)' }}>لا توجد حجوزات</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {customerDetails.reservations.map(r => {
                            const st = RENTAL_STATUS[r.status] || { label: r.status, class: 'badge-primary' };
                            return (
                              <div key={r.id} style={{ background: 'var(--bg-primary)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-light)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                                  <strong style={{ fontSize: '14px' }}>🚗 {r.car_name}</strong>
                                  <span className={`badge ${st.class}`}>{st.label}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                  <span>🎨 {r.car_color} — {r.car_plate}</span>
                                  <span>📋 {RENTAL_TYPE_LABELS[r.rental_type] || r.rental_type} ({r.rental_duration})</span>
                                  <span>📅 من: {r.start_date || '—'}</span>
                                  <span>📅 إلى: {r.end_date || '—'}</span>
                                  <span>💰 {Number(r.total_price).toLocaleString()} ج.م</span>
                                  <span>🕐 {r.created_at ? new Date(r.created_at).toLocaleDateString('ar-EG') : '—'}</span>
                                </div>
                                {r.notes && <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>📝 {r.notes}</div>}
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}

                    {activeTab === 'docs' && (() => {
                      const docs = customerDetails.kyc_documents.filter(d => d.doc_type !== 'deposit_receipt');
                      return docs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', background: 'var(--bg-primary)', borderRadius: '12px', color: 'var(--text-muted)' }}>لا توجد مستندات مرفوعة</div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                          {docs.map(doc => (
                            <DocCard key={doc.id} doc={doc} blobUrl={docBlobUrls[doc.id]} isLoading={docLoadingIds[doc.id]}
                              onLoad={() => fetchDocBlob(doc)}
                              onView={async () => {
                                const url = await fetchDocBlob(doc);
                                if (url) setLightbox({ src: url, label: doc.doc_label || doc.original_filename });
                              }}
                            />
                          ))}
                        </div>
                      );
                    })()}

                    {activeTab === 'deposits' && (() => {
                      const depositDocs = customerDetails.kyc_documents.filter(d => d.doc_type === 'deposit_receipt');
                      const depositReservations = customerDetails.reservations.filter(r => r.deposit_amount > 0);
                      return depositDocs.length === 0 && depositReservations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-primary)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                          <div style={{ fontSize: '36px', marginBottom: '8px' }}>💳</div>
                          لا توجد مدفوعات عربون لهذا العميل
                        </div>
                      ) : (
                        <div>
                          {depositReservations.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                              {depositReservations.map(r => (
                                <div key={r.id} style={{ background: 'rgba(16,185,129,0.06)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <strong style={{ fontSize: '20px', color: 'var(--success)' }}>{r.deposit_amount} ج.م</strong>
                                    <span className="badge badge-success" style={{ fontSize: '10px' }}>✅ مدفوع</span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    حجز: {new Date(r.start_date).toLocaleDateString('ar-EG')} — {r.car_name || 'سيارة'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {depositDocs.length > 0 && (
                            <>
                              <strong style={{ fontSize: '13px', display: 'block', marginBottom: '10px', color: 'var(--text-secondary)' }}>🧾 إيصالات التحويل ({depositDocs.length})</strong>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                {depositDocs.map(doc => (
                                  <DocCard key={doc.id} doc={doc} blobUrl={docBlobUrls[doc.id]} isLoading={docLoadingIds[doc.id]}
                                    onLoad={() => fetchDocBlob(doc)}
                                    onView={async () => {
                                      const url = await fetchDocBlob(doc);
                                      if (url) setLightbox({ src: url, label: doc.doc_label || doc.original_filename });
                                    }}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()}

                    {activeTab === 'notes' && (
                      <div>
                        <textarea value={notesText} onChange={e => setNotesText(e.target.value)} placeholder="اكتب ملاحظات خاصة عن هذا العميل... (لن تظهر للعميل)"
                          style={{ width: '100%', minHeight: '120px', padding: '14px', borderRadius: '12px', border: '2px solid var(--border-light)', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.8 }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                          <button className="btn btn-sm btn-primary" onClick={saveNotes} disabled={savingNotes}>
                            {savingNotes ? '⏳' : <FiSave size={14} />} حفظ الملاحظات
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Blacklist Reason */}
                  {customerDetails.customer.status === 'blacklisted' && customerDetails.customer.blacklist_reason && (
                    <div style={{ margin: '0 24px 20px', padding: '14px', background: 'rgba(239,68,68,0.1)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <strong style={{ color: 'var(--danger)', fontSize: '13px' }}>🚫 سبب الحظر:</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{customerDetails.customer.blacklist_reason}</p>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>حدث خطأ في تحميل البيانات</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && <DocLightbox src={lightbox.src} label={lightbox.label} onClose={() => setLightbox(null)} />}

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
        }
        @keyframes docCardPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {confirmDelete && (
        <ConfirmModal
          show={true}
          title="حذف العميل"
          message={`هل أنت متأكد من حذف العميل "${confirmDelete.name}" نهائياً؟ \nسيتم حذف كل بياناته وحجوزاته ومستنداته.`}
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
          type="danger"
        />
      )}
    </div>
  );
}

/* ─── Inline Document Card ───────────────────────────────────── */
function DocCard({ doc, blobUrl, isLoading, onLoad, onView }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const icon = DOC_TYPE_ICONS[doc.doc_type] || '📄';
  const typeLabel = doc.doc_type === 'national_id' ? '🪪 بطاقة (وش)' : doc.doc_type === 'national_id_back' ? '🪪 بطاقة (ضهر)' : doc.doc_type === 'license' ? '📄 رخصة' : doc.doc_type === 'selfie' ? '🤳 سيلفي' : '🧾 إيصال';

  useEffect(() => {
    if (!blobUrl && !isLoading) onLoad();
  }, [blobUrl, isLoading]);

  return (
    <div style={{
      background: 'var(--bg-primary)', borderRadius: '14px', overflow: 'hidden',
      border: '1px solid var(--border-light)', transition: 'all 0.25s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
    >
      <div style={{
        position: 'relative', height: '180px', background: '#f0f2f5', cursor: 'pointer',
        overflow: 'hidden',
      }} onClick={onView}>
        {isLoading ? (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: '8px',
          }}>
            <div style={{
              width: 36, height: 36, border: '3px solid var(--border-light)',
              borderTopColor: 'var(--accent)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>جاري التحميل...</span>
          </div>
        ) : blobUrl && !error ? (
          <img
            src={blobUrl} alt={doc.doc_label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: '6px',
            color: 'var(--text-muted)',
          }}>
            <span style={{ fontSize: '40px' }}>{icon}</span>
            <span style={{ fontSize: '11px' }}>{error ? 'تعذر عرض الملف' : 'اضغط للتحميل'}</span>
          </div>
        )}

        {/* Type badge */}
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          color: 'white', padding: '3px 10px', borderRadius: '8px',
          fontSize: '10px', fontWeight: 700,
        }}>{typeLabel}</div>

        {/* Zoom overlay */}
        {blobUrl && !error && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', opacity: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.style.opacity = '0'; }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              borderRadius: '50%', width: 44, height: 44, display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'white',
            }}>
              <FiMaximize2 size={18} />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 12px' }}>
        <strong style={{ fontSize: '12px', display: 'block' }}>{doc.doc_label}</strong>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{doc.original_filename}</span>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('ar-EG') : ''}
        </div>
      </div>
    </div>
  );
}
