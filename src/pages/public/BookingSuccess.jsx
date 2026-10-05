import { Link, useLocation } from 'react-router-dom';
import { FiCheck, FiHome } from 'react-icons/fi';

export default function BookingSuccess() {
  const location = useLocation();
  const reservationId = location.state?.reservationId;

  return (
    <div className="success-page">
      <div className="container">
        <div className="success-card animate-scale-in">
          <div className="success-ring">
            <div className="success-icon">✓</div>
          </div>
          <h1>تم إرسال الحجز بنجاح!</h1>
          <p>شكراً لك! تم استلام طلب الحجز وسيتم مراجعته من قبل فريقنا في أقرب وقت.</p>

          {reservationId && (
            <div className="booking-ref">
              <span>رقم الحجز المرجعي</span>
              <strong>{String(reservationId).substring(0, 8).toUpperCase()}</strong>
            </div>
          )}

          <div className="next-steps">
            <h3>الخطوات التالية:</h3>
            <div className="step-item"><FiCheck /> سيتم التواصل معك عبر الهاتف لتأكيد الحجز</div>
            <div className="step-item"><FiCheck /> توجه إلى مكتبنا في الموعد المحدد لتوقيع العقد</div>
            <div className="step-item"><FiCheck /> استلم سيارتك وانطلق!</div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px' }}>
            <Link to="/" className="btn btn-primary"><FiHome /> العودة للرئيسية</Link>
            <Link to="/track" className="btn btn-outline">تتبع حجزك</Link>
          </div>
        </div>
      </div>

      <style>{`
        .success-page { padding: var(--space-3xl) 0; min-height: 70vh; display: flex; align-items: center; }
        .success-card {
          max-width: 620px;
          margin: 0 auto;
          text-align: center;
          background: var(--bg-card);
          border-radius: var(--radius-2xl);
          padding: var(--space-3xl);
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--border-light);
          position: relative;
          overflow: hidden;
        }
        .success-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          right: -50%;
          height: 200px;
          background: radial-gradient(ellipse at center, rgba(16,185,129,0.18), transparent 60%);
          pointer-events: none;
        }
        .success-card > * { position: relative; z-index: 1; }
        .success-ring {
          width: 110px;
          height: 110px;
          margin: 0 auto var(--space-lg);
          border-radius: 50%;
          background: var(--success-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: pulseRing 2s ease-out infinite;
        }
        .success-icon {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--success), #059669);
          color: white;
          font-size: 44px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(16,185,129,0.45);
        }
        .success-card h1 { font-size: var(--font-size-3xl); font-weight: 900; margin-bottom: var(--space-md); color: var(--text-primary); letter-spacing: -0.02em; }
        .success-card > p { color: var(--text-secondary); margin-bottom: var(--space-xl); line-height: 1.8; font-size: var(--font-size-base); }

        .booking-ref {
          background: var(--bg-soft);
          padding: var(--space-lg);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-xl);
          border: 2px dashed var(--border-medium);
        }
        .booking-ref span { display: block; font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: 6px; font-weight: 700; }
        .booking-ref strong { font-size: var(--font-size-3xl); background: var(--grad-accent); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 4px; font-weight: 900; }

        .next-steps { text-align: right; margin-top: var(--space-xl); padding: var(--space-lg); background: var(--bg-soft); border-radius: var(--radius-lg); }
        .next-steps h3 { font-size: var(--font-size-base); font-weight: 800; margin-bottom: var(--space-md); }
        .step-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.55rem 0;
          font-size: var(--font-size-sm);
          color: var(--text-primary);
          font-weight: 600;
        }
        .step-item svg { color: var(--success); background: white; padding: 4px; border-radius: 50%; flex-shrink: 0; box-shadow: var(--shadow-sm); }
      `}</style>
    </div>
  );
}
