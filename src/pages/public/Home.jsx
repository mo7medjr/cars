import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { FaCar, FaShieldAlt, FaHandshake, FaStar, FaCarSide } from 'react-icons/fa';
import { FiArrowLeft, FiCheck, FiClock, FiMapPin, FiCreditCard, FiHeadphones } from 'react-icons/fi';
import {
  SiToyota, SiHyundai, SiKia, SiNissan, SiChevrolet, SiBmw, SiMitsubishi,
  SiRenault, SiVolkswagen, SiHonda, SiFord, SiAudi, SiPeugeot, SiSkoda,
  SiJeep, SiPorsche, SiMazda, SiSuzuki, SiFiat, SiTesla,
  SiSubaru, SiAlfaromeo, SiCadillac, SiAcura, SiLandrover, SiVolvo,
  SiSeat, SiCitroen, SiMaserati, SiOpel, SiInfiniti,
} from 'react-icons/si';
import api from '../../api/client';
import config from '../../config/siteConfig';
import useReveal from '../../hooks/useReveal';
import { carImageUrl } from '../../utils/imageUrl';
import CinematicHero from '../../components/home/CinematicHero';

// Custom Mercedes-Benz star logo (not available in react-icons/si)
const MercedesLogo = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
    <line x1="50" y1="50" x2="50" y2="6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="50" y1="50" x2="88" y2="72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="50" y1="50" x2="12" y2="72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

// Custom Lexus L monogram (not available in react-icons/si)
const LexusLogo = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <ellipse cx="50" cy="50" rx="46" ry="32" fill="none" stroke="currentColor" strokeWidth="4" />
    <path d="M30 28 L30 72 L70 72" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BRANDS = [
  { name: 'Toyota', Icon: SiToyota },
  { name: 'Hyundai', Icon: SiHyundai },
  { name: 'Kia', Icon: SiKia },
  { name: 'Nissan', Icon: SiNissan },
  { name: 'Chevrolet', Icon: SiChevrolet },
  { name: 'BMW', Icon: SiBmw },
  { name: 'Mercedes', Icon: MercedesLogo },
  { name: 'Mitsubishi', Icon: SiMitsubishi },
  { name: 'Renault', Icon: SiRenault },
  { name: 'Volkswagen', Icon: SiVolkswagen },
  { name: 'Honda', Icon: SiHonda },
  { name: 'Ford', Icon: SiFord },
  { name: 'Audi', Icon: SiAudi },
  { name: 'Peugeot', Icon: SiPeugeot },
  { name: 'Skoda', Icon: SiSkoda },
  { name: 'Lexus', Icon: LexusLogo },
  { name: 'Jeep', Icon: SiJeep },
  { name: 'Porsche', Icon: SiPorsche },
  { name: 'Mazda', Icon: SiMazda },
  { name: 'Suzuki', Icon: SiSuzuki },
  { name: 'Fiat', Icon: SiFiat },
  { name: 'Tesla', Icon: SiTesla },
  { name: 'Subaru', Icon: SiSubaru },
  { name: 'Alfa Romeo', Icon: SiAlfaromeo },
  { name: 'Cadillac', Icon: SiCadillac },
  { name: 'Acura', Icon: SiAcura },
  { name: 'Land Rover', Icon: SiLandrover },
  { name: 'Volvo', Icon: SiVolvo },
  { name: 'Seat', Icon: SiSeat },
  { name: 'Citroen', Icon: SiCitroen },
  { name: 'Maserati', Icon: SiMaserati },
  { name: 'Opel', Icon: SiOpel },
  { name: 'Infiniti', Icon: SiInfiniti },
];

const TESTIMONIALS = [
  { name: 'أحمد محمود', city: 'دمياط الجديدة', text: 'تجربة ممتازة جداً، السيارة كانت نظيفة والسعر مناسب والاستلام سريع.', rating: 5 },
  { name: 'سارة عبد الله', city: 'القاهرة', text: 'أفضل مكان لتأجير السيارات في دمياط. خدمة عملاء راقية وعقد واضح بدون رسوم خفية.', rating: 5 },
  { name: 'محمد صلاح', city: 'دمياط', text: 'اشتريت سيارة من المعرض، حالة ممتازة وسعر تنافسي. أنصح أي حد يتعامل معاهم.', rating: 5 },
  { name: 'علي حسن', city: 'المنصورة', text: 'حجزت أونلاين والإجراءات اتخلصت في 5 دقايق بس. السيارة كانت جاهزة في الميعاد بالظبط.', rating: 5 },
  { name: 'مريم إبراهيم', city: 'الإسكندرية', text: 'أسعار حلوة وخدمة محترمة. استلمت السيارة من المكتب من غير أي تأخير ولا مشاكل.', rating: 5 },
  { name: 'يوسف خالد', city: 'دمياط', text: 'أنا عميل دائم عندهم من سنتين، مفيش مكان زي المراكبي في الالتزام والمصداقية.', rating: 5 },
  { name: 'نور الدين', city: 'بورسعيد', text: 'بعت عربيتي عندهم وقدّروها سعر عادل ومتعرّضتش لأي ضغط. أنصح بيهم بكل ثقة.', rating: 5 },
  { name: 'هدى مصطفى', city: 'دمياط الجديدة', text: 'أول مرة أأجر سيارة وكنت قلقانة، بس الموظفين شرحولي كل حاجة بصبر وراحة بال.', rating: 5 },
  { name: 'كريم أشرف', city: 'كفر الشيخ', text: 'العقد كان واضح من أوله لآخره، مفيش رسوم خفية أو مفاجآت. تجربة محترمة فعلاً.', rating: 5 },
  { name: 'فاطمة الزهراء', city: 'القاهرة', text: 'أسطول السيارات متنوع جداً وتقدر تختار اللي يناسبك في الميزانية. بجد شغل احترافي.', rating: 5 },
  { name: 'إسلام رفعت', city: 'دمياط الجديدة', text: 'استأجرت سيارة لفرح أخويا، وصلت في الميعاد وكانت نظيفة جداً ومجهزة. أهنّيهم على دقّة المواعيد.', rating: 5 },
  { name: 'دينا عاطف', city: 'دمياط الجديدة', text: 'بعت عربيتي عندهم بسعر كويس ومن غير لف ودوران. الإجراءات اتخلصت في يومين بس.', rating: 5 },
  { name: 'طارق فتحي', city: 'دمياط الجديدة', text: 'استئجار شهري لشغلي وأنا مسافر برّه. كل شهر السيارة بتتسلّم نضيفة وعداد التأمين واضح.', rating: 5 },
  { name: 'منى سعيد', city: 'دمياط الجديدة', text: 'المكتب قريب وسهل الوصول. الموظفين بيرحبوا بيك زي أهلك بجد. تجربة بتشجّع على التكرار.', rating: 5 },
  { name: 'وليد عبد الرحمن', city: 'رأس البر', text: 'استأجرت عربية للأجازة الصيفية مع العيلة. كل حاجة كانت ممتازة من الاستلام للتسليم.', rating: 5 },
  { name: 'رنا حسام', city: 'دمياط الجديدة', text: 'اشتريت سيارة مستعملة بحالة جديدة من المعرض. فحصوها قدامي وشرحوا كل تفاصيلها — مفيش غش.', rating: 5 },
  { name: 'بسّام مجدي', city: 'شربين', text: 'سعر السيارة المستعملة كان أقل من السوق بفرق محترم. وفّرت كتير وريحة من التفاوض.', rating: 5 },
  { name: 'إيمان رضا', city: 'دمياط الجديدة', text: 'محتاجة عربية فجأة لظروف، اتصلت بيهم وفي ساعتين كانت جاهزة عندي. خدمة طوارئ حقيقية.', rating: 5 },
];

export default function Home() {
  const [cars, setCars] = useState([]);
  const [settings, setSettings] = useState(null);
  useReveal([cars.length]);

  useEffect(() => {
    document.title = 'المراكبي لتجارة وإيجار السيارات | بيع وإيجار سيارات في دمياط الجديدة';
  }, []);

  useEffect(() => {
    const fetchData = () => {
      api.get('/api/cars/public/all').then(({ data }) => setCars(data.items || [])).catch(() => {});
    };
    fetchData();
    api.get('/api/settings').then(({ data }) => setSettings(data)).catch(() => {});
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const available = useMemo(() => cars.filter(c => c.status === 'available'), [cars]);
  const liveCount = available.length;

  // Hero: cheapest available car
  const heroCar = useMemo(() => {
    if (!available.length) return null;
    return available.reduce((min, c) => Number(c.daily_rate) < Number(min.daily_rate) ? c : min, available[0]);
  }, [available]);

  // Featured: top 6 available, prefer with images
  const featured = useMemo(() => {
    const withImg = available.filter(c => c.images && c.images.length);
    return (withImg.length ? withImg : available).slice(0, 6);
  }, [available]);

  const phone = settings?.whatsapp1 || config.whatsapp1;

  return (
    <div className="home-page">
      {/* ─── CINEMATIC HERO ───────────────────────────────── */}
      <CinematicHero heroCar={heroCar} liveCount={liveCount} phone={phone} />

      {/* ─── BRAND MARQUEE ───────────────────────────────── */}
      <section className="brand-strip">
        <div className="container">
          <div className="brand-strip-header">
            <span className="brand-strip-label">ماركات نتعامل معها</span>
            <span className="brand-strip-sub">تشكيلة واسعة من أفخم ماركات السيارات العالمية</span>
          </div>
          <div className="brand-marquee">
            <div className="marquee-fade marquee-fade-start" aria-hidden="true" />
            <div className="marquee-fade marquee-fade-end" aria-hidden="true" />
            <div className="brand-track">
              {[...BRANDS, ...BRANDS].map((b, i) => {
                const Icon = b.Icon;
                return (
                  <div key={i} className="brand-logo-card" title={b.name}>
                    <Icon className="brand-logo-svg" />
                    <span className="brand-logo-name">{b.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section className="how-it-works-v2">
        <div className="container">
          <div className="section-header text-center reveal">
            <span className="section-eyebrow">كيف يعمل النظام؟</span>
            <h2>3 خطوات بسيطة لاستلام سيارتك</h2>
            <p>اختار، احجز، استلم — كل ده في أقل من 10 دقائق.</p>
          </div>
          <div className="steps-v2">
            {[
              { icon: <FaCar size={26} />, title: 'اختر سيارتك', desc: 'تصفّح الأسطول واختر السيارة الأنسب من حيث الموديل والسعر.', color: '#e61e5a' },
              { icon: <FaShieldAlt size={26} />, title: 'أكمل البيانات', desc: 'املأ بياناتك الشخصية، ارفع البطاقة والرخصة — كل ده أونلاين.', color: '#3b82f6' },
              { icon: <FaHandshake size={26} />, title: 'وقّع واستلم', desc: 'تعالى المكتب لتوقيع العقد واستلام السيارة فوراً.', color: '#10b981' },
            ].map((s, i) => (
              <div key={i} className="step-v2 reveal" style={{ transitionDelay: `${i * 40}ms` }}>
                <div className="step-v2-num">{i + 1}</div>
                <div className="step-v2-icon" style={{ background: `${s.color}1a`, color: s.color }}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED CARS ────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="featured-cars">
          <div className="container">
            <div className="flex-between mb-2 reveal" style={{ flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span className="section-eyebrow">سيارات مختارة لك</span>
                <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginTop: 4 }}>الأكثر طلباً للإيجار</h2>
              </div>
              <Link to="/fleet" className="btn btn-outline btn-lg">شاهد كل الأسطول <FiArrowLeft /></Link>
            </div>

            <div className="featured-grid">
              {featured.map((car, idx) => (
                <Link key={car.id} to={`/book/${car.id}`} className="feat-card reveal" style={{ transitionDelay: `${idx * 30}ms` }}>
                  <div className="feat-card-img">
                    {car.images?.[0] ? (
                      <img src={carImageUrl(car.images[0])} alt={`${car.make} ${car.model}`} />
                    ) : (
                      <div className="feat-card-placeholder">🚘</div>
                    )}
                    <span className="feat-card-badge">متاحة</span>
                    <div className="feat-card-overlay">
                      <span className="feat-price">{Number(car.daily_rate).toLocaleString()} <small>ج.م/يوم</small></span>
                    </div>
                  </div>
                  <div className="feat-card-body">
                    <h3>{car.make} {car.model}</h3>
                    <div className="feat-card-meta">
                      <span>📅 {car.year}</span>
                      {car.color && <span>🎨 {car.color}</span>}
                    </div>
                    <span className="feat-card-cta">احجز الآن <FiArrowLeft /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── WHY US ───────────────────────────────────────── */}
      <section className="why-us-v2">
        <div className="container why-grid">
          <div className="why-text reveal">
            <span className="section-eyebrow">ليه المراكبي؟</span>
            <h2>تجربة تأجير وبيع سيارات <span className="text-gradient-accent">بمعايير مختلفة</span></h2>
            <p className="why-desc">من 2010 وإحنا بنخدم عملاء دمياط ومحافظات مصر بإحترافية وشفافية. هدفنا تجربة بدون مفاجآت.</p>

            <div className="why-features">
              {[
                { icon: <FiCheck />, text: 'أسعار تنافسية بدون رسوم خفية' },
                { icon: <FiCheck />, text: 'سيارات حديثة وصيانة دورية' },
                { icon: <FiCheck />, text: 'عقود واضحة وشفافة' },
                { icon: <FiCheck />, text: 'تأمين شامل على جميع السيارات' },
                { icon: <FiCheck />, text: 'خدمة عملاء على مدار الساعة' },
                { icon: <FiCheck />, text: 'حجز إلكتروني سريع وآمن' },
              ].map((f, i) => (
                <div key={i} className="why-feat">
                  <span className="why-feat-icon">{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>

            <div className="hero-cta-row" style={{ marginTop: 24 }}>
              <Link to="/fleet" className="btn btn-primary btn-lg">ابدأ الحجز الآن <FiArrowLeft /></Link>
              <Link to="/about" className="btn btn-outline btn-lg">تعرّف علينا</Link>
            </div>
          </div>

          <div className="why-cards reveal">
            <div className="why-icon-card why-card-1">
              <FiClock size={26} />
              <strong>حجز في 5 دقائق</strong>
              <span>عبر الموقع أو واتساب</span>
            </div>
            <div className="why-icon-card why-card-2">
              <FiCreditCard size={26} />
              <strong>دفع مرن</strong>
              <span>كاش أو إلكتروني</span>
            </div>
            <div className="why-icon-card why-card-3">
              <FiHeadphones size={26} />
              <strong>دعم 24/7</strong>
              <span>اتصل في أي وقت</span>
            </div>
            <div className="why-icon-card why-card-4">
              <FaCarSide size={26} />
              <strong>أسطول متنوع</strong>
              <span>من اقتصادي لـ VIP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS MARQUEE ─────────────────────────── */}
      <section className="testimonials-marquee-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">آراء عملائنا</span>
            <h2>عملاء سعداء يثقون بنا</h2>
            <p>أكتر من <strong>3000 عميل</strong> اتعاملوا معانا في الإيجار والشراء.</p>
          </div>
        </div>
        <div className="testi-marquee">
          <div className="marquee-fade marquee-fade-start" aria-hidden="true" />
          <div className="marquee-fade marquee-fade-end" aria-hidden="true" />
          <div className="testi-track">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <article key={i} className="testi-card-mq">
                <div className="testi-quote-mark">&ldquo;</div>
                <div className="testimonial-stars">
                  {Array.from({ length: t.rating }).map((_, j) => <FaStar key={j} size={13} />)}
                </div>
                <p className="testi-card-text">{t.text}</p>
                <div className="testi-card-author">
                  <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span><FiMapPin size={11} /> {t.city}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .home-page { background: var(--bg-primary); }

        /* ─── HERO ─────────────────────────────────────────── */
        .hero-v2 {
          position: relative;
          padding: var(--space-4xl) 0 var(--space-3xl);
          background: var(--grad-hero);
          color: white;
          overflow: hidden;
          isolation: isolate;
        }
        .hero-gradient { position: absolute; inset: 0; background: var(--grad-hero-radial); pointer-events: none; }
        .hero-mesh {
          position: absolute; inset: -10%;
          background:
            radial-gradient(circle at 20% 30%, rgba(230,30,90,0.12) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(212,168,67,0.10) 0%, transparent 40%);
          filter: blur(40px);
          animation: gradientShift 14s ease-in-out infinite;
          background-size: 200% 200%;
          pointer-events: none;
        }
        .hero-grid-bg {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
          pointer-events: none;
          opacity: 0.6;
        }
        .hero-v2-content {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: var(--space-3xl);
          align-items: center;
        }
        .hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          font-weight: 700;
          color: white;
          margin-bottom: var(--space-lg);
        }
        .live-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulseRing 1.6s ease-out infinite;
        }
        .hero-title {
          font-size: var(--font-size-display);
          font-weight: 900;
          color: white;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin-bottom: var(--space-lg);
        }
        .hero-desc {
          font-size: var(--font-size-lg);
          color: rgba(255,255,255,0.78);
          line-height: 1.85;
          margin-bottom: var(--space-xl);
          max-width: 560px;
        }
        .hero-desc strong { color: var(--gold-light); font-weight: 800; }
        .hero-cta-row {
          display: flex;
          gap: var(--space-md);
          flex-wrap: wrap;
          margin-bottom: var(--space-xl);
        }
        .hero-trust {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          padding: var(--space-md) var(--space-lg);
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: var(--radius-xl);
          width: fit-content;
        }
        .trust-item { display: flex; flex-direction: column; gap: 2px; }
        .trust-item strong { font-size: var(--font-size-2xl); font-weight: 900; color: var(--gold); line-height: 1; letter-spacing: -0.02em; }
        .trust-item span { font-size: var(--font-size-xs); color: rgba(255,255,255,0.65); }
        .trust-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.15); }

        /* Hero visual */
        .hero-v2-visual {
          position: relative;
          min-height: 480px;
        }
        .hero-car-main {
          position: relative;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: var(--radius-2xl);
          padding: var(--space-lg);
          box-shadow: 0 24px 60px rgba(0,0,0,0.30);
          animation: floatSlow 7s ease-in-out infinite;
        }
        .hero-car-tag {
          position: absolute;
          top: -14px;
          right: 24px;
          background: var(--grad-accent);
          color: white;
          padding: 0.45rem 1rem;
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: var(--shadow-accent);
        }
        .hero-car-photo {
          width: 100%;
          height: 220px;
          border-radius: var(--radius-xl);
          overflow: hidden;
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
          margin-bottom: var(--space-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-car-photo img { width: 100%; height: 100%; object-fit: cover; }
        .hero-car-placeholder { font-size: 80px; opacity: 0.5; }
        .hero-car-details h3 { color: white; font-size: var(--font-size-xl); font-weight: 800; margin-bottom: 6px; letter-spacing: -0.01em; }
        .hero-car-meta { display: flex; gap: 14px; color: rgba(255,255,255,0.6); font-size: var(--font-size-xs); margin-bottom: var(--space-md); }
        .hero-car-price-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); padding-top: var(--space-md); border-top: 1px solid rgba(255,255,255,0.1); }
        .hero-car-price { font-size: var(--font-size-3xl); font-weight: 900; color: var(--gold); letter-spacing: -0.02em; }
        .hero-car-price-unit { font-size: var(--font-size-xs); color: rgba(255,255,255,0.6); margin-right: 6px; }

        .hero-stat-float {
          position: absolute;
          background: white;
          border-radius: var(--radius-lg);
          padding: 0.85rem 1.1rem;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: var(--shadow-xl);
          color: var(--text-primary);
          animation: float 6s ease-in-out infinite;
        }
        .hero-stat-float strong { display: block; font-size: var(--font-size-sm); font-weight: 800; }
        .hero-stat-float span { font-size: 11px; color: var(--text-secondary); }
        .hero-stat-1 { top: 30px; right: -12px; color: var(--accent); }
        .hero-stat-1 svg { color: var(--accent); }
        .hero-stat-2 { bottom: 24px; left: -16px; animation-delay: 2s; }
        .hero-stat-2 svg { color: var(--gold); }

        .hero-wave {
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          line-height: 0;
          z-index: 1;
        }
        .hero-wave svg { width: 100%; height: 60px; display: block; }

        /* ─── BRAND STRIP ────────────────────────────── */
        .brand-strip {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-light);
          padding: var(--space-2xl) 0;
        }
        .brand-strip-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }
        .brand-strip-label {
          display: block;
          font-size: var(--font-size-xs);
          color: var(--accent);
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .brand-strip-sub {
          display: block;
          font-size: var(--font-size-base);
          color: var(--text-secondary);
          margin-top: 6px;
        }
        .brand-marquee {
          position: relative;
          overflow: hidden;
          direction: ltr;
        }
        .marquee-fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 80px;
          z-index: 2;
          pointer-events: none;
        }
        .brand-strip .marquee-fade-start {
          left: 0;
          background: linear-gradient(90deg, var(--bg-secondary) 0%, transparent 100%);
        }
        .brand-strip .marquee-fade-end {
          right: 0;
          background: linear-gradient(270deg, var(--bg-secondary) 0%, transparent 100%);
        }
        .brand-track {
          display: flex;
          gap: var(--space-md);
          width: max-content;
          animation: marquee 55s linear infinite;
          padding: var(--space-sm) 0;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .brand-track:hover { animation-play-state: paused; }
        .brand-logo-card {
          flex-shrink: 0;
          width: 140px;
          height: 110px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: var(--space-md);
          transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
          position: relative;
          overflow: hidden;
        }
        .brand-logo-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--grad-card-hover);
          opacity: 0;
          transition: opacity var(--transition-base);
        }
        .brand-logo-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent);
        }
        .brand-logo-card:hover::before { opacity: 1; }
        .brand-logo-svg {
          width: 42px;
          height: 42px;
          color: var(--text-primary);
          opacity: 0.85;
          transition: color var(--transition-base), opacity var(--transition-base), transform var(--transition-base);
          position: relative;
          z-index: 1;
        }
        .brand-logo-card:hover .brand-logo-svg {
          color: var(--accent);
          opacity: 1;
          transform: scale(1.08);
        }
        .brand-logo-name {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.02em;
          position: relative;
          z-index: 1;
          transition: color var(--transition-base);
        }
        .brand-logo-card:hover .brand-logo-name { color: var(--accent); }

        /* ─── HOW IT WORKS V2 ──────────────────────────────── */
        .how-it-works-v2 { padding: var(--space-4xl) 0; }
        .section-eyebrow {
          display: inline-block;
          padding: 0.3rem 0.85rem;
          background: var(--accent-soft);
          color: var(--accent);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          font-weight: 800;
          letter-spacing: 0.02em;
          margin-bottom: var(--space-md);
        }
        .section-header h2 {
          font-size: var(--font-size-3xl);
          font-weight: 900;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin-bottom: var(--space-sm);
        }
        .section-header p {
          font-size: var(--font-size-lg);
          color: var(--text-secondary);
          max-width: 580px;
          margin: 0 auto;
        }
        .section-header { margin-bottom: var(--space-3xl); }
        .steps-v2 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-xl);
        }
        .step-v2 {
          position: relative;
          padding: var(--space-xl);
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          text-align: center;
          transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
        }
        .step-v2:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent);
        }
        .step-v2-num {
          position: absolute;
          top: 18px;
          right: 18px;
          font-size: var(--font-size-3xl);
          font-weight: 900;
          color: var(--bg-soft);
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .step-v2-icon {
          width: 64px; height: 64px;
          border-radius: var(--radius-lg);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-lg);
        }
        .step-v2 h3 { font-size: var(--font-size-xl); font-weight: 800; margin-bottom: 8px; }
        .step-v2 p { color: var(--text-secondary); line-height: 1.85; font-size: var(--font-size-sm); }

        /* ─── FEATURED CARS ────────────────────────────────── */
        .featured-cars { padding: var(--space-4xl) 0; background: var(--bg-secondary); }
        .featured-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-xl); }
        .feat-card {
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          overflow: hidden;
          border: 1px solid var(--border-light);
          transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
          color: inherit;
          text-decoration: none;
          display: block;
        }
        .feat-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-xl); border-color: var(--accent); }
        .feat-card-img {
          position: relative;
          height: 220px;
          overflow: hidden;
          background: linear-gradient(135deg, #eef0f7, #dde2ee);
        }
        .feat-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 600ms cubic-bezier(0.4,0,0.2,1); }
        .feat-card:hover .feat-card-img img { transform: scale(1.08); }
        .feat-card-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 70px; opacity: 0.4; }
        .feat-card-badge {
          position: absolute; top: 12px; right: 12px;
          background: rgba(16,185,129,0.95);
          color: white;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          font-weight: 800;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .feat-card-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 0.75rem 1.1rem;
          background: linear-gradient(180deg, transparent 0%, rgba(20,20,58,0.55) 35%, rgba(20,20,58,0.92) 100%);
          color: white;
        }
        .feat-price {
          font-size: var(--font-size-2xl);
          font-weight: 900;
          background: var(--grad-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }
        .feat-price small { font-size: 11px; color: rgba(255,255,255,0.7); -webkit-text-fill-color: initial; background: none; margin-right: 4px; font-weight: 600; }
        .feat-card-body { padding: var(--space-md) var(--space-lg) var(--space-lg); }
        .feat-card-body h3 { font-size: var(--font-size-lg); font-weight: 800; margin-bottom: 6px; }
        .feat-card-meta { display: flex; gap: 12px; color: var(--text-secondary); font-size: var(--font-size-xs); margin-bottom: var(--space-md); }
        .feat-card-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--accent);
          font-weight: 800;
          font-size: var(--font-size-sm);
          transition: transform var(--transition-fast);
        }
        .feat-card:hover .feat-card-cta { transform: translateX(-4px); }

        /* ─── WHY US ───────────────────────────────────────── */
        .why-us-v2 { padding: var(--space-4xl) 0; }
        .why-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: var(--space-3xl); align-items: center; }
        .why-text h2 { font-size: var(--font-size-3xl); font-weight: 900; line-height: 1.2; letter-spacing: -0.02em; margin-bottom: var(--space-md); }
        .why-desc { color: var(--text-secondary); font-size: var(--font-size-lg); line-height: 1.85; margin-bottom: var(--space-xl); }
        .why-features { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm) var(--space-md); margin-bottom: var(--space-md); }
        .why-feat { display: flex; align-items: center; gap: 10px; font-size: var(--font-size-sm); color: var(--text-primary); font-weight: 600; }
        .why-feat-icon { width: 22px; height: 22px; border-radius: 50%; background: var(--success-bg); color: var(--success); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }

        .why-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-md);
          position: relative;
        }
        .why-icon-card {
          padding: var(--space-lg);
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
        }
        .why-icon-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); border-color: var(--accent); }
        .why-icon-card svg { color: var(--accent); margin-bottom: 6px; }
        .why-icon-card strong { font-size: var(--font-size-base); font-weight: 800; }
        .why-icon-card span { font-size: var(--font-size-xs); color: var(--text-secondary); }
        .why-card-2 { transform: translateY(28px); }
        .why-card-3 { transform: translateY(-28px); }
        .why-card-2 svg, .why-card-4 svg { color: var(--gold); }

        /* ─── TESTIMONIALS MARQUEE ─────────────────────────── */
        .testimonials-marquee-section {
          padding: var(--space-4xl) 0;
          background: var(--bg-secondary);
          overflow: hidden;
        }
        .testimonials-marquee-section .section-header { margin-bottom: var(--space-2xl); }
        .testimonials-marquee-section p strong { color: var(--accent); font-weight: 900; }
        .testi-marquee {
          position: relative;
          overflow: hidden;
          direction: ltr;
        }
        .testimonials-marquee-section .marquee-fade-start {
          left: 0;
          background: linear-gradient(90deg, var(--bg-secondary) 0%, transparent 100%);
        }
        .testimonials-marquee-section .marquee-fade-end {
          right: 0;
          background: linear-gradient(270deg, var(--bg-secondary) 0%, transparent 100%);
        }
        .testi-track {
          display: flex;
          gap: var(--space-lg);
          width: max-content;
          animation: marquee 55s linear infinite;
          padding: var(--space-md) 0;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .testi-track:hover { animation-play-state: paused; }
        .testi-card-mq {
          flex-shrink: 0;
          width: 360px;
          padding: var(--space-xl);
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          position: relative;
          direction: rtl;
          text-align: right;
          transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
        }
        .testi-card-mq:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent);
        }
        .testi-quote-mark {
          position: absolute;
          top: 8px;
          left: 16px;
          font-size: 70px;
          line-height: 1;
          color: var(--accent);
          opacity: 0.12;
          font-family: Georgia, serif;
          font-weight: 900;
        }
        .testi-card-text {
          color: var(--text-primary);
          line-height: 1.85;
          font-size: var(--font-size-sm);
          margin: var(--space-md) 0 var(--space-lg);
          min-height: 100px;
          position: relative;
          z-index: 1;
        }
        .testi-card-author {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: var(--space-md);
          border-top: 1px solid var(--border-light);
        }
        .testimonial-stars { display: flex; gap: 2px; color: var(--gold); }
        .testimonial-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: var(--grad-accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: var(--font-size-lg);
          flex-shrink: 0;
        }
        .testi-card-author strong { display: block; font-size: var(--font-size-sm); }
        .testi-card-author span { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-secondary); }

        /* ─── RESPONSIVE ───────────────────────────────────── */
        @media (max-width: 1024px) {
          .hero-v2-content { grid-template-columns: 1fr; text-align: center; }
          .hero-v2-text { display: flex; flex-direction: column; align-items: center; }
          .hero-trust { width: 100%; justify-content: center; }
          .hero-cta-row { justify-content: center; }
          .hero-v2-visual { min-height: 400px; max-width: 460px; margin: 0 auto; }
          .why-grid { grid-template-columns: 1fr; gap: var(--space-2xl); }
          .featured-grid { grid-template-columns: repeat(2, 1fr); }
          .steps-v2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .hero-v2 { padding: var(--space-3xl) 0 var(--space-3xl); }
          .hero-title { font-size: var(--font-size-3xl); }
          .hero-desc { font-size: var(--font-size-base); }
          .hero-trust { flex-wrap: wrap; gap: var(--space-md); padding: var(--space-md); }
          .trust-divider { display: none; }
          .trust-item strong { font-size: var(--font-size-xl); }
          .hero-stat-float { display: none; }
          .why-features, .why-cards { grid-template-columns: 1fr; }
          .why-card-2, .why-card-3 { transform: none; }
          .featured-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
          .feat-card-img { height: 130px; }
          .feat-card-body { padding: var(--space-sm) var(--space-md) var(--space-md); }
          .feat-card-body h3 { font-size: var(--font-size-base); margin-bottom: 4px; }
          .feat-card-meta { font-size: 11px; gap: 8px; margin-bottom: var(--space-sm); flex-wrap: wrap; }
          .feat-card-overlay { padding: 0.5rem 0.75rem; }
          .feat-price { font-size: var(--font-size-base); }
          .feat-card-cta { font-size: 12px; }
          .brand-logo-card { width: 130px; height: 105px; gap: 6px; }
          .brand-logo-svg { width: 40px; height: 40px; }
          .brand-logo-name { font-size: 12px; }
          .marquee-fade { width: 40px; }
          .testi-card-mq { width: 290px; padding: var(--space-lg); }
          .testi-card-text { min-height: 80px; font-size: 13px; }
        }
        @media (max-width: 380px) {
          .featured-grid { gap: var(--space-sm); }
          .feat-card-img { height: 110px; }
          .feat-card-body { padding: 0.5rem 0.65rem 0.7rem; }
          .feat-card-body h3 { font-size: var(--font-size-sm); }
        }
      `}</style>
    </div>
  );
}
