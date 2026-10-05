import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaCar, FaUsers, FaFileContract, FaUsersCog, FaTag } from 'react-icons/fa';
import { FiGrid, FiCalendar, FiLogOut, FiChevronLeft, FiMenu, FiX, FiDatabase, FiSettings, FiSun, FiMoon, FiExternalLink } from 'react-icons/fi';
import { useState } from 'react';
import NotificationsCenter from '../admin/NotificationsCenter';
import GlobalSearch from '../admin/GlobalSearch';

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { path: '/admin', icon: <FiGrid size={20} />, label: 'لوحة التحكم' },
    { path: '/admin/cars', icon: <FaCar size={18} />, label: 'إدارة السيارات' },
    { path: '/admin/sales', icon: <FaTag size={18} />, label: 'سيارات للبيع' },
    { path: '/admin/consignment', icon: <FaCar size={18} />, label: '📥 طلبات بيع' },
    { path: '/admin/customers', icon: <FaUsers size={18} />, label: 'إدارة العملاء' },
    { path: '/admin/reservations', icon: <FiCalendar size={20} />, label: 'الحجوزات' },
    { path: '/admin/calendar', icon: <FiCalendar size={20} />, label: 'التقويم' },
    { path: '/admin/contracts', icon: <FaFileContract size={18} />, label: 'العقود' },
    ...(admin?.role === 'super_admin' ? [
      { path: '/admin/staff', icon: <FaUsersCog size={18} />, label: 'الموظفين' },
      { path: '/admin/backup', icon: <FiDatabase size={18} />, label: 'النسخ الاحتياطي' },
      { path: '/admin/settings', icon: <FiSettings size={18} />, label: 'الإعدادات' },
    ] : []),
  ];

  const handleLogout = () => { logout(); navigate('/admin/login'); };
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="admin-layout" dir="rtl">
      {/* Mobile overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={closeMobile} />}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/admin" className="sidebar-brand" onClick={closeMobile}>
            <img src="/logo.png" alt="المراكبي" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <div>
              <span className="sidebar-brand-name">المراكبي</span>
              <span className="sidebar-brand-sub">لوحة الإدارة</span>
            </div>
          </Link>
          <button className="sidebar-close-btn" onClick={closeMobile}><FiX size={20} /></button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`} onClick={closeMobile}>
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
              {location.pathname === item.path && <FiChevronLeft className="sidebar-link-arrow" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-admin-info">
            <div className="admin-avatar">{admin?.full_name?.charAt(0) || 'م'}</div>
            <div>
              <div className="admin-name">{admin?.full_name || 'مسؤول'}</div>
              <div className="admin-role">{admin?.role === 'super_admin' ? 'مدير عام' : 'مسؤول'}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="تسجيل خروج"><FiLogOut size={18} /></button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-content">
        <header className="admin-header">
          <div className="admin-header-left">
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}><FiMenu size={22} /></button>
            <div className="header-breadcrumb">
              {menuItems.find(i => i.path === location.pathname)?.label || 'لوحة التحكم'}
            </div>
          </div>

          <div className="admin-header-center">
            <GlobalSearch />
          </div>

          <div className="admin-header-right">
            <button
              className="header-icon-btn"
              onClick={toggle}
              title={theme === 'dark' ? 'وضع فاتح' : 'وضع داكن'}
              aria-label="تبديل الثيم"
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <NotificationsCenter />
            <Link to="/" className="header-view-site" target="_blank" title="فتح الموقع">
              <FiExternalLink size={14} />
              <span>عرض الموقع</span>
            </Link>
          </div>
        </header>
        <main className="admin-main"><Outlet /></main>
      </div>

      <style>{`
        .admin-layout { display: flex; min-height: 100vh; background: var(--bg-primary); }

        .sidebar {
          width: var(--sidebar-width);
          background: linear-gradient(180deg, var(--primary-deep) 0%, var(--primary) 100%);
          color: white;
          display: flex; flex-direction: column; position: fixed;
          top: 0; right: 0; bottom: 0; z-index: 100; overflow-y: auto;
          transition: transform 0.3s ease;
          border-left: 1px solid rgba(255,255,255,0.06);
          box-shadow: -2px 0 24px rgba(0,0,0,0.10);
        }
        .sidebar::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(600px 300px at 100% 0%, rgba(230,30,90,0.10), transparent 60%);
          pointer-events: none;
        }
        .sidebar > * { position: relative; z-index: 1; }
        .sidebar-overlay { display: none; }
        .sidebar-close-btn { display: none; background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; }

        .sidebar-header { padding: var(--space-xl); border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; }
        .sidebar-brand { display: flex; align-items: center; gap: 12px; color: white; text-decoration: none; }
        .sidebar-brand svg { color: var(--accent); }
        .sidebar-brand-name { display: block; font-size: var(--font-size-lg); font-weight: 800; line-height: 1.2; }
        .sidebar-brand-sub { display: block; font-size: var(--font-size-xs); color: rgba(255,255,255,0.4); }

        .sidebar-nav { flex: 1; padding: var(--space-md); display: flex; flex-direction: column; gap: 4px; }
        .sidebar-link {
          display: flex; align-items: center; gap: 12px; padding: 0.75rem 1rem;
          border-radius: var(--radius-md); color: rgba(255,255,255,0.65);
          font-size: var(--font-size-sm); font-weight: 600;
          transition: color var(--transition-fast), background var(--transition-fast), transform var(--transition-fast);
          text-decoration: none; position: relative;
        }
        .sidebar-link:hover { color: white; background: rgba(255,255,255,0.06); transform: translateX(-2px); }
        .sidebar-link.active {
          color: white;
          background: var(--grad-accent);
          font-weight: 800;
          box-shadow: 0 8px 20px rgba(230,30,90,0.35);
        }
        .sidebar-link.active::before {
          content: '';
          position: absolute;
          right: -16px;
          top: 8px;
          bottom: 8px;
          width: 3px;
          border-radius: 3px;
          background: var(--gold);
          box-shadow: 0 0 12px var(--gold);
        }
        .sidebar-link-icon { width: 20px; text-align: center; }
        .sidebar-link-arrow { position: absolute; left: 12px; font-size: 14px; }

        .sidebar-footer { padding: var(--space-lg); border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; }
        .sidebar-admin-info { display: flex; align-items: center; gap: 10px; }
        .admin-avatar { width: 38px; height: 38px; border-radius: var(--radius-md); background: var(--grad-accent); display: flex; align-items: center; justify-content: center; font-size: var(--font-size-sm); font-weight: 800; box-shadow: var(--shadow-accent); }
        .admin-name { font-size: var(--font-size-sm); font-weight: 600; }
        .admin-role { font-size: var(--font-size-xs); color: rgba(255,255,255,0.4); }
        .sidebar-logout { background: rgba(255,255,255,0.06); border: none; color: rgba(255,255,255,0.5); padding: 8px; border-radius: var(--radius-sm); cursor: pointer; transition: all var(--transition-fast); }
        .sidebar-logout:hover { background: rgba(239,68,68,0.2); color: #ef4444; }

        .admin-content { flex: 1; margin-right: var(--sidebar-width); min-height: 100vh; display: flex; flex-direction: column; }
        .admin-header {
          background: var(--bg-glass);
          backdrop-filter: blur(18px) saturate(160%);
          -webkit-backdrop-filter: blur(18px) saturate(160%);
          padding: 0 var(--space-xl);
          height: var(--header-height);
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: var(--space-md);
          border-bottom: 1px solid var(--border-light);
          position: sticky; top: 0; z-index: 50;
          box-shadow: var(--shadow-sm);
        }
        .admin-header-left {
          display: flex; align-items: center; gap: 12px;
        }
        .admin-header-center { display: flex; justify-content: center; }
        .admin-header-right {
          display: flex; align-items: center; gap: 8px;
          justify-content: flex-start;
        }
        .header-breadcrumb { font-size: var(--font-size-lg); font-weight: 800; color: var(--text-primary); letter-spacing: -0.01em; }
        .header-icon-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background: var(--bg-soft);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: color var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast);
        }
        .header-icon-btn:hover {
          color: var(--accent); border-color: var(--accent); background: var(--accent-soft);
          transform: translateY(-1px);
        }
        .header-view-site {
          display: inline-flex; align-items: center; gap: 6px;
          height: 40px;
          padding: 0 14px;
          font-size: var(--font-size-sm);
          color: var(--accent);
          font-weight: 700;
          border-radius: var(--radius-md);
          background: var(--accent-soft);
          border: 1px solid transparent;
          transition: background var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast);
        }
        .header-view-site:hover { background: var(--accent); color: white; transform: translateY(-1px); }
        .admin-main { flex: 1; padding: var(--space-2xl); }
        .mobile-menu-btn { display: none; background: none; border: none; color: var(--text-primary); cursor: pointer; padding: 4px; }

        /* Tablet */
        @media (max-width: 1024px) {
          .sidebar { width: 70px; }
          .sidebar-brand-name, .sidebar-brand-sub, .sidebar-link-label, .sidebar-link-arrow,
          .sidebar-admin-info > div:last-child { display: none; }
          .sidebar-header { padding: var(--space-md); justify-content: center; }
          .sidebar-brand { justify-content: center; }
          .sidebar-link { justify-content: center; padding: 0.75rem; }
          .sidebar-footer { flex-direction: column; gap: 8px; padding: var(--space-md); }
          .admin-content { margin-right: 70px; }
          .admin-main { padding: var(--space-lg); }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .sidebar {
            width: 280px; transform: translateX(100%);
            box-shadow: -4px 0 30px rgba(0,0,0,0.3);
          }
          .sidebar.sidebar-open { transform: translateX(0); }
          .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }
          .sidebar-close-btn { display: block; }
          .sidebar-brand-name, .sidebar-brand-sub, .sidebar-link-label, .sidebar-link-arrow,
          .sidebar-admin-info > div:last-child { display: block; }
          .sidebar-header { justify-content: space-between; padding: var(--space-xl); }
          .sidebar-link { justify-content: flex-start; padding: 0.75rem 1rem; }
          .sidebar-footer { flex-direction: row; padding: var(--space-lg); }

          .admin-content { margin-right: 0; }
          .admin-header {
            padding: 0 var(--space-md);
            grid-template-columns: auto 1fr auto;
          }
          .admin-header-center { display: none; }
          .admin-main { padding: var(--space-md); }
          .mobile-menu-btn { display: block; }
          .header-breadcrumb { font-size: 15px; }
          .header-view-site span { display: none; }
          .header-view-site { padding: 0 10px; }
        }
      `}</style>
    </div>
  );
}
