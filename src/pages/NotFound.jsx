import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="nf-page">
      <div className="nf-bg-radial" />
      <div className="nf-grid" />

      <div className="nf-inner">
        <div className="nf-car" aria-hidden="true">🚗</div>

        <h1 className="nf-code">404</h1>
        <h2 className="nf-title">الصفحة مش موجودة!</h2>
        <p className="nf-desc">يبدو إنك وصلت لمكان غلط. الصفحة اللي بتدور عليها مش موجودة أو تم نقلها.</p>

        <div className="nf-actions">
          <Link to="/" className="btn btn-primary btn-lg">
            <FiHome /> الصفحة الرئيسية
          </Link>
          <Link to="/fleet" className="btn btn-gold btn-lg">
            <FaCar /> تصفح السيارات
            <FiArrowLeft />
          </Link>
        </div>

        <div className="nf-dots">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`nf-dot ${i === 2 ? 'active' : ''}`} style={{ animationDelay: `${i * 0.18}s` }} />
          ))}
        </div>
      </div>

      <style>{`
        .nf-page {
          min-height: 100vh;
          background: var(--grad-hero);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          direction: rtl;
          font-family: 'Cairo', sans-serif;
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        .nf-bg-radial {
          position: absolute; inset: 0;
          background: var(--grad-hero-radial);
          pointer-events: none;
        }
        .nf-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          pointer-events: none;
        }
        .nf-inner {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 540px;
          animation: fadeInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .nf-car {
          font-size: 72px;
          margin-bottom: 4px;
          animation: floatSlow 4s ease-in-out infinite;
          filter: drop-shadow(0 8px 20px rgba(0,0,0,0.35));
        }
        .nf-code {
          font-size: clamp(96px, 18vw, 200px);
          font-weight: 900;
          background: linear-gradient(135deg, #e61e5a, #ff4080 40%, #d4a843);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 0.95;
          margin: 0 0 8px;
          letter-spacing: -8px;
          filter: drop-shadow(0 12px 30px rgba(230,30,90,0.30));
        }
        .nf-title {
          color: white;
          font-size: clamp(20px, 3vw, 28px);
          font-weight: 800;
          margin: 0 0 12px;
          letter-spacing: -0.01em;
        }
        .nf-desc {
          color: rgba(255,255,255,0.65);
          font-size: 15px;
          line-height: 1.85;
          margin: 0 0 32px;
          max-width: 440px;
          margin-inline: auto;
        }
        .nf-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .nf-dots {
          margin-top: 50px;
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        .nf-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.20);
          animation: pulse 2s ease-in-out infinite;
        }
        .nf-dot.active {
          background: var(--accent);
          box-shadow: 0 0 12px var(--accent);
        }
      `}</style>
    </div>
  );
}
