import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error('يرجى إدخال اسم المستخدم وكلمة المرور');

    setLoading(true);
    try {
      await login(username, password);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" dir="rtl">
      <div className="login-bg-mesh" />
      <div className="login-bg-grid" />
      <div className="login-container">
        <div className="login-card animate-scale-in">
          <div className="login-header">
            <div className="login-logo-wrap">
              <img src="/logo.png" alt="المراكبي" className="login-logo" />
            </div>
            <h1>المراكبي</h1>
            <p>لوحة إدارة نظام تأجير السيارات</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label"><FiUser size={14} /> اسم المستخدم</label>
              <input type="text" className="form-input" placeholder="أدخل اسم المستخدم" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label"><FiLock size={14} /> كلمة المرور</label>
              <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? '⏳ جاري الدخول...' : <><FiLogIn /> تسجيل الدخول</>}
            </button>
          </form>

        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: var(--grad-hero);
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        .login-bg-mesh {
          position: absolute; inset: 0;
          background: var(--grad-hero-radial);
          pointer-events: none;
        }
        .login-bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          pointer-events: none;
        }

        .login-card {
          background: var(--bg-card);
          border-radius: var(--radius-2xl);
          padding: var(--space-3xl);
          width: 440px;
          max-width: 100%;
          box-shadow: 0 30px 80px rgba(0,0,0,0.30), 0 12px 30px rgba(0,0,0,0.20);
          position: relative;
          z-index: 2;
          border: 1px solid rgba(255,255,255,0.10);
        }
        .login-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: var(--radius-2xl);
          padding: 1px;
          background: linear-gradient(135deg, rgba(230,30,90,0.45), rgba(212,168,67,0.30));
          -webkit-mask: linear-gradient(black, black) content-box, linear-gradient(black, black);
          mask: linear-gradient(black, black) content-box, linear-gradient(black, black);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0.4;
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }
        .login-logo-wrap {
          width: 110px;
          height: 110px;
          margin: 0 auto var(--space-md);
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-deep) 0%, var(--primary) 60%, var(--primary-light) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow:
            0 0 0 5px rgba(230, 30, 90, 0.12),
            0 18px 36px rgba(20, 20, 58, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .login-logo-wrap::before {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background: var(--grad-accent);
          z-index: -1;
          opacity: 0.45;
          filter: blur(14px);
        }
        .login-logo-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.10), transparent 60%);
          pointer-events: none;
        }
        .login-logo {
          width: 76px;
          height: 76px;
          object-fit: contain;
          display: block;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.30));
        }
        .login-header h1 {
          font-size: var(--font-size-3xl);
          font-weight: 900;
          background: var(--grad-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }
        .login-header p { color: var(--text-secondary); font-size: var(--font-size-sm); margin-top: 6px; font-weight: 600; }
        .login-page .form-input { padding: 0.75rem 1rem; }
        .login-page .form-label { display: flex; align-items: center; gap: 6px; }

        .login-demo-hint { margin-top: var(--space-xl); }
        .login-demo-divider {
          display: flex; align-items: center; gap: 12px;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 700;
          margin-bottom: var(--space-md);
        }
        .login-demo-divider::before,
        .login-demo-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-light);
        }
        .login-demo-note {
          margin-top: var(--space-md);
          padding: 10px 14px;
          background: var(--info-bg);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: var(--radius-md);
          font-size: 11px;
          color: var(--info);
          line-height: 1.7;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
