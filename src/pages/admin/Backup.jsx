import { useState, useEffect, useRef } from 'react';
import { FiDownload, FiUpload, FiTrash2, FiDatabase, FiShield } from 'react-icons/fi';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

export default function BackupPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { fetchBackups(); }, []);

  const fetchBackups = async () => {
    try {
      const { data } = await api.get('/api/backup/list');
      setBackups(data.backups || []);
    } catch { setBackups([]); }
    finally { setLoading(false); }
  };

  const handleDownload = async () => {
    try {
      toast.loading('جاري إنشاء النسخة الاحتياطية...', { id: 'backup' });
      const response = await api.get('/api/backup/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `rennt_backup_${new Date().toISOString().slice(0,10)}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('تم تحميل النسخة الاحتياطية ✅', { id: 'backup' });
      fetchBackups();
    } catch {
      toast.error('فشل إنشاء النسخة الاحتياطية', { id: 'backup' });
    }
  };

  const handleRestore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.db') && !file.name.endsWith('.zip')) { toast.error('الملف يجب أن يكون بصيغة .zip أو .db'); return; }
    setConfirmRestore(true);
    // Store file for later use
    fileRef.current._selectedFile = file;
  };

  const confirmRestoreAction = async () => {
    const file = fileRef.current._selectedFile;
    if (!file) return;
    setUploading(true);
    setConfirmRestore(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/api/backup/restore', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('تم استعادة قاعدة البيانات بنجاح! يرجى إعادة تحميل الصفحة.');
      fetchBackups();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'فشل في الاستعادة');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (filename) => {
    try {
      await api.delete(`/api/backup/${filename}`);
      toast.success('تم حذف النسخة');
      fetchBackups();
    } catch { toast.error('فشل في الحذف'); }
    setConfirmDelete(null);
  };

  return (
    <div>
      <div className="page-header"><h1>💾 النسخ الاحتياطي</h1><p>نسخة كاملة من قاعدة البيانات والمستندات والصور</p></div>

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ cursor: 'pointer' }} onClick={handleDownload}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', flexShrink: 0 }}>
              <FiDownload size={24} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '15px' }}>تحميل نسخة احتياطية</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>نسخة كاملة: قاعدة البيانات + المستندات + صور السيارات</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => fileRef.current?.click()}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)', flexShrink: 0 }}>
              <FiUpload size={24} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '15px' }}>{uploading ? '⏳ جاري الاستعادة...' : 'استعادة نسخة احتياطية'}</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>رفع ملف .zip أو .db لاستعادة كل البيانات</span>
            </div>
          </div>
          <input ref={fileRef} type="file" accept=".db,.zip" onChange={handleRestore} style={{ display: 'none' }} />
        </div>

        <div className="card">
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(212,168,67,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0 }}>
              <FiShield size={24} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '15px' }}>نسخ تلقائي</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>يتم إنشاء نسخة تلقائية يومياً الساعة 3:00 صباحاً</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup List */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}><FiDatabase size={18} style={{ marginLeft: '8px' }} /> النسخ المتاحة</h3>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{backups.length} نسخة</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>اسم الملف</th><th>النوع</th><th>الحجم</th><th>التاريخ</th><th></th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>⏳</td></tr>
              ) : backups.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد نسخ احتياطية</td></tr>
              ) : backups.map(b => (
                <tr key={b.filename}>
                  <td><code style={{ fontSize: '12px', background: 'var(--bg-primary)', padding: '3px 8px', borderRadius: '4px' }}>{b.filename}</code></td>
                  <td><span className={`badge ${b.type === 'full' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '10px' }}>{b.type === 'full' ? '📦 كاملة' : '🗄️ قاعدة بيانات'}</span></td>
                  <td>{b.size_mb} MB</td>
                  <td style={{ fontSize: '12px' }}>{b.created_at ? new Date(b.created_at).toLocaleString('ar-EG') : '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(b.filename)} style={{ minWidth: 'auto' }}>
                      <FiTrash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="حذف نسخة احتياطية"
          message={`هل تريد حذف النسخة ${confirmDelete}؟`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
          type="danger"
        />
      )}

      {confirmRestore && (
        <ConfirmModal
          title="استعادة قاعدة البيانات"
          message="⚠️ سيتم استعادة كل البيانات (قاعدة البيانات + المستندات + الصور) من الملف المرفوع. سيتم إنشاء نسخة احتياطية كاملة تلقائياً قبل الاستعادة. هل أنت متأكد؟"
          onConfirm={confirmRestoreAction}
          onCancel={() => setConfirmRestore(false)}
          type="danger"
        />
      )}
    </div>
  );
}
