import { useEffect, useRef, useState } from 'react';

/**
 * Track mouse position over an element and return parallax offsets.
 * Returns [ref, { x, y, rx, ry }] — x/y in [-1..1], rx/ry are clamped rotations.
 *
 * @param {object} options
 * @param {number} options.intensity - Multiplier for rotation degrees (default 8)
 * @param {boolean} options.disabled  - Skip parallax (e.g., mobile)
 */
export default function useMouseParallax({ intensity = 8, disabled = false } = {}) {
  const ref = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, rx: 0, ry: 0 });

  useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const handle = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const x = Math.max(-1, Math.min(1, dx));
        const y = Math.max(-1, Math.min(1, dy));
        setTransform({
          x,
          y,
          ry: x * intensity,
          rx: -y * intensity,
        });
      });
    };

    const reset = () => setTransform({ x: 0, y: 0, rx: 0, ry: 0 });

    window.addEventListener('mousemove', handle);
    window.addEventListener('mouseleave', reset);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', handle);
      window.removeEventListener('mouseleave', reset);
    };
  }, [intensity, disabled]);

  return [ref, transform];
}
