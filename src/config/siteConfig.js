/**
 * ═══════════════════════════════════════════════════════════
 *  بيانات التواصل والمعلومات العامة
 *  غيّر الأرقام والبيانات هنا وهتتغير في كل الموقع تلقائياً
 * ═══════════════════════════════════════════════════════════
 */

const siteConfig = {
  // ─── اسم الشركة ─────────────────────────────
  companyName: 'المراكبي',
  companyNameEn: 'Al-Marakby',
  companySlogan: 'لتجارة وإيجار السيارات',

  // ─── أرقام الواتساب (2 رقم) ──────────────────
  // ⚠️ الرقمين دلوقتي واحد — لو عندك رقم تاني غيّره هنا
  whatsapp1: '01097835116',
  whatsapp2: '01097835116',  // ← غيّر ده لو عندك رقم واتساب تاني

  // ─── أرقام التليفون (2 رقم) ──────────────────
  // ⚠️ الرقمين دلوقتي واحد — لو عندك رقم تاني غيّره هنا
  phone1: '01097835116',
  phone2: '01097835116',  // ← غيّر ده لو عندك رقم تليفون تاني

  // ─── البريد الإلكتروني ───────────────────────
  email: 'info@elmarakby.com',

  // ─── العناوين (فرعين) ──────────────────────────
  address: 'معرض المراكبي — دمياط الجديدة',
  branches: [
    {
      name: 'معرض المراكبي',
      address: 'شارع الصحبجية بجوار مركز البُطة للعلاج الطبيعي، دمياط الجديدة',
      mapUrl: 'https://maps.app.goo.gl/nVK7Dx3aKPMjk9kc6',
    },
    {
      name: 'مكتب المراكبي لتجارة وايجار السيارات',
      address: 'دمياط الجديدة',
      mapUrl: 'https://maps.app.goo.gl/ut8fncED3ZQiZo2YA',
    },
  ],

  // ─── روابط السوشيال ميديا (اختياري) ──────────
  facebook: '',
  instagram: '',
  tiktok: '',
};

// ─── Helper Functions (لا تعدّل عليهم) ──────────
/**
 * يحوّل رقم محلي 01x إلى صيغة دولية 201x
 */
export const toInternational = (phone) => {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) return `2${clean}`;
  return clean;
};

/**
 * رابط الواتساب
 */
export const waLink = (phone) => `https://wa.me/${toInternational(phone)}`;

/**
 * رابط الاتصال
 */
export const telLink = (phone) => `tel:+${toInternational(phone)}`;

export default siteConfig;
