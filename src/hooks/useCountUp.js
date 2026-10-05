import { useEffect, useRef, useState } from 'react';

/**
 * Animate a number from 0 → target when the element enters the viewport.
 * @param {number} target - End value
 * @param {object} options
 * @param {number} options.duration - Animation duration in ms (default 1500)
 * @param {string} options.suffix   - Suffix to append (e.g., "+", "%")
 */
export default function useCountUp(target, { duration = 1500, suffix = '' } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const animate = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const start = performance.now();
      const from = 0;
      const to = Number(target) || 0;

      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        const cur = Math.round(from + (to - from) * eased);
        setValue(cur);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && animate()),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return [ref, `${value.toLocaleString()}${suffix}`];
}
