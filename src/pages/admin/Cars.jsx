import { useState, useEffect, useRef, useMemo } from 'react';
import { FaPlus, FaTrash, FaCamera, FaStar, FaArrowUp, FaArrowDown, FaUndo, FaArchive, FaCar, FaCheckCircle, FaTools } from 'react-icons/fa';
import { FiEdit2, FiSearch, FiImage, FiX, FiTrash2, FiKey } from 'react-icons/fi';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  const [archivedCars, setArchivedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(null); // car object
  const [editCar, setEditCar] = useState(null);
  const [form, setForm] = useState({ make: '', model: '', year: 2024, color: '', plate_number: '', chassis_number: '', daily_rate: '', weekly_rate: '', monthly_rate: '', current_mileage: 0, oil_change_interval_km: 5000, notes: '' });
  const [imageLoading, setImageLoading] = useState(false);
  const fileRef = useRef();
  const galleryFileRef = useRef();

  // Confirm modal state
  const [confirmState, setConfirmState] = useState({ show: false, title: '', message: '', type: 'danger', onConfirm: null });

  useEffect(() => { fetchCars(); fetchArchivedCars(); }, []);

  const fetchCars = async () => {
    try {
      const { data } = await api.get('/api/cars', { params: { page_size: 100 } });
      setCars(data.items || []);
    } catch {
      setCars([]);
    } finally { setLoading(false); }
  };

  const fetchArchivedCars = async () => {
    try {
      const { data } = await api.get('/api/cars/archived', { params: { page_size: 100 } });
      setArchivedCars(data.items || []);
    } catch { setArchivedCars([]); }
  };

  const STATUS_MAP = {
    available: { label: 'متاحة', class: 'badge-success' },
    rented: { label: 'مؤجرة', class: 'badge-warning' },
    maintenance: { label: 'صيانة', class: 'badge-info' },
    retired: { label: 'محذوفة', class: 'badge-danger' },
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        weekly_rate: form.weekly_rate === '' || form.weekly_rate === 0 ? null : Number(form.weekly_rate),
        monthly_rate: form.monthly_rate === '' || form.monthly_rate === 0 ? null : Number(form.monthly_rate),
      };
      if (editCar) {
        await api.put(`/api/cars/${editCar.id}`, payload);
        toast.success('تم تحديث السيارة');
      } else {
        await api.post('/api/cars', payload);
        toast.success('تم إضافة السيارة');
      }
      setShowModal(false);
      setEditCar(null);
      fetchCars();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'حدث خطأ');
    }
  };

  const handleStatusChange = async (carId, newStatus) => {
    try {
      await api.patch(`/api/cars/${carId}/status`, { status: newStatus });
      toast.success('تم تحديث حالة السيارة');
      fetchCars();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'حدث خطأ');
    }
  };

  const handleDelete = (carId) => {
    setConfirmState({
      show: true,
      title: 'أرشفة السيارة',
      message: 'هل أنت متأكد من أرشفة هذه السيارة؟ ستنتقل إلى تبويب الأرشيف ويمكنك استعادتها لاحقاً.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/api/cars/${carId}`);
          toast.success('تم أرشفة السيارة ✅');
          fetchCars();
          fetchArchivedCars();
        } catch (err) {
          toast.error(err.response?.data?.detail || 'حدث خطأ');
        }
        setConfirmState({ ...confirmState, show: false });
      },
    });
  };

  const handleRestore = (carId, carName) => {
    setConfirmState({
      show: true,
      title: 'استعادة السيارة',
      message: `هل تريد استعادة ${carName} من الأرشيف وإعادتها للأسطول؟`,
      type: 'info',
      onConfirm: async () => {
        try {
          await api.patch(`/api/cars/${carId}/restore`);
          toast.success('تم استعادة السيارة ✅');
          fetchCars();
          fetchArchivedCars();
        } catch (err) {
          toast.error(err.response?.data?.detail || 'حدث خطأ');
        }
        setConfirmState({ ...confirmState, show: false });
      },
    });
  };

  const handlePermanentDelete = (carId, carName) => {
    setConfirmState({
      show: true,
      title: '⚠️ حذف نهائي',
      message: `هل أنت متأكد من حذف ${carName} نهائياً؟ \nسيتم حذف السيارة وكل صورها بشكل دائم ولن يمكن التراجع.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/api/cars/${carId}/permanent`);
          toast.success('تم الحذف النهائي 🗑️');
          fetchArchivedCars();
        } catch (err) {
          toast.error(err.response?.data?.detail || 'حدث خطأ');
        }
        setConfirmState({ ...confirmState, show: false });
      },
    });
  };

  const handleImageUpload = async (carId, files) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    try {
      setImageLoading(true);
      await api.post(`/api/cars/${carId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`تم رفع ${files.length} صورة`);
      fetchCars();
      if (showImageModal) {
        const { data } = await api.get(`/api/cars/${carId}`);
        setShowImageModal(data);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'خطأ في رفع الصور');
    } finally {
      setImageLoading(false);
    }
  };

  // ─── Image Management ───────────────────────────────────────
  const handleDeleteImage = (carId, imageIndex, imageName) => {
    setConfirmState({
      show: true,
      title: 'حذف الصورة',
      message: `هل أنت متأكد من حذف هذه الصورة؟ لن يمكن استرجاعها.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          setImageLoading(true);
          const { data } = await api.delete(`/api/cars/${carId}/images/${imageIndex}`);
          toast.success('تم حذف الصورة');
          setShowImageModal(data);
          fetchCars();
        } catch (err) {
          toast.error(err.response?.data?.detail || 'خطأ في حذف الصورة');
        } finally {
          setImageLoading(false);
          setConfirmState(prev => ({ ...prev, show: false }));
        }
      },
    });
  };

  const handleSetPrimary = async (carId, imageIndex) => {
    try {
      setImageLoading(true);
      const { data } = await api.patch(`/api/cars/${carId}/images/primary`, { image_index: imageIndex });
      toast.success('تم تعيين الصورة الرئيسية');
      setShowImageModal(data);
      fetchCars();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'خطأ');
    } finally {
      setImageLoading(false);
    }
  };

  const handleMoveImage = async (carId, fromIndex, direction) => {
    const images = [...(showImageModal?.images || [])];
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= images.length) return;
    const newOrder = images.map((_, i) => i);
    [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];
    try {
      setImageLoading(true);
      const { data } = await api.patch(`/api/cars/${carId}/images/reorder`, { order: newOrder });
      toast.success('تم إعادة الترتيب');
      setShowImageModal(data);
      fetchCars();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'خطأ');
    } finally {
      setImageLoading(false);
    }
  };

  const summary = useMemo(() => {
    const total = cars.length;
    const available = cars.filter(c => c.status === 'available').length;
    const rented = cars.filter(c => c.status === 'rented').length;
    const maintenance = cars.filter(c => c.status === 'maintenance').length;
    return { total, available, rented, maintenance };
  }, [cars]);

  const filtered = activeTab === 'active'
    ? cars.filter(c => `${c.make} ${c.model} ${c.plate_number} ${c.color}`.toLowerCase().includes(search.toLowerCase()))
    : archivedCars.filter(c => `${c.make} ${c.model} ${c.plate_number} ${c.color}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header flex-between">
        <div><h1>🚗 إدارة السيارات</h1><p>إدارة أسطول سيارات المراكبي</p></div>
        <button className="btn btn-primary" onClick={() => { setEditCar(null); setForm({ make: '', model: '', year: 2024, color: '', plate_number: '', chassis_number: '', daily_rate: '', weekly_rate: '', monthly_rate: '', current_mileage: 0, oil_change_interval_km: 5000, notes: '' }); setShowModal(true); }}>
          <FaPlus /> إضافة سيارة
        </button>
      </div>

      {/* Summary cards */}
      <div className="admin-summary">
        <div className="admin-summary-card">
          <div className="admin-summary-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><FaCar /></div>
          <div className="admin-summary-info">
            <div className="admin-summary-value">{summary.total}</div>
            <div className="admin-summary-label">إجمالي الأسطول</div>
          </div>
        </div>
        <div className="admin-summary-card">
          <div className="admin-summary-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><FaCheckCircle /></div>
          <div className="admin-summary-info">
            <div className="admin-summary-value">{summary.available}</div>
            <div className="admin-summary-label">متاحة للإيجار</div>
          </div>
        </div>
        <div className="admin-summary-card">
          <div className="admin-summary-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><FiKey size={20} /></div>
          <div className="admin-summary-info">
            <div className="admin-summary-value">{summary.rented}</div>
            <div className="admin-summary-label">مؤجرة حالياً</div>
          </div>
        </div>
        <div className="admin-summary-card">
          <div className="admin-summary-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}><FaTools /></div>
          <div className="admin-summary-info">
            <div className="admin-summary-value">{summary.maintenance}</div>
            <div className="admin-summary-label">في الصيانة</div>
          </div>
        </div>
        <div className="admin-summary-card">
          <div className="admin-summary-icon" style={{ background: 'rgba(107,114,128,0.12)', color: '#6b7280' }}><FaArchive /></div>
          <div className="admin-summary-info">
            <div className="admin-summary-value">{archivedCars.length}</div>
            <div className="admin-summary-label">في الأرشيف</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <FiSearch />
          <input type="text" placeholder="بحث بالماركة، الموديل، اللون، أو رقم اللوحة..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-pills">
          <button className={`filter-pill ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
            🚗 النشطة <span className="count">{cars.length}</span>
          </button>
          <button className={`filter-pill ${activeTab === 'archive' ? 'active' : ''}`} onClick={() => setActiveTab('archive')}>
            📦 الأرشيف <span className="count">{archivedCars.length}</span>
          </button>
        </div>
        <div className="admin-toolbar-spacer" />
        <span className="admin-toolbar-meta">{filtered.length} نتيجة</span>
      </div>

      {/* Cars Grid */}
      {loading ? (
        <div className="grid grid-3">{[1,2,3].map(i => <div className="skeleton" key={i} style={{ height: '300px', borderRadius: '16px' }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">{activeTab === 'active' ? '🚗' : '📦'}</div>
          <div className="admin-empty-title">{activeTab === 'active' ? 'لا توجد سيارات' : 'لا توجد سيارات في الأرشيف'}</div>
          <div className="admin-empty-text">{search ? 'جرّب تعديل البحث أو الفلتر' : 'ابدأ بإضافة أول سيارة لأسطولك'}</div>
        </div>
      ) : (
        <div className="grid grid-3">
          {filtered.map(car => (
            <div className="card" key={car.id} style={{ overflow: 'hidden', opacity: activeTab === 'archive' ? 0.85 : 1 }}>
              {/* Car Image */}
              <div style={{ height: '180px', background: 'linear-gradient(135deg, #f0f2f5, #e4e8ec)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}
                onClick={() => setShowImageModal(car)}>
                {car.images && car.images.length > 0 ? (
                  <img src={`/static/cars/${car.images[0]}`} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: activeTab === 'archive' ? 'grayscale(0.5)' : 'none' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <FiImage size={40} />
                    <p style={{ fontSize: '12px', marginTop: '8px' }}>لا توجد صور</p>
                  </div>
                )}
                {car.images && car.images.length > 1 && (
                  <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>
                    📷 {car.images.length}
                  </span>
                )}
                <span className={`badge ${activeTab === 'archive' ? 'badge-danger' : (STATUS_MAP[car.status]?.class || 'badge-primary')}`} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  {activeTab === 'archive' ? '📦 أرشيف' : (STATUS_MAP[car.status]?.label || car.status)}
                </span>
              </div>

              {/* Car Info */}
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{car.make} {car.model}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{car.year} · {car.color}</span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ fontSize: '18px', color: 'var(--accent)' }}>{Number(car.daily_rate).toLocaleString()}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>ج.م/يوم</span>
                    {car.weekly_rate > 0 && <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>أسبوعي: {Number(car.weekly_rate).toLocaleString()}</span>}
                    {car.monthly_rate > 0 && <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>شهري: {Number(car.monthly_rate).toLocaleString()}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <code style={{ background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>{car.plate_number}</code>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📏 {Number(car.current_mileage).toLocaleString()} كم</span>
                  {car.needs_oil_change && <span style={{ fontSize: '11px', color: 'var(--danger)' }}>⚠️ تغيير زيت</span>}
                </div>

                {/* Car Notes */}
                {car.notes && (
                  <div style={{ padding: '8px 10px', background: 'rgba(59,130,246,0.06)', borderRadius: '8px', borderRight: '3px solid var(--info)', marginBottom: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    📝 {car.notes.length > 60 ? car.notes.substring(0, 60) + '...' : car.notes}
                  </div>
                )}

                {activeTab === 'active' ? (
                  <>
                    {/* Status Control */}
                    <div style={{ marginBottom: '12px' }}>
                      <select className="form-input" value={car.status} onChange={e => handleStatusChange(car.id, e.target.value)}
                        style={{ fontSize: '12px', padding: '6px 10px', background: 'var(--bg-primary)' }}>
                        <option value="available">✅ متاحة</option>
                        <option value="rented">🔒 محجوزة</option>
                        <option value="maintenance">🔧 صيانة</option>
                      </select>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-sm btn-outline" style={{ flex: 1 }} onClick={() => { setEditCar(car); setForm({ make: car.make, model: car.model, year: car.year, color: car.color, plate_number: car.plate_number, chassis_number: car.chassis_number, daily_rate: car.daily_rate, weekly_rate: car.weekly_rate || '', monthly_rate: car.monthly_rate || '', current_mileage: car.current_mileage, oil_change_interval_km: car.oil_change_interval_km || 5000, notes: car.notes || '' }); setShowModal(true); }}>
                        <FiEdit2 size={13} /> تعديل
                      </button>
                      <button className="btn btn-sm btn-outline" onClick={() => { fileRef.current?.setAttribute('data-car-id', car.id); fileRef.current?.click(); }}>
                        <FaCamera size={13} />
                      </button>
                      <button className="btn btn-sm" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }} onClick={() => handleDelete(car.id)} title="أرشفة">
                        <FaArchive size={13} />
                      </button>
                    </div>
                  </>
                ) : (
                  /* Archive Actions */
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => handleRestore(car.id, `${car.make} ${car.model}`)}>
                      <FaUndo size={12} /> استعادة
                    </button>
                    <button className="btn btn-sm" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }} onClick={() => handlePermanentDelete(car.id, `${car.make} ${car.model}`)} title="حذف نهائي">
                      <FaTrash size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input for quick image upload */}
      <input type="file" ref={fileRef} hidden multiple accept="image/*" onChange={e => {
        const carId = fileRef.current?.getAttribute('data-car-id');
        if (carId && e.target.files.length) handleImageUpload(carId, e.target.files);
        e.target.value = '';
      }} />

      {/* Hidden file input for gallery upload */}
      <input type="file" ref={galleryFileRef} hidden multiple accept="image/*" onChange={e => {
        if (showImageModal && e.target.files.length) handleImageUpload(showImageModal.id, e.target.files);
        e.target.value = '';
      }} />

      {/* ─── Image Gallery Modal ───────────────────────────────── */}
      {showImageModal && (
        <div className="modal-overlay" onClick={() => { setShowImageModal(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>📷 صور {showImageModal.make} {showImageModal.model}</h3>
              <button className="btn-icon" onClick={() => { setShowImageModal(null); }} style={{ background: 'var(--bg-primary)' }}>✕</button>
            </div>
            <div className="modal-body">
              {imageLoading && (
                <div style={{ textAlign: 'center', padding: '12px', color: 'var(--accent)', fontSize: '14px', fontWeight: 600 }}>
                  ⏳ جاري التحديث...
                </div>
              )}

              {(!showImageModal.images || showImageModal.images.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                  <FiImage size={56} />
                  <p style={{ marginTop: '16px', fontSize: '15px' }}>لا توجد صور — ارفع صور للسيارة</p>
                </div>
              ) : (
                <div className="img-gallery-grid">
                  {showImageModal.images.map((img, i) => (
                    <div key={i} className="img-gallery-item">
                      <img src={`/static/cars/${img}`} alt={`صورة ${i+1}`} />

                      {/* Primary badge */}
                      {i === 0 && (
                        <span className="img-primary-badge">⭐ الرئيسية</span>
                      )}

                      {/* Image number */}
                      <span className="img-number-badge">{i + 1}</span>

                      {/* Action overlay */}
                      <div className="img-actions-overlay">
                        {/* Set as Primary */}
                        {i !== 0 && (
                          <button
                            className="img-action-btn primary-btn"
                            title="تعيين كرئيسية"
                            onClick={() => handleSetPrimary(showImageModal.id, i)}
                            disabled={imageLoading}
                          >
                            <FaStar size={14} />
                          </button>
                        )}

                        {/* Move Up */}
                        {i > 0 && (
                          <button
                            className="img-action-btn move-btn"
                            title="تحريك لأعلى"
                            onClick={() => handleMoveImage(showImageModal.id, i, 'up')}
                            disabled={imageLoading}
                          >
                            <FaArrowUp size={12} />
                          </button>
                        )}

                        {/* Move Down */}
                        {i < showImageModal.images.length - 1 && (
                          <button
                            className="img-action-btn move-btn"
                            title="تحريك لأسفل"
                            onClick={() => handleMoveImage(showImageModal.id, i, 'down')}
                            disabled={imageLoading}
                          >
                            <FaArrowDown size={12} />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          className="img-action-btn delete-btn"
                          title="حذف الصورة"
                          onClick={() => handleDeleteImage(showImageModal.id, i, img)}
                          disabled={imageLoading}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Car notes (from car itself) */}
              {showImageModal.notes && (
                <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(59,130,246,0.06)', borderRadius: '8px', borderRight: '3px solid var(--info)', fontSize: '13px' }}>
                  <strong style={{ fontSize: '11px', color: 'var(--info)' }}>📝 ملاحظات السيارة:</strong>
                  <p style={{ margin: '4px 0 0', whiteSpace: 'pre-line' }}>{showImageModal.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => galleryFileRef.current?.click()} disabled={imageLoading}>
                <FaCamera /> رفع صور جديدة
              </button>
              <button className="btn btn-outline" onClick={() => { setShowImageModal(null); }}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Car Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{editCar ? '✏️ تعديل سيارة' : '🚗 إضافة سيارة جديدة'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)} style={{ background: 'var(--bg-primary)' }}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group"><label className="form-label">الشركة المصنعة</label><input className="form-input" value={form.make} onChange={e => setForm({...form, make: e.target.value})} placeholder="مثال: تويوتا" /></div>
                <div className="form-group"><label className="form-label">الموديل</label><input className="form-input" value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="مثال: كامري" /></div>
                <div className="form-group"><label className="form-label">سنة الصنع</label><input type="number" className="form-input" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} /></div>
                <div className="form-group"><label className="form-label">اللون</label><input className="form-input" value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="مثال: أبيض" /></div>
                <div className="form-group"><label className="form-label">رقم اللوحة</label><input className="form-input" value={form.plate_number} onChange={e => setForm({...form, plate_number: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">رقم الشاسيه</label><input className="form-input" value={form.chassis_number} onChange={e => setForm({...form, chassis_number: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">السعر اليومي (ج.م) *</label><input type="number" className="form-input" value={form.daily_rate} onChange={e => setForm({...form, daily_rate: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">الكيلومترات</label><input type="number" className="form-input" value={form.current_mileage} onChange={e => setForm({...form, current_mileage: parseInt(e.target.value)})} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '4px' }}>
                <div className="form-group">
                  <label className="form-label">💰 سعر الأسبوع (ج.م) <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>اتركه فارغ = معطل</span></label>
                  <input type="number" className="form-input" value={form.weekly_rate} onChange={e => setForm({...form, weekly_rate: e.target.value})} placeholder="0 = معطل" />
                </div>
                <div className="form-group">
                  <label className="form-label">💰 سعر الشهر (ج.م) <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>اتركه فارغ = معطل</span></label>
                  <input type="number" className="form-input" value={form.monthly_rate} onChange={e => setForm({...form, monthly_rate: e.target.value})} placeholder="0 = معطل" />
                </div>
              </div>
              <div className="form-group"><label className="form-label">ملاحظات</label><textarea className="form-input" rows="2" value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleSave}>{editCar ? 'حفظ التعديلات' : 'إضافة السيارة'}</button>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        show={confirmState.show}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState({ ...confirmState, show: false })}
      />

      <style>{`
        .img-gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .img-gallery-item {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          aspect-ratio: 16/10;
          background: var(--bg-primary);
          border: 2px solid var(--border-light);
          transition: all 0.2s ease;
        }
        .img-gallery-item:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 20px rgba(230,30,90,0.15);
        }
        .img-gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .img-primary-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: linear-gradient(135deg, var(--gold), var(--gold-light));
          color: var(--primary-dark);
          padding: 3px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(212,168,67,0.4);
          z-index: 2;
        }
        .img-number-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0,0,0,0.5);
          color: white;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .img-actions-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
          padding: 30px 10px 10px;
          display: flex;
          gap: 6px;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .img-gallery-item:hover .img-actions-overlay {
          opacity: 1;
        }
        .img-action-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          backdrop-filter: blur(4px);
        }
        .img-action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .img-action-btn.primary-btn {
          background: rgba(212,168,67,0.9);
          color: #1a1a2e;
        }
        .img-action-btn.primary-btn:hover:not(:disabled) {
          background: var(--gold);
          transform: scale(1.1);
        }
        .img-action-btn.move-btn {
          background: rgba(255,255,255,0.2);
          color: white;
        }
        .img-action-btn.move-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.4);
          transform: scale(1.1);
        }
        .img-action-btn.delete-btn {
          background: rgba(239,68,68,0.85);
          color: white;
        }
        .img-action-btn.delete-btn:hover:not(:disabled) {
          background: var(--danger);
          transform: scale(1.1);
        }
        @media (max-width: 640px) {
          .img-gallery-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
