import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUpload, FiUser, FiPhone, FiCreditCard, FiCheck, FiClock, FiCalendar, FiCopy, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/client';
import siteConfig from '../../config/siteConfig';

const ALL_RENTAL_TYPES = [
  { key: 'daily', label: 'يومي', icon: '📅', desc: 'إيجار بالأيام', unit: 'يوم', multiplier: 1, rateField: 'daily_rate' },
  { key: 'weekly', label: 'أسبوعي', icon: '📆', desc: 'إيجار بالأسابيع', unit: 'أسبوع', multiplier: 7, rateField: 'weekly_rate' },
  { key: 'monthly', label: 'شهري', icon: '🗓️', desc: 'إيجار بالشهور', unit: 'شهر', multiplier: 30, rateField: 'monthly_rate' },
];

const VALID_PREFIXES = ['010', '011', '012', '015'];

const validatePhonePrefix = (phone) => {
  if (!phone || phone.length < 3) return true; // not enough to validate yet
  return VALID_PREFIXES.some(p => phone.startsWith(p));
};

export default function BookCar() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [car, setCar] = useState(null);
  const [returningCustomer, setReturningCustomer] = useState(null);


  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_phone2: '',
    national_id: '',
    notes: '',
    rental_type: '',
    rental_duration: 1,
    start_date: new Date().toISOString().split('T')[0],
  });

  const handleNumOnly = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setForm({ ...form, [e.target.name]: val });

    // Auto-lookup customer when phone reaches 11 digits
    if (e.target.name === 'customer_phone' && val.length === 11 && validatePhonePrefix(val)) {
      api.get(`/api/reservations/customer-lookup/${val}`).then(({ data }) => {
        if (data.found) {
          setReturningCustomer(data);
          setForm(f => ({
            ...f,
            customer_name: f.customer_name || data.customer_name,
            national_id: f.national_id || data.national_id,
            customer_phone2: f.customer_phone2 || data.phone2,
          }));
        } else {
          setReturningCustomer(null);
        }
      }).catch(() => setReturningCustomer(null));
    } else if (e.target.name === 'customer_phone' && val.length < 11) {
      setReturningCustomer(null);
    }
  };

  const [files, setFiles] = useState({
    national_id: null,
    national_id_back: null,
    license: null,
    selfie: null,
  });

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const openCamera = async (docType) => {
    setCameraTarget(docType);
    // Revoke old captured image URL to prevent memory leak
    if (capturedImage) URL.revokeObjectURL(capturedImage);
    setCapturedImage(null);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: docType === 'selfie' ? 'user' : 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setCameraStream(stream);
      // Attach to video element after render
      setTimeout(() => {
        const vid = document.getElementById('camera-preview');
        if (vid) { vid.srcObject = stream; vid.play(); }
      }, 100);
    } catch (err) {
      toast.error('تعذر فتح الكاميرا. تأكد من السماح بالوصول للكاميرا');
      setCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    const vid = document.getElementById('camera-preview');
    const canvas = document.createElement('canvas');
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    canvas.getContext('2d').drawImage(vid, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${cameraTarget}_capture.jpg`, { type: 'image/jpeg' });
        // Revoke old URL before creating new one
        if (capturedImage) URL.revokeObjectURL(capturedImage);
        setCapturedImage(URL.createObjectURL(blob));
        setFiles(prev => ({ ...prev, [cameraTarget]: file }));
        // Stop camera
        if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
        setCameraStream(null);
      }
    }, 'image/jpeg', 0.92);
  };

  const closeCamera = () => {
    if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    if (capturedImage) URL.revokeObjectURL(capturedImage);
    setCapturedImage(null);
    setCameraOpen(false);
    setCameraTarget(null);
  };
  const [depositReceipt, setDepositReceipt] = useState(null);
  const [payChoice, setPayChoice] = useState('online');
  const [payTab, setPayTab] = useState('vodafone_cash');
  const [siteSettings, setSiteSettings] = useState({ deposit_daily: 500, deposit_weekly: 1000, deposit_monthly: 2000, wallets: [] });

  const DEPOSIT_MAP = { daily: siteSettings.deposit_daily || 500, weekly: siteSettings.deposit_weekly || 1000, monthly: siteSettings.deposit_monthly || 2000 };
  const DEPOSIT_AMOUNT = DEPOSIT_MAP[form.rental_type] || 500;
  const WALLETS = siteSettings.wallets || [];

  const WALLET_LOGOS = { vodafone_cash: '/vodafone-cash.png', instapay: '/instapay.png' };
  const WALLET_COLORS = { vodafone_cash: '#e60000', instapay: '#1B3A8C', other: '#6b7280' };

  useEffect(() => {
    api.get('/api/settings').then(({ data }) => setSiteSettings(s => ({ ...s, ...data }))).catch(() => {});
  }, []);

  useEffect(() => {
    if (carId) {
      api.get(`/api/cars/${carId}`).then(({ data }) => {
        setCar(data);
        // Auto-select first available rental type
        const available = ALL_RENTAL_TYPES.filter(t => {
          if (t.key === 'daily') return true;
          const rate = data[t.rateField];
          return rate && Number(rate) > 0;
        });
        if (available.length > 0) {
          setForm(f => ({ ...f, rental_type: available[0].key }));
        }
      }).catch(() => {});
    }
  }, [carId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('حجم الملف كبير جداً (الحد الأقصى 10 ميجا)');
        return;
      }
      setFiles({ ...files, [type]: file });
    }
  };

  // Get available rental types for this car
  const availableTypes = car ? ALL_RENTAL_TYPES.filter(t => {
    if (t.key === 'daily') return true; // daily always available
    const rate = car[t.rateField];
    return rate && Number(rate) > 0;
  }) : [];

  const rentalType = ALL_RENTAL_TYPES.find(t => t.key === form.rental_type) || ALL_RENTAL_TYPES[0];

  // Calculate price based on type
  const getUnitPrice = () => {
    if (!car) return 0;
    if (form.rental_type === 'weekly') return Number(car.weekly_rate) || 0;
    if (form.rental_type === 'monthly') return Number(car.monthly_rate) || 0;
    return Number(car.daily_rate) || 0;
  };

  const unitPrice = getUnitPrice();
  const totalDays = form.rental_duration * rentalType.multiplier;
  const totalPrice = unitPrice * form.rental_duration;

  const validateStep1 = () => {
    if (!form.customer_name || form.customer_name.length < 2) {
      toast.error('يرجى إدخال الاسم الكامل'); return false;
    }
    if (!form.customer_phone || form.customer_phone.length !== 11) {
      toast.error('رقم الهاتف يجب أن يكون 11 رقم'); return false;
    }
    if (!validatePhonePrefix(form.customer_phone)) {
      toast.error('رقم الهاتف يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015'); return false;
    }
    if (form.customer_phone2 && form.customer_phone2.length > 0) {
      if (form.customer_phone2.length !== 11) {
        toast.error('الرقم الاحتياطي يجب أن يكون 11 رقم'); return false;
      }
      if (!validatePhonePrefix(form.customer_phone2)) {
        toast.error('الرقم الاحتياطي يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015'); return false;
      }
    }
    if (!form.national_id || form.national_id.length !== 14) {
      toast.error('رقم البطاقة يجب أن يكون 14 رقم'); return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (form.rental_duration < 1) {
      toast.error('يرجى تحديد مدة الإيجار'); return false;
    }
    if (!form.start_date) {
      toast.error('يرجى تحديد تاريخ البداية'); return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const depositPaid = payChoice === 'online' && depositReceipt;
      const notesWithDeposit = (form.notes || '') + (depositPaid ? `\n💳 تم رفع إيصال عربون ${DEPOSIT_AMOUNT} ج.م (أونلاين)` : payChoice === 'pickup' ? `\n🏢 العميل اختار الدفع عند الاستلام` : '');
      const { data } = await api.post('/api/reservations', {
        car_id: carId,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_phone2: form.customer_phone2 || null,
        national_id: form.national_id,
        notes: notesWithDeposit,
        rental_type: form.rental_type,
        rental_duration: parseInt(form.rental_duration),
        start_date: form.start_date,
        deposit_amount: depositPaid ? DEPOSIT_AMOUNT : 0,
      });

      // Upload KYC documents
      const customerId = data.customer_id;
      for (const [type, file] of Object.entries(files)) {
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('customer_id', customerId);
          formData.append('doc_type', type);
          try {
            await api.post('/api/kyc/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } catch { /* ignore KYC upload errors */ }
        }
      }

      // Upload deposit receipt
      if (payChoice === 'online' && depositReceipt) {
        const receiptFd = new FormData();
        receiptFd.append('file', depositReceipt);
        receiptFd.append('customer_id', customerId);
        receiptFd.append('doc_type', 'deposit_receipt');
        try { await api.post('/api/kyc/upload', receiptFd, { headers: { 'Content-Type': 'multipart/form-data' } }); } catch {}
      }

      toast.success('تم إرسال الحجز بنجاح!');
      navigate('/booking-success', { state: { reservationId: data.id, totalPrice: data.total_price, startDate: data.start_date, endDate: data.end_date, depositPaid: payChoice === 'online' && !!depositReceipt } });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'حدث خطأ أثناء الحجز');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'البيانات' },
    { num: 2, label: 'الإيجار' },
    { num: 3, label: 'المستندات' },
    { num: 4, label: 'العربون' },
    { num: 5, label: 'التأكيد' },
  ];

  const addDays = (d, days) => { const r = new Date(d); r.setDate(r.getDate() + days); return r; };
  const formatDate = (d) => d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const startDate = form.start_date ? new Date(form.start_date + 'T00:00:00') : new Date();
  const endDate = addDays(startDate, totalDays);

  // Min date for date picker = today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="book-page">
      <div className="container">
        <div className="book-card">
          {/* Car Summary */}
          {car && (
            <div className="book-car-summary">
              <div className="book-car-info">
                <h3>🚗 {car.make} {car.model} {car.year}</h3>
                <div><span className="book-tag">{car.color}</span><span className="book-tag">{car.plate_number}</span></div>
              </div>
              <div className="book-car-price">
                <span className="book-price-num">{Number(car.daily_rate).toLocaleString()}</span>
                <span className="book-price-label">ج.م / يوم</span>
                {car.weekly_rate > 0 && <span className="book-price-sub">{Number(car.weekly_rate).toLocaleString()} / أسبوع</span>}
                {car.monthly_rate > 0 && <span className="book-price-sub">{Number(car.monthly_rate).toLocaleString()} / شهر</span>}
              </div>
            </div>
          )}

          {/* Stepper */}
          <div className="stepper">
            {steps.map((s, i) => (
              <div key={s.num} className={`stepper-step ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
                <div className="stepper-circle">
                  {step > s.num ? <FiCheck size={16} /> : s.num}
                </div>
                <span className="stepper-label">{s.label}</span>
                {i < steps.length - 1 && <div className="stepper-line" />}
              </div>
            ))}
          </div>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="book-step animate-fade-in">
              <h2>👤 بياناتك الشخصية</h2>

              {/* Returning customer banner */}
              {returningCustomer && (
                <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>👋</span>
                  <div>
                    <strong style={{ fontSize: '13px', color: 'var(--success)', display: 'block' }}>أهلاً بعودتك، {returningCustomer.customer_name}!</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      تم التعرف عليك برقم الهاتف — بياناتك اتملت تلقائياً
                      {returningCustomer.has_docs && ' ✅ ومستنداتك موجودة عندنا'}
                    </span>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label"><FiPhone size={14} /> رقم الهاتف * (11 رقم)</label>
                <input type="tel" name="customer_phone" className="form-input" placeholder="01xxxxxxxxx" value={form.customer_phone} onChange={handleNumOnly} maxLength={11} style={{ direction: 'ltr', textAlign: 'right' }} />
                {form.customer_phone.length >= 3 && !validatePhonePrefix(form.customer_phone) && (
                  <span style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px', display: 'block' }}>⚠️ يجب أن يبدأ بـ 010, 011, 012, أو 015</span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label"><FiUser size={14} /> الاسم الكامل *</label>
                <input type="text" name="customer_name" className="form-input" placeholder="أدخل اسمك الكامل" value={form.customer_name} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label"><FiCreditCard size={14} /> رقم البطاقة * (14 رقم)</label>
                  <input type="text" name="national_id" className="form-input" placeholder="ادخل الرقم القومي المكون من 14 رقم" value={form.national_id} onChange={handleNumOnly} maxLength={14} style={{ direction: 'ltr', textAlign: 'right' }} />
                </div>
                <div className="form-group">
                  <label className="form-label"><FiPhone size={14} /> رقم احتياطي (اختياري)</label>
                  <input type="tel" name="customer_phone2" className="form-input" placeholder="01xxxxxxxxx" value={form.customer_phone2} onChange={handleNumOnly} maxLength={11} style={{ direction: 'ltr', textAlign: 'right' }} />
                  {form.customer_phone2.length >= 3 && !validatePhonePrefix(form.customer_phone2) && (
                    <span style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px', display: 'block' }}>⚠️ يجب أن يبدأ بـ 010, 011, 012, أو 015</span>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">ملاحظات (اختياري)</label>
                <textarea name="notes" className="form-input" rows="2" placeholder="أي ملاحظات إضافية..." value={form.notes} onChange={handleChange} />
              </div>
              <button className="btn btn-primary btn-lg btn-block" onClick={() => { if (validateStep1()) setStep(2); }}>
                التالي ←
              </button>
            </div>
          )}

          {/* Step 2: Rental Type & Duration */}
          {step === 2 && (
            <div className="book-step animate-fade-in">
              <h2><FiClock size={22} /> نوع ومدة الإيجار</h2>
              <p className="step-desc">اختر نوع الإيجار وحدد المدة المطلوبة</p>

              {/* Rental Type Cards — only show enabled types */}
              <div className="rental-type-grid" style={{ gridTemplateColumns: `repeat(${Math.min(availableTypes.length, 3)}, 1fr)` }}>
                {availableTypes.map(t => (
                  <div
                    key={t.key}
                    className={`rental-type-card ${form.rental_type === t.key ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, rental_type: t.key, rental_duration: 1 })}
                  >
                    <span className="rental-type-icon">{t.icon}</span>
                    <strong>{t.label}</strong>
                    <span className="rental-type-desc">{t.desc}</span>
                    <span className="rental-type-price">{car ? Number(car[t.rateField]).toLocaleString() : 0} ج.م</span>
                  </div>
                ))}
              </div>

              {/* Start Date */}
              <div className="form-group" style={{ maxWidth: '300px', margin: '0 auto', marginBottom: 'var(--space-lg)' }}>
                <label className="form-label"><FiCalendar size={14} /> تاريخ البداية (من)</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.start_date}
                  min={today}
                  onChange={e => setForm({ ...form, start_date: e.target.value })}
                  style={{ direction: 'ltr', textAlign: 'center' }}
                />
              </div>

              {/* Duration Input */}
              <div className="form-group" style={{ maxWidth: '300px', margin: '0 auto' }}>
                <label className="form-label">المدة ({rentalType.unit})</label>
                <div className="duration-input">
                  <button className="duration-btn" onClick={() => setForm({ ...form, rental_duration: Math.max(1, form.rental_duration - 1) })}>−</button>
                  <input
                    type="number"
                    className="form-input duration-field"
                    value={form.rental_duration}
                    onChange={e => setForm({ ...form, rental_duration: Math.max(1, parseInt(e.target.value) || 1) })}
                    min="1"
                  />
                  <button className="duration-btn" onClick={() => setForm({ ...form, rental_duration: form.rental_duration + 1 })}>+</button>
                </div>
              </div>

              {/* Price Preview */}
              <div className="price-preview">
                <div className="price-preview-row">
                  <span>📅 من</span>
                  <strong>{formatDate(startDate)}</strong>
                </div>
                <div className="price-preview-row">
                  <span>📅 إلى (تلقائي)</span>
                  <strong>{formatDate(endDate)}</strong>
                </div>
                <div className="price-preview-row">
                  <span>⏱️ المدة الإجمالية</span>
                  <strong>{totalDays} يوم</strong>
                </div>
                <div className="price-preview-row">
                  <span>💲 سعر {rentalType.label === 'يومي' ? 'اليوم' : rentalType.label === 'أسبوعي' ? 'الأسبوع' : 'الشهر'}</span>
                  <strong>{unitPrice.toLocaleString()} ج.م</strong>
                </div>
                <div className="price-preview-total">
                  <span>💰 الإجمالي المتوقع</span>
                  <strong>{totalPrice.toLocaleString()} ج.م</strong>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn btn-outline" onClick={() => setStep(1)}>السابق</button>
                <button className="btn btn-primary btn-lg" onClick={() => { if (validateStep2()) setStep(3); }}>التالي ←</button>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="book-step animate-fade-in">
              <h2>📄 رفع المستندات</h2>

              {/* Returning customer — docs already on file */}
              {returningCustomer?.has_docs ? (
                <>
                  <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.03))', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(59,130,246,0.15)', textAlign: 'center' }}>
                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '6px' }}>✅</span>
                    <strong style={{ fontSize: '14px', color: 'var(--info)', display: 'block' }}>مستنداتك موجودة بالفعل</strong>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                      عندنا {returningCustomer.doc_count} مستندات مسجلة باسمك. يمكنك تخطي هذه الخطوة أو تحديث الصور.
                    </p>
                  </div>
                  <p className="step-desc" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>🔄 إذا تريد تحديث المستندات، ارفع صور جديدة أدناه:</p>
                </>
              ) : (
                <p className="step-desc">يرجى رفع صور واضحة من المستندات التالية</p>
              )}

              {[
                { key: 'national_id', label: 'البطاقة الشخصية (وجه أمامي)', icon: '🪪' },
                { key: 'national_id_back', label: 'البطاقة الشخصية (وجه خلفي)', icon: '🪪' },
                { key: 'license', label: 'صورة رخصة القيادة', icon: '🪪' },
                { key: 'selfie', label: 'صورة سيلفي شخصية', icon: '🤳' },
              ].map((doc) => {
                const alreadyOnFile = returningCustomer?.doc_types?.includes(doc.key);
                return (
                  <div className={`upload-zone ${files[doc.key] ? 'uploaded' : alreadyOnFile ? 'uploaded' : ''}`} key={doc.key}>
                    <input type="file" accept="image/*" id={`file-${doc.key}`} hidden onChange={(e) => handleFileChange(doc.key, e)} />
                    <div className="upload-label">
                      <span className="upload-icon">{doc.icon}</span>
                      <div style={{ flex: 1 }}>
                        <strong>{doc.label}</strong>
                        <span>
                          {files[doc.key]
                            ? `✅ ${files[doc.key].name}`
                            : alreadyOnFile
                              ? '✅ موجود — اختر لتحديث'
                              : 'اختر طريقة الرفع'
                          }
                        </span>
                      </div>
                      <div className="upload-actions">
                        <label htmlFor={`file-${doc.key}`} className="upload-action-btn" title="رفع من المعرض">
                          <FiUpload size={16} />
                          <span>معرض</span>
                        </label>
                        <button type="button" className="upload-action-btn camera-btn" onClick={() => openCamera(doc.key)} title="تصوير مباشر">
                          <FiCamera size={16} />
                          <span>كاميرا</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="form-actions">
                <button className="btn btn-outline" onClick={() => setStep(2)}>السابق</button>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(4)}>التالي ←</button>
              </div>
            </div>
          )}

          {/* Step 4: Deposit Payment */}
          {step === 4 && (
            <div className="book-step animate-fade-in">
              <h2>💳 دفع العربون</h2>

              {/* Payment Choice */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <button onClick={() => setPayChoice('online')}
                  style={{ padding: '16px', borderRadius: '14px', border: payChoice === 'online' ? '2px solid var(--accent)' : '2px solid var(--border-light)', background: payChoice === 'online' ? 'rgba(99,102,241,0.06)' : 'var(--bg-primary)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>📲</div>
                  <strong style={{ display: 'block', fontSize: '13px', color: payChoice === 'online' ? 'var(--accent)' : 'var(--text-primary)' }}>ادفع أونلاين</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>فودافون كاش / إنستاباي</span>
                </button>
                <button onClick={() => { setPayChoice('pickup'); setDepositReceipt(null); }}
                  style={{ padding: '16px', borderRadius: '14px', border: payChoice === 'pickup' ? '2px solid var(--success)' : '2px solid var(--border-light)', background: payChoice === 'pickup' ? 'rgba(16,185,129,0.06)' : 'var(--bg-primary)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>🏢</div>
                  <strong style={{ display: 'block', fontSize: '13px', color: payChoice === 'pickup' ? 'var(--success)' : 'var(--text-primary)' }}>ادفع عند الاستلام</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>في مقر الشركة</span>
                </button>
              </div>

              {payChoice === 'online' && (
                <>
                  {/* Deposit Amount */}
                  <div style={{ background: 'linear-gradient(135deg, #1a1a3e, #2e2a5e)', borderRadius: '14px', padding: '16px', color: 'white', marginBottom: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 900 }}>{DEPOSIT_AMOUNT} ج.م</div>
                    <div style={{ fontSize: '11px', opacity: 0.6 }}>مبلغ العربون المطلوب</div>
                  </div>

                  {/* Payment Method Tabs */}
                  {(() => {
                    const vodWallets = WALLETS.filter(w => w.type === 'vodafone_cash');
                    const instaWallets = WALLETS.filter(w => w.type === 'instapay');
                    const availTabs = [];
                    if (vodWallets.length) availTabs.push({ key: 'vodafone_cash', label: 'فودافون كاش', color: '#e60000', wallets: vodWallets });
                    if (instaWallets.length) availTabs.push({ key: 'instapay', label: 'إنستاباي', color: '#1B3A8C', wallets: instaWallets });

                    return (
                      <>
                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '0', marginBottom: '0', borderRadius: '12px 12px 0 0', overflow: 'hidden', border: '1px solid var(--border-light)', borderBottom: 'none' }}>
                          {availTabs.map(tab => (
                            <button key={tab.key} onClick={() => setPayTab(tab.key)}
                              style={{ flex: 1, padding: '12px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                background: payTab === tab.key ? tab.color : 'var(--bg-primary)', color: payTab === tab.key ? 'white' : 'var(--text-secondary)', transition: 'all 0.25s' }}>
                              <img src={WALLET_LOGOS[tab.key]} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: tab.key === 'instapay' ? '5px' : '0', filter: payTab === tab.key ? 'brightness(10)' : 'none' }} />
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        {/* Active Tab Content */}
                        {availTabs.filter(t => t.key === payTab).map(tab => (
                          <div key={tab.key} style={{ border: `2px solid ${tab.color}`, borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '16px', background: 'var(--bg-primary)', marginBottom: '14px' }}>
                            {tab.wallets.map((w, wi) => (
                              <div key={wi} style={{ textAlign: 'center', marginBottom: wi < tab.wallets.length - 1 ? '14px' : 0, paddingBottom: wi < tab.wallets.length - 1 ? '14px' : 0, borderBottom: wi < tab.wallets.length - 1 ? '1px dashed var(--border-light)' : 'none' }}>
                                <div style={{ fontSize: '22px', fontWeight: 900, direction: 'ltr', letterSpacing: '2px', color: tab.color, margin: '4px 0' }}>{w.number}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{w.name}</div>
                                {w.qr && (
                                  <div style={{ display: 'inline-block', padding: '8px', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '8px' }}>
                                    <img src={w.qr} alt="QR Code" onClick={() => window.open(w.qr, '_blank')} style={{ width: '140px', height: '140px', display: 'block', objectFit: 'contain', cursor: 'pointer' }} title="اضغط لتكبير" />
                                  </div>
                                )}
                                <div>
                                  <button className="btn btn-sm" style={{ fontSize: '11px', background: tab.color, color: 'white' }}
                                    onClick={() => { navigator.clipboard.writeText(w.number); toast.success('تم نسخ الرقم'); }}>
                                    <FiCopy size={12} /> نسخ الرقم
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </>
                    );
                  })()}

                  {/* Upload Receipt */}
                  <div className={`upload-zone ${depositReceipt ? 'uploaded' : ''}`} style={{ marginBottom: '10px' }}>
                    <input type="file" accept="image/*" id="deposit-receipt" hidden onChange={(e) => { if (e.target.files[0]) setDepositReceipt(e.target.files[0]); }} />
                    <label htmlFor="deposit-receipt" className="upload-label">
                      <span className="upload-icon">🧾</span>
                      <div>
                        <strong>رفع إيصال التحويل</strong>
                        <span>{depositReceipt ? `✅ ${depositReceipt.name}` : 'اضغط لرفع صورة الإيصال'}</span>
                      </div>
                      <FiUpload size={20} />
                    </label>
                  </div>

                  <div style={{ padding: '8px 12px', background: depositReceipt ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: '8px', fontSize: '12px', color: depositReceipt ? '#065f46' : '#991b1b', fontWeight: 600, marginBottom: '12px' }}>
                    {depositReceipt ? '✅ تم رفع الإيصال — يمكنك المتابعة' : '⚠️ يجب رفع صورة إيصال التحويل للمتابعة'}
                  </div>
                </>
              )}

              {payChoice === 'pickup' && (
                <div style={{ textAlign: 'center', padding: '28px 16px', background: 'rgba(16,185,129,0.05)', borderRadius: '14px', border: '2px dashed var(--success)', marginBottom: '12px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
                  <strong style={{ fontSize: '16px', color: 'var(--success)', display: 'block', marginBottom: '4px' }}>سيتم الدفع عند الاستلام</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ادفع مبلغ العربون ({DEPOSIT_AMOUNT} ج.م) عند استلام السيارة في مقر الشركة</span>
                </div>
              )}

              <div className="form-actions">
                <button className="btn btn-outline" onClick={() => setStep(3)}>السابق</button>
                <button className="btn btn-primary btn-lg" onClick={() => {
                  if (payChoice === 'online' && !depositReceipt) { toast.error('يجب رفع صورة إيصال التحويل'); return; }
                  setStep(5);
                }}>مراجعة وتأكيد</button>
              </div>
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {step === 5 && (
            <div className="book-step animate-fade-in">
              <h2>✅ مراجعة البيانات</h2>

              <div className="review-card">
                <div className="review-section-title">👤 البيانات الشخصية</div>
                <div className="review-row"><span>الاسم:</span><strong>{form.customer_name}</strong></div>
                <div className="review-row"><span>الهاتف:</span><strong>{form.customer_phone}</strong></div>
                {form.customer_phone2 && <div className="review-row"><span>هاتف احتياطي:</span><strong>{form.customer_phone2}</strong></div>}
                <div className="review-row"><span>رقم البطاقة:</span><strong>{form.national_id}</strong></div>

                <div className="review-section-title" style={{ marginTop: '16px' }}>📅 تفاصيل الإيجار</div>
                <div className="review-row"><span>نوع الإيجار:</span><strong>{rentalType.label}</strong></div>
                <div className="review-row"><span>المدة:</span><strong>{form.rental_duration} {rentalType.unit}</strong></div>
                <div className="review-row"><span>من:</span><strong>{formatDate(startDate)}</strong></div>
                <div className="review-row"><span>إلى:</span><strong>{formatDate(endDate)}</strong></div>

                <div className="review-section-title" style={{ marginTop: '16px' }}>🚗 السيارة</div>
                {car && <div className="review-row"><span>السيارة:</span><strong>{car.make} {car.model} {car.year}</strong></div>}
                {car && <div className="review-row"><span>اللون:</span><strong>{car.color}</strong></div>}

                <div className="review-row" style={{ borderTop: '2px solid var(--accent)', paddingTop: '12px', marginTop: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '16px' }}>💰 الإجمالي:</span>
                  <strong style={{ color: 'var(--accent)', fontSize: '20px' }}>{totalPrice.toLocaleString()} ج.م</strong>
                </div>

                <div className="review-section-title" style={{ marginTop: '16px' }}>💳 العربون</div>
                <div className="review-row">
                  <span>طريقة الدفع:</span>
                  <strong style={{ color: payChoice === 'online' ? 'var(--accent)' : 'var(--success)' }}>
                    {payChoice === 'online' ? '📲 دفع أونلاين' : '🏢 دفع عند الاستلام'}
                  </strong>
                </div>
                {payChoice === 'online' && (
                  <div className="review-row">
                    <span>إيصال التحويل:</span>
                    <strong style={{ color: 'var(--success)' }}>✅ {depositReceipt?.name}</strong>
                  </div>
                )}

                <div className="review-row"><span>المستندات:</span><strong>{Object.values(files).filter(Boolean).length}/4 مرفقة</strong></div>
                {form.notes && <div className="review-row"><span>ملاحظات:</span><strong>{form.notes}</strong></div>}
              </div>

              <div className="form-actions">
                <button className="btn btn-outline" onClick={() => setStep(4)}>السابق</button>
                <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                  {loading ? '⏳ جاري الإرسال...' : '🚀 تأكيد الحجز'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .book-page { padding: var(--space-2xl) 0 var(--space-3xl); }
        .book-card { max-width: 700px; margin: 0 auto; background: var(--bg-card); border-radius: var(--radius-xl); padding: var(--space-2xl); box-shadow: var(--shadow-lg); border: 1px solid var(--border-light); }

        .book-car-summary { display: flex; justify-content: space-between; align-items: center; padding: var(--space-lg); background: linear-gradient(135deg, var(--primary), var(--primary-light)); border-radius: var(--radius-lg); margin-bottom: var(--space-xl); color: white; }
        .book-car-info h3 { font-size: var(--font-size-lg); font-weight: 800; margin: 0 0 8px; }
        .book-tag { background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 20px; font-size: 11px; margin-left: 6px; }
        .book-car-price { text-align: center; }
        .book-price-num { display: block; font-size: 28px; font-weight: 900; }
        .book-price-label { font-size: 12px; opacity: 0.7; }
        .book-price-sub { display: block; font-size: 10px; opacity: 0.6; margin-top: 2px; }

        .stepper { display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-2xl); }
        .stepper-step { display: flex; align-items: center; gap: 6px; }
        .stepper-circle { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--border-light); display: flex; align-items: center; justify-content: center; font-size: var(--font-size-sm); font-weight: 700; color: var(--text-muted); background: var(--bg-secondary); transition: all var(--transition-base); }
        .stepper-step.active .stepper-circle { border-color: var(--accent); color: white; background: var(--accent); }
        .stepper-step.completed .stepper-circle { border-color: var(--success); background: var(--success); color: white; }
        .stepper-label { font-size: var(--font-size-xs); font-weight: 600; color: var(--text-muted); }
        .stepper-step.active .stepper-label { color: var(--accent); }
        .stepper-line { width: 40px; height: 2px; background: var(--border-light); margin: 0 6px; }
        .book-step h2 { font-size: var(--font-size-xl); font-weight: 700; margin-bottom: var(--space-lg); text-align: center; }
        .step-desc { text-align: center; color: var(--text-secondary); margin-bottom: var(--space-xl); font-size: var(--font-size-sm); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }

        .rental-type-grid { display: grid; gap: 12px; margin-bottom: var(--space-xl); }
        .rental-type-card { border: 2px solid var(--border-light); border-radius: var(--radius-lg); padding: var(--space-lg); text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .rental-type-card:hover { border-color: var(--accent); transform: translateY(-2px); }
        .rental-type-card.selected { border-color: var(--accent); background: rgba(230,30,90,0.06); box-shadow: 0 4px 15px rgba(230,30,90,0.15); }
        .rental-type-icon { font-size: 32px; }
        .rental-type-card strong { font-size: var(--font-size-md); }
        .rental-type-desc { font-size: var(--font-size-xs); color: var(--text-muted); }
        .rental-type-price { font-size: var(--font-size-sm); font-weight: 800; color: var(--accent); margin-top: 4px; }

        .duration-input { display: flex; align-items: center; gap: 8px; }
        .duration-btn { width: 44px; height: 44px; border-radius: var(--radius-md); border: 2px solid var(--border-light); background: var(--bg-secondary); font-size: 20px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; color: var(--text-primary); }
        .duration-btn:hover { border-color: var(--accent); color: var(--accent); }
        .duration-field { text-align: center; font-size: var(--font-size-xl); font-weight: 800; flex: 1; }

        .price-preview { background: var(--bg-primary); border-radius: var(--radius-md); padding: var(--space-lg); margin-top: var(--space-xl); border: 1px solid var(--border-light); }
        .price-preview-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: var(--font-size-sm); color: var(--text-secondary); border-bottom: 1px solid var(--border-light); }
        .price-preview-row:last-child { border: none; }
        .price-preview-total { display: flex; justify-content: space-between; padding: 12px 0 0; margin-top: 8px; border-top: 2px solid var(--accent); font-size: var(--font-size-lg); }
        .price-preview-total strong { color: var(--accent); font-size: var(--font-size-xl); }

        .upload-zone { border: 2px dashed var(--border-light); border-radius: var(--radius-md); margin-bottom: var(--space-md); transition: all var(--transition-fast); }
        .upload-zone.uploaded { border-color: var(--success); background: var(--success-bg); }
        .upload-zone:hover { border-color: var(--accent); }
        .upload-label { display: flex; align-items: center; gap: 14px; padding: var(--space-lg); cursor: pointer; }
        .upload-icon { font-size: 28px; }
        .upload-label strong { display: block; font-size: var(--font-size-sm); }
        .upload-label span { font-size: var(--font-size-xs); color: var(--text-secondary); }

        .upload-actions { display: flex; gap: 6px; margin-right: auto; }
        .upload-action-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 12px; border-radius: 10px; border: 1.5px solid var(--border-light); background: var(--bg-secondary); color: var(--text-secondary); cursor: pointer; transition: all 0.2s; font-family: inherit; font-size: 10px; font-weight: 600; text-decoration: none; }
        .upload-action-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(99,102,241,0.06); transform: translateY(-1px); }
        .upload-action-btn.camera-btn { border-color: rgba(16,185,129,0.3); }
        .upload-action-btn.camera-btn:hover { border-color: var(--success); color: var(--success); background: rgba(16,185,129,0.06); }
        .review-card { background: var(--bg-primary); border-radius: var(--radius-md); padding: var(--space-xl); margin-bottom: var(--space-xl); }
        .review-section-title { font-size: var(--font-size-sm); font-weight: 800; color: var(--primary); margin-bottom: 8px; }
        .review-row { display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid var(--border-light); font-size: var(--font-size-sm); }
        .review-row:last-child { border: none; }
        .review-row span { color: var(--text-secondary); }
        .form-actions { display: flex; gap: var(--space-md); justify-content: space-between; margin-top: var(--space-xl); }
        @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } .stepper-label { display: none; } .rental-type-grid { grid-template-columns: 1fr !important; } .upload-label { flex-wrap: wrap; } .upload-actions { width: 100%; justify-content: center; margin-top: 6px; } }

        /* Camera Modal */
        .camera-modal-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
        .camera-modal-header { position: absolute; top: 0; left: 0; right: 0; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; z-index: 2; background: linear-gradient(180deg, rgba(0,0,0,0.6), transparent); }
        .camera-modal-header h3 { color: white; font-size: 16px; font-weight: 700; margin: 0; }
        .camera-close-btn { width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); transition: all 0.2s; }
        .camera-close-btn:hover { background: rgba(255,255,255,0.25); }
        .camera-video-container { position: relative; width: 90vw; max-width: 640px; aspect-ratio: 4/3; border-radius: 16px; overflow: hidden; background: #111; }
        .camera-video-container video { width: 100%; height: 100%; object-fit: cover; }
        .camera-captured-img { width: 100%; height: 100%; object-fit: contain; background: #111; }
        .camera-controls { display: flex; gap: 16px; margin-top: 24px; align-items: center; }
        .camera-capture-btn { width: 72px; height: 72px; border-radius: 50%; border: 4px solid white; background: transparent; cursor: pointer; position: relative; transition: all 0.2s; }
        .camera-capture-btn::after { content: ''; position: absolute; inset: 4px; border-radius: 50%; background: white; transition: all 0.15s; }
        .camera-capture-btn:hover::after { background: var(--accent); }
        .camera-capture-btn:active { transform: scale(0.9); }
        .camera-action-btn { padding: 12px 28px; border-radius: 14px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .camera-action-btn.confirm { background: var(--success); color: white; }
        .camera-action-btn.retake { background: rgba(255,255,255,0.15); color: white; backdrop-filter: blur(8px); }
        .camera-action-btn:hover { transform: translateY(-1px); }

        .camera-guide-frame { position: absolute; inset: 12%; border: 2px dashed rgba(255,255,255,0.4); border-radius: 12px; pointer-events: none; }
        .camera-guide-text { position: absolute; bottom: 8px; left: 0; right: 0; text-align: center; color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 600; pointer-events: none; }
      `}</style>

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="camera-modal-overlay">
          <div className="camera-modal-header">
            <h3>📸 {cameraTarget === 'selfie' ? 'التقط صورة سيلفي' : cameraTarget === 'national_id' ? 'صوّر البطاقة (الوجه الأمامي)' : cameraTarget === 'national_id_back' ? 'صوّر البطاقة (الوجه الخلفي)' : 'صوّر رخصة القيادة'}</h3>
            <button className="camera-close-btn" onClick={closeCamera}>✕</button>
          </div>
          <div className="camera-video-container">
            {capturedImage ? (
              <img src={capturedImage} alt="captured" className="camera-captured-img" />
            ) : (
              <>
                <video id="camera-preview" autoPlay playsInline muted style={{ transform: cameraTarget === 'selfie' ? 'scaleX(-1)' : 'none' }} />
                <div className="camera-guide-frame" />
                <div className="camera-guide-text">
                  {cameraTarget === 'selfie' ? 'ضع وجهك داخل الإطار' : 'ضع المستند داخل الإطار'}
                </div>
              </>
            )}
          </div>
          <div className="camera-controls">
            {capturedImage ? (
              <>
                <button className="camera-action-btn retake" onClick={() => { setCapturedImage(null); openCamera(cameraTarget); }}>🔄 إعادة التصوير</button>
                <button className="camera-action-btn confirm" onClick={closeCamera}>✅ تم — استخدم الصورة</button>
              </>
            ) : (
              <button className="camera-capture-btn" onClick={capturePhoto} title="التقط الصورة" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
