import { useState, useEffect, useRef } from 'react';
import { FiDownload, FiUpload } from 'react-icons/fi';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function AdminContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadTarget, setUploadTarget] = useState(null);
  const fileRef = useRef();

  useEffect(() => { fetchContracts(); }, []);

  const fetchContracts = async () => {
    try {
      const { data } = await api.get('/api/contracts', { params: { page_size: 50 } });
      setContracts(data.items || []);
    } catch {
      setContracts([]);
    } finally { setLoading(false); }
  };

  const handleDownload = async (contractId) => {
    try {
      const response = await api.get(`/api/contracts/${contractId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract_${contractId.substring(0, 8)}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('تم تحميل العقد');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'خطأ في تحميل العقد');
    }
  };

  const handleUploadSigned = async (contractId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/api/contracts/${contractId}/upload-signed`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('تم رفع العقد الموقع');
      fetchContracts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'خطأ في الرفع');
    }
  };

  const STATUS_MAP = { generated: { label: 'تم التوليد', class: 'badge-info' }, printed: { label: 'تم الطباعة', class: 'badge-warning' }, signed: { label: 'تم التوقيع', class: 'badge-success' } };

  return (
    <div>
      <div className="page-header"><h1>📄 العقود</h1><p>إدارة عقود الإيجار</p></div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>رقم العقد</th><th>العميل</th><th>السيارة</th><th>الحالة</th><th>تاريخ التوليد</th><th>التوقيع</th><th>إجراءات</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center" style={{ padding: '40px' }}>⏳</td></tr>
              ) : contracts.length === 0 ? (
                <tr><td colSpan="7" className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>لا توجد عقود — قم بتوليد عقد من صفحة الحجوزات</td></tr>
              ) : contracts.map(c => (
                <tr key={c.id}>
                  <td><code style={{ fontSize: '12px' }}>{String(c.id).substring(0, 8)}</code></td>
                  <td><strong>{c.customer_name || '—'}</strong></td>
                  <td>{c.car_name || '—'}</td>
                  <td><span className={`badge ${STATUS_MAP[c.status]?.class}`}>{STATUS_MAP[c.status]?.label}</span></td>
                  <td style={{ fontSize: '13px' }}>{c.generated_at ? new Date(c.generated_at).toLocaleDateString('ar-EG') : '—'}</td>
                  <td>{c.signed_at ? <span className="badge badge-success">✅ موقَّع {new Date(c.signed_at).toLocaleDateString('ar-EG')}</span> : <span className="badge badge-warning">بانتظار التوقيع</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => handleDownload(c.id)}>
                        <FiDownload size={13} /> تحميل PDF
                      </button>
                      {c.status !== 'signed' && (
                        <button className="btn btn-sm btn-primary" onClick={() => { setUploadTarget(c.id); fileRef.current?.click(); }}>
                          <FiUpload size={13} /> رفع موقَّع
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden file input for signed contract upload */}
      <input type="file" ref={fileRef} hidden accept="image/*,.pdf" onChange={e => {
        if (uploadTarget && e.target.files[0]) handleUploadSigned(uploadTarget, e.target.files[0]);
        e.target.value = '';
        setUploadTarget(null);
      }} />
    </div>
  );
}
