import { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheck, FiX } from 'react-icons/fi';

const STORAGE_KEY = 'el_marakby_notifications';
const MAX_ITEMS = 50;

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function saveStored(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS))); } catch {}
}

/**
 * NotificationsCenter — dropdown bell في header الأدمن.
 * بيتكامل مع window event "admin-notification".
 *
 * Usage:
 *   import { pushNotification } from './NotificationsCenter';
 *   pushNotification({ type: 'reservation', title: 'حجز جديد', message: '...' });
 */

export function pushNotification(notif) {
  const item = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    type: notif.type || 'info',
    title: notif.title || 'إشعار',
    message: notif.message || '',
    link: notif.link || null,
    timestamp: Date.now(),
    read: false,
  };
  const existing = loadStored();
  const updated = [item, ...existing].slice(0, MAX_ITEMS);
  saveStored(updated);
  window.dispatchEvent(new CustomEvent('admin-notification', { detail: item }));
}

export default function NotificationsCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(loadStored);
  const ref = useRef(null);

  const unread = items.filter(i => !i.read).length;

  useEffect(() => {
    const onNew = () => setItems(loadStored());
    window.addEventListener('admin-notification', onNew);
    window.addEventListener('storage', onNew);
    return () => {
      window.removeEventListener('admin-notification', onNew);
      window.removeEventListener('storage', onNew);
    };
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const markAllRead = () => {
    const updated = items.map(i => ({ ...i, read: true }));
    setItems(updated);
    saveStored(updated);
  };

  const remove = (id) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    saveStored(updated);
  };

  const clearAll = () => {
    setItems([]);
    saveStored([]);
  };

  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'الآن';
    if (m < 60) return `منذ ${m} دقيقة`;
    const h = Math.floor(m / 60);
    if (h < 24) return `منذ ${h} ساعة`;
    const d = Math.floor(h / 24);
    return `منذ ${d} يوم`;
  };

  const iconFor = (type) => {
    switch (type) {
      case 'reservation': return '🚗';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'danger': return '❌';
      default: return '🔔';
    }
  };

  return (
    <div ref={ref} className="notif-wrap">
      <button
        className="notif-bell"
        onClick={() => setOpen(!open)}
        aria-label="الإشعارات"
        title="الإشعارات"
      >
        <FiBell size={20} />
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <strong>الإشعارات {unread > 0 && <span className="notif-count">{unread}</span>}</strong>
            <div className="notif-panel-actions">
              {unread > 0 && (
                <button className="notif-link" onClick={markAllRead} title="تعليم الكل كمقروء">
                  <FiCheck size={14} /> الكل
                </button>
              )}
              {items.length > 0 && (
                <button className="notif-link notif-link-danger" onClick={clearAll} title="مسح الكل">
                  مسح
                </button>
              )}
            </div>
          </div>

          <div className="notif-list">
            {items.length === 0 ? (
              <div className="notif-empty">
                <span>🔕</span>
                <p>مفيش إشعارات</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className={`notif-item ${item.read ? '' : 'unread'}`}>
                  <span className="notif-icon">{iconFor(item.type)}</span>
                  <div className="notif-body">
                    <strong>{item.title}</strong>
                    {item.message && <p>{item.message}</p>}
                    <time>{formatTime(item.timestamp)}</time>
                  </div>
                  <button
                    className="notif-remove"
                    onClick={() => remove(item.id)}
                    aria-label="إزالة"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .notif-wrap { position: relative; }
        .notif-bell {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background: var(--bg-soft);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: color var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
        }
        .notif-bell:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }
        .notif-badge {
          position: absolute;
          top: -4px;
          left: -4px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: var(--grad-accent);
          color: white;
          font-size: 10px;
          font-weight: 800;
          border-radius: var(--radius-full);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-secondary);
          box-shadow: 0 4px 8px rgba(230,30,90,0.30);
        }

        .notif-panel {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          width: 380px;
          max-width: calc(100vw - 32px);
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
          z-index: 200;
          animation: notifIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes notifIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .notif-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-light);
          font-size: var(--font-size-sm);
        }
        .notif-panel-header strong { display: inline-flex; align-items: center; gap: 8px; font-weight: 800; }
        .notif-count { background: var(--accent); color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: var(--radius-full); }
        .notif-panel-actions { display: flex; gap: 4px; }
        .notif-link {
          font-size: 11px;
          color: var(--accent);
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: background var(--transition-fast);
          font-family: inherit;
        }
        .notif-link:hover { background: var(--accent-soft); }
        .notif-link-danger { color: var(--danger); }
        .notif-link-danger:hover { background: var(--danger-bg); }

        .notif-list {
          max-height: 420px;
          overflow-y: auto;
        }
        .notif-empty {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-muted);
        }
        .notif-empty span { font-size: 36px; display: block; margin-bottom: 8px; opacity: 0.5; }
        .notif-empty p { font-size: var(--font-size-sm); }

        .notif-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-light);
          transition: background var(--transition-fast);
          position: relative;
        }
        .notif-item:hover { background: var(--bg-soft); }
        .notif-item:last-child { border-bottom: none; }
        .notif-item.unread { background: rgba(230, 30, 90, 0.04); }
        .notif-item.unread::before {
          content: '';
          position: absolute;
          right: 6px;
          top: 18px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
        }
        .notif-icon { font-size: 22px; flex-shrink: 0; }
        .notif-body { flex: 1; min-width: 0; }
        .notif-body strong { display: block; font-size: var(--font-size-sm); font-weight: 800; margin-bottom: 2px; color: var(--text-primary); }
        .notif-body p { font-size: var(--font-size-xs); color: var(--text-secondary); line-height: 1.6; margin-bottom: 4px; }
        .notif-body time { font-size: 10px; color: var(--text-muted); font-weight: 600; }
        .notif-remove {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          align-self: flex-start;
          opacity: 0;
          transition: opacity var(--transition-fast), color var(--transition-fast), background var(--transition-fast);
        }
        .notif-item:hover .notif-remove { opacity: 1; }
        .notif-remove:hover { color: var(--danger); background: var(--danger-bg); }
      `}</style>
    </div>
  );
}
