import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import { FiCalendar, FiAlertTriangle, FiClock, FiTrendingUp, FiTrendingDown, FiLock, FiX, FiEye, FiEyeOff, FiWifi, FiWifiOff, FiTag, FiActivity, FiPercent, FiArrowUpRight, FiRefreshCw } from 'react-icons/fi';
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import api from '../../api/client';
import toast from 'react-hot-toast';

const STATUS_ICON = {
  pending: '⏳', approved: '✅', active: '🚗', completed: '✔️', cancelled: '❌', overdue: '⚠️',
};
const STATUS_LABEL = {
  pending: 'بانتظار', approved: 'موافق عليه', active: 'نشط', completed: 'مكتمل', cancelled: 'ملغي', overdue: 'متأخر',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [salesStats, setSalesStats] = useState(null);
  const [revenueRange, setRevenueRange] = useState('12m'); // '7d' | '12m'
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const connectWebSocket = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws/dashboard`);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        ws._pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send('ping');
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'stats_update' && msg.data) {
            setStats(prev => ({ ...prev, ...msg.data }));
          }
          if (msg.event === 'new_reservation' && msg.data) {
            toast('🔔 حجز جديد: ' + (msg.data.customer_name || '') + ' — ' + (msg.data.car_name || ''), {
              duration: 8000,
              icon: '🚗',
              style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(230,30,90,0.3)' },
            });
            try { new Audio('data:audio/wav;base64,UklGRl9vT19teleVFQBAAAABAAEARKwAAIhYAQACABAAZGF0YU' + 'tvT19XQVYAAAAAgICAgICAgIA=').play(); } catch {}
            api.get('/api/dashboard/recent-activity').then(({ data }) => setRecent(data.items || [])).catch(() => {});
          }
          if (['reservation_approved', 'reservation_activated', 'reservation_cancelled', 'reservation_completed'].includes(msg.event)) {
            api.get('/api/dashboard/recent-activity').then(({ data }) => setRecent(data.items || [])).catch(() => {});
          }
        } catch {}
      };

      ws.onclose = () => {
        setWsConnected(false);
        clearInterval(ws._pingInterval);
        reconnectTimer.current = setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      setWsConnected(false);
      reconnectTimer.current = setTimeout(connectWebSocket, 5000);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, []);

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);
    try {
      const [statsRes, recentRes, chartsRes] = await Promise.all([
        api.get('/api/dashboard/stats'),
        api.get('/api/dashboard/recent-activity'),
        api.get('/api/dashboard/charts').catch(() => ({ data: null })),
      ]);
      setStats(statsRes.data);
      setRecent(recentRes.data.items || []);
      if (chartsRes?.data) setCharts(chartsRes.data);
      api.get('/api/sales/stats/summary').then(({ data }) => setSalesStats(data)).catch(() => {});
    } catch {
      setStats({
        total_cars: 0, available_cars: 0, rented_cars: 0, maintenance_cars: 0,
        total_customers: 0, vip_customers: 0, blacklisted_customers: 0,
        pending_reservations: 0, active_reservations: 0, overdue_reservations: 0,
        total_revenue: 0, monthly_revenue: 0,
        cars_due_today: 0, cars_needing_maintenance: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.old_password) { toast.error('أدخل كلمة المرور الحالية'); return; }
    if (pwForm.new_password.length < 6) { toast.error('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'); return; }
    if (pwForm.new_password !== pwForm.confirm) { toast.error('كلمة المرور الجديدة غير متطابقة'); return; }

    setPwLoading(true);
    try {
      await api.patch('/api/auth/me/password', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      });
      toast.success('تم تغيير كلمة المرور بنجاح ✅');
      setShowPasswordModal(false);
      setPwForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'حدث خطأ');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-4" style={{ gap: '20px' }}>
        {[1,2,3,4,5,6,7,8].map(i => (
          <div className="skeleton" key={i} style={{ height: '120px', borderRadius: '16px' }} />
        ))}
      </div>
    );
  }

  const kpis = charts?.kpis || {};
  const occupancyRate = kpis.occupancy_rate ?? Math.round((stats.rented_cars / Math.max(stats.total_cars, 1)) * 100);

  // KPI hero cards (top row — 4 wide)
  const heroKpis = [
    {
      label: 'إيرادات الشهر',
      value: Number(stats.monthly_revenue).toLocaleString(),
      suffix: 'ج.م',
      icon: <FaMoneyBillWave />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      change: kpis.revenue_change_pct,
    },
    {
      label: 'إجمالي الحجوزات',
      value: (stats.completed_reservations || 0) + stats.active_reservations,
      icon: <FiCalendar />,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      change: kpis.bookings_change_pct,
      link: '/admin/reservations',
    },
    {
      label: 'العملاء النشطون',
      value: stats.total_customers,
      icon: <FaUsers />,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      change: kpis.customers_change_pct,
      link: '/admin/customers',
    },
    {
      label: 'نسبة الإشغال',
      value: occupancyRate,
      suffix: '%',
      icon: <FiPercent />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      progress: occupancyRate,
    },
  ];

  // Quick stat tiles (second row — smaller)
  const quickTiles = [
    { icon: <FaCar />, label: 'متاحة', value: stats.available_cars, color: '#10b981', link: '/admin/cars' },
    { icon: <FaCar />, label: 'مؤجرة', value: stats.rented_cars, color: '#f59e0b', link: '/admin/cars' },
    { icon: <FiClock />, label: 'بانتظار', value: stats.pending_reservations, color: '#3b82f6', link: '/admin/reservations' },
    { icon: <FiActivity />, label: 'نشطة', value: stats.active_reservations, color: '#6366f1', link: '/admin/reservations' },
    { icon: <FiAlertTriangle />, label: 'متأخرة', value: stats.overdue_reservations, color: '#ef4444', link: '/admin/reservations' },
    ...(salesStats ? [{ icon: <FiTag />, label: 'للبيع', value: salesStats.available_for_sale, color: '#a855f7', link: '/admin/sales' }] : []),
  ];

  const revenueData = revenueRange === '7d' ? (charts?.bookings_weekly || []) : (charts?.revenue_monthly || []);

  return (
    <div className="dashboard-page">
      <div className="page-header flex-between">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            لوحة التحكم
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '11px', fontWeight: 600, padding: '3px 10px',
              borderRadius: '50px',
              background: wsConnected ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: wsConnected ? '#10b981' : '#ef4444',
              border: `1px solid ${wsConnected ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              {wsConnected ? <FiWifi size={12} /> : <FiWifiOff size={12} />}
              {wsConnected ? 'LIVE' : 'OFFLINE'}
              {wsConnected && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />}
            </span>
          </h1>
          <p>مرحباً بك في نظام المراكبي لتجارة وإيجار السيارات</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => fetchAll(true)} disabled={refreshing}>
            <FiRefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> تحديث
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowPasswordModal(true)}>
            <FiLock size={14} /> تغيير كلمة المرور
          </button>
          <Link to="/admin/cars" className="btn btn-primary btn-sm">+ إضافة سيارة</Link>
        </div>
      </div>

      {/* Alert Banners */}
      {(stats.overdue_reservations > 0 || stats.pending_reservations > 0) && (
        <div className="alert-section">
          {stats.overdue_reservations > 0 && (
            <div className="alert-banner danger">
              <FiAlertTriangle size={20} />
              <span>يوجد <strong>{stats.overdue_reservations}</strong> حجز متأخر — يرجى المتابعة فوراً</span>
              <Link to="/admin/reservations" className="btn btn-sm btn-danger">عرض</Link>
            </div>
          )}
          {stats.pending_reservations > 0 && (
            <div className="alert-banner warning">
              <FiClock size={20} />
              <span>يوجد <strong>{stats.pending_reservations}</strong> حجز معلق بانتظار الموافقة</span>
              <Link to="/admin/reservations" className="btn btn-sm btn-gold">مراجعة</Link>
            </div>
          )}
        </div>
      )}

      {/* Hero KPI Cards */}
      <div className="kpi-grid">
        {heroKpis.map((kpi, i) => {
          const Wrap = kpi.link ? Link : 'div';
          const isUp = (kpi.change ?? 0) >= 0;
          return (
            <Wrap to={kpi.link} className="kpi-card animate-fade-in" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="kpi-bg" style={{ background: kpi.gradient }} />
              <div className="kpi-content">
                <div className="kpi-icon" style={{ background: kpi.gradient }}>{kpi.icon}</div>
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value">
                  {kpi.value}
                  {kpi.suffix && <span className="kpi-suffix">{kpi.suffix}</span>}
                </div>
                {typeof kpi.change === 'number' && (
                  <div className={`kpi-change ${isUp ? 'up' : 'down'}`}>
                    {isUp ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                    <span>{Math.abs(kpi.change).toFixed(1)}%</span>
                    <span className="kpi-change-label">عن الشهر السابق</span>
                  </div>
                )}
                {typeof kpi.progress === 'number' && (
                  <div className="kpi-progress">
                    <div className="kpi-progress-fill" style={{ width: `${kpi.progress}%`, background: kpi.gradient }} />
                  </div>
                )}
              </div>
            </Wrap>
          );
        })}
      </div>

      {/* Quick stat tiles */}
      <div className="quick-tiles">
        {quickTiles.map((t, i) => (
          <Link to={t.link} className="quick-tile" key={i}>
            <div className="quick-tile-icon" style={{ color: t.color, background: t.color + '15' }}>{t.icon}</div>
            <div className="quick-tile-info">
              <div className="quick-tile-value">{t.value}</div>
              <div className="quick-tile-label">{t.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts row 1: Revenue trend (wide) + Fleet donut */}
      <div className="charts-row charts-row-1">
        <div className="chart-card chart-card-wide">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">� الإيرادات والحجوزات</h3>
              <p className="chart-subtitle">{revenueRange === '7d' ? 'آخر 7 أيام' : 'آخر 12 شهر'}</p>
            </div>
            <div className="chart-tabs">
              <button className={revenueRange === '12m' ? 'active' : ''} onClick={() => setRevenueRange('12m')}>12 شهر</button>
              <button className={revenueRange === '7d' ? 'active' : ''} onClick={() => setRevenueRange('7d')}>7 أيام</button>
            </div>
          </div>
          <div className="chart-body" style={{ height: 320 }}>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 12, fontSize: 12, boxShadow: 'var(--shadow-lg)' }} formatter={(value, name) => [Number(value).toLocaleString() + (name === 'revenue' ? ' ج.م' : ''), name === 'revenue' ? 'الإيرادات' : 'الحجوزات']} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#gradRevenue)" />
                  <Area type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradBookings)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">جاري تحميل البيانات...</div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">🚗 حالة الأسطول</h3>
              <p className="chart-subtitle">{stats.total_cars} سيارة إجمالاً</p>
            </div>
          </div>
          <div className="chart-body" style={{ height: 320 }}>
            {charts?.fleet_breakdown ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.fleet_breakdown} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} stroke="var(--bg-card)" strokeWidth={2}>
                    {charts.fleet_breakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 12, fontSize: 12, boxShadow: 'var(--shadow-lg)' }} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">جاري التحميل...</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts row 2: Top cars + Recent activity */}
      <div className="charts-row charts-row-2">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">🏆 أكثر السيارات تأجيراً</h3>
              <p className="chart-subtitle">حسب عدد الحجوزات هذا الشهر</p>
            </div>
            <Link to="/admin/cars" className="chart-link"><FiArrowUpRight size={14} /> الكل</Link>
          </div>
          <div className="chart-body" style={{ height: 320 }}>
            {charts?.top_cars ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.top_cars} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTop" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#e61e5a" />
                      <stop offset="100%" stopColor="#fb7185" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 12, fontSize: 12, boxShadow: 'var(--shadow-lg)' }} formatter={(v, n) => [Number(v).toLocaleString() + (n === 'revenue' ? ' ج.م' : ''), n === 'revenue' ? 'الإيرادات' : 'الحجوزات']} cursor={{ fill: 'var(--bg-primary)' }} />
                  <Bar dataKey="bookings" fill="url(#gradTop)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">جاري التحميل...</div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">⏱️ آخر النشاطات</h3>
              <p className="chart-subtitle">أحدث {Math.min(recent.length, 8)} حجوزات</p>
            </div>
            <Link to="/admin/reservations" className="chart-link"><FiArrowUpRight size={14} /> الكل</Link>
          </div>
          <div className="chart-body chart-body-list">
            {recent.length === 0 ? (
              <div className="chart-empty">لا توجد حجوزات بعد</div>
            ) : (
              <div className="timeline">
                {recent.slice(0, 8).map((item, i) => (
                  <div className="timeline-item" key={i}>
                    <div className={`timeline-dot status-${item.status}`}>{STATUS_ICON[item.status] || '📋'}</div>
                    <div className="timeline-body">
                      <div className="timeline-row">
                        <strong>{item.customer_name}</strong>
                        <span className="timeline-amount">{Number(item.amount || item.total_price || 0).toLocaleString()} ج.م</span>
                      </div>
                      <div className="timeline-row">
                        <span className="timeline-car">{item.car_name}</span>
                        <span className={`timeline-badge status-${item.status}`}>{STATUS_LABEL[item.status] || item.status}</span>
                      </div>
                      <div className="timeline-time">
                        {item.created_at ? new Date(item.created_at).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Weekly bar + Reservations status donut */}
      <div className="charts-row charts-row-3">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">📅 الحجوزات الأسبوعية</h3>
              <p className="chart-subtitle">حجوزات هذا الأسبوع حسب اليوم</p>
            </div>
          </div>
          <div className="chart-body" style={{ height: 280 }}>
            {charts?.bookings_weekly ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.bookings_weekly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradWeek" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 12, fontSize: 12, boxShadow: 'var(--shadow-lg)' }} cursor={{ fill: 'var(--bg-primary)' }} />
                  <Bar dataKey="bookings" fill="url(#gradWeek)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">جاري التحميل...</div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">📊 الحجوزات حسب الحالة</h3>
              <p className="chart-subtitle">توزيع الحجوزات الكلي</p>
            </div>
          </div>
          <div className="chart-body" style={{ height: 280 }}>
            {charts?.reservations_by_status ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.reservations_by_status} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={95} stroke="var(--bg-card)" strokeWidth={2}>
                    {charts.reservations_by_status.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 12, fontSize: 12, boxShadow: 'var(--shadow-lg)' }} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">جاري التحميل...</div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)} style={{ zIndex: 200 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>🔐 تغيير كلمة المرور</h3>
              <button className="btn-icon" onClick={() => setShowPasswordModal(false)} style={{ background: 'var(--bg-primary)' }}><FiX size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">كلمة المرور الحالية</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showOld ? 'text' : 'password'}
                    className="form-input"
                    value={pwForm.old_password}
                    onChange={e => setPwForm({ ...pwForm, old_password: e.target.value })}
                    placeholder="أدخل كلمة المرور الحالية"
                  />
                  <button type="button" onClick={() => setShowOld(!showOld)} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showOld ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">كلمة المرور الجديدة</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    className="form-input"
                    value={pwForm.new_password}
                    onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })}
                    placeholder="6 أحرف على الأقل"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  className="form-input"
                  value={pwForm.confirm}
                  onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                  placeholder="أعد كتابة كلمة المرور الجديدة"
                />
                {pwForm.confirm && pwForm.new_password !== pwForm.confirm && (
                  <span style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px', display: 'block' }}>⚠️ كلمة المرور غير متطابقة</span>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>إلغاء</button>
              <button className="btn btn-primary" onClick={handleChangePassword} disabled={pwLoading}>
                {pwLoading ? '⏳' : '🔐'} تغيير كلمة المرور
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .alert-section { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        .alert-banner {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 20px;
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          backdrop-filter: blur(8px);
        }
        .alert-banner.danger { background: var(--danger-bg); color: var(--danger); border: 1px solid rgba(239,68,68,0.25); }
        .alert-banner.warning { background: var(--warning-bg); color: #92400e; border: 1px solid rgba(245,158,11,0.25); }
        .alert-banner span { flex: 1; }
        .alert-banner .btn { margin-right: auto; }

        /* ── Hero KPI Cards ── */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 18px;
        }
        .kpi-card {
          position: relative;
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: 18px;
          padding: 22px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: all var(--transition-base);
          cursor: pointer;
        }
        .kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-xl);
          border-color: transparent;
        }
        .kpi-bg {
          position: absolute;
          top: -40px; right: -40px;
          width: 140px; height: 140px;
          border-radius: 50%;
          opacity: 0.10;
          filter: blur(8px);
        }
        .kpi-card:hover .kpi-bg { opacity: 0.18; transform: scale(1.15); transition: all .4s; }
        .kpi-content { position: relative; z-index: 1; }
        .kpi-icon {
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 12px;
          color: white;
          font-size: 19px;
          margin-bottom: 14px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }
        .kpi-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .kpi-value {
          font-size: 28px;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1.1;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }
        .kpi-suffix {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-secondary);
          margin-right: 5px;
        }
        .kpi-change {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 50px;
        }
        .kpi-change.up { background: rgba(16,185,129,0.12); color: #10b981; }
        .kpi-change.down { background: rgba(239,68,68,0.12); color: #ef4444; }
        .kpi-change-label {
          color: var(--text-muted);
          font-weight: 600;
          font-size: 10px;
        }
        .kpi-progress {
          height: 6px;
          background: var(--bg-primary);
          border-radius: 3px;
          overflow: hidden;
          margin-top: 4px;
        }
        .kpi-progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 1.2s cubic-bezier(.2,.7,.2,1);
        }

        /* ── Quick tiles ── */
        .quick-tiles {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .quick-tile {
          display: flex; align-items: center; gap: 10px;
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: 14px;
          padding: 12px 14px;
          text-decoration: none;
          color: inherit;
          transition: all var(--transition-base);
        }
        .quick-tile:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--accent);
        }
        .quick-tile-icon {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
          font-size: 16px;
        }
        .quick-tile-info { display: flex; flex-direction: column; }
        .quick-tile-value { font-size: 18px; font-weight: 800; line-height: 1; color: var(--text-primary); }
        .quick-tile-label { font-size: 11px; color: var(--text-secondary); font-weight: 600; margin-top: 2px; }

        /* ── Charts row ── */
        .charts-row { display: grid; gap: 18px; margin-bottom: 18px; }
        .charts-row-1 { grid-template-columns: 2fr 1fr; }
        .charts-row-2 { grid-template-columns: 1fr 1fr; }
        .charts-row-3 { grid-template-columns: 1fr 1fr; }

        .chart-card {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: 18px;
          overflow: hidden;
          transition: box-shadow var(--transition-base);
        }
        .chart-card:hover { box-shadow: var(--shadow-md); }
        .chart-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 18px 20px 12px;
          border-bottom: 1px solid var(--border-light);
        }
        .chart-title {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: -0.01em;
        }
        .chart-subtitle {
          font-size: 11px;
          color: var(--text-muted);
          margin: 4px 0 0;
          font-weight: 600;
        }
        .chart-link {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px;
          color: var(--accent);
          font-weight: 700;
          text-decoration: none;
          padding: 4px 10px;
          border-radius: 50px;
          background: rgba(230,30,90,0.08);
          transition: all var(--transition-base);
        }
        .chart-link:hover { background: var(--accent); color: white; }
        .chart-tabs {
          display: flex; gap: 4px;
          background: var(--bg-primary);
          border-radius: 50px;
          padding: 3px;
        }
        .chart-tabs button {
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 700;
          background: transparent;
          border: none;
          border-radius: 50px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
        }
        .chart-tabs button.active {
          background: var(--bg-card);
          color: var(--accent);
          box-shadow: var(--shadow-sm);
        }
        .chart-body { padding: 14px; }
        .chart-body-list { padding: 0; }
        .chart-empty {
          display: flex; align-items: center; justify-content: center;
          height: 100%;
          color: var(--text-muted);
          font-size: 13px;
          padding: 40px;
        }

        /* ── Timeline (Recent activity) ── */
        .timeline {
          padding: 8px 4px;
          max-height: 380px;
          overflow-y: auto;
        }
        .timeline-item {
          display: flex; gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-light);
          transition: background var(--transition-base);
        }
        .timeline-item:last-child { border-bottom: none; }
        .timeline-item:hover { background: var(--bg-primary); }
        .timeline-dot {
          flex-shrink: 0;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
          font-size: 16px;
          background: var(--bg-primary);
        }
        .timeline-dot.status-pending { background: rgba(59,130,246,0.12); }
        .timeline-dot.status-active, .timeline-dot.status-approved { background: rgba(16,185,129,0.12); }
        .timeline-dot.status-completed { background: rgba(139,92,246,0.12); }
        .timeline-dot.status-cancelled { background: rgba(107,114,128,0.12); }
        .timeline-dot.status-overdue { background: rgba(239,68,68,0.12); }
        .timeline-body { flex: 1; min-width: 0; }
        .timeline-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px;
          margin-bottom: 3px;
        }
        .timeline-row strong { font-size: 13px; color: var(--text-primary); }
        .timeline-amount { font-size: 13px; font-weight: 800; color: var(--success); }
        .timeline-car { font-size: 11px; color: var(--text-secondary); }
        .timeline-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 50px;
        }
        .timeline-badge.status-pending { background: rgba(59,130,246,0.12); color: #3b82f6; }
        .timeline-badge.status-active, .timeline-badge.status-approved { background: rgba(16,185,129,0.12); color: #10b981; }
        .timeline-badge.status-completed { background: rgba(139,92,246,0.12); color: #8b5cf6; }
        .timeline-badge.status-cancelled { background: rgba(107,114,128,0.12); color: #6b7280; }
        .timeline-badge.status-overdue { background: rgba(239,68,68,0.12); color: #ef4444; }
        .timeline-time { font-size: 10px; color: var(--text-muted); margin-top: 2px; }

        /* ── Responsive ── */
        @media (max-width: 1200px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .quick-tiles { grid-template-columns: repeat(3, 1fr); }
          .charts-row-1, .charts-row-2, .charts-row-3 { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr; }
          .quick-tiles { grid-template-columns: repeat(2, 1fr); }
          .kpi-value { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}
