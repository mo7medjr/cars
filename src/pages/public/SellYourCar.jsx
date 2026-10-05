import { useState, useEffect, useRef } from 'react';
import { FiUpload, FiCheck, FiPhone } from 'react-icons/fi';
import { FaWhatsapp, FaCar } from 'react-icons/fa';
import api from '../../api/client';
import config, { waLink, telLink } from '../../config/siteConfig';
import toast from 'react-hot-toast';

export default function SellYourCar() {
  const [step, setStep] = useState(1); // 1=form, 2=success
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    owner_name: '', owner_phone: '', make: '', model: '',
    year: new Date().getFullYear(), price: '', color: '',
    mileage: '', description: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    document.title = 'بيع سيارتك عندنا — المراكبي لتجارة وإيجار السيارات';
    api.get('/api/settings').then(({ data }) => setSettings(data)).catch(() => {});
  }, []);

  const handleImages = (e) => {
    const files = [...e.target.files];
    setImages(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.owner_name || !form.owner_phone || !form.make || !form.model || !form.price) {
      toast.error('أدخل البيانات الأساسية'); return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      images.forEach(img => fd.append('images', img));
      const { data } = await api.post('/api/consignment/submit', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      setStep(2);
      toast.success('تم إرسال طلبك بنجاح! ✅');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'حدث خطأ');
    } finally { setSubmitting(false); }
  };

  const phone = settings?.whatsapp1 || config.whatsapp1;
  const phoneCall = settings?.phone1 || config.phone1;

  return (
    <div className="sell-car-page" dir="rtl">
      {/* Hero */}
      <section className="sell-hero">
        <div className="sell-hero-bg" />
        <div className="container sell-hero-content">
          <div className="sell-hero-badge">🏷️ خدمة جديدة</div>
          <h1>بيع سيارتك <span className="text-gradient">عندنا</span></h1>
          <p>سجّل بيانات سيارتك وهنعرضها للبيع في موقعنا — وهنتواصل معاك للتفاصيل</p>
        </div>
      </section>

      <section className="sell-content">
        <div className="container">
          {step === 1 ? (
            <div className="sell-form-wrapper">
              {/* Steps indicator */}
              <div className="sell-steps">
                <div className="sell-step active"><span>1</span> بيانات السيارة</div>
                <div className="sell-step-line" />
                <div className="sell-step"><span>2</span> تأكيد وتواصل</div>
              </div>

              <form className="sell-form" onSubmit={handleSubmit}>
                <h3>📋 بياناتك</h3>
                <div className="sell-row">
                  <div className="form-group">
                    <label className="form-label">اسمك *</label>
                    <input className="form-input" value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})} placeholder="أحمد محمد" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">رقم موبايلك *</label>
                    <input className="form-input" value={form.owner_phone} onChange={e => setForm({...form, owner_phone: e.target.value})} placeholder="01xxxxxxxxx" required />
                  </div>
                </div>

                <h3 style={{ marginTop: 24 }}>🚗 بيانات السيارة</h3>
                <div className="sell-row sell-row-3">
                  <div className="form-group">
                    <label className="form-label">الماركة *</label>
                    <input className="form-input" value={form.make} onChange={e => setForm({...form, make: e.target.value})} placeholder="تويوتا" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الموديل *</label>
                    <input className="form-input" value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="كورولا" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">سنة الصنع *</label>
                    <input className="form-input" type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} required />
                  </div>
                </div>
                <div className="sell-row sell-row-3">
                  <div className="form-group">
                    <label className="form-label">السعر المطلوب (ج.م) *</label>
                    <input className="form-input" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="350000" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">اللون</label>
                    <input className="form-input" value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="أبيض" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الكيلومترات</label>
                    <input className="form-input" type="number" value={form.mileage} onChange={e => setForm({...form, mileage: e.target.value})} placeholder="50000" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">وصف السيارة (اختياري)</label>
                  <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="سيارة بحالة ممتازة — مالك أول — بدون حوادث — فول أوبشن..." style={{ resize: 'vertical' }} />
                </div>

                {/* Image upload */}
                <div className="form-group">
                  <label className="form-label">📷 صور السيارة (اختياري — يُفضّل رفع صور واضحة)</label>
                  <input type="file" ref={fileRef} accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
                  <button type="button" className="sell-upload-btn" onClick={() => fileRef.current?.click()}>
                    <FiUpload size={18} /> اختر صور {images.length > 0 && `(${images.length})`}
                  </button>
                  {previews.length > 0 && (
                    <div className="sell-previews">
                      {previews.map((src, i) => <img key={i} src={src} alt="" className="sell-preview-img" />)}
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary btn-lg sell-submit-btn" disabled={submitting}>
                  {submitting ? '⏳ جاري الإرسال...' : '📤 أرسل طلبك'}
                </button>
              </form>
            </div>
          ) : (
            /* Success Step */
            <div className="sell-success">
              <div className="sell-success-icon">✅</div>
              <h2>تم إرسال طلبك بنجاح!</h2>
              <p className="sell-success-car">{result?.display_name}</p>
              <p>سيتم مراجعة طلبك وعرض سيارتك على موقعنا بعد الموافقة.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>تقدر تتواصل معانا لتسريع العملية:</p>

              <div className="sell-success-actions">
                <a href={`${waLink(phone)}?text=${encodeURIComponent(`مرحباً، أنا ${form.owner_name} — أرسلت طلب بيع سيارة ${result?.display_name} على موقعكم. ممكن نتكلم؟`)}`} target="_blank" rel="noopener noreferrer" className="sell-action-btn sell-wa">
                  <FaWhatsapp size={22} /> تواصل عبر واتساب
                </a>
                <a href={telLink(phoneCall)} className="sell-action-btn sell-call">
                  <FiPhone size={20} /> اتصل بنا
                </a>
              </div>

              <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={() => { setStep(1); setForm({ owner_name: '', owner_phone: '', make: '', model: '', year: new Date().getFullYear(), price: '', color: '', mileage: '', description: '' }); setImages([]); setPreviews([]); }}>
                📤 أرسل سيارة تانية
              </button>
            </div>
          )}

          {/* How it works */}
          <div className="sell-how">
            <h3>كيف تعمل الخدمة؟</h3>
            <div className="sell-how-grid">
              <div className="sell-how-step">
                <div className="sell-how-num">1</div>
                <h4>سجّل سيارتك</h4>
                <p>املا البيانات وارفع صور السيارة</p>
              </div>
              <div className="sell-how-step">
                <div className="sell-how-num">2</div>
                <h4>نراجع الطلب</h4>
                <p>فريقنا هيراجع البيانات ويتواصل معاك</p>
              </div>
              <div className="sell-how-step">
                <div className="sell-how-num">3</div>
                <h4>نعرضها للبيع</h4>
                <p>سيارتك تظهر على موقعنا لآلاف الزوار</p>
              </div>
              <div className="sell-how-step">
                <div className="sell-how-num">4</div>
                <h4>تتباع!</h4>
                <p>لما نلاقي مشتري — ننهي الصفقة معاك</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .sell-hero { position: relative; padding: 80px 0 60px; background: var(--grad-hero); text-align: center; overflow: hidden; isolation: isolate; }
        .sell-hero-bg { position: absolute; inset: 0; background: var(--grad-hero-radial); pointer-events: none; }
        .sell-hero::after {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          pointer-events: none;
        }
        .sell-hero-content { position: relative; z-index: 2; }
        .sell-hero-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(16,185,129,0.18); color: #34d399; padding: 7px 18px; border-radius: 50px; font-size: 13px; font-weight: 700; margin-bottom: 18px; border: 1px solid rgba(16,185,129,0.28); backdrop-filter: blur(8px); }
        .sell-hero h1 { font-size: clamp(2rem, 4.5vw, 3.5rem); font-weight: 900; color: white; margin-bottom: 14px; letter-spacing: -0.02em; line-height: 1.1; }
        .sell-hero p { color: rgba(255,255,255,0.72); font-size: 17px; max-width: 580px; margin-inline: auto; }

        .sell-content { padding: 40px 0 60px; }
        .sell-form-wrapper { max-width: 700px; margin: 0 auto 40px; }

        .sell-steps { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 30px; }
        .sell-step { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-muted); font-weight: 600; }
        .sell-step.active { color: var(--accent); }
        .sell-step span { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; background: var(--bg-secondary); border: 2px solid var(--border-light); }
        .sell-step.active span { background: var(--accent); color: white; border-color: var(--accent); }
        .sell-step-line { width: 60px; height: 2px; background: var(--border-light); }

        .sell-form { background: var(--bg-card); border-radius: 16px; padding: 28px; border: 1px solid var(--border-light); }
        .sell-form h3 { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
        .sell-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .sell-row-3 { grid-template-columns: 1fr 1fr 1fr; }

        .sell-upload-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; border: 2px dashed var(--border-light); background: var(--bg-primary); color: var(--text-secondary); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .sell-upload-btn:hover { border-color: var(--accent); color: var(--accent); }
        .sell-previews { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
        .sell-preview-img { width: 80px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid var(--border-light); }

        .sell-submit-btn { width: 100%; margin-top: 20px; font-size: 16px; font-weight: 700; }

        /* Success */
        .sell-success { text-align: center; max-width: 500px; margin: 0 auto 40px; padding: 40px 20px; }
        .sell-success-icon { font-size: 60px; margin-bottom: 16px; }
        .sell-success h2 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
        .sell-success-car { font-size: 18px; color: var(--accent); font-weight: 700; margin-bottom: 12px; }
        .sell-success p { color: var(--text-secondary); margin-bottom: 8px; }

        .sell-success-actions { display: flex; gap: 12px; justify-content: center; margin-top: 20px; flex-wrap: wrap; }
        .sell-action-btn { display: flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 700; text-decoration: none; transition: all 0.2s; }
        .sell-wa { background: #25d366; color: white; }
        .sell-wa:hover { background: #1da851; transform: scale(1.03); }
        .sell-call { background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-light); }
        .sell-call:hover { border-color: var(--accent); color: var(--accent); }

        /* How it works */
        .sell-how { max-width: 800px; margin: 0 auto; text-align: center; }
        .sell-how h3 { font-size: 20px; font-weight: 800; margin-bottom: 24px; }
        .sell-how-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .sell-how-step { background: var(--bg-card); border-radius: 14px; padding: 20px 16px; border: 1px solid var(--border-light); }
        .sell-how-num { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), #f97316); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; margin: 0 auto 10px; }
        .sell-how-step h4 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
        .sell-how-step p { font-size: 12px; color: var(--text-muted); line-height: 1.6; }

        @media (max-width: 768px) {
          .sell-row, .sell-row-3 { grid-template-columns: 1fr; }
          .sell-how-grid { grid-template-columns: repeat(2, 1fr); }
          .sell-success-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
