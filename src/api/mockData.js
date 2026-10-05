/**
 * Mock data للـ demo — بتشتغل لما الـ backend مش متاح.
 * بيانات واقعية للسوق المصري.
 *
 * الصور: SVG placeholders inline (data URI) عشان نضمن إنها دايماً صورة عربية صح
 * مش صور عشوائية من CDN خارجي.
 */

// خريطة الألوان العربية -> hex (للسلويت)
const COLOR_MAP = {
  'أبيض لؤلؤي': '#f1f5f9',
  'أبيض': '#e2e8f0',
  'فضي ميتاليك': '#cbd5e1',
  'فضي': '#94a3b8',
  'رمادي': '#64748b',
  'أسود': '#1e293b',
  'أسود ميتاليك': '#0f172a',
  'أحمر': '#dc2626',
  'أزرق': '#1d4ed8',
  'أخضر': '#16a34a',
  'ذهبي': '#d4a843',
};

/**
 * يولّد SVG placeholder احترافي للسيارة (data URI).
 */
function carPlaceholder({ make, model, year, color = 'رمادي', tagline = '' }) {
  const carColor = COLOR_MAP[color] || '#94a3b8';
  const isDark = ['أسود', 'أسود ميتاليك', 'أزرق'].includes(color);
  const accentText = isDark ? '#f0c85c' : '#d4a843';

  // Encode-safe SVG (مفيش newlines داخل النص)
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500' preserveAspectRatio='xMidYMid slice'>
<defs>
<linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
<stop offset='0%' stop-color='#0a0a24'/>
<stop offset='55%' stop-color='#14143a'/>
<stop offset='100%' stop-color='#2a2660'/>
</linearGradient>
<radialGradient id='glow' cx='0.78' cy='0.25' r='0.55'>
<stop offset='0%' stop-color='#e61e5a' stop-opacity='0.35'/>
<stop offset='100%' stop-color='#e61e5a' stop-opacity='0'/>
</radialGradient>
<radialGradient id='glowGold' cx='0.18' cy='0.85' r='0.5'>
<stop offset='0%' stop-color='#d4a843' stop-opacity='0.22'/>
<stop offset='100%' stop-color='#d4a843' stop-opacity='0'/>
</radialGradient>
<linearGradient id='carBody' x1='0' y1='0' x2='0' y2='1'>
<stop offset='0%' stop-color='${carColor}'/>
<stop offset='100%' stop-color='${carColor}' stop-opacity='0.7'/>
</linearGradient>
</defs>
<rect width='800' height='500' fill='url(#bg)'/>
<rect width='800' height='500' fill='url(#glow)'/>
<rect width='800' height='500' fill='url(#glowGold)'/>

<!-- subtle grid -->
<g opacity='0.06' stroke='white' stroke-width='1'>
<line x1='0' y1='100' x2='800' y2='100'/>
<line x1='0' y1='200' x2='800' y2='200'/>
<line x1='0' y1='300' x2='800' y2='300'/>
<line x1='0' y1='400' x2='800' y2='400'/>
<line x1='200' y1='0' x2='200' y2='500'/>
<line x1='400' y1='0' x2='400' y2='500'/>
<line x1='600' y1='0' x2='600' y2='500'/>
</g>

<!-- ground shadow -->
<ellipse cx='400' cy='320' rx='280' ry='14' fill='black' opacity='0.45'/>

<!-- Car silhouette (sedan) -->
<g transform='translate(160,180)'>
<!-- body -->
<path d='M30,130 L60,80 Q80,55 120,52 L200,48 Q260,18 360,18 L420,18 Q480,18 530,48 L600,52 Q640,55 660,80 L690,130 Q695,138 690,148 L660,148 Q655,180 615,180 Q580,180 575,148 L145,148 Q140,180 105,180 Q65,180 60,148 L30,148 Q25,138 30,130 Z' fill='url(#carBody)' stroke='rgba(0,0,0,0.4)' stroke-width='1.5'/>
<!-- windows -->
<path d='M205,55 L260,22 L420,22 L470,55 L470,90 L205,90 Z' fill='#0a0a24' opacity='0.85'/>
<path d='M210,58 L262,28 L378,28 L378,87 L210,87 Z' fill='#1e293b' opacity='0.6'/>
<line x1='378' y1='28' x2='378' y2='87' stroke='#0a0a24' stroke-width='2'/>
<!-- door line -->
<line x1='340' y1='90' x2='340' y2='148' stroke='rgba(0,0,0,0.25)' stroke-width='1.5'/>
<!-- headlight -->
<ellipse cx='655' cy='110' rx='12' ry='6' fill='#fef9c3' opacity='0.9'/>
<!-- taillight -->
<rect x='40' y='105' width='14' height='10' rx='2' fill='#dc2626' opacity='0.9'/>
<!-- wheels -->
<circle cx='105' cy='148' r='30' fill='#0a0a24'/>
<circle cx='105' cy='148' r='18' fill='#475569'/>
<circle cx='105' cy='148' r='10' fill='#1e293b'/>
<circle cx='615' cy='148' r='30' fill='#0a0a24'/>
<circle cx='615' cy='148' r='18' fill='#475569'/>
<circle cx='615' cy='148' r='10' fill='#1e293b'/>
</g>

<!-- Brand info -->
<text x='400' y='390' text-anchor='middle' fill='${accentText}' font-family='system-ui,-apple-system,Segoe UI,sans-serif' font-size='40' font-weight='900' letter-spacing='-1'>${escapeXml(make)} ${escapeXml(model)}</text>
<text x='400' y='430' text-anchor='middle' fill='rgba(255,255,255,0.78)' font-family='system-ui,-apple-system,Segoe UI,sans-serif' font-size='22' font-weight='600'>${year}${tagline ? ' · ' + escapeXml(tagline) : ''}</text>

<!-- corner badge -->
<g transform='translate(40,40)'>
<circle cx='14' cy='14' r='5' fill='#10b981'>
<animate attributeName='opacity' values='1;0.4;1' dur='2s' repeatCount='indefinite'/>
</circle>
<text x='28' y='19' fill='rgba(255,255,255,0.85)' font-family='system-ui,sans-serif' font-size='13' font-weight='700' letter-spacing='1'>EL MARAKBY</text>
</g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const car = (props) => carPlaceholder(props);

// ──────────────────────────────────────────────
// سيارات الإيجار (Rental Fleet)
// ──────────────────────────────────────────────
export const MOCK_RENTAL_CARS = [
  {
    id: 'r1',
    make: 'Hyundai',
    model: 'Elantra',
    year: 2023,
    color: 'أبيض لؤلؤي',
    plate_number: 'دمياط 4521',
    daily_rate: 1200,
    weekly_rate: 7500,
    monthly_rate: 28000,
    current_mileage: 18500,
    status: 'available',
    images: [
      car({ make: 'Hyundai', model: 'Elantra', year: 2023, color: 'أبيض لؤلؤي' }),
      car({ make: 'Hyundai', model: 'Elantra', year: 2023, color: 'أبيض', tagline: 'داخلي جلد' }),
    ],
    notes: 'سيارة موديل 2023 — حالة فابريكا، فتحة سقف، بلوتوث، كاميرا خلفية، تكييف رهيب.',
    available_after: null,
  },
  {
    id: 'r2',
    make: 'Toyota',
    model: 'Corolla',
    year: 2022,
    color: 'فضي ميتاليك',
    plate_number: 'دمياط 7821',
    daily_rate: 1100,
    weekly_rate: 6800,
    monthly_rate: 25000,
    current_mileage: 32400,
    status: 'available',
    images: [
      car({ make: 'Toyota', model: 'Corolla', year: 2022, color: 'فضي ميتاليك' }),
    ],
    notes: 'الأكثر طلباً — اقتصادية في البنزين، صيانة دورية، كراسي جلد.',
    available_after: null,
  },
  {
    id: 'r3',
    make: 'Kia',
    model: 'Cerato',
    year: 2022,
    color: 'أسود',
    plate_number: 'دمياط 2310',
    daily_rate: 1150,
    weekly_rate: 7000,
    monthly_rate: 26500,
    current_mileage: 28900,
    status: 'rented',
    images: [
      car({ make: 'Kia', model: 'Cerato', year: 2022, color: 'أسود' }),
    ],
    notes: 'مجهزة بشاشة لمس وكاميرا 360.',
    available_after: new Date(Date.now() + 3 * 86400000).toISOString(),
  },
  {
    id: 'r4',
    make: 'Nissan',
    model: 'Sunny',
    year: 2021,
    color: 'رمادي',
    plate_number: 'دمياط 9034',
    daily_rate: 950,
    weekly_rate: 5800,
    monthly_rate: 21000,
    current_mileage: 45200,
    status: 'available',
    images: [
      car({ make: 'Nissan', model: 'Sunny', year: 2021, color: 'رمادي' }),
    ],
    notes: 'الأرخص في الأسطول — مناسبة للرحلات اليومية والمشاوير الطويلة.',
    available_after: null,
  },
  {
    id: 'r5',
    make: 'Chevrolet',
    model: 'Optra',
    year: 2020,
    color: 'أبيض',
    plate_number: 'دمياط 5612',
    daily_rate: 900,
    weekly_rate: 5500,
    monthly_rate: 20000,
    current_mileage: 67800,
    status: 'maintenance',
    images: [
      car({ make: 'Chevrolet', model: 'Optra', year: 2020, color: 'أبيض' }),
    ],
    notes: 'في الصيانة الدورية — متاحة قريباً.',
    available_after: new Date(Date.now() + 5 * 86400000).toISOString(),
  },
  {
    id: 'r6',
    make: 'MG',
    model: '5',
    year: 2023,
    color: 'أحمر',
    plate_number: 'دمياط 1287',
    daily_rate: 1350,
    weekly_rate: 8200,
    monthly_rate: 31000,
    current_mileage: 12300,
    status: 'available',
    images: [
      car({ make: 'MG', model: '5', year: 2023, color: 'أحمر' }),
      car({ make: 'MG', model: '5', year: 2023, color: 'أحمر', tagline: 'تصميم رياضي' }),
    ],
    notes: 'موديل 2023 — تصميم رياضي، شاشة كبيرة، مقاعد جلد فاخرة.',
    available_after: null,
  },
  {
    id: 'r7',
    make: 'Renault',
    model: 'Megane',
    year: 2021,
    color: 'أزرق',
    plate_number: 'دمياط 3344',
    daily_rate: 1050,
    weekly_rate: 6400,
    monthly_rate: 23500,
    current_mileage: 38700,
    status: 'available',
    images: [
      car({ make: 'Renault', model: 'Megane', year: 2021, color: 'أزرق' }),
    ],
    notes: 'سيارة فرنسية أنيقة — استهلاك بنزين منخفض جداً.',
    available_after: null,
  },
  {
    id: 'r8',
    make: 'Mitsubishi',
    model: 'Lancer',
    year: 2020,
    color: 'أبيض',
    plate_number: 'دمياط 8855',
    daily_rate: 1000,
    weekly_rate: 6000,
    monthly_rate: 22000,
    current_mileage: 51400,
    status: 'rented',
    images: [
      car({ make: 'Mitsubishi', model: 'Lancer', year: 2020, color: 'أبيض' }),
    ],
    notes: 'صيانة منتظمة — مناسبة للعائلة.',
    available_after: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
  {
    id: 'r9',
    make: 'Hyundai',
    model: 'Tucson',
    year: 2023,
    color: 'أبيض',
    plate_number: 'دمياط 6677',
    daily_rate: 1800,
    weekly_rate: 11000,
    monthly_rate: 42000,
    current_mileage: 9800,
    status: 'available',
    images: [
      car({ make: 'Hyundai', model: 'Tucson', year: 2023, color: 'أبيض', tagline: 'SUV' }),
      car({ make: 'Hyundai', model: 'Tucson', year: 2023, color: 'أبيض', tagline: '7 راكب' }),
    ],
    notes: 'SUV حديثة — مناسبة للرحلات والسفر، 7 راكب، 4×4.',
    available_after: null,
  },
];

// ──────────────────────────────────────────────
// سيارات للبيع (Sales)
// ──────────────────────────────────────────────
export const MOCK_SALE_CARS = [
  {
    id: 's1',
    make: 'BMW',
    model: '320i',
    display_name: 'BMW 320i 2021',
    year: 2021,
    color: 'أسود ميتاليك',
    price: 1450000,
    old_price: 1550000,
    has_discount: true,
    mileage: 42500,
    fuel_type: 'بنزين',
    transmission: 'automatic',
    engine_size: '2.0L Turbo',
    featured: true,
    images: [
      car({ make: 'BMW', model: '320i', year: 2021, color: 'أسود ميتاليك' }),
      car({ make: 'BMW', model: '320i', year: 2021, color: 'أسود ميتاليك', tagline: 'M-Sport' }),
    ],
    description: 'BMW 320i موديل 2021 — وارد ألمانيا، حالة فابريكا، فتحة سقف بانوراما، نظام صوت Harman Kardon، كرسي تدفئة وتبريد.',
    features: 'فتحة سقف بانوراما\nنظام Harman Kardon\nكاميرا 360 درجة\nمساعد ركن أوتوماتيك\nLED Adaptive Headlights\nكرسي جلد ناعم',
  },
  {
    id: 's2',
    make: 'Mercedes-Benz',
    model: 'C200',
    display_name: 'Mercedes C200 AMG 2022',
    year: 2022,
    color: 'فضي',
    price: 2100000,
    old_price: null,
    has_discount: false,
    mileage: 28000,
    fuel_type: 'بنزين',
    transmission: 'automatic',
    engine_size: '1.5L Hybrid',
    featured: true,
    images: [
      car({ make: 'Mercedes-Benz', model: 'C200', year: 2022, color: 'فضي', tagline: 'AMG Line' }),
    ],
    description: 'مرسيدس C200 — AMG Line كاملة الإضافات، حالة لا مثيل لها، أول مالك.',
    features: 'AMG Body Kit\nشاشة MBUX\nمساعد قيادة ذكي\nكشافات LED\nمقاعد رياضية',
  },
  {
    id: 's3',
    make: 'Hyundai',
    model: 'Elantra',
    display_name: 'Hyundai Elantra 2020',
    year: 2020,
    color: 'أبيض',
    price: 580000,
    old_price: 620000,
    has_discount: true,
    mileage: 65000,
    fuel_type: 'بنزين',
    transmission: 'automatic',
    engine_size: '1.6L',
    featured: false,
    images: [
      car({ make: 'Hyundai', model: 'Elantra', year: 2020, color: 'أبيض' }),
    ],
    description: 'هيونداي إلنترا 2020 — حالة ممتازة، صيانة دورية في التوكيل.',
    features: 'بلوتوث\nشاشة لمس 8 بوصة\nكاميرا خلفية\nحساسات أمامية وخلفية',
  },
  {
    id: 's4',
    make: 'Kia',
    model: 'Sportage',
    display_name: 'Kia Sportage GT-Line 2022',
    year: 2022,
    color: 'رمادي',
    price: 1250000,
    old_price: null,
    has_discount: false,
    mileage: 35000,
    fuel_type: 'بنزين',
    transmission: 'automatic',
    engine_size: '2.0L',
    featured: false,
    images: [
      car({ make: 'Kia', model: 'Sportage', year: 2022, color: 'رمادي', tagline: 'GT-Line' }),
    ],
    description: 'كيا سبورتاج 2022 — SUV عائلية مريحة، كل الإضافات.',
    features: 'تتبع المسار\nمساعد الفرملة\nشاشة 10 بوصة\nمقاعد جلد',
  },
  {
    id: 's5',
    make: 'Toyota',
    model: 'Corolla',
    display_name: 'Toyota Corolla 2019',
    year: 2019,
    color: 'أزرق',
    price: 480000,
    old_price: null,
    has_discount: false,
    mileage: 89000,
    fuel_type: 'بنزين',
    transmission: 'automatic',
    engine_size: '1.6L',
    featured: false,
    images: [
      car({ make: 'Toyota', model: 'Corolla', year: 2019, color: 'أزرق' }),
    ],
    description: 'تويوتا كورولا 2019 — اقتصادية، صيانة منتظمة، مناسبة كأول عربية.',
    features: 'شاشة لمس\nبلوتوث\nكاميرا خلفية\nمقاعد قماش',
  },
  {
    id: 's6',
    make: 'Volkswagen',
    model: 'Passat',
    display_name: 'Volkswagen Passat R-Line 2021',
    year: 2021,
    color: 'أسود',
    price: 1100000,
    old_price: 1180000,
    has_discount: true,
    mileage: 48000,
    fuel_type: 'بنزين',
    transmission: 'automatic',
    engine_size: '2.0L TSI',
    featured: true,
    images: [
      car({ make: 'Volkswagen', model: 'Passat', year: 2021, color: 'أسود', tagline: 'R-Line' }),
    ],
    description: 'فولكس واجن باسات R-Line 2021 — ألمانية أصيلة، حالة ممتازة.',
    features: 'Digital Cockpit\nنظام Massage للكرسي\nشاشة 12 بوصة\nمصابيح LED Matrix',
  },
];

// ──────────────────────────────────────────────
// Demo Admin (للأدمن بانل بدون backend)
// ──────────────────────────────────────────────
const DEMO_TOKEN = 'demo-token-' + Math.random().toString(36).slice(2);
export const MOCK_ADMIN = {
  id: 'demo-admin-1',
  full_name: 'مدير تجريبي',
  role: 'super_admin',
  username: 'demo',
  email: 'admin@elmarakby.com',
};

export const MOCK_LOGIN_RESPONSE = {
  access_token: DEMO_TOKEN,
  refresh_token: DEMO_TOKEN,
  admin_id: MOCK_ADMIN.id,
  admin_name: MOCK_ADMIN.full_name,
  role: MOCK_ADMIN.role,
};

// ──────────────────────────────────────────────
// Dashboard Stats
// ──────────────────────────────────────────────
const _availableCount = MOCK_RENTAL_CARS.filter(c => c.status === 'available').length;
const _rentedCount = MOCK_RENTAL_CARS.filter(c => c.status === 'rented').length;
const _maintenanceCount = MOCK_RENTAL_CARS.filter(c => c.status === 'maintenance').length;

export const MOCK_DASHBOARD_STATS = {
  total_cars: MOCK_RENTAL_CARS.length,
  available_cars: _availableCount,
  rented_cars: _rentedCount,
  maintenance_cars: _maintenanceCount,
  total_customers: 87,
  vip_customers: 12,
  blacklisted_customers: 3,
  pending_reservations: 5,
  active_reservations: _rentedCount,
  overdue_reservations: 1,
  completed_reservations: 142,
  total_revenue: 1245000,
  monthly_revenue: 178500,
  weekly_revenue: 42000,
  daily_revenue: 6800,
  cars_due_today: 2,
  cars_needing_maintenance: 1,
};

// ──────────────────────────────────────────────
// Recent Activity
// ──────────────────────────────────────────────
const _hours = (h) => new Date(Date.now() - h * 3600000).toISOString();

export const MOCK_RECENT_ACTIVITY = {
  items: [
    { id: 'a1', type: 'reservation', status: 'pending', customer_name: 'أحمد محمود', car_name: 'Hyundai Elantra 2023', amount: 4800, created_at: _hours(0.5) },
    { id: 'a2', type: 'reservation', status: 'active', customer_name: 'سارة عبد الله', car_name: 'Toyota Corolla 2022', amount: 6800, created_at: _hours(2) },
    { id: 'a3', type: 'reservation', status: 'completed', customer_name: 'محمد صلاح', car_name: 'Kia Cerato 2022', amount: 8050, created_at: _hours(5) },
    { id: 'a4', type: 'reservation', status: 'approved', customer_name: 'مريم حسن', car_name: 'MG 5 2023', amount: 5400, created_at: _hours(8) },
    { id: 'a5', type: 'reservation', status: 'pending', customer_name: 'يوسف إبراهيم', car_name: 'Nissan Sunny 2021', amount: 2850, created_at: _hours(12) },
    { id: 'a6', type: 'reservation', status: 'completed', customer_name: 'فاطمة علي', car_name: 'Hyundai Tucson 2023', amount: 12600, created_at: _hours(20) },
  ],
};

// ──────────────────────────────────────────────
// Dashboard Charts (revenue, bookings, top cars, fleet)
// ──────────────────────────────────────────────
export const MOCK_DASHBOARD_CHARTS = {
  // آخر 12 شهر
  revenue_monthly: [
    { label: 'مايو', revenue: 95000, bookings: 28 },
    { label: 'يونيو', revenue: 112000, bookings: 32 },
    { label: 'يوليو', revenue: 145000, bookings: 41 },
    { label: 'أغسطس', revenue: 168000, bookings: 47 },
    { label: 'سبتمبر', revenue: 134000, bookings: 38 },
    { label: 'أكتوبر', revenue: 156000, bookings: 44 },
    { label: 'نوفمبر', revenue: 142000, bookings: 40 },
    { label: 'ديسمبر', revenue: 189000, bookings: 53 },
    { label: 'يناير', revenue: 165000, bookings: 46 },
    { label: 'فبراير', revenue: 178000, bookings: 50 },
    { label: 'مارس', revenue: 195000, bookings: 56 },
    { label: 'أبريل', revenue: 178500, bookings: 51 },
  ],
  // آخر 7 أيام
  bookings_weekly: [
    { label: 'الأحد', bookings: 8, revenue: 9200 },
    { label: 'الإثنين', bookings: 6, revenue: 7100 },
    { label: 'الثلاثاء', bookings: 11, revenue: 13400 },
    { label: 'الأربعاء', bookings: 9, revenue: 10800 },
    { label: 'الخميس', bookings: 14, revenue: 16800 },
    { label: 'الجمعة', bookings: 17, revenue: 21500 },
    { label: 'السبت', bookings: 12, revenue: 14200 },
  ],
  // توزيع الأسطول
  fleet_breakdown: [
    { label: 'متاحة', value: _availableCount, color: '#10b981' },
    { label: 'مؤجرة', value: _rentedCount, color: '#f59e0b' },
    { label: 'صيانة', value: _maintenanceCount, color: '#ef4444' },
  ],
  // أكثر السيارات تأجيراً
  top_cars: [
    { name: 'Hyundai Elantra', bookings: 24, revenue: 86400 },
    { name: 'Toyota Corolla', bookings: 21, revenue: 71400 },
    { name: 'Kia Cerato', bookings: 18, revenue: 63000 },
    { name: 'Hyundai Tucson', bookings: 14, revenue: 78400 },
    { name: 'Nissan Sunny', bookings: 12, revenue: 34200 },
  ],
  // توزيع حالات الحجوزات
  reservations_by_status: [
    { label: 'مكتملة', value: 142, color: '#10b981' },
    { label: 'نشطة', value: 8, color: '#f59e0b' },
    { label: 'بانتظار', value: 5, color: '#3b82f6' },
    { label: 'موافق عليها', value: 4, color: '#8b5cf6' },
    { label: 'متأخرة', value: 1, color: '#ef4444' },
    { label: 'ملغاة', value: 7, color: '#6b7280' },
  ],
  // KPIs مع نسب التغيير
  kpis: {
    revenue_change_pct: 12.4,
    bookings_change_pct: 8.7,
    customers_change_pct: 15.2,
    avg_rental_days: 4.6,
    avg_rental_change_pct: -2.1,
    occupancy_rate: 73,
  },
};

// ──────────────────────────────────────────────
// Sales Stats Summary
// ──────────────────────────────────────────────
export const MOCK_SALES_STATS = {
  total_for_sale: MOCK_SALE_CARS.length,
  available_for_sale: MOCK_SALE_CARS.length,
  featured_count: MOCK_SALE_CARS.filter(c => c.featured).length,
  total_value: MOCK_SALE_CARS.reduce((sum, c) => sum + (c.price || 0), 0),
};

// ──────────────────────────────────────────────
// Customers
// ──────────────────────────────────────────────
export const MOCK_CUSTOMERS = [
  { id: 'c1', full_name: 'أحمد محمود حسن', phone: '01001234567', national_id: '29801010100123', status: 'active', total_rentals: 8, total_spent: 64000, created_at: '2024-01-15T10:00:00Z' },
  { id: 'c2', full_name: 'سارة عبد الله', phone: '01112345678', national_id: '29905050200456', status: 'vip', total_rentals: 24, total_spent: 245000, created_at: '2023-08-20T14:00:00Z' },
  { id: 'c3', full_name: 'محمد صلاح إبراهيم', phone: '01223456789', national_id: '29703030300789', status: 'active', total_rentals: 5, total_spent: 38000, created_at: '2024-03-10T09:00:00Z' },
  { id: 'c4', full_name: 'مريم حسن علي', phone: '01098765432', national_id: '30001020400321', status: 'active', total_rentals: 3, total_spent: 18500, created_at: '2024-06-05T11:00:00Z' },
  { id: 'c5', full_name: 'يوسف إبراهيم أحمد', phone: '01187654321', national_id: '29509070500654', status: 'blacklisted', total_rentals: 1, total_spent: 2800, created_at: '2024-02-20T16:00:00Z', blacklist_reason: 'تأخير في إرجاع السيارة' },
  { id: 'c6', full_name: 'فاطمة علي محمد', phone: '01276543210', national_id: '29803060600987', status: 'vip', total_rentals: 18, total_spent: 178000, created_at: '2023-11-01T13:00:00Z' },
];

// ──────────────────────────────────────────────
// Reservations
// ──────────────────────────────────────────────
const _days = (d) => new Date(Date.now() + d * 86400000).toISOString();
const _daysPast = (d) => new Date(Date.now() - d * 86400000).toISOString();

export const MOCK_RESERVATIONS = [
  {
    id: 'res1', customer_id: 'c1', customer_name: 'أحمد محمود حسن', customer_phone: '01001234567',
    car_id: 'r1', car_name: 'Hyundai Elantra 2023', car_plate: 'دمياط 4521',
    rental_type: 'daily', rental_duration: 4, daily_rate: 1200, total_amount: 4800,
    deposit_amount: 500, deposit_paid: true,
    start_date: _days(1), end_date: _days(5),
    status: 'pending', payment_method: 'online',
    created_at: _hours(0.5),
  },
  {
    id: 'res2', customer_id: 'c2', customer_name: 'سارة عبد الله', customer_phone: '01112345678',
    car_id: 'r3', car_name: 'Kia Cerato 2022', car_plate: 'دمياط 2310',
    rental_type: 'weekly', rental_duration: 1, daily_rate: 7000, total_amount: 7000,
    deposit_amount: 500, deposit_paid: true,
    start_date: _daysPast(2), end_date: _days(5),
    status: 'active', payment_method: 'cash',
    created_at: _daysPast(2),
  },
  {
    id: 'res3', customer_id: 'c3', customer_name: 'محمد صلاح إبراهيم', customer_phone: '01223456789',
    car_id: 'r2', car_name: 'Toyota Corolla 2022', car_plate: 'دمياط 7821',
    rental_type: 'daily', rental_duration: 7, daily_rate: 1100, total_amount: 7700,
    deposit_amount: 500, deposit_paid: true,
    start_date: _daysPast(10), end_date: _daysPast(3),
    status: 'completed', payment_method: 'online',
    created_at: _daysPast(11),
  },
  {
    id: 'res4', customer_id: 'c4', customer_name: 'مريم حسن علي', customer_phone: '01098765432',
    car_id: 'r6', car_name: 'MG 5 2023', car_plate: 'دمياط 1287',
    rental_type: 'daily', rental_duration: 4, daily_rate: 1350, total_amount: 5400,
    deposit_amount: 500, deposit_paid: false,
    start_date: _days(2), end_date: _days(6),
    status: 'approved', payment_method: 'cash',
    created_at: _hours(8),
  },
  {
    id: 'res5', customer_id: 'c5', customer_name: 'يوسف إبراهيم', customer_phone: '01187654321',
    car_id: 'r4', car_name: 'Nissan Sunny 2021', car_plate: 'دمياط 9034',
    rental_type: 'daily', rental_duration: 3, daily_rate: 950, total_amount: 2850,
    deposit_amount: 500, deposit_paid: false,
    start_date: _days(3), end_date: _days(6),
    status: 'pending', payment_method: 'online',
    created_at: _hours(12),
  },
  {
    id: 'res6', customer_id: 'c6', customer_name: 'فاطمة علي محمد', customer_phone: '01276543210',
    car_id: 'r9', car_name: 'Hyundai Tucson 2023', car_plate: 'دمياط 6677',
    rental_type: 'weekly', rental_duration: 1, daily_rate: 11000, total_amount: 11000,
    deposit_amount: 1000, deposit_paid: true,
    start_date: _daysPast(5), end_date: _days(2),
    status: 'overdue', payment_method: 'cash',
    created_at: _daysPast(6),
  },
];

// ──────────────────────────────────────────────
// إعدادات الموقع
// ──────────────────────────────────────────────
export const MOCK_SETTINGS = {
  whatsapp1: '01097835116',
  whatsapp2: '01097835116',
  phone1: '01097835116',
  phone2: '01097835116',
  email: 'info@elmarakby.com',
  address1: 'شارع الصحبجية بجوار مركز البُطة للعلاج الطبيعي، دمياط الجديدة',
  address1_map: 'https://maps.app.goo.gl/nVK7Dx3aKPMjk9kc6',
  address2: 'مكتب المراكبي لتجارة وايجار السيارات، دمياط الجديدة',
  address2_map: 'https://maps.app.goo.gl/ut8fncED3ZQiZo2YA',
};

// ──────────────────────────────────────────────
// Map endpoint → mock response
// ──────────────────────────────────────────────
// كل الـ GET endpoints (تستخدم لما الـ backend مش متاح)
export const MOCK_RESPONSES = {
  // Public
  '/api/cars/public/all': () => ({ items: MOCK_RENTAL_CARS }),
  '/api/sales/public': () => ({ items: MOCK_SALE_CARS }),
  '/api/settings': () => MOCK_SETTINGS,

  // Admin auth
  '/api/auth/me': () => MOCK_ADMIN,

  // Admin dashboard
  '/api/dashboard/stats': () => MOCK_DASHBOARD_STATS,
  '/api/dashboard/recent-activity': () => MOCK_RECENT_ACTIVITY,
  '/api/dashboard/charts': () => MOCK_DASHBOARD_CHARTS,

  // Admin sales
  '/api/sales/stats/summary': () => MOCK_SALES_STATS,
  '/api/sales': () => ({ items: MOCK_SALE_CARS }),

  // Admin lists
  '/api/cars': () => ({ items: MOCK_RENTAL_CARS, total: MOCK_RENTAL_CARS.length, page: 1, page_size: 20 }),
  '/api/cars/archived': () => ({ items: [] }),
  '/api/customers': () => ({ items: MOCK_CUSTOMERS, total: MOCK_CUSTOMERS.length, page: 1, page_size: 20 }),
  '/api/reservations': () => ({ items: MOCK_RESERVATIONS, total: MOCK_RESERVATIONS.length, page: 1, page_size: 20 }),
  '/api/contracts': () => ({ items: [] }),
  '/api/staff': () => ({ items: [MOCK_ADMIN] }),
  '/api/maintenance': () => ({ items: [] }),
  '/api/consignment': () => ({ items: [] }),
  '/api/backup/list': () => ({ items: [] }),
};

// POST endpoints (auth, etc)
export const MOCK_POST_RESPONSES = {
  '/api/auth/login': () => MOCK_LOGIN_RESPONSE,
  '/api/auth/refresh': () => MOCK_LOGIN_RESPONSE,
};
