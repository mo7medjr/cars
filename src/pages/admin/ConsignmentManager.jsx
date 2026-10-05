import { useState, useEffect } from 'react';
import { FiSearch, FiCheck, FiX, FiTrash2, FiPhone, FiEye, FiChevronLeft, FiChevronRight, FiMaximize2 } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { waLink, telLink } from '../../config/siteConfig';
import ConfirmModal from '../../components/ConfirmModal';

const STATUS_MAP = {
  pending: { label: 'في الانتظار', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  approved: { label: 'تمت الموافقة', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  rejected: { label: 'مرفوض', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
};

/* ─── Image Gallery Lightbox ─────────────────────────────── */
function ImageGallery({ images, initialIndex = 0, onClose }) {
  const [idx, setIdx] = useState(initialIndex);
  const img = images[idx];

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        setIdx(i => e.key === 'ArrowRight' ? (i + 1) % images.length : (i - 1 + images.length) % images.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images.length, onClose]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }}>
      {/* Counter */}
      <div style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        color: 'white', fontSize: 13, fontWeight: 600, padding: '6px 16px',
        background: 'rgba(255,255,255,0.1)', borderRadius: 20, backdropFilter: 'blur(10px)',
      }}>{idx + 1} / {images.length}</div>

      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16, width: 40, height: 40,
        borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(10px)',
      }}><FiX size={18} /></button>

      {/* Nav */}
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
            style={{
              position: 'absolute', left: 16, width: 44, height: 44, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)',
              color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', backdropFilter: 'blur(10px)',
            }}><FiChevronLeft size={20} /></button>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
            style={{
              position: 'absolute', right: 16, width: 44, height: 44, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)',
              color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', backdropFilter: 'blur(10px)',
            }}><FiChevronRight size={20} /></button>
        </>
      )}

      {/* Image */}
      <img onClick={e => e.stopPropagation()} src={`/static/consignment/${img}`}
        alt="" style={{
          maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain',
          borderRadius: 12, transition: 'all 0.3s',
        }} />
    </div>
  );
}

export default function ConsignmentManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type, id, name }
  const [gallery, setGallery] = useState(null); // { images, index }
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/consignment');
      setItems(data.items || []);
      setPendingCount(data.pending_count || 0);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try {
      const fd = new FormData();
      fd.append('admin_notes', '');
      await api.patch(`/api/consignment/${id}/approve`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('تمت الموافقة — السيارة اتضافت في صفحة البيع ✅');
      fetchAll();
      setSelected(null);
      setConfirmAction(null);
    } catch (err) { toast.error(err.response?.data?.detail || 'حدث خطأ'); }
  };

  const handleReject = async (id) => {
    try {
      const fd = new FormData();
      fd.append('admin_notes', '');
      await api.patch(`/api/consignment/${id}/reject`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('تم رفض الطلب');
      fetchAll();
      setSelected(null);
      setConfirmAction(null);
    } catch { toast.error('حدث خطأ'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/consignment/${id}`);
      toast.success('تم الحذف');
      fetchAll();
      setConfirmAction(null);
    } catch { toast.error('حدث خطأ'); }
  };

  const filtered = items.filter(c => {
    if (filter && c.status !== filter) return false;
    if (search) {
      const t = search.toLowerCase();
      return c.owner_name?.toLowerCase().includes(t) || c.make?.toLowerCase().includes(t) || c.model?.toLowerCase().includes(t) || c.owner_phone?.includes(t);
    }
    return true;
  });

  return (
    <div className="consignment-manager">
      <div className="page-header flex-between">
        <div>
          <h1>📥 طلبات بيع سيارات</h1>
          <p>"بيع سيارتك عندنا" — طلبات العملاء</p>
        </div>
        {pendingCount > 0 && (
          <div style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '8px 18px', borderRadius: 50, fontWeight: 700, fontSize: 14, border: '1px solid rgba(245,158,11,0.2)' }}>
            ⏳ {pendingCount} طلب في الانتظار
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, padding: '12px 16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <FiSearch size={16} style={{ color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="ابحث بالاسم أو الماركة أو الرقم..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', padding: 0, flex: 1, minWidth: 200 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ v: '', l: 'الكل' }, { v: 'pending', l: '⏳ الانتظار' }, { v: 'approved', l: '✅ موافق' }, { v: 'rejected', l: '❌ مرفوض' }].map(f => (
              <button key={f.v} className={`btn btn-sm ${filter === f.v ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f.v)} style={{ fontSize: 12 }}>{f.l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'grid', gap: 12 }}>{[1,2,3].map(i => <div className="skeleton" key={i} style={{ height: 70, borderRadius: 12 }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48 }}>📥</div>
          <h3>لا توجد طلبات</h3>
          <p style={{ color: 'var(--text-muted)' }}>لم يصل أي طلب بيع سيارة بعد</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>الصورة</th>
                <th>السيارة</th>
                <th>صاحب السيارة</th>
                <th>السعر</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const st = STATUS_MAP[c.status] || STATUS_MAP.pending;
                return (
                  <tr key={c.id}>
                    <td>
                      {c.images?.[0] ? (
                        <img src={`/static/consignment/${c.images[0]}`} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                      ) : (
                        <div style={{ width: 56, height: 40, borderRadius: 8, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚘</div>
                      )}
                    </td>
                    <td>
                      <strong style={{ fontSize: 14 }}>{c.make} {c.model}</strong>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.year} • {c.color}</div>
                    </td>
                    <td>
                      <strong style={{ fontSize: 13 }}>{c.owner_name}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.owner_phone}</div>
                    </td>
                    <td><strong style={{ color: 'var(--success)' }}>{Number(c.price).toLocaleString()} ج.م</strong></td>
                    <td><span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.created_at ? new Date(c.created_at).toLocaleDateString('ar-EG') : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-icon" title="عرض التفاصيل" onClick={() => { setSelected(c); setActiveImgIdx(0); }}><FiEye size={14} /></button>
                        {c.status === 'pending' && (
                          <>
                            <button className="btn-icon" style={{ color: '#10b981' }} title="موافقة"
                              onClick={() => setConfirmAction({ type: 'approve', id: c.id, name: `${c.make} ${c.model} ${c.year}` })}><FiCheck size={14} /></button>
                            <button className="btn-icon" style={{ color: '#ef4444' }} title="رفض"
                              onClick={() => setConfirmAction({ type: 'reject', id: c.id, name: `${c.make} ${c.model} ${c.year}` })}><FiX size={14} /></button>
                          </>
                        )}
                        <button className="btn-icon" style={{ color: 'var(--danger)' }} title="حذف"
                          onClick={() => setConfirmAction({ type: 'delete', id: c.id, name: `${c.make} ${c.model} ${c.year}` })}><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Premium Detail Modal ──────────────────────────────── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)} style={{ zIndex: 200 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            maxWidth: 650, maxHeight: '92vh', overflowY: 'auto',
            borderRadius: 20, padding: 0,
          }}>
            {/* Hero Image Section */}
            {selected.images?.length > 0 ? (
              <div style={{ position: 'relative', height: 260, overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
                <img
                  src={`/static/consignment/${selected.images[activeImgIdx]}`} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s' }}
                />
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                }} />

                {/* Expand button */}
                <button onClick={() => setGallery({ images: selected.images, index: activeImgIdx })}
                  style={{
                    position: 'absolute', top: 12, left: 12, width: 36, height: 36,
                    borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                    color: 'white', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}><FiMaximize2 size={14} /></button>

                {/* Status badge */}
                {(() => {
                  const st = STATUS_MAP[selected.status] || STATUS_MAP.pending;
                  return (
                    <span style={{
                      position: 'absolute', top: 12, right: 12,
                      padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700,
                      background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                      backdropFilter: 'blur(8px)',
                    }}>{st.label}</span>
                  );
                })()}

                {/* Car name overlay */}
                <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, color: 'white' }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                    {selected.make} {selected.model} {selected.year}
                  </h2>
                  <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>
                    {Number(selected.price).toLocaleString()} <span style={{ fontSize: 14, opacity: 0.8 }}>ج.م</span>
                  </div>
                </div>

                {/* Thumbnail strip */}
                {selected.images.length > 1 && (
                  <div style={{
                    position: 'absolute', bottom: 12, right: 16,
                    display: 'flex', gap: 4,
                  }}>
                    {selected.images.map((img, i) => (
                      <div key={i} onClick={(e) => { e.stopPropagation(); setActiveImgIdx(i); }}
                        style={{
                          width: 40, height: 30, borderRadius: 6, overflow: 'hidden',
                          border: `2px solid ${i === activeImgIdx ? 'white' : 'rgba(255,255,255,0.3)'}`,
                          cursor: 'pointer', transition: 'all 0.2s',
                          opacity: i === activeImgIdx ? 1 : 0.6,
                        }}>
                        <img src={`/static/consignment/${img}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* No images header */
              <div style={{
                height: 120, background: 'linear-gradient(135deg, #1a1a3e 0%, #2e2a5e 100%)',
                borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center',
                justifyContent: 'center', position: 'relative',
              }}>
                <div style={{ fontSize: 48 }}>🚘</div>
                <div style={{ position: 'absolute', bottom: 16, left: 20, color: 'white' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{selected.make} {selected.model} {selected.year}</h2>
                </div>
                {/* Close btn */}
                <button className="btn-icon" onClick={() => setSelected(null)} style={{
                  position: 'absolute', top: 12, left: 12, color: 'white', background: 'rgba(255,255,255,0.15)',
                }}><FiX size={16} /></button>
              </div>
            )}

            {/* Body */}
            <div style={{ padding: '20px 24px' }}>
              {/* Owner Section */}
              <div style={{
                background: 'var(--bg-primary)', borderRadius: 14, padding: '16px 18px',
                marginBottom: 16, border: '1px solid var(--border-light)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>👤 صاحب السيارة</div>
                    <strong style={{ fontSize: 16 }}>{selected.owner_name}</strong>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', direction: 'ltr', textAlign: 'right', marginTop: 2 }}>{selected.owner_phone}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a href={`${waLink(selected.owner_phone)}?text=${encodeURIComponent(`مرحباً ${selected.owner_name}، بخصوص سيارة ${selected.display_name} اللي سجلتها للبيع عندنا...`)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        width: 40, height: 40, borderRadius: 12, background: '#25d366', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(37,211,102,0.3)',
                      }}><FaWhatsapp size={18} /></a>
                    <a href={telLink(selected.owner_phone)}
                      style={{
                        width: 40, height: 40, borderRadius: 12, background: 'var(--accent)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(230,30,90,0.3)',
                      }}><FiPhone size={16} /></a>
                  </div>
                </div>
              </div>

              {/* Car Specs Grid */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>🚗 مواصفات السيارة</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { label: 'الماركة', value: selected.make, icon: '🏷️' },
                    { label: 'الموديل', value: selected.model, icon: '📋' },
                    { label: 'السنة', value: selected.year, icon: '📅' },
                    { label: 'اللون', value: selected.color || '—', icon: '🎨' },
                    { label: 'الكيلومترات', value: selected.mileage > 0 ? `${Number(selected.mileage).toLocaleString()} كم` : '—', icon: '🛣️' },
                    { label: 'السعر المطلوب', value: `${Number(selected.price).toLocaleString()} ج.م`, icon: '💰', highlight: true },
                  ].map((spec, i) => (
                    <div key={i} style={{
                      background: spec.highlight ? 'rgba(16,185,129,0.06)' : 'var(--bg-primary)',
                      borderRadius: 12, padding: '12px 14px',
                      border: spec.highlight ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--border-light)',
                    }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>{spec.icon} {spec.label}</span>
                      <div style={{
                        fontWeight: 700, fontSize: spec.highlight ? 16 : 14, marginTop: 2,
                        color: spec.highlight ? 'var(--success)' : 'var(--text-primary)',
                      }}>{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {selected.description && (
                <div style={{
                  background: 'var(--bg-primary)', borderRadius: 12, padding: '14px 16px',
                  marginBottom: 16, border: '1px solid var(--border-light)',
                }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>📝 الوصف</span>
                  <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'var(--text-secondary)' }}>{selected.description}</div>
                </div>
              )}

              {/* Date */}
              {selected.created_at && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 8 }}>
                  📅 تاريخ الطلب: {new Date(selected.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {selected.status === 'pending' && (
              <div style={{
                padding: '16px 24px', borderTop: '1px solid var(--border-light)',
                display: 'flex', gap: 10, justifyContent: 'center',
                background: 'var(--bg-primary)', borderRadius: '0 0 20px 20px',
              }}>
                <button className="btn" onClick={() => setConfirmAction({ type: 'reject', id: selected.id, name: selected.display_name })}
                  style={{
                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.2)', fontWeight: 700,
                    padding: '10px 28px', borderRadius: 12, fontSize: 14,
                    transition: 'all 0.2s', cursor: 'pointer',
                  }}>
                  ❌ رفض الطلب
                </button>
                <button className="btn btn-primary" onClick={() => setConfirmAction({ type: 'approve', id: selected.id, name: selected.display_name })}
                  style={{
                    padding: '10px 28px', borderRadius: 12, fontSize: 14,
                    fontWeight: 700, boxShadow: '0 4px 15px rgba(230,30,90,0.3)',
                    transition: 'all 0.2s',
                  }}>
                  ✅ موافقة وإضافة للبيع
                </button>
              </div>
            )}

            {/* Close button for non-hero images */}
            {selected.images?.length > 0 && (
              <button className="btn-icon" onClick={() => setSelected(null)} style={{
                position: 'absolute', top: 12, left: 12, color: 'white',
                background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                width: 36, height: 36, borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.2)',
              }}><FiX size={16} /></button>
            )}
          </div>
        </div>
      )}

      {/* Confirm Modal — replaces browser confirm() */}
      {confirmAction && (
        <ConfirmModal
          show={true}
          title={
            confirmAction.type === 'approve' ? 'الموافقة على الطلب' :
            confirmAction.type === 'reject' ? 'رفض الطلب' : 'حذف الطلب'
          }
          message={
            confirmAction.type === 'approve'
              ? `هل تريد الموافقة على طلب بيع "${confirmAction.name}"؟\nالسيارة هتتضاف تلقائياً في صفحة البيع.`
              : confirmAction.type === 'reject'
              ? `هل تريد رفض طلب بيع "${confirmAction.name}"؟`
              : `هل أنت متأكد من حذف طلب "${confirmAction.name}" نهائياً؟`
          }
          confirmText={
            confirmAction.type === 'approve' ? '✅ موافقة' :
            confirmAction.type === 'reject' ? '❌ رفض' : '🗑️ حذف'
          }
          type={confirmAction.type === 'approve' ? 'success' : 'danger'}
          onConfirm={() => {
            if (confirmAction.type === 'approve') handleApprove(confirmAction.id);
            else if (confirmAction.type === 'reject') handleReject(confirmAction.id);
            else handleDelete(confirmAction.id);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Image Gallery Lightbox */}
      {gallery && (
        <ImageGallery
          images={gallery.images}
          initialIndex={gallery.index}
          onClose={() => setGallery(null)}
        />
      )}
    </div>
  );
}
