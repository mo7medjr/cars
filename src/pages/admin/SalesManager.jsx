import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiStar } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import api from '../../api/client';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  available: { label: 'متاحة', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  reserved: { label: 'محجوزة', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
};

export default function SalesManager() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | car object
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    make: '', model: '', year: new Date().getFullYear(), price: '', old_price: '',
    color: '', mileage: '', fuel_type: '', transmission: '', engine_size: '',
    description: '', features: '', featured: false, contact_phone: '', status: 'available',
  });
  const [newImages, setNewImages] = useState([]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [carsRes, statsRes] = await Promise.all([
        api.get('/api/sales'),
        api.get('/api/sales/stats/summary'),
      ]);
      setCars(carsRes.data.items || []);
      setStats(statsRes.data);
    } catch { setCars([]); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm({
      make: '', model: '', year: new Date().getFullYear(), price: '', old_price: '',
      color: '', mileage: '', fuel_type: '', transmission: '', engine_size: '',
      description: '', features: '', featured: false, contact_phone: '', status: 'available',
    });
    setNewImages([]);
    setModal('add');
  };

  const openEdit = (car) => {
    setForm({
      make: car.make, model: car.model, year: car.year, price: car.price, old_price: car.old_price || '',
      color: car.color, mileage: car.mileage || '', fuel_type: car.fuel_type, transmission: car.transmission,
      engine_size: car.engine_size, description: car.description, features: car.features,
      featured: car.featured, contact_phone: car.contact_phone || '', status: car.status,
    });
    setNewImages([]);
    setModal(car);
  };

  const handleSave = async () => {
    if (!form.make || !form.model) {
      toast.error('أدخل الماركة والموديل'); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('make', form.make);
      fd.append('model', form.model);
      fd.append('year', form.year);
      if (form.price) fd.append('price', form.price);
      else fd.append('price', 0);
      if (form.old_price) fd.append('old_price', form.old_price);
      fd.append('color', form.color);
      if (form.mileage) fd.append('mileage', form.mileage);
      fd.append('fuel_type', form.fuel_type);
      fd.append('transmission', form.transmission);
      fd.append('engine_size', form.engine_size);
      fd.append('description', form.description);
      fd.append('features', form.features);
      fd.append('featured', form.featured);
      fd.append('contact_phone', form.contact_phone);
      if (modal !== 'add') fd.append('status', form.status);

      if (modal === 'add') {
        for (const f of newImages) fd.append('images', f);
        await api.post('/api/sales', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('تم إضافة السيارة ✅');
      } else {
        for (const f of newImages) fd.append('new_images', f);
        await api.patch(`/api/sales/${modal.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('تم تحديث السيارة ✅');
      }
      setModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'حدث خطأ');
    } finally { setSaving(false); }
  };

  const handleDelete = async (car) => {
    if (!confirm(`حذف "${car.display_name}" نهائياً؟`)) return;
    try {
      await api.delete(`/api/sales/${car.id}`);
      toast.success('تم الحذف ✅');
      fetchAll();
    } catch { toast.error('حدث خطأ'); }
  };

  const handleDeleteImage = async (car, imgName) => {
    try {
      await api.delete(`/api/sales/${car.id}/images/${imgName}`);
      toast.success('تم حذف الصورة');
      fetchAll();
    } catch { toast.error('حدث خطأ'); }
  };

  const handleReorderImages = async (car, fromIdx, toIdx) => {
    const imgs = [...car.images];
    const [moved] = imgs.splice(fromIdx, 1);
    imgs.splice(toIdx, 0, moved);
    try {
      await api.patch(`/api/sales/${car.id}/images/reorder`, { images: imgs });
      toast.success('تم ترتيب الصور');
      // Update modal with new order
      setModal({ ...car, images: imgs });
      fetchAll();
    } catch { toast.error('حدث خطأ'); }
  };

  const filtered = cars.filter(c => {
    const t = search.toLowerCase();
    return !t || c.make?.toLowerCase().includes(t) || c.model?.toLowerCase().includes(t);
  });

  return (
    <div className="sales-manager">
      {/* Header */}
      <div className="page-header flex-between">
        <div>
          <h1>🏷️ سيارات للبيع</h1>
          <p>إدارة السيارات المعروضة للبيع</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus size={16} /> إضافة سيارة للبيع</button>
      </div>

      {/* Summary cards */}
      {stats && (
        <div className="admin-summary">
          <div className="admin-summary-card">
            <div className="admin-summary-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><FaCar /></div>
            <div className="admin-summary-info">
              <div className="admin-summary-value">{stats.total_for_sale}</div>
              <div className="admin-summary-label">إجمالي المعروض</div>
            </div>
          </div>
          <div className="admin-summary-card">
            <div className="admin-summary-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><FaCar /></div>
            <div className="admin-summary-info">
              <div className="admin-summary-value">{stats.available_for_sale}</div>
              <div className="admin-summary-label">متاحة للبيع</div>
            </div>
          </div>
          <div className="admin-summary-card">
            <div className="admin-summary-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><FaCar /></div>
            <div className="admin-summary-info">
              <div className="admin-summary-value">{stats.reserved_for_sale}</div>
              <div className="admin-summary-label">محجوزة</div>
            </div>
          </div>
          <div className="admin-summary-card">
            <div className="admin-summary-icon" style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}><FiStar /></div>
            <div className="admin-summary-info">
              <div className="admin-summary-value">{stats.featured_for_sale}</div>
              <div className="admin-summary-label">مميزة</div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <FiSearch />
          <input type="text" placeholder="ابحث بالماركة أو الموديل..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="admin-toolbar-spacer" />
        <span className="admin-toolbar-meta">{filtered.length} نتيجة</span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'grid', gap: 12 }}>{[1,2,3].map(i => <div className="skeleton" key={i} style={{ height: 60, borderRadius: 12 }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">🏷️</div>
          <div className="admin-empty-title">لا توجد سيارات للبيع</div>
          <div className="admin-empty-text">أضف أول سيارة معروضة للبيع</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}><FiPlus /> إضافة سيارة</button>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>الصورة</th>
                <th>السيارة</th>
                <th>السعر</th>
                <th>الكيلومترات</th>
                <th>الحالة</th>
                <th>مميزة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(car => {
                const st = STATUS_MAP[car.status] || STATUS_MAP.available;
                return (
                  <tr key={car.id}>
                    <td>
                      {car.images?.[0] ? (
                        <img src={`/static/sales/${car.images[0]}`} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                      ) : (
                        <div style={{ width: 56, height: 40, borderRadius: 8, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚘</div>
                      )}
                    </td>
                    <td>
                      <strong style={{ fontSize: 14 }}>{car.make} {car.model}</strong>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{car.year} • {car.color}</div>
                    </td>
                    <td>
                      {car.has_discount && <div style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 11 }}>{Number(car.old_price).toLocaleString()}</div>}
                      {car.price > 0 ? (
                        <strong style={{ color: 'var(--success)' }}>{Number(car.price).toLocaleString()} ج.م</strong>
                      ) : (
                        <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>تواصل لمعرفة السعر</span>
                      )}
                    </td>
                    <td style={{ fontSize: 13 }}>{car.mileage > 0 ? `${Number(car.mileage).toLocaleString()} كم` : '—'}</td>
                    <td><span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span></td>
                    <td style={{ fontSize: 18, textAlign: 'center' }}>{car.featured ? '⭐' : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" onClick={() => openEdit(car)}><FiEdit2 size={14} /></button>
                        <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(car)}><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)} style={{ zIndex: 200 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{modal === 'add' ? '➕ إضافة سيارة للبيع' : '✏️ تعديل سيارة'}</h3>
              <button className="btn-icon" onClick={() => setModal(null)}><FiX size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="grid grid-3" style={{ gap: 12, marginBottom: 12 }}>
                <div className="form-group"><label className="form-label">الماركة *</label><input className="form-input" value={form.make} onChange={e => setForm({...form, make: e.target.value})} placeholder="تويوتا" /></div>
                <div className="form-group"><label className="form-label">الموديل *</label><input className="form-input" value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="كامري" /></div>
                <div className="form-group"><label className="form-label">السنة *</label><input className="form-input" type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} /></div>
              </div>
              <div className="grid grid-3" style={{ gap: 12, marginBottom: 12 }}>
                <div className="form-group"><label className="form-label">السعر (ج.م) <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>اختياري</span></label><input className="form-input" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="اتركه فارغاً لعرض: تواصل لمعرفة السعر" /></div>
                <div className="form-group"><label className="form-label">السعر قبل الخصم</label><input className="form-input" type="number" value={form.old_price} onChange={e => setForm({...form, old_price: e.target.value})} placeholder="اختياري" /></div>
                <div className="form-group"><label className="form-label">اللون</label><input className="form-input" value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="أبيض" /></div>
              </div>
              <div className="grid grid-4" style={{ gap: 12, marginBottom: 12 }}>
                <div className="form-group"><label className="form-label">الكيلومترات</label><input className="form-input" type="number" value={form.mileage} onChange={e => setForm({...form, mileage: e.target.value})} placeholder="50000" /></div>
                <div className="form-group"><label className="form-label">الوقود</label><select className="form-input" value={form.fuel_type} onChange={e => setForm({...form, fuel_type: e.target.value})}><option value="">اختر</option><option>بنزين</option><option>ديزل</option><option>غاز</option><option>كهرباء</option><option>هايبريد</option></select></div>
                <div className="form-group"><label className="form-label">ناقل الحركة</label><select className="form-input" value={form.transmission} onChange={e => setForm({...form, transmission: e.target.value})}><option value="">اختر</option><option value="automatic">أوتوماتيك</option><option value="manual">مانيوال</option></select></div>
                <div className="form-group"><label className="form-label">حجم المحرك</label><input className="form-input" value={form.engine_size} onChange={e => setForm({...form, engine_size: e.target.value})} placeholder="1600cc" /></div>
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">المواصفات (اكتب كل المواصفات هنا)</label>
                <textarea className="form-input" rows={4} value={form.features} onChange={e => setForm({...form, features: e.target.value})} placeholder="فتحة سقف&#10;كاميرا خلفية&#10;حساسات ركن&#10;شاشة تاتش&#10;..." style={{ resize: 'vertical' }} />
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">وصف إضافي</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="سيارة بحالة ممتازة — مالك أول — بدون حوادث..." style={{ resize: 'vertical' }} />
              </div>

              <div className="grid grid-2" style={{ gap: 12, marginBottom: 12 }}>
                <div className="form-group"><label className="form-label">رقم تواصل خاص (اختياري)</label><input className="form-input" value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} placeholder="لو غير الرقم الأساسي" /></div>
                {modal !== 'add' && (
                  <div className="form-group"><label className="form-label">الحالة</label><select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="available">متاحة</option><option value="reserved">محجوزة</option></select></div>
                )}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} />
                  ⭐ سيارة مميزة (تظهر في الأول)
                </label>
              </div>

              {/* Current images */}
              {modal !== 'add' && modal.images?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <label className="form-label">الصور الحالية <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(اسحب لتغيير الترتيب)</span></label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {modal.images.map((img, i) => (
                      <div key={img} draggable
                        onDragStart={e => e.dataTransfer.setData('dragIdx', i)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); handleReorderImages(modal, parseInt(e.dataTransfer.getData('dragIdx')), i); }}
                        style={{ position: 'relative', cursor: 'grab', border: '2px solid transparent', borderRadius: 10, transition: 'border 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                      >
                        <img src={`/static/sales/${img}`} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                        <span style={{ position: 'absolute', bottom: 2, left: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 4 }}>{i + 1}</span>
                        <button onClick={() => handleDeleteImage(modal, img)} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload images */}
              <div className="form-group">
                <label className="form-label">رفع صور</label>
                <input type="file" ref={fileRef} accept="image/*" multiple onChange={e => setNewImages([...e.target.files])} style={{ display: 'none' }} />
                <button className="btn btn-outline" onClick={() => fileRef.current?.click()}>
                  <FiImage size={14} /> اختر صور {newImages.length > 0 && `(${newImages.length})`}
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>إلغاء</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳' : modal === 'add' ? '➕' : '💾'} {modal === 'add' ? 'إضافة' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
