import { useEffect, useState, useRef } from 'react';

/**
 * Track scroll progress (0 → 1) of an element relative to the viewport.
 * Useful for sticky scroll-driven animations.
 *
 * @param {object} options
 * @param {number} options.start - Start trigger: 0 = element top hits viewport bottom, 1 = element top hits viewport top
 * @param {number} options.end   - End trigger: same scale
 */
export default function useScrollProgress({ start = 0, end = 1 } = {}) {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when top of element at bottom of viewport, 1 when bottom at top
      const total = rect.height + vh;
      const passed = vh - rect.top;
      const raw = passed / total; // 0..1
      // Apply remap [start..end] -> [0..1]
      const span = Math.max(0.0001, end - start);
      const p = Math.min(1, Math.max(0, (raw - start) / span));
      setProgress(p);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [start, end]);

  return [ref, progress];
}
