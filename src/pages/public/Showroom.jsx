import { useState, useEffect, useRef } from 'react';
import api from '../../api/client';

export default function Showroom() {
  const [cars, setCars] = useState([]);
  const [current, setCurrent] = useState(0);
  const [time, setTime] = useState(new Date());
  const [settings, setSettings] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    document.title = 'المراكبي لتجارة وإيجار السيارات — معرض السيارات';
    const fetchData = () => {
      api.get('/api/cars/public/all').then(({ data }) => {
        const available = (data.items || []).filter(c => c.status === 'available');
        setCars(available);
      }).catch(() => {});
      api.get('/api/settings').then(({ data }) => setSettings(data)).catch(() => {});
    };
    fetchData();
    const refresh = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(refresh);
  }, []);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-slide
  useEffect(() => {
    if (cars.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % cars.length);
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, [cars.length]);

  const car = cars[current];
  const companyName = settings?.company_name || 'المراكبي';
  const slogan = settings?.company_slogan || 'لتجارة وإيجار السيارات';
  const phone1 = settings?.phone1 || '01097835116';
  const address = settings?.address1 || 'دمياط الجديدة';

  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  const formatTime = (d) => {
    const h = d.getHours() % 12 || 12;
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = d.getHours() >= 12 ? 'م' : 'ص';
    return { h, m, ampm };
  };

  const { h, m, ampm } = formatTime(time);

  const getImageUrl = (car) => {
    if (car.images && car.images.length > 0) return `/static/cars/${car.images[0]}`;
    return null;
  };

  return (
    <div className="showroom-page" dir="rtl">
      {/* Top Bar */}
      <header className="sr-header">
        <div className="sr-brand">
          <img src="/logo.png" alt="" className="sr-logo" />
          <div>
            <h1>{companyName}</h1>
            <span>{slogan}</span>
          </div>
        </div>
        <div className="sr-clock">
          <div className="sr-time">{h}:{m} <small>{ampm}</small></div>
          <div className="sr-date">{dayNames[time.getDay()]}، {time.getDate()} {monthNames[time.getMonth()]} {time.getFullYear()}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="sr-main">
        {cars.length === 0 ? (
          <div className="sr-empty">
            <div className="sr-empty-icon">🚗</div>
            <h2>مرحباً بكم في {companyName}</h2>
            <p>نرحب بكم في معرضنا — تواصل معنا للاستفسار</p>
            <div className="sr-phone-big">📞 {phone1}</div>
          </div>
        ) : (
          <div className="sr-showcase">
            {/* Car Display */}
            <div className="sr-car-display" key={current}>
              <div className="sr-car-image-wrap">
                {getImageUrl(car) ? (
                  <img src={getImageUrl(car)} alt={`${car.make} ${car.model}`} className="sr-car-image" />
                ) : (
                  <div className="sr-car-placeholder">🚘</div>
                )}
                <div className="sr-car-badge">متاحة للحجز</div>
              </div>
              <div className="sr-car-info">
                <h2>{car.make} {car.model}</h2>
                <div className="sr-car-year">{car.year}</div>
                <div className="sr-specs">
                  {car.color && <span className="sr-spec">🎨 {car.color}</span>}
                  {car.fuel_type && <span className="sr-spec">⛽ {car.fuel_type}</span>}
                  {car.transmission && <span className="sr-spec">⚙️ {car.transmission === 'automatic' ? 'أوتوماتيك' : 'مانيوال'}</span>}
                </div>
                <div className="sr-prices">
                  {car.daily_rate > 0 && (
                    <div className="sr-price-card">
                      <span className="sr-price-label">يومي</span>
                      <strong>{Number(car.daily_rate).toLocaleString()}</strong>
                      <span className="sr-price-unit">ج.م</span>
                    </div>
                  )}
                  {car.weekly_rate > 0 && (
                    <div className="sr-price-card">
                      <span className="sr-price-label">أسبوعي</span>
                      <strong>{Number(car.weekly_rate).toLocaleString()}</strong>
                      <span className="sr-price-unit">ج.م</span>
                    </div>
                  )}
                  {car.monthly_rate > 0 && (
                    <div className="sr-price-card">
                      <span className="sr-price-label">شهري</span>
                      <strong>{Number(car.monthly_rate).toLocaleString()}</strong>
                      <span className="sr-price-unit">ج.م</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dots */}
            {cars.length > 1 && (
              <div className="sr-dots">
                {cars.map((_, i) => (
                  <button key={i} className={`sr-dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
                ))}
              </div>
            )}

            {/* Car counter */}
            <div className="sr-counter">{current + 1} / {cars.length} سيارة متاحة</div>
          </div>
        )}
      </main>

      {/* Bottom Bar */}
      <footer className="sr-footer">
        <div className="sr-footer-item">📍 {address}</div>
        <div className="sr-footer-item">📞 {phone1}</div>
        <div className="sr-footer-item sr-scan">📱 احجز أونلاين من موقعنا</div>
      </footer>

      <style>{`
        .showroom-page {
          position: fixed;
          inset: 0;
          background: var(--grad-hero), var(--grad-hero-radial);
          background-blend-mode: normal;
          color: white;
          font-family: 'Cairo', sans-serif;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          cursor: none;
          user-select: none;
        }

        /* Header */
        .sr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .sr-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .sr-logo {
          width: 64px;
          height: 64px;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }
        .sr-brand h1 {
          font-size: 32px;
          font-weight: 900;
          margin: 0;
          line-height: 1.2;
        }
        .sr-brand span {
          font-size: 14px;
          opacity: 0.5;
          letter-spacing: 1px;
        }
        .sr-clock { text-align: left; }
        .sr-time {
          font-size: 36px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          direction: ltr;
        }
        .sr-time small { font-size: 16px; opacity: 0.6; }
        .sr-date { font-size: 13px; opacity: 0.4; }

        /* Main */
        .sr-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 40px;
        }

        /* Empty */
        .sr-empty { text-align: center; }
        .sr-empty-icon { font-size: 100px; margin-bottom: 20px; animation: float 4s ease-in-out infinite; }
        .sr-empty h2 { font-size: 42px; font-weight: 900; margin-bottom: 8px; }
        .sr-empty p { font-size: 18px; opacity: 0.5; margin-bottom: 24px; }
        .sr-phone-big { font-size: 32px; font-weight: 800; color: #f0c040; direction: ltr; }

        /* Showcase */
        .sr-showcase { width: 100%; max-width: 1200px; }
        .sr-car-display {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          align-items: center;
          animation: slideIn 0.7s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .sr-car-image-wrap {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          background: rgba(255,255,255,0.05);
          aspect-ratio: 16/10;
        }
        .sr-car-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .sr-car-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 120px;
          background: linear-gradient(135deg, rgba(230,30,90,0.1), rgba(99,102,241,0.1));
        }
        .sr-car-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 6px 20px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 4px 20px rgba(16,185,129,0.4);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .sr-car-info { padding: 10px 0; }
        .sr-car-info h2 {
          font-size: 42px;
          font-weight: 900;
          margin-bottom: 4px;
          line-height: 1.2;
        }
        .sr-car-year {
          font-size: 20px;
          color: #f0c040;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .sr-specs {
          display: flex;
          gap: 16px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .sr-spec {
          background: rgba(255,255,255,0.08);
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 15px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .sr-prices {
          display: flex;
          gap: 14px;
        }
        .sr-price-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 16px 24px;
          text-align: center;
          flex: 1;
          transition: all 0.3s;
        }
        .sr-price-card:first-child {
          background: linear-gradient(135deg, rgba(230,30,90,0.15), rgba(230,30,90,0.05));
          border-color: rgba(230,30,90,0.3);
        }
        .sr-price-label {
          display: block;
          font-size: 12px;
          opacity: 0.5;
          margin-bottom: 4px;
        }
        .sr-price-card strong {
          display: block;
          font-size: 32px;
          font-weight: 900;
          color: #f0c040;
          line-height: 1;
          margin-bottom: 2px;
        }
        .sr-price-unit { font-size: 13px; opacity: 0.5; }

        /* Dots */
        .sr-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
        }
        .sr-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.15);
          cursor: pointer;
          transition: all 0.3s;
          padding: 0;
        }
        .sr-dot.active {
          width: 32px;
          border-radius: 5px;
          background: #e61e5a;
        }
        .sr-counter {
          text-align: center;
          margin-top: 10px;
          font-size: 13px;
          opacity: 0.3;
        }

        /* Footer */
        .sr-footer {
          display: flex;
          justify-content: center;
          gap: 40px;
          padding: 16px 40px;
          background: rgba(0,0,0,0.3);
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .sr-footer-item {
          font-size: 14px;
          opacity: 0.5;
        }
        .sr-footer-item.sr-scan {
          color: #f0c040;
          font-weight: 700;
          opacity: 1;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @media (max-width: 900px) {
          .sr-car-display { grid-template-columns: 1fr; gap: 20px; }
          .sr-car-info h2 { font-size: 28px; }
          .sr-price-card strong { font-size: 24px; }
          .sr-header { padding: 12px 20px; }
          .sr-brand h1 { font-size: 22px; }
          .sr-time { font-size: 24px; }
          .sr-main { padding: 10px 20px; }
          .sr-footer { gap: 16px; flex-wrap: wrap; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
