import { Link } from 'react-router-dom';
import { FaShieldAlt, FaHandshake, FaCar, FaClock, FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp, FaStar, FaUsers, FaAward, FaRoad } from 'react-icons/fa';
import { FiCheck, FiArrowLeft } from 'react-icons/fi';
import config, { waLink, telLink } from '../../config/siteConfig';
import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function About() {
  const [s, setS] = useState(null);
  useEffect(() => {
    document.title = 'من نحن — المراكبي لتجارة وإيجار السيارات | دمياط الجديدة';
    api.get('/api/settings').then(({ data }) => setS(data)).catch(() => {});
  }, []);

  const branches = s ? [
    { name: 'معرض المراكبي', address: s.address1 || '', mapUrl: s.address1_map || '' },
    { name: 'مكتب المراكبي لتجارة وايجار السيارات', address: s.address2 || '', mapUrl: s.address2_map || '' },
  ].filter(b => b.address) : config.branches;

  const stats = [
    { icon: <FaCar size={28} />, value: '50+', label: 'سيارة في الأسطول', color: '#e61e5a' },
    { icon: <FaUsers size={28} />, value: '1000+', label: 'عميل سعيد', color: '#3b82f6' },
    { icon: <FaRoad size={28} />, value: '500K+', label: 'كيلومتر مقطوعة', color: '#10b981' },
    { icon: <FaAward size={28} />, value: '5+', label: 'سنوات خبرة', color: '#f59e0b' },
  ];

  const values = [
    { icon: <FaShieldAlt size={24} />, title: 'الأمان والشفافية', desc: 'عقود واضحة بدون رسوم مخفية وتأمين شامل على جميع السيارات', color: '#3b82f6' },
    { icon: <FaHandshake size={24} />, title: 'خدمة عملاء متميزة', desc: 'فريق محترف جاهز لخدمتك على مدار الساعة لضمان رضاك التام', color: '#10b981' },
    { icon: <FaCar size={24} />, title: 'أسطول حديث ومتنوع', desc: 'سيارات بأحدث الموديلات مع صيانة دورية لضمان أعلى مستوى من الأمان والراحة', color: '#e61e5a' },
    { icon: <FaClock size={24} />, title: 'حجز سريع وسهل', desc: 'اختر سيارتك واحجزها أونلاين في أقل من 5 دقائق — بدون تعقيد', color: '#8b5cf6' },
    { icon: <FaStar size={24} />, title: 'أسعار تنافسية', desc: 'أسعار مدروسة تناسب جميع الميزانيات مع إيجار يومي وأسبوعي وشهري', color: '#f59e0b' },
    { icon: <FaAward size={24} />, title: 'سمعة وثقة', desc: 'سنوات من الخبرة والثقة في سوق دمياط الجديدة — عملاؤنا هم أفضل إعلان لنا', color: '#ec4899' },
  ];

  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-bg" />
        <div className="container about-hero-content">
          <div className="about-hero-badge">🏢 تعرف علينا</div>
          <h1>نحن <span className="text-gradient">المراكبي</span></h1>
          <p>شريكك الموثوق لتجارة وإيجار السيارات في دمياط الجديدة. نقدم لك سيارات للبيع والإيجار بأسعار تنافسية وخدمة لا مثيل لها.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div className="stat-card" key={i} style={{ '--accent': s.color }}>
                <div className="stat-icon">{s.icon}</div>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="about-story">
        <div className="container">
          <div className="story-grid">
            <div className="story-text">
              <div className="section-label">قصتنا</div>
              <h2>من البداية إلى الآن</h2>
              <p>
                بدأنا رحلتنا في دمياط الجديدة بهدف واحد: تقديم خدمة تجارة وإيجار سيارات على أعلى مستوى من الجودة والاحترافية. 
                نؤمن أن كل عميل يستحق تجربة مميزة، ولذلك نحرص على توفير سيارات حديثة ونظيفة للبيع والإيجار مع عقود شفافة وأسعار عادلة.
              </p>
              <p>
                اليوم، أصبحنا الخيار الأول في المنطقة بفضل ثقة عملائنا الكرام. نفخر بأسطولنا المتنوع الذي يلبي
                جميع الاحتياجات — سواء كنت بتدور على سيارة للشراء أو للإيجار اليومي أو الشهري.
              </p>
              <div className="story-highlights">
                {['سيارات للبيع والإيجار بأسعار تنافسية', 'عقود شفافة بدون رسوم مخفية', 'حجز إلكتروني سريع وآمن', 'تأمين شامل على كل السيارات'].map((h, i) => (
                  <div className="highlight-item" key={i}>
                    <FiCheck className="highlight-check" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="story-visual">
              <div className="visual-card">
                <div className="visual-emoji">🚗</div>
                <h3>{config.companyName}</h3>
                <p>{config.companySlogan}</p>
                <div className="visual-badge">منذ 2020</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-label center">لماذا نحن؟</div>
            <h2>ما يميزنا عن غيرنا</h2>
            <p>نحرص على تقديم أفضل تجربة تأجير سيارات</p>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div className="value-card" key={i} style={{ '--accent': v.color, animationDelay: `${i * 0.1}s` }}>
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="about-branches">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-label center">📍 فروعنا</div>
            <h2>زورنا في أي وقت</h2>
          </div>
          <div className="branches-grid">
            {branches.map((b, i) => (
              <a key={i} href={b.mapUrl} target="_blank" rel="noopener noreferrer" className="branch-card">
                <div className="branch-icon"><FaMapMarkerAlt size={28} /></div>
                <h3>{b.name}</h3>
                <p>{b.address}</p>
                <span className="branch-link">افتح في الخرائط ←</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container text-center">
          <h2>جاهز تحجز سيارتك؟</h2>
          <p>تصفح الأسطول واختر سيارتك المفضلة — الحجز أونلاين في دقائق</p>
          <div className="cta-actions">
            <Link to="/fleet" className="btn btn-primary btn-lg">
              تصفح السيارات <FiArrowLeft />
            </Link>
            <a href={waLink(config.whatsapp1)} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg cta-wa">
              <FaWhatsapp size={18} /> تواصل واتساب
            </a>
          </div>
          <div className="cta-phones">
            <a href={telLink(config.phone1)} className="cta-phone"><FaPhoneAlt size={14} /> {config.phone1}</a>
            <a href={telLink(config.phone2)} className="cta-phone"><FaPhoneAlt size={14} /> {config.phone2}</a>
          </div>
        </div>
      </section>

      <style>{`
        .about-page { overflow: hidden; }

        /* Hero */
        .about-hero {
          position: relative;
          padding: 90px 0 70px;
          background: var(--grad-hero);
          text-align: center;
          overflow: hidden;
          isolation: isolate;
        }
        .about-hero-bg {
          position: absolute; inset: 0;
          background: var(--grad-hero-radial);
          pointer-events: none;
        }
        .about-hero::after {
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
        .about-hero-content { position: relative; z-index: 2; }
        .about-hero-badge {
          display: inline-block;
          background: rgba(230,30,90,0.15);
          color: var(--accent-light);
          padding: 6px 20px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
          border: 1px solid rgba(230,30,90,0.2);
        }
        .about-hero h1 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 900;
          color: white;
          margin-bottom: 16px;
        }
        .about-hero p {
          font-size: 18px;
          color: rgba(255,255,255,0.7);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.8;
        }

        /* Stats */
        .about-stats {
          margin-top: -40px;
          position: relative;
          z-index: 3;
          padding: 0 0 40px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .stat-card {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 28px 20px;
          text-align: center;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-lg);
          transition: all 0.3s;
        }
        .stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-xl); }
        .stat-icon { color: var(--accent); margin-bottom: 12px; }
        .stat-card strong {
          display: block;
          font-size: 32px;
          font-weight: 900;
          color: var(--accent);
          margin-bottom: 4px;
        }
        .stat-card span { font-size: 13px; color: var(--text-secondary); }

        /* Story */
        .about-story { padding: 60px 0; }
        .story-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .section-label {
          display: inline-block;
          color: var(--accent);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .section-label.center { display: block; text-align: center; }
        .story-text h2 {
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          font-weight: 800;
          margin-bottom: 20px;
          color: var(--text-primary);
        }
        .story-text p {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 2;
          margin-bottom: 16px;
        }
        .story-highlights { margin-top: 24px; }
        .highlight-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .highlight-check {
          color: var(--success);
          background: var(--success-bg);
          border-radius: 50%;
          padding: 3px;
          flex-shrink: 0;
        }

        .story-visual { display: flex; justify-content: center; }
        .visual-card {
          background: var(--grad-hero);
          border-radius: 24px;
          padding: 48px 40px;
          text-align: center;
          color: white;
          position: relative;
          min-width: 260px;
          box-shadow: 0 20px 60px rgba(26,26,46,0.3);
        }
        .visual-emoji { font-size: 64px; margin-bottom: 16px; }
        .visual-card h3 { font-size: 28px; font-weight: 900; margin-bottom: 4px; }
        .visual-card p { font-size: 14px; opacity: 0.7; }
        .visual-badge {
          display: inline-block;
          margin-top: 16px;
          background: rgba(255,255,255,0.15);
          padding: 6px 16px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 700;
          border: 1px solid rgba(255,255,255,0.2);
        }

        /* Values */
        .about-values { padding: 60px 0; background: var(--bg-secondary); }
        .about-values .section-header { margin-bottom: 40px; }
        .about-values .section-header h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); font-weight: 800; margin-bottom: 8px; }
        .about-values .section-header p { color: var(--text-secondary); font-size: 16px; }
        .values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .value-card {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 28px 24px;
          border: 1px solid var(--border-light);
          transition: all 0.3s;
          animation: fadeIn 0.5s ease forwards;
          opacity: 0;
        }
        .value-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--accent); }
        .value-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          background: color-mix(in srgb, var(--accent) 10%, transparent);
          color: var(--accent);
        }
        .value-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
        .value-card p { font-size: 13px; color: var(--text-secondary); line-height: 1.8; }

        /* Branches */
        .about-branches { padding: 60px 0; }
        .about-branches .section-header { margin-bottom: 32px; }
        .about-branches .section-header h2 { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; margin-bottom: 8px; }
        .branches-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .branch-card {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 28px 24px;
          text-align: center;
          border: 2px solid var(--border-light);
          transition: all 0.3s;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .branch-card:hover { border-color: var(--accent); transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .branch-icon { color: var(--accent); margin-bottom: 12px; }
        .branch-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
        .branch-card p { font-size: 13px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 12px; }
        .branch-link { font-size: 12px; color: var(--accent); font-weight: 700; }

        /* CTA */
        .about-cta {
          padding: 80px 0;
          background: var(--grad-hero);
          color: white;
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        .about-cta::before {
          content: '';
          position: absolute; inset: 0;
          background: var(--grad-hero-radial);
          pointer-events: none;
        }
        .about-cta > .container { position: relative; z-index: 1; }
        .about-cta h2 { font-size: clamp(1.5rem, 3vw, 2.5rem); font-weight: 900; margin-bottom: 12px; }
        .about-cta > .container > p { font-size: 16px; opacity: 0.7; margin-bottom: 28px; }
        .cta-actions { display: flex; gap: 14px; justify-content: center; margin-bottom: 24px; }
        .cta-wa { color: #25d366 !important; border-color: #25d366 !important; }
        .cta-wa:hover { background: rgba(37,211,102,0.15) !important; }
        .cta-actions .btn-outline { color: white; border-color: rgba(255,255,255,0.3); }
        .cta-actions .btn-outline:hover { background: rgba(255,255,255,0.1); border-color: white; }
        .cta-phones { display: flex; gap: 24px; justify-content: center; }
        .cta-phone {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.6);
          font-size: 14px;
          transition: color 0.2s;
        }
        .cta-phone:hover { color: white; }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .story-grid { grid-template-columns: 1fr; }
          .story-visual { margin-top: 20px; }
          .values-grid { grid-template-columns: 1fr; }
          .branches-grid { grid-template-columns: 1fr; }
          .cta-actions { flex-direction: column; align-items: center; }
          .cta-phones { flex-direction: column; align-items: center; gap: 8px; }
        }
      `}</style>
    </div>
  );
}
