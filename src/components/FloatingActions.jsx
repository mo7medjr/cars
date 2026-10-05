import { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiArrowUp } from 'react-icons/fi';
import config, { waLink } from '../config/siteConfig';
import api from '../api/client';

/**
 * أزرار عائمة: واتساب دائم + زر الصعود لأعلى يظهر بعد السكرول.
 */
export default function FloatingActions() {
  const [scrolled, setScrolled] = useState(false);
  const [waNumber, setWaNumber] = useState(config.whatsapp1);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    api.get('/api/settings').then(({ data }) => {
      if (data?.whatsapp1) setWaNumber(data.whatsapp1);
    }).catch(() => {});
  }, []);

  const message = encodeURIComponent('السلام عليكم، عايز أستفسر عن السيارات المتاحة');

  return (
    <>
      <a
        href={`${waLink(waNumber)}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fab fab-wa"
        aria-label="تواصل عبر واتساب"
        title="تواصل عبر واتساب"
      >
        <span className="fab-pulse" aria-hidden="true" />
        <FaWhatsapp size={28} />
      </a>

      <button
        className={`fab fab-top ${scrolled ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="الذهاب إلى أعلى"
        title="الذهاب إلى أعلى"
      >
        <FiArrowUp size={20} />
      </button>

      <style>{`
        .fab {
          position: fixed;
          z-index: 90;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          color: white;
          text-decoration: none;
          transition: transform var(--transition-base), box-shadow var(--transition-base), opacity var(--transition-base);
        }
        .fab:hover { transform: translateY(-3px) scale(1.04); }
        .fab:active { transform: translateY(0) scale(1); }

        .fab-wa {
          bottom: 22px;
          left: 22px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
          box-shadow: 0 12px 28px rgba(37, 211, 102, 0.45), 0 4px 10px rgba(37, 211, 102, 0.25);
        }
        .fab-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          animation: pulseRing 2.2s ease-out infinite;
          pointer-events: none;
        }

        .fab-top {
          bottom: 22px;
          right: 22px;
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: var(--primary);
          box-shadow: 0 10px 24px rgba(20, 20, 58, 0.30);
          opacity: 0;
          pointer-events: none;
        }
        .fab-top.visible { opacity: 1; pointer-events: auto; }

        @media (max-width: 768px) {
          .fab-wa { width: 54px; height: 54px; bottom: 16px; left: 16px; }
          .fab-top { width: 42px; height: 42px; bottom: 16px; right: 16px; }
        }
      `}</style>
    </>
  );
}
