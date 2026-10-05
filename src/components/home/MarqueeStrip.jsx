/**
 * A bold animated marquee strip with statement words.
 * Use between sections to break the page rhythm.
 */
export default function MarqueeStrip({ words = ['السرعة', 'الفخامة', 'الثقة', 'الراحة'], variant = 'dark' }) {
  const items = [...words, ...words, ...words];
  return (
    <div className={`marquee-strip marquee-${variant}`} aria-hidden="true">
      <div className="marquee-strip-track">
        {items.map((w, i) => (
          <span key={i} className="marquee-word">
            {w}
            <span className="marquee-sep">★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
