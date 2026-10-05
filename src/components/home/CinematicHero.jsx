import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaCar, FaWhatsapp } from 'react-icons/fa';
import { FiArrowLeft, FiZap, FiShield } from 'react-icons/fi';
import useMouseParallax from '../../hooks/useMouseParallax';
import useCountUp from '../../hooks/useCountUp';
import { carImageUrl } from '../../utils/imageUrl';
import { waLink } from '../../config/siteConfig';

export default function CinematicHero({ heroCar, liveCount, phone }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 900;
  const [stageRef, parallax] = useMouseParallax({ intensity: 3, disabled: isMobile });
  const [carsRef, carsCount] = useCountUp(Math.max(liveCount, 50), { suffix: '+' });
  const [clientsRef, clientsCount] = useCountUp(1000, { suffix: '+' });
  const [yearsRef, yearsCount] = useCountUp(15, { suffix: '+' });
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTitleVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="cinema-hero">
      {/* ─── BACKGROUND LAYERS ─────────────────────────── */}
      <div className="cinema-bg">
        <div className="cinema-glow cinema-glow-1" />
        <div className="cinema-glow cinema-glow-2" />
        <div className="cinema-particles">
          {[...Array(14)].map((_, i) => (
            <span key={i} className="cinema-particle" style={{
              '--x': `${(i * 73) % 100}%`,
              '--y': `${(i * 41) % 100}%`,
              '--d': `${8 + (i % 5) * 2}s`,
              '--delay': `${(i * 0.4) % 6}s`,
              '--size': `${2 + (i % 3)}px`,
            }} />
          ))}
        </div>
      </div>

      <div className="container cinema-content">
        {/* ─── LEFT: COPY ────────────────────────────────── */}
        <div className="cinema-copy">
          <div className={`cinema-pill ${titleVisible ? 'in' : ''}`}>
            <span className="cinema-pill-dot" />
            {liveCount > 0 ? `${liveCount} سيارة متاحة الآن` : 'بيع وإيجار سيارات في دمياط'}
          </div>

          <h1 className={`cinema-title ${titleVisible ? 'in' : ''}`}>
            <span className="cinema-line cinema-line-1">حجز سريع،</span>
            <span className="cinema-line cinema-line-2">استلام <span className="cinema-line-gold">فوري</span></span>
            <span className="cinema-tagline">وراحة بال من أول لحظة · من <strong>المراكبي</strong></span>
          </h1>

          <p className={`cinema-desc ${titleVisible ? 'in' : ''}`}>
            إيجار وبيع سيارات في <strong>دمياط الجديدة</strong> بأحسن سعر،
            <br className="hide-mobile" />
            بدون رسوم خفية وبدون لفّ ودوران. اختار اللي على مزاجك واحجزها دلوقتي.
          </p>

          <div className={`cinema-cta ${titleVisible ? 'in' : ''}`}>
            <Link to="/fleet" className="cinema-btn cinema-btn-primary">
              <span className="cinema-btn-shine" />
              <FaCar /> احجز دلوقتي
              <FiArrowLeft />
            </Link>
            <Link to="/sales" className="cinema-btn cinema-btn-ghost">
              🏷️ عربيات للبيع
            </Link>
            <a
              href={`${waLink(phone)}?text=${encodeURIComponent('السلام عليكم، عايز أستفسر')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cinema-btn cinema-btn-wa"
            >
              <FaWhatsapp />
            </a>
          </div>

          {/* Trust strip */}
          <div className="cinema-trust">
            <div className="cinema-trust-item" ref={carsRef}>
              <strong>{carsCount}</strong>
              <span>سيارة</span>
            </div>
            <div className="cinema-trust-divider" />
            <div className="cinema-trust-item" ref={clientsRef}>
              <strong>{clientsCount}</strong>
              <span>عميل سعيد</span>
            </div>
            <div className="cinema-trust-divider" />
            <div className="cinema-trust-item" ref={yearsRef}>
              <strong>{yearsCount}</strong>
              <span>سنة خبرة</span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: CAR STAGE ─────────────────────────── */}
        <div className="cinema-stage" ref={stageRef}>
          <div
            className="cinema-stage-3d"
            style={{
              '--rx': `${parallax.rx}deg`,
              '--ry': `${parallax.ry}deg`,
              '--px': `${parallax.x * 6}px`,
              '--py': `${parallax.y * 4}px`,
            }}
          >
            <div className="cinema-car-wrap">
              {heroCar?.images?.[0] ? (
                <>
                  <img
                    src={carImageUrl(heroCar.images[0])}
                    alt={`${heroCar.make} ${heroCar.model}`}
                    className="cinema-car-img"
                  />
                  <div className="cinema-shine-pass" />
                </>
              ) : (
                <div className="cinema-car-placeholder">🚘</div>
              )}
              <div className="cinema-underglow" />
            </div>

            {/* Floating tech badges */}
            <div className="cinema-badge cinema-badge-1">
              <FiZap />
              <div>
                <strong>حجز فوري</strong>
                <span>أقل من 5 دقايق</span>
              </div>
            </div>
            <div className="cinema-badge cinema-badge-2">
              <FiShield />
              <div>
                <strong>تأمين شامل</strong>
                <span>على كل العربيات</span>
              </div>
            </div>

            {/* Hero car price tag */}
            {heroCar && (
              <div className="cinema-price-tag">
                <span className="cinema-price-label">يبدأ من</span>
                <strong>{Number(heroCar.daily_rate).toLocaleString()}</strong>
                <span className="cinema-price-unit">ج.م / يوم</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="cinema-scroll-cue">
        <div className="cinema-scroll-mouse"><span /></div>
        <span className="cinema-scroll-text">انزل للأسفل</span>
      </div>
    </section>
  );
}
