import { useEffect } from 'react';

/**
 * useReveal — يضيف class "is-visible" على عناصر .reveal لما تدخل في الـ viewport
 * استخدم: ضع className="reveal" على أي عنصر تريد ظهوره عند السكرول.
 * لا يحتاج خصائص — يعمل تلقائياً مع كل العناصر التي تحمل class الـ reveal.
 */
export default function useReveal(deps = []) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const els = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!els.length) return;

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.01, rootMargin: '0px 0px 250px 0px' });

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
