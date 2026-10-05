import { useState, useEffect } from 'react';
import { FaPlus, FaUserShield, FaUserTie, FaUser } from 'react-icons/fa';
import { FiEdit2, FiLock, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const ROLE_MAP = {
  super_admin: { label: 'مدير عام', icon: <FaUserShield size={14} />, class: 'badge-danger' },
  admin: { label: 'مسؤول', icon: <FaUserTie size={14} />, class: 'badge-info' },
  staff: { label: 'موظف', icon: <FaUser size={14} />, class: 'badge-primary' },
};

const MAX_ACCOUNTS = 20;

export default function StaffManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [showResetModal, setShowResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [form, setForm] = useState({ username: '', full_name: '', password: '', phone: '', role: 'staff' });
  const [confirmState, setConfirmState] = useState({ show: false, title: '', message: '', type: 'warning', onConfirm: null });

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      const { data } = await api.get('/api/auth/admins');
      setAdmins(data.items || []);
    } catch {
      setAdmins([]);
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.username || !form.full_name) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (!editAdmin && (!form.password || form.password.length < 6)) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    try {
      if (editAdmin) {
        await api.put(`/api/auth/admins/${editAdmin.id}`, form);
        toast.success('تم تحديث الحساب');
      } else {
        await api.post('/api/auth/admins', form);
        toast.success('تم إنشاء الحساب');
      }
      setShowModal(false);
      setEditAdmin(null);
      setForm({ username: '', full_name: '', password: '', phone: '', role: 'staff' });
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'حدث خطأ');
    }
  };

  const handleToggle = (admin) => {
    setConfirmState({
      show: true,
      title: admin.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب',
      message: `هل أنت متأكد من ${admin.is_active ? 'تعطيل' : 'تفعيل'} حساب "${admin.full_name}"؟`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await api.patch(`/api/auth/admins/${admin.id}/toggle`);
          toast.success(admin.is_active ? 'تم تعطيل الحساب' : 'تم تفعيل الحساب');
          fetchAdmins();
        } catch (err) { toast.error(err.response?.data?.detail || 'خطأ'); }
        setConfirmState(prev => ({ ...prev, show: false }));
      },
    });
  };

  const handleDelete = (admin) => {
    setConfirmState({
      show: true,
      title: '🗑️ حذف نهائي',
      message: `هل أنت متأكد من حذف حساب "${admin.full_name}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/api/auth/admins/${admin.id}`);
          toast.success('تم حذف الحساب نهائياً');
          fetchAdmins();
        } catch (err) { toast.error(err.response?.data?.detail || 'خطأ في الحذف'); }
        setConfirmState(prev => ({ ...prev, show: false }));
      },
    });
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    try {
      await api.patch(`/api/auth/admins/${showResetModal.id}/reset-password`, { password: newPassword });
      toast.success('تم تغيير كلمة المرور');
      setShowResetModal(null);
      setNewPassword('');
    } catch (err) { toast.error(err.response?.data?.detail || 'خطأ'); }
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>👥 إدارة الموظفين</h1>
          <p>إدارة حسابات المسؤولين والموظفين — <span style={{ fontWeight: 700, color: admins.length >= MAX_ACCOUNTS ? 'var(--danger)' : 'var(--accent)' }}>{admins.length}/{MAX_ACCOUNTS}</span> حساب</p>
        </div>
        <button className="btn btn-primary" disabled={admins.length >= MAX_ACCOUNTS} onClick={() => { setEditAdmin(null); setForm({ username: '', full_name: '', password: '', phone: '', role: 'staff' }); setShowModal(true); }}>
          <FaPlus /> إضافة موظف
        </button>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>الموظف</th><th>اسم المستخدم</th><th>التليفون</th><th>الصلاحية</th><th>الحالة</th><th>آخر دخول</th><th>تاريخ الإنشاء</th><th>إجراءات</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center" style={{ padding: '40px' }}>⏳</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan="8" className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>لا يوجد موظفين</td></tr>
              ) : admins.map(a => {
                const role = ROLE_MAP[a.role] || ROLE_MAP.staff;
                return (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: a.is_active ? 'linear-gradient(135deg, var(--accent), var(--primary))' : 'var(--bg-primary)', color: a.is_active ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                          {a.full_name?.charAt(0)}
                        </div>
                        <strong>{a.full_name}</strong>
                      </div>
                    </td>
                    <td><code style={{ fontSize: '12px', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '4px' }}>{a.username}</code></td>
                    <td style={{ fontSize: '13px', direction: 'ltr', textAlign: 'center' }}>
                      {a.phone ? (
                        <a href={`tel:${a.phone}`} style={{ color: 'var(--info)', fontWeight: 600 }}>{a.phone}</a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${role.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {role.icon} {role.label}
                      </span>
                    </td>
                    <td>
                      {a.is_active ? (
                        <span className="badge badge-success">🟢 نشط</span>
                      ) : (
                        <span className="badge badge-danger">🔴 معطل</span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {a.last_login ? new Date(a.last_login).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('ar-EG') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => { setEditAdmin(a); setForm({ username: a.username, full_name: a.full_name, password: '', phone: a.phone || '', role: a.role }); setShowModal(true); }}>
                          <FiEdit2 size={13} /> تعديل
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => { setShowResetModal(a); setNewPassword(''); }} title="إعادة تعيين كلمة المرور">
                          <FiLock size={13} />
                        </button>
                        <button className={`btn btn-sm ${a.is_active ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggle(a)} style={{ minWidth: 'auto' }}>
                          {a.is_active ? <FiToggleRight size={15} /> : <FiToggleLeft size={15} />}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a)} style={{ minWidth: 'auto' }} title="حذف نهائي">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{editAdmin ? '✏️ تعديل حساب' : '👤 إضافة موظف جديد'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">الاسم الكامل *</label>
                <input className="form-input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="مثال: أحمد محمد" />
              </div>
              <div className="form-group">
                <label className="form-label">اسم المستخدم *</label>
                <input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="مثال: ahmed" style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>
              <div className="form-group">
                <label className="form-label">{editAdmin ? 'كلمة مرور جديدة (اتركها فارغة للإبقاء)' : 'كلمة المرور *'}</label>
                <input type="password" className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="6 أحرف على الأقل" />
              </div>
              <div className="form-group">
                <label className="form-label">رقم التليفون</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="مثال: 01012345678" style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>
              <div className="form-group">
                <label className="form-label">الصلاحية</label>
                <select className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="staff">👤 موظف — إضافة سيارات ومتابعة الحجوزات</option>
                  <option value="admin">👔 مسؤول — كل صلاحيات الموظف + الموافقة على الحجوزات</option>
                  <option value="super_admin">🛡️ مدير عام — كل الصلاحيات</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleSave}>{editAdmin ? 'حفظ التعديلات' : 'إنشاء الحساب'}</button>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>🔐 إعادة تعيين كلمة المرور</h3>
              <button className="btn-icon" onClick={() => setShowResetModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                إعادة تعيين كلمة مرور <strong>{showResetModal.full_name}</strong>
              </p>
              <div className="form-group">
                <label className="form-label">كلمة المرور الجديدة</label>
                <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="6 أحرف على الأقل" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleResetPassword}>تغيير كلمة المرور</button>
              <button className="btn btn-outline" onClick={() => setShowResetModal(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={confirmState.show}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState({ ...confirmState, show: false })}
      />
    </div>
  );
}
