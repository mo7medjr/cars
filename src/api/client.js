import axios from 'axios';
import { MOCK_RESPONSES, MOCK_POST_RESPONSES } from './mockData';

const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// عرض رسالة واحدة فقط في الـ console عشان ما نزعجش
let _mockNoticeShown = false;
const _showMockNotice = () => {
  if (_mockNoticeShown) return;
  _mockNoticeShown = true;
  // eslint-disable-next-line no-console
  console.info('%c[Demo Mode] الـ Backend مش شغّال — بيتم استخدام بيانات تجريبية للسيارات.',
    'background:#e61e5a;color:white;padding:4px 10px;border-radius:6px;font-weight:700');
};

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401, token refresh, and mock fallback
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ─── Mock fallback: لما الـ backend مش متاح ────
    // - network error (الـ backend مش شغال)
    // - أو 502/503/504 (proxy errors من Vite)
    const status = error.response?.status;
    const isUpstreamDown = !error.response || status === 502 || status === 503 || status === 504;
    if (isUpstreamDown && error.code !== 'ECONNABORTED' && originalRequest?.url) {
      const url = originalRequest.url;
      const method = (originalRequest.method || 'get').toLowerCase();
      const handler = method === 'get' ? MOCK_RESPONSES[url] : MOCK_POST_RESPONSES[url];
      if (handler) {
        _showMockNotice();
        return Promise.resolve({
          data: handler(),
          status: 200,
          statusText: 'OK (mock)',
          headers: {},
          config: originalRequest,
          _mock: true,
        });
      }
      // أي PATCH/DELETE/PUT/POST آخر مش معروف → نرجّع نجاح فارغ عشان UI ما يكسرش
      if (method !== 'get') {
        _showMockNotice();
        return Promise.resolve({
          data: { success: true, message: 'Demo mode — العملية محاكاة فقط' },
          status: 200,
          statusText: 'OK (mock)',
          headers: {},
          config: originalRequest,
          _mock: true,
        });
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', {
            refresh_token: refreshToken,
          });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/admin/login';
        }
      } else {
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
