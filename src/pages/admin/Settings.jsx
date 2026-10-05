import { useState, useEffect, useRef } from 'react';
import { FiSave, FiRefreshCw, FiUpload, FiPhone, FiMail, FiMapPin, FiGlobe } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoRef = useRef(null);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/api/settings');
      setSettings(data);
    } catch { toast.error('خطأ في تحميل الإعدادات'); }
    finally { setLoading(false); }
  };

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/settings', settings);
      toast.success('تم حفظ الإعدادات بنجاح ✅');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'خطأ في الحفظ');
    } finally { setSaving(false); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('الملف يجب أن يكون صورة'); return; }
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/api/settings/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('تم تحديث الشعار ✅');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'خطأ في رفع الشعار');
    } finally { setLogoUploading(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>⏳ جاري التحميل...</div>;
  if (!settings) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>خطأ في تحميل الإعدادات</div>;

  const wallets = settings.wallets || [];
  const WALLET_TYPES = [
    { value: 'vodafone_cash', label: 'فودافون كاش', color: '#e60000', logo: '/vodafone-cash.png' },
    { value: 'instapay', label: 'إنستاباي', color: '#1B3A8C', logo: '/instapay.png' },
    { value: 'other', label: 'أخرى', color: '#6b7280', logo: '' },
  ];

  const updateWallet = (idx, key, val) => {
    const w = [...wallets];
    w[idx] = { ...w[idx], [key]: val };
    if (key === 'type') {
      const t = WALLET_TYPES.find(wt => wt.value === val);
      if (t) w[idx].label = t.label;
    }
    update('wallets', w);
  };
  const addWallet = () => update('wallets', [...wallets, { type: 'vodafone_cash', label: 'فودافون كاش', number: '', name: '', qr: '' }]);
  const removeWallet = (idx) => update('wallets', wallets.filter((_, i) => i !== idx));
  const handleQrUpload = async (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('wallet_index', idx);
    try {
      const { data } = await api.post('/api/settings/wallet-qr', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateWallet(idx, 'qr', data.qr_url);
      toast.success('تم رفع QR Code ✅');
    } catch { toast.error('خطأ في رفع QR'); }
  };

  const sections = [
    {
      title: '🏢 بيانات الشركة',
      icon: <FiGlobe />,
      fields: [
        { key: 'company_name', label: 'اسم الشركة (عربي)', placeholder: 'المراكبي' },
        { key: 'company_name_en', label: 'اسم الشركة (إنجليزي)', placeholder: 'Al-Marakby' },
        { key: 'company_slogan', label: 'الشعار النصي', placeholder: 'لتجارة وإيجار السيارات' },
      ]
    },
    {
      title: '📞 أرقام التواصل',
      icon: <FiPhone />,
      fields: [
        { key: 'whatsapp1', label: 'واتساب 1', placeholder: '01XXXXXXXXX', icon: <FaWhatsapp size={14} style={{ color: '#25d366' }} /> },
        { key: 'whatsapp2', label: 'واتساب 2', placeholder: '01XXXXXXXXX', icon: <FaWhatsapp size={14} style={{ color: '#25d366' }} /> },
        { key: 'phone1', label: 'تليفون 1', placeholder: '01XXXXXXXXX', icon: <FiPhone size={14} /> },
        { key: 'phone2', label: 'تليفون 2', placeholder: '01XXXXXXXXX', icon: <FiPhone size={14} /> },
      ]
    },
    {
      title: '📍 العناوين والتواصل',
      icon: <FiMapPin />,
      fields: [
        { key: 'email', label: 'البريد الإلكتروني', placeholder: 'info@example.com', icon: <FiMail size={14} /> },
        { key: 'address1', label: 'العنوان الأول (المعرض)', placeholder: 'العنوان الكامل', icon: <FiMapPin size={14} /> },
        { key: 'address1_map', label: 'رابط خرائط العنوان الأول', placeholder: 'https://maps.app.goo.gl/...' },
        { key: 'address2', label: 'العنوان الثاني (المكتب)', placeholder: 'العنوان الكامل', icon: <FiMapPin size={14} /> },
        { key: 'address2_map', label: 'رابط خرائط العنوان الثاني', placeholder: 'https://maps.app.goo.gl/...' },
      ]
    },
    {
      title: '🌐 السوشيال ميديا',
      icon: <FaFacebook />,
      fields: [
        { key: 'facebook', label: 'فيسبوك (الرابط)', placeholder: 'https://facebook.com/...', icon: <FaFacebook size={14} style={{ color: '#1877f2' }} /> },
        { key: 'instagram', label: 'انستجرام (الرابط)', placeholder: 'https://instagram.com/...', icon: <FaInstagram size={14} style={{ color: '#e4405f' }} /> },
        { key: 'tiktok', label: 'تيك توك (الرابط)', placeholder: 'https://tiktok.com/...', icon: <FaTiktok size={14} /> },
      ]
    },
    {
      title: '💳 العربون والدفع',
      icon: null,
      fields: [
        { key: 'deposit_daily', label: 'عربون الإيجار اليومي (ج.م)', placeholder: '500', type: 'number' },
        { key: 'deposit_weekly', label: 'عربون الإيجار الأسبوعي (ج.م)', placeholder: '1000', type: 'number' },
        { key: 'deposit_monthly', label: 'عربون الإيجار الشهري (ج.م)', placeholder: '2000', type: 'number' },
      ],
      customContent: 'wallets',
    },
    {
      title: '📜 النصوص القانونية',
      icon: null,
      fields: [
        { key: 'contract_terms', label: 'شروط العقد', placeholder: 'شروط وأحكام الإيجار...', type: 'textarea' },
        { key: 'rental_policy', label: 'سياسة الإيجار', placeholder: 'سياسة الإيجار والاسترجاع...', type: 'textarea' },
      ]
    },
  ];

  return (
    <div>
      <div className="page-header flex-between">
        <div><h1>⚙️ الإعدادات</h1><p>إعدادات الموقع وبيانات الشركة</p></div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? '⏳ جاري الحفظ...' : <><FiSave size={16} /> حفظ جميع الإعدادات</>}
        </button>
      </div>

      {/* Logo Upload */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-light)', flexShrink: 0, overflow: 'hidden' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
          </div>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px' }}>شعار الشركة</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>يظهر في الموقع والعقود والإيصالات. يفضل صورة PNG شفافة.</span>
          </div>
          <button className="btn btn-sm btn-outline" onClick={() => logoRef.current?.click()} disabled={logoUploading}>
            {logoUploading ? '⏳' : <FiUpload size={14} />} {logoUploading ? 'جاري الرفع...' : 'تغيير الشعار'}
          </button>
          <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Settings Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sections.map((section, si) => (
          <div className="card" key={si}>
            <div className="card-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{section.title}</h3>
            </div>
            <div className="card-body">
              {section.fields.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: section.fields.some(f => f.type === 'textarea') ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {section.fields.map(field => (
                  <div key={field.key} className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {field.icon} {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="form-input"
                        value={settings[field.key] || ''}
                        onChange={e => update(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        style={{ minHeight: '100px', resize: 'vertical', lineHeight: 1.8 }}
                      />
                    ) : (
                      <input
                        className="form-input"
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={settings[field.key] ?? ''}
                        onChange={e => update(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                        placeholder={field.placeholder}
                        style={{ direction: field.key.includes('phone') || field.key.includes('whatsapp') || field.key.includes('_map') || field.type === 'number' ? 'ltr' : 'rtl', textAlign: field.key.includes('phone') || field.key.includes('whatsapp') || field.key.includes('_map') || field.type === 'number' ? 'left' : 'right' }}
                      />
                    )}
                  </div>
                ))}
              </div>
              )}

              {/* Wallets Manager */}
              {section.customContent === 'wallets' && (
                <div style={{ marginTop: section.fields.length > 0 ? '20px' : 0 }}>
                  {WALLET_TYPES.filter(t => t.value !== 'other').map(wType => {
                    const typeWallets = wallets.map((w, idx) => ({ ...w, _idx: idx })).filter(w => w.type === wType.value);
                    return (
                      <div key={wType.value} style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '8px 12px', background: `${wType.color}08`, borderRadius: '10px', borderRight: `4px solid ${wType.color}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {wType.logo && <img src={wType.logo} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '4px' }} />}
                            <strong style={{ fontSize: '14px', color: wType.color }}>{wType.label} ({typeWallets.length})</strong>
                          </div>
                          <button className="btn btn-sm" style={{ background: wType.color, color: 'white', fontSize: '11px' }}
                            onClick={() => update('wallets', [...wallets, { type: wType.value, label: wType.label, number: '', name: '', qr: '' }])}>
                            + إضافة محفظة {wType.label}
                          </button>
                        </div>

                        {typeWallets.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', border: '1px dashed var(--border-light)', borderRadius: '8px', marginBottom: '8px' }}>
                            لا توجد محافظ {wType.label}
                          </div>
                        )}

                        {typeWallets.map(w => (
                          <div key={w._idx} style={{ border: '1px solid var(--border-light)', borderRadius: '10px', padding: '12px', marginBottom: '8px', background: 'var(--bg-primary)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                              <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontSize: '11px' }}>رقم المحفظة</label>
                                <input className="form-input" value={w.number} onChange={e => updateWallet(w._idx, 'number', e.target.value)} placeholder="01XXXXXXXXX" style={{ direction: 'ltr', textAlign: 'left', fontSize: '13px' }} />
                              </div>
                              <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontSize: '11px' }}>اسم صاحب المحفظة</label>
                                <input className="form-input" value={w.name} onChange={e => updateWallet(w._idx, 'name', e.target.value)} placeholder="الاسم" style={{ fontSize: '13px' }} />
                              </div>
                              <button className="btn btn-sm btn-danger" onClick={() => removeWallet(w._idx)} style={{ minWidth: 'auto', padding: '6px 10px', marginBottom: '2px' }}>🗑️</button>
                            </div>
                            {/* QR */}
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {w.qr ? (
                                <img src={w.qr} alt="QR" style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '6px', border: '1px solid var(--border-light)' }} />
                              ) : (
                                <div style={{ width: '56px', height: '56px', borderRadius: '6px', border: '2px dashed var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', opacity: 0.3, flexShrink: 0 }}>QR</div>
                              )}
                              <div>
                                <input type="file" accept="image/*" id={`qr-${w._idx}`} hidden onChange={e => handleQrUpload(w._idx, e)} />
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button className="btn btn-sm btn-outline" onClick={() => document.getElementById(`qr-${w._idx}`)?.click()} style={{ fontSize: '11px' }}>
                                    <FiUpload size={12} /> {w.qr ? 'تغيير QR' : 'رفع QR Code'}
                                  </button>
                                  {w.qr && (
                                    <button className="btn btn-sm btn-danger" onClick={() => updateWallet(w._idx, 'qr', '')} style={{ fontSize: '11px', minWidth: 'auto' }}>
                                      🗑️ حذف QR
                                    </button>
                                  )}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>يظهر للعميل في صفحة الدفع</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Save Footer */}
      <div style={{ marginTop: '24px', padding: '20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>💡 التغييرات تظهر فوراً بعد الحفظ وإعادة تحميل الصفحة</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={fetchSettings}><FiRefreshCw size={14} /> إعادة تحميل</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '⏳' : <FiSave size={16} />} حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
}
