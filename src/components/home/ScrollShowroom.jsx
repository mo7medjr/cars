import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import useScrollProgress from '../../hooks/useScrollProgress';
import { carImageUrl } from '../../utils/imageUrl';

/**
 * Sticky scroll-driven section: car grows, rotates, and headline morphs as user scrolls.
 * Pinned for ~2x viewport height to give room for the animation.
 */
export default function ScrollShowroom({ cars = [] }) {
  const [ref, p] = useScrollProgress({ start: 0.05, end: 0.85 });

  // Pick 3 hero cars for the showcase
  const showcase = cars.filter(c => c.images?.length).slice(0, 3);
  const activeIdx = Math.min(showcase.length - 1, Math.floor(p * showcase.length * 0.999));
  const car = showcase[activeIdx] || showcase[0];

  // Animated values
  const scale = 0.6 + p * 1.4;            // 0.6 → 2.0
  const rotate = -25 + p * 35;            // -25° → +10°
  const titleOpacity = p < 0.15 ? p / 0.15 : (p > 0.85 ? (1 - p) / 0.15 : 1);
  const titleY = (1 - titleOpacity) * 30;
  const ctaOpacity = p > 0.7 ? Math.min(1, (p - 0.7) / 0.2) : 0;

  const phrases = [
    'كل سيارة',
    'بقصة مختلفة',
    'وتجربة استثنائية',
  ];
  const phraseIdx = Math.min(phrases.length - 1, Math.floor(p * phrases.length * 0.999));

  return (
    <section className="scroll-showroom" ref={ref}>
      <div className="scroll-showroom-inner">
        {/* Background layers */}
        <div className="ss-bg">
          <div className="ss-glow" style={{ opacity: 0.6 + p * 0.4 }} />
          <div className="ss-circle" style={{ transform: `scale(${0.8 + p * 0.6}) rotate(${p * 180}deg)` }} />
          <div className="ss-circle ss-circle-2" style={{ transform: `scale(${1.2 - p * 0.4}) rotate(${-p * 120}deg)` }} />
        </div>

        {/* Progress dots (right side) */}
        <div className="ss-progress-dots">
          {showcase.map((_, i) => (
            <span key={i} className={`ss-dot ${i === activeIdx ? 'active' : ''}`} />
          ))}
        </div>

        {/* Title overlay */}
        <div className="ss-headline" style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
          <span className="ss-eyebrow">عالم القيادة</span>
          <h2>
            {phrases.map((ph, i) => (
              <span key={i} className={`ss-phrase ${i === phraseIdx ? 'active' : ''}`}>{ph}</span>
            ))}
          </h2>
          <p>اختر من تشكيلة سيارات حديثة بمواصفات عالمية وأسعار تنافسية.</p>
        </div>

        {/* CAR STAGE */}
        <div className="ss-stage">
          {car?.images?.[0] && (
            <>
              <div
                className="ss-car"
                style={{
                  transform: `translate(-50%, -50%) scale(${scale}) rotateY(${rotate}deg) rotateZ(${(p - 0.5) * -4}deg)`,
                }}
              >
                <img src={carImageUrl(car.images[0])} alt={`${car.make} ${car.model}`} />
              </div>
              <div className="ss-car-shadow" style={{ width: `${28 + p * 32}%`, opacity: 0.3 + p * 0.5 }} />
            </>
          )}

          {/* Floating speed marks */}
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="ss-spark"
              style={{
                '--top': `${15 + i * 14}%`,
                '--delay': `${i * 0.15}s`,
                opacity: p > 0.2 && p < 0.95 ? 0.7 : 0,
              }}
            />
          ))}
        </div>

        {/* Car name strip (cycles with active car) */}
        {car && (
          <div className="ss-car-name" style={{ opacity: titleOpacity }}>
            <strong>{car.make} {car.model}</strong>
            <span>{car.year} {car.color && `· ${car.color}`}</span>
          </div>
        )}

        {/* CTA at end */}
        <div className="ss-cta" style={{ opacity: ctaOpacity, pointerEvents: ctaOpacity > 0.5 ? 'auto' : 'none' }}>
          <Link to="/fleet" className="cinema-btn cinema-btn-primary">
            <span className="cinema-btn-shine" />
            استكشف الأسطول كاملاً <FiArrowLeft />
          </Link>
        </div>
      </div>
    </section>
  );
}
