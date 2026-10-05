import { FiAlertTriangle, FiTrash2, FiCheck } from 'react-icons/fi';

/**
 * ConfirmModal — مودال تأكيد أنيق قابل لإعادة الاستخدام
 *
 * Props:
 * - show: boolean
 * - title: string
 * - message: string
 * - confirmText: string (default: "تأكيد")
 * - cancelText: string (default: "إلغاء")
 * - type: "danger" | "warning" | "success" (default: "danger")
 * - onConfirm: () => void
 * - onCancel: () => void
 * - loading: boolean (optional)
 */
export default function ConfirmModal({
  show,
  title = 'تأكيد العملية',
  message = 'هل أنت متأكد من هذه العملية؟',
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  type = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!show) return null;

  const icons = {
    danger: <FiTrash2 size={28} />,
    warning: <FiAlertTriangle size={28} />,
    success: <FiCheck size={28} />,
  };

  const colors = {
    danger: { bg: 'var(--danger-bg)', color: 'var(--danger)', btn: 'var(--danger)', shadow: 'rgba(239,68,68,0.3)' },
    warning: { bg: 'var(--warning-bg)', color: 'var(--warning)', btn: 'var(--warning)', shadow: 'rgba(245,158,11,0.3)' },
    success: { bg: 'var(--success-bg)', color: 'var(--success)', btn: 'var(--success)', shadow: 'rgba(16,185,129,0.3)' },
  };

  const c = colors[type] || colors.danger;

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 2000 }}>
      <div
        className="confirm-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="confirm-icon-wrap" style={{ background: c.bg, color: c.color }}>
          {icons[type]}
        </div>

        {/* Text */}
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>

        {/* Buttons */}
        <div className="confirm-actions">
          <button
            className="btn confirm-btn-primary"
            style={{ background: c.btn, color: '#fff', boxShadow: `0 4px 15px ${c.shadow}` }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '⏳ جاري...' : confirmText}
          </button>
          <button className="btn btn-outline confirm-btn-cancel" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
        </div>

        <style>{`
          .confirm-modal-content {
            background: var(--bg-card);
            border-radius: var(--radius-xl);
            padding: var(--space-2xl) var(--space-2xl) var(--space-xl);
            max-width: 420px;
            width: 90%;
            text-align: center;
            box-shadow: var(--shadow-xl);
            animation: confirmPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          @keyframes confirmPop {
            from { opacity: 0; transform: scale(0.85) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .confirm-icon-wrap {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto var(--space-lg);
          }
          .confirm-title {
            font-size: var(--font-size-xl);
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: var(--space-sm);
          }
          .confirm-message {
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
            line-height: 1.8;
            margin-bottom: var(--space-xl);
          }
          .confirm-actions {
            display: flex;
            gap: var(--space-md);
            justify-content: center;
          }
          .confirm-btn-primary {
            min-width: 120px;
            font-weight: 700;
          }
          .confirm-btn-primary:hover {
            transform: translateY(-1px);
            filter: brightness(1.1);
          }
          .confirm-btn-cancel {
            min-width: 100px;
          }
        `}</style>
      </div>
    </div>
  );
}
