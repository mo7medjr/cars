import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiCornerDownLeft } from 'react-icons/fi';
import api from '../../api/client';

const QUICK_LINKS = [
  { label: 'لوحة التحكم', path: '/admin', icon: '📊', keywords: 'dashboard home' },
  { label: 'إدارة السيارات', path: '/admin/cars', icon: '🚗', keywords: 'cars vehicles' },
  { label: 'سيارات للبيع', path: '/admin/sales', icon: '🏷️', keywords: 'sales sell' },
  { label: 'طلبات بيع', path: '/admin/consignment', icon: '📥', keywords: 'consignment requests' },
  { label: 'العملاء', path: '/admin/customers', icon: '👥', keywords: 'customers users' },
  { label: 'الحجوزات', path: '/admin/reservations', icon: '📅', keywords: 'reservations bookings' },
  { label: 'التقويم', path: '/admin/calendar', icon: '🗓️', keywords: 'calendar' },
  { label: 'العقود', path: '/admin/contracts', icon: '📄', keywords: 'contracts' },
  { label: 'الموظفين', path: '/admin/staff', icon: '👤', keywords: 'staff team' },
  { label: 'النسخ الاحتياطي', path: '/admin/backup', icon: '💾', keywords: 'backup' },
  { label: 'الإعدادات', path: '/admin/settings', icon: '⚙️', keywords: 'settings' },
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [carResults, setCarResults] = useState([]);
  const [customerResults, setCustomerResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Hotkey: Ctrl+K / Cmd+K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // Debounced search for cars/customers
  useEffect(() => {
    if (!query || query.length < 2) {
      setCarResults([]); setCustomerResults([]); return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const [cars, customers] = await Promise.all([
          api.get('/api/cars/public/all').then(({ data }) => (data.items || []).filter(c =>
            `${c.make} ${c.model} ${c.plate_number} ${c.color || ''}`.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 5)).catch(() => []),
          api.get('/api/customers', { params: { search: query, page_size: 5 } }).then(({ data }) => data.items || []).catch(() => []),
        ]);
        setCarResults(cars);
        setCustomerResults(customers);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const filteredLinks = useMemo(() => {
    if (!query) return QUICK_LINKS;
    const q = query.toLowerCase();
    return QUICK_LINKS.filter(l =>
      l.label.toLowerCase().includes(q) || l.keywords.includes(q)
    );
  }, [query]);

  // Flatten all results into one navigable list
  const flatResults = useMemo(() => {
    const list = [];
    filteredLinks.forEach(l => list.push({ kind: 'link', label: l.label, icon: l.icon, path: l.path }));
    carResults.forEach(c => list.push({
      kind: 'car',
      label: `${c.make} ${c.model} ${c.year}`,
      icon: '🚗',
      sub: `${c.plate_number || ''} ${c.color || ''}`,
      path: `/admin/cars`,
    }));
    customerResults.forEach(c => list.push({
      kind: 'customer',
      label: c.full_name || c.name || 'عميل',
      icon: '👤',
      sub: c.phone || c.national_id || '',
      path: `/admin/customers`,
    }));
    return list;
  }, [filteredLinks, carResults, customerResults]);

  const handleSelect = (item) => {
    if (!item) return;
    setOpen(false);
    navigate(item.path);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, flatResults.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); handleSelect(flatResults[activeIndex]); }
  };

  if (!open) {
    return (
      <button className="gs-trigger" onClick={() => setOpen(true)} title="بحث (Ctrl+K)">
        <FiSearch size={16} />
        <span>بحث سريع</span>
        <kbd>Ctrl K</kbd>
      </button>
    );
  }

  return (
    <>
      <div className="gs-overlay" onClick={() => setOpen(false)}>
        <div className="gs-panel" onClick={e => e.stopPropagation()}>
          <div className="gs-search-bar">
            <FiSearch size={18} className="gs-search-icon" />
            <input
              ref={inputRef}
              type="text"
              placeholder="ابحث عن سيارة، عميل، أو صفحة..."
              value={query}
              onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
              onKeyDown={onKeyDown}
            />
            <button className="gs-close" onClick={() => setOpen(false)} aria-label="إغلاق"><FiX size={18} /></button>
          </div>

          <div className="gs-results">
            {flatResults.length === 0 ? (
              <div className="gs-empty">
                <span>🔎</span>
                <p>{searching ? 'بيتم البحث...' : 'لا توجد نتائج'}</p>
              </div>
            ) : (
              <>
                {filteredLinks.length > 0 && (
                  <div className="gs-section">
                    <div className="gs-section-title">صفحات</div>
                    {filteredLinks.map((l, idx) => {
                      const realIdx = idx;
                      return (
                        <button
                          key={l.path}
                          className={`gs-result ${realIdx === activeIndex ? 'active' : ''}`}
                          onClick={() => handleSelect({ kind: 'link', path: l.path })}
                          onMouseEnter={() => setActiveIndex(realIdx)}
                        >
                          <span className="gs-result-icon">{l.icon}</span>
                          <span className="gs-result-label">{l.label}</span>
                          {realIdx === activeIndex && <FiCornerDownLeft size={14} className="gs-result-enter" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {carResults.length > 0 && (
                  <div className="gs-section">
                    <div className="gs-section-title">سيارات</div>
                    {carResults.map((c, idx) => {
                      const realIdx = filteredLinks.length + idx;
                      return (
                        <button
                          key={`car-${c.id}`}
                          className={`gs-result ${realIdx === activeIndex ? 'active' : ''}`}
                          onClick={() => handleSelect({ kind: 'car', path: '/admin/cars' })}
                          onMouseEnter={() => setActiveIndex(realIdx)}
                        >
                          <span className="gs-result-icon">🚗</span>
                          <span className="gs-result-label">
                            {c.make} {c.model} <small>{c.year}</small>
                            <em>{c.plate_number} · {c.color}</em>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {customerResults.length > 0 && (
                  <div className="gs-section">
                    <div className="gs-section-title">عملاء</div>
                    {customerResults.map((c, idx) => {
                      const realIdx = filteredLinks.length + carResults.length + idx;
                      return (
                        <button
                          key={`cust-${c.id}`}
                          className={`gs-result ${realIdx === activeIndex ? 'active' : ''}`}
                          onClick={() => handleSelect({ kind: 'customer', path: '/admin/customers' })}
                          onMouseEnter={() => setActiveIndex(realIdx)}
                        >
                          <span className="gs-result-icon">👤</span>
                          <span className="gs-result-label">
                            {c.full_name || 'عميل'}
                            <em>{c.phone || ''}</em>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="gs-footer">
            <span><kbd>↑↓</kbd> للتنقل</span>
            <span><kbd>Enter</kbd> للفتح</span>
            <span><kbd>Esc</kbd> للإغلاق</span>
          </div>
        </div>
      </div>

      <style>{`
        .gs-trigger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 12px;
          background: var(--bg-soft);
          color: var(--text-muted);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          cursor: pointer;
          font-family: inherit;
          transition: color var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
          min-width: 240px;
        }
        .gs-trigger:hover { color: var(--text-primary); border-color: var(--accent); }
        .gs-trigger span { flex: 1; text-align: right; }
        .gs-trigger kbd, .gs-footer kbd {
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 6px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: 4px;
          color: var(--text-secondary);
          line-height: 1;
        }

        .gs-overlay {
          position: fixed; inset: 0;
          background: rgba(10, 10, 24, 0.55);
          backdrop-filter: blur(6px);
          z-index: 500;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 12vh;
          animation: fadeIn 150ms ease;
        }
        .gs-panel {
          width: 600px;
          max-width: calc(100% - 32px);
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
          animation: scaleIn 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .gs-search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          border-bottom: 1px solid var(--border-light);
        }
        .gs-search-icon { color: var(--text-muted); flex-shrink: 0; }
        .gs-search-bar input {
          flex: 1;
          border: none;
          background: none;
          outline: none;
          font-family: inherit;
          font-size: var(--font-size-base);
          color: var(--text-primary);
          direction: rtl;
        }
        .gs-search-bar input::placeholder { color: var(--text-muted); }
        .gs-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          transition: color var(--transition-fast), background var(--transition-fast);
        }
        .gs-close:hover { color: var(--text-primary); background: var(--bg-soft); }

        .gs-results { max-height: 50vh; overflow-y: auto; padding: 8px; }
        .gs-empty { padding: 40px 20px; text-align: center; color: var(--text-muted); }
        .gs-empty span { font-size: 36px; display: block; margin-bottom: 8px; opacity: 0.5; }

        .gs-section { margin-bottom: 8px; }
        .gs-section-title {
          font-size: 10px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 8px 12px 4px;
        }

        .gs-result {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          background: none;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-family: inherit;
          color: var(--text-primary);
          transition: background var(--transition-fast);
          text-align: right;
        }
        .gs-result.active, .gs-result:hover { background: var(--accent-soft); color: var(--accent); }
        .gs-result-icon { font-size: 18px; width: 24px; flex-shrink: 0; }
        .gs-result-label {
          flex: 1;
          font-size: var(--font-size-sm);
          font-weight: 700;
          display: flex;
          align-items: baseline;
          gap: 6px;
          flex-wrap: wrap;
        }
        .gs-result-label small { font-size: 11px; color: var(--text-muted); font-weight: 600; }
        .gs-result-label em {
          font-style: normal;
          display: block;
          width: 100%;
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }
        .gs-result-enter { color: currentColor; flex-shrink: 0; opacity: 0.7; }

        .gs-footer {
          display: flex;
          gap: 18px;
          padding: 10px 16px;
          border-top: 1px solid var(--border-light);
          background: var(--bg-soft);
          font-size: 11px;
          color: var(--text-muted);
        }
        .gs-footer span { display: inline-flex; align-items: center; gap: 6px; }

        @media (max-width: 768px) {
          .gs-trigger { min-width: auto; }
          .gs-trigger span, .gs-trigger kbd { display: none; }
          .gs-overlay { padding-top: 8vh; padding-inline: 12px; }
        }
      `}</style>
    </>
  );
}
