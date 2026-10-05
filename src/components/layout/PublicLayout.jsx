import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import config, { waLink, telLink } from '../../config/siteConfig';
import api from '../../api/client';
import FloatingActions from '../FloatingActions';

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [s, setS] = useState(null);

  useEffect(() => {
    api.get('/api/settings').then(({ data }) => setS(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const branches = s ? [
    { name: 'معرض المراكبي', address: s.address1 || '', mapUrl: s.address1_map || '' },
    { name: 'مكتب المراكبي', address: s.address2 || '', mapUrl: s.address2_map || '' },
  ].filter(b => b.address) : config.branches;

  const navLinks = [
    { path: '/', label: 'الرئيسية' },
    { path: '/fleet', label: 'أسطول السيارات' },
    { path: '/sales', label: 'سيارات للبيع' },
    { path: '/sell-your-car', label: 'بيع سيارتك' },
    { path: '/about', label: 'من نحن' },
    { path: '/track', label: 'تتبع حجزك' },
  ];

  return (
    <div className="public-layout" dir="rtl">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container flex-between">
          <div className="top-bar-info">
            <a href={waLink(s?.whatsapp1 || config.whatsapp1)} target="_blank" rel="noopener noreferrer" className="top-bar-wa"><FaWhatsapp size={13} /> {s?.whatsapp1 || config.whatsapp1}</a>
            <a href={waLink(s?.whatsapp2 || config.whatsapp2)} target="_blank" rel="noopener noreferrer" className="top-bar-wa"><FaWhatsapp size={13} /> {s?.whatsapp2 || config.whatsapp2}</a>
            <a href={telLink(s?.phone1 || config.phone1)} className="top-bar-phone"><FiPhone size={13} /> {s?.phone1 || config.phone1}</a>
            <a href={telLink(s?.phone2 || config.phone2)} className="top-bar-phone"><FiPhone size={13} /> {s?.phone2 || config.phone2}</a>
            {branches[0] && <a href={branches[0].mapUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.7)' }}><FiMapPin size={13} /> {branches[0].name}</a>}
          </div>
          <Link to="/admin/login" className="top-bar-admin">🔒 دخول</Link>
        </div>
      </div>

      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container flex-between">
          <Link to="/" className="navbar-brand">
            <img src="/logo.png" alt={config.companyName} className="brand-logo-img" />
            <div>
              <span className="brand-name">{config.companyName}</span>
              <span className="brand-sub">{config.companySlogan}</span>
            </div>
          </Link>

          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/fleet" className="btn btn-primary nav-cta" onClick={() => setMenuOpen(false)}>
              احجز سيارتك الآن
            </Link>
            <Link to="/admin/login" className="nav-link mobile-login-link" onClick={() => setMenuOpen(false)}>
              🔒 دخول الموظفين
            </Link>
          </div>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="public-main">
        <Outlet />
      </main>

      <FloatingActions />

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/logo.png" alt={config.companyName} style={{ width: '60px', height: '60px', objectFit: 'contain', filter: 'brightness(0) invert(1) opacity(0.9)' }} />
                <div>
                  <h3>{config.companyName}</h3>
                  <p>{config.companySlogan}</p>
                </div>
              </div>
              <p className="footer-desc">
                سيارات للبيع والإيجار بأسعار تنافسية مع خدمة متميزة وراحة بال كاملة.
              </p>
            </div>
            <div className="footer-links-group">
              <h4>روابط سريعة</h4>
              <Link to="/">الرئيسية</Link>
              <Link to="/fleet">أسطول السيارات</Link>
              <Link to="/sales">سيارات للبيع</Link>
              <Link to="/about">من نحن</Link>
              <Link to="/track">تتبع حجزك</Link>
            </div>
            <div className="footer-links-group">
              <h4>تواصل معنا</h4>
              <a href={waLink(s?.whatsapp1 || config.whatsapp1)} target="_blank" rel="noopener noreferrer" className="footer-contact-link wa-link">
                <FaWhatsapp size={16} /> {s?.whatsapp1 || config.whatsapp1}
              </a>
              <a href={waLink(s?.whatsapp2 || config.whatsapp2)} target="_blank" rel="noopener noreferrer" className="footer-contact-link wa-link">
                <FaWhatsapp size={16} /> {s?.whatsapp2 || config.whatsapp2}
              </a>
              <a href={telLink(s?.phone1 || config.phone1)} className="footer-contact-link phone-link">
                <FiPhone size={14} /> {s?.phone1 || config.phone1}
              </a>
              <a href={telLink(s?.phone2 || config.phone2)} className="footer-contact-link phone-link">
                <FiPhone size={14} /> {s?.phone2 || config.phone2}
              </a>
              <p>📧 {s?.email || config.email}</p>
              <div style={{ marginTop: '8px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>📍 فروعنا:</p>
                {branches.map((branch, i) => (
                  <a key={i} href={branch.mapUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', transition: 'color 0.2s', lineHeight: 1.6 }}>
                    🏢 <strong>{branch.name}</strong><br/>
                    <span style={{ opacity: 0.7, paddingRight: '18px', display: 'inline-block' }}>{branch.address}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} {config.companyName} {config.companySlogan} — جميع الحقوق محفوظة</p>
            <p className="footer-credits">تم التصميم والبرمجة بكل حب ❤️ بواسطة <a href="https://www.facebook.com/Mo7medjr/" target="_blank" rel="noopener noreferrer">محمد رضا</a></p>
          </div>
        </div>
      </footer>

      <style>{`
        .top-bar {
          background: var(--primary-dark);
          color: rgba(255,255,255,0.7);
          padding: 8px 0;
          font-size: var(--font-size-xs);
        }
        .top-bar-info { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }
        .top-bar-info span, .top-bar-info a { display: flex; align-items: center; gap: 5px; }
        .top-bar-wa {
          color: #25d366;
          font-weight: 600;
          transition: all var(--transition-fast);
        }
        .top-bar-wa:hover { color: #4ae17f; text-shadow: 0 0 8px rgba(37,211,102,0.4); }
        .top-bar-phone {
          color: rgba(255,255,255,0.7);
          transition: all var(--transition-fast);
        }
        .top-bar-phone:hover { color: white; }
        .top-bar-admin {
          color: var(--gold);
          font-size: var(--font-size-xs);
          font-weight: 600;
          transition: color var(--transition-fast);
        }
        .top-bar-admin:hover { color: var(--gold-light); }

        .navbar {
          background: var(--bg-secondary);
          padding: 0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow-sm);
          border-bottom: 1px solid var(--border-light);
          transition: background var(--transition-base), box-shadow var(--transition-base), backdrop-filter var(--transition-base);
        }
        .navbar.navbar-scrolled {
          background: var(--bg-glass);
          backdrop-filter: blur(18px) saturate(160%);
          -webkit-backdrop-filter: blur(18px) saturate(160%);
          box-shadow: var(--shadow-md);
        }
        .navbar .container { height: var(--header-height); }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .brand-logo-img { width: 56px; height: 56px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
        .brand-name {
          display: block;
          font-size: 1.4rem;
          font-weight: 900;
          color: var(--primary);
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .brand-sub {
          display: block;
          font-size: var(--font-size-xs);
          color: var(--accent);
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        .nav-link {
          position: relative;
          padding: 0.5rem 0.85rem;
          font-size: var(--font-size-sm);
          font-weight: 700;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          transition: color var(--transition-fast), background var(--transition-fast);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          left: 12px; right: 12px;
          bottom: 4px;
          height: 2px;
          background: var(--grad-accent);
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform var(--transition-base);
        }
        .nav-link:hover { color: var(--text-primary); }
        .nav-link:hover::after { transform: scaleX(0.6); }
        .nav-link.active { color: var(--accent); }
        .nav-link.active::after { transform: scaleX(1); }
        .nav-cta { margin-right: var(--space-md); }
        .nav-cta::after { display: none; }
        .mobile-login-link { display: none !important; }

        .menu-toggle {
          display: none;
          background: none;
          color: var(--text-primary);
          padding: 8px;
        }

        .public-main { min-height: 60vh; }

        .footer {
          background: linear-gradient(180deg, var(--primary-deep) 0%, var(--primary) 100%);
          color: rgba(255,255,255,0.8);
          padding: var(--space-3xl) 0 0;
          margin-top: var(--space-3xl);
          position: relative;
          overflow: hidden;
        }
        .footer::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(800px 400px at 100% 0%, rgba(230,30,90,0.18), transparent 60%), radial-gradient(600px 300px at 0% 100%, rgba(212,168,67,0.10), transparent 60%);
          pointer-events: none;
        }
        .footer > * { position: relative; z-index: 1; }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: var(--space-2xl);
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
          margin-bottom: var(--space-lg);
        }
        .footer-logo h3 { font-size: var(--font-size-xl); font-weight: 800; margin: 0; }
        .footer-logo p { font-size: var(--font-size-xs); opacity: 0.7; margin: 0; }
        .footer-desc { font-size: var(--font-size-sm); line-height: 1.8; opacity: 0.7; }

        .footer-links-group h4 {
          color: white;
          font-size: var(--font-size-base);
          font-weight: 700;
          margin-bottom: var(--space-lg);
        }
        .footer-links-group a,
        .footer-links-group p {
          display: block;
          font-size: var(--font-size-sm);
          color: rgba(255,255,255,.6);
          margin-bottom: var(--space-sm);
          transition: color var(--transition-fast);
        }
        .footer-links-group a:hover { color: var(--gold); }
        .footer-contact-link {
          display: flex !important;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
          transition: all var(--transition-fast);
        }
        .footer-contact-link.wa-link { color: #25d366 !important; }
        .footer-contact-link.wa-link:hover { color: #4ae17f !important; text-shadow: 0 0 10px rgba(37,211,102,0.3); }
        .footer-contact-link.phone-link { color: rgba(255,255,255,0.7) !important; }
        .footer-contact-link.phone-link:hover { color: white !important; }

        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: var(--space-lg) 0;
          margin-top: var(--space-2xl);
          text-align: center;
          font-size: var(--font-size-xs);
          opacity: 0.5;
        }
        .footer-credits {
          margin-top: 8px;
          font-size: 12px;
          opacity: 0.8;
        }
        .footer-credits a {
          color: var(--gold) !important;
          font-weight: 700;
          opacity: 1;
          text-decoration: none;
          transition: all 0.2s;
        }
        .footer-credits a:hover {
          color: white !important;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .menu-toggle { display: block; }
          .nav-links {
            display: none;
            position: absolute;
            top: var(--header-height);
            right: 0;
            left: 0;
            background: var(--bg-secondary);
            flex-direction: column;
            padding: var(--space-lg);
            box-shadow: var(--shadow-lg);
            border-bottom: 2px solid var(--accent);
          }
          .nav-links.open { display: flex; }
          .nav-cta { margin: 0; width: 100%; }
          .mobile-login-link {
            display: flex !important;
            align-items: center;
            gap: 6px;
            color: var(--gold) !important;
            font-weight: 700 !important;
            font-size: var(--font-size-sm);
            border-top: 1px solid var(--border-light);
            margin-top: var(--space-sm);
            padding-top: var(--space-md) !important;
          }
          .footer-grid { grid-template-columns: 1fr; }
          .top-bar { display: none; }
        }
      `}</style>
    </div>
  );
}
