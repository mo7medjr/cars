/**
 * Helper موحد لإظهار الصور.
 * - لو المسار URL كامل (http/https) → يرجع زي ما هو (مفيد لـ mock data أو CDN خارجي)
 * - غير كده → يضيف الـ prefix المناسب (cars / sales)
 */
const isAbsolute = (path) => /^(https?:\/\/|data:)/i.test(path || '');

export function carImageUrl(path) {
  if (!path) return null;
  if (isAbsolute(path)) return path;
  return `/static/cars/${path}`;
}

export function saleImageUrl(path) {
  if (!path) return null;
  if (isAbsolute(path)) return path;
  return `/static/sales/${path}`;
}
