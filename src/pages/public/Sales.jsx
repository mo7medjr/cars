import { useState, useEffect } from 'react';
import { FiSearch, FiPhone, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaWhatsapp, FaGasPump, FaCar, FaTachometerAlt, FaStar, FaTimes } from 'react-icons/fa';
import api from '../../api/client';
import config, { waLink, telLink } from '../../config/siteConfig';
import { saleImageUrl } from '../../utils/imageUrl';

export default function Sales() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selected, setSelected] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    document.title = 'سيارات للبيع — المراكبي لتجارة وإيجار السيارات';
    fetchCars();
    api.get('/api/settings').then(({ data }) => setSettings(data)).catch(() => {});
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/sales/public');
      setCars(data.items || []);
    } catch { setCars([]); }
    finally { setLoading(false); }
  };

  const phone = settings?.whatsapp1 || config.whatsapp1;

  const waMessage = (car) => {
    const priceText = car.price > 0 ? `\nالسعر: ${Number(car.price).toLocaleString()} ج.م` : '';
    const text = `مرحباً، أنا مهتم بسيارة *${car.display_name}* المعروضة للبيع على موقعكم.${priceText}\nممكن تفاصيل أكتر؟`;
    return `${waLink(phone)}?text=${encodeURIComponent(text)}`;
  };

  const filtered = cars.filter(c => {
    const t = search.toLowerCase();
    return !t || c.make?.toLowerCase().includes(t) || c.model?.toLowerCase().includes(t) || c.color?.toLowerCase().includes(t) || c.description?.toLowerCase().includes(t);
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_low': return a.price - b.price;
      case 'price_high': return b.price - a.price;
      case 'year_new': return b.year - a.year;
      case 'year_old': return a.year - b.year;
      case 'mileage': return (a.mileage || 0) - (b.mileage || 0);
      default: return 0; // newest = API default order
    }
  });

  // Similar cars: same make or same price range (±20%)
  const getSimilarCars = (car) => {
    if (!car) return [];
    return cars.filter(c => c.id !== car.id && (c.make === car.make || (Math.abs(c.price - car.price) / car.price < 0.25))).slice(0, 3);
  };

  const getImg = (car, idx = 0) => car.images?.[idx] ? saleImageUrl(car.images[idx]) : null;

  return (
    <div className="sales-page" dir="rtl">
      {/* Hero */}
      <section className="sales-hero">
        <div className="sales-hero-bg" />
        <div className="container sales-hero-content">
          <div className="sales-hero-badge">🏷️ سيارات للبيع</div>
          <h1>اختر سيارتك <span className="text-gradient">بأفضل سعر</span></h1>
          <p>تشكيلة متنوعة من السيارات المستعملة بحالة ممتازة — بأسعار تنافسية وضمان جودة</p>
          <div className="sales-search-wrap">
            <FiSearch size={18} />
            <input type="text" placeholder="ابحث بالماركة أو الموديل أو اللون..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="sales-toolbar">
            <div className="sales-count">{filtered.length} سيارة معروضة</div>
            <select className="sales-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">الأحدث</option>
              <option value="price_low">الأرخص أولاً</option>
              <option value="price_high">الأغلى أولاً</option>
              <option value="year_new">الأحدث موديل</option>
              <option value="year_old">الأقدم موديل</option>
              <option value="mileage">الأقل كيلومترات</option>
            </select>
          </div>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="sales-grid-section">
        <div className="container">
          {loading ? (
            <div className="sales-loading">
              {[1,2,3,4,5,6].map(i => <div className="skeleton" key={i} style={{ height: 340, borderRadius: 16 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="sales-empty">
              <div style={{ fontSize: 60 }}>🚗</div>
              <h3>لا توجد سيارات معروضة حالياً</h3>
              <p>تابعنا — سيارات جديدة تُضاف باستمرار</p>
            </div>
          ) : (
            <div className="sales-grid">
              {filtered.map(car => (
                <div className="sale-card" key={car.id} onClick={() => { setSelected(car); setImgIdx(0); }}>
                  {car.featured && <div className="sale-featured-badge"><FaStar size={10} /> مميزة</div>}
                  {car.has_discount && <div className="sale-discount-badge">خصم</div>}
                  <div className="sale-card-img">
                    {getImg(car) ? (
                      <img src={getImg(car)} alt={car.display_name} />
                    ) : (
                      <div className="sale-card-placeholder">🚘</div>
                    )}
                    <div className="sale-card-overlay">
                      <span>عرض التفاصيل</span>
                    </div>
                  </div>
                  <div className="sale-card-body">
                    <h3>{car.make} {car.model}</h3>
                    <div className="sale-card-year">{car.year}</div>
                    <div className="sale-card-specs">
                      {car.mileage > 0 && <span><FaTachometerAlt size={11} /> {Number(car.mileage).toLocaleString()} كم</span>}
                      {car.fuel_type && <span><FaGasPump size={11} /> {car.fuel_type}</span>}
                      {car.transmission && <span><FaCar size={11} /> {car.transmission === 'automatic' ? 'أوتوماتيك' : car.transmission === 'manual' ? 'مانيوال' : car.transmission}</span>}
                    </div>
                    <div className="sale-card-price-row">
                      <div>
                        {car.price > 0 ? (
                          <>
                            {car.has_discount && <span className="sale-old-price">{Number(car.old_price).toLocaleString()}</span>}
                            <strong className="sale-price">{Number(car.price).toLocaleString()} <small>ج.م</small></strong>
                          </>
                        ) : (
                          <strong className="sale-price" style={{ color: 'var(--accent)', fontSize: 15 }}>تواصل لمعرفة السعر</strong>
                        )}
                      </div>
                      <a href={waMessage(car)} target="_blank" rel="noopener noreferrer" className="sale-wa-btn" onClick={e => e.stopPropagation()}>
                        <FaWhatsapp size={16} /> تواصل
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {selected && (
        <div className="sale-modal-overlay" onClick={() => setSelected(null)}>
          <div className="sale-modal" onClick={e => e.stopPropagation()}>
            <button className="sale-modal-close" onClick={() => setSelected(null)}><FaTimes size={18} /></button>

            {/* Gallery */}
            <div className="sale-modal-gallery">
              {getImg(selected, imgIdx) ? (
                <img src={getImg(selected, imgIdx)} alt="" className="sale-modal-img" />
              ) : (
                <div className="sale-modal-placeholder">🚘</div>
              )}
              {(selected.images?.length || 0) > 1 && (
                <>
                  <button className="gallery-btn gallery-prev" onClick={() => setImgIdx(i => i > 0 ? i - 1 : selected.images.length - 1)}><FiChevronRight size={24} /></button>
                  <button className="gallery-btn gallery-next" onClick={() => setImgIdx(i => i < selected.images.length - 1 ? i + 1 : 0)}><FiChevronLeft size={24} /></button>
                  <div className="gallery-dots">
                    {selected.images.map((_, i) => <span key={i} className={`gallery-dot ${i === imgIdx ? 'active' : ''}`} onClick={() => setImgIdx(i)} />)}
                  </div>
                </>
              )}
            </div>

            <div className="sale-modal-body">
              <h2>{selected.display_name}</h2>
              <div className="sale-modal-price-row">
                {selected.price > 0 ? (
                  <>
                    {selected.has_discount && <span className="sale-old-price big">{Number(selected.old_price).toLocaleString()} ج.م</span>}
                    <strong className="sale-modal-price">{Number(selected.price).toLocaleString()} <small>ج.م</small></strong>
                  </>
                ) : (
                  <strong className="sale-modal-price" style={{ color: 'var(--accent)' }}>تواصل لمعرفة السعر</strong>
                )}
              </div>

              <div className="sale-modal-specs">
                {selected.color && <div className="spec-item"><span>🎨</span> {selected.color}</div>}
                {selected.year && <div className="spec-item"><span>📅</span> {selected.year}</div>}
                {selected.mileage > 0 && <div className="spec-item"><span>🛣️</span> {Number(selected.mileage).toLocaleString()} كم</div>}
                {selected.fuel_type && <div className="spec-item"><span>⛽</span> {selected.fuel_type}</div>}
                {selected.transmission && <div className="spec-item"><span>⚙️</span> {selected.transmission === 'automatic' ? 'أوتوماتيك' : selected.transmission === 'manual' ? 'مانيوال' : selected.transmission}</div>}
                {selected.engine_size && <div className="spec-item"><span>🔧</span> {selected.engine_size}</div>}
              </div>

              {selected.features && (
                <div className="sale-modal-features">
                  <h4>المواصفات</h4>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: 2 }}>{selected.features}</p>
                </div>
              )}

              {selected.description && (
                <div className="sale-modal-desc">
                  <h4>الوصف</h4>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: 2 }}>{selected.description}</p>
                </div>
              )}

              <div className="sale-modal-actions">
                <a href={waMessage(selected)} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-lg sale-action-btn">
                  <FaWhatsapp size={20} /> تواصل عبر واتساب
                </a>
                <a href={telLink(settings?.phone1 || config.phone1)} className="btn btn-outline btn-lg sale-action-btn">
                  <FiPhone size={18} /> اتصل الآن
                </a>
              </div>

              {/* Similar Cars */}
              {getSimilarCars(selected).length > 0 && (
                <div className="sale-similar">
                  <h4>🚗 سيارات مشابهة</h4>
                  <div className="sale-similar-grid">
                    {getSimilarCars(selected).map(sc => (
                      <div className="sale-similar-card" key={sc.id} onClick={() => { setSelected(sc); setImgIdx(0); }}>
                        <div className="sale-similar-img">
                          {getImg(sc) ? <img src={getImg(sc)} alt="" /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, background: '#f0f2f5' }}>🚘</div>}
                        </div>
                        <div className="sale-similar-info">
                          <strong>{sc.make} {sc.model}</strong>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sc.year} • {sc.color}</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>{sc.price > 0 ? `${Number(sc.price).toLocaleString()} ج.م` : 'تواصل لمعرفة السعر'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Hero */
        .sales-hero {
          position: relative; padding: 80px 0 70px;
          background: var(--grad-hero);
          text-align: center; overflow: hidden;
          isolation: isolate;
        }
        .sales-hero-bg {
          position: absolute; inset: 0;
          background: var(--grad-hero-radial);
          pointer-events: none;
        }
        .sales-hero::after {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          pointer-events: none;
        }
        .sales-hero-content { position: relative; z-index: 2; }
        .sales-hero-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(212,168,67,0.18); color: var(--gold-light); padding: 7px 18px; border-radius: 50px; font-size: 13px; font-weight: 700; margin-bottom: 16px; border: 1px solid rgba(212,168,67,0.25); backdrop-filter: blur(8px); }
        .sales-hero h1 { font-size: clamp(2rem, 4.5vw, 3.5rem); font-weight: 900; color: white; margin-bottom: 14px; letter-spacing: -0.02em; line-height: 1.1; }
        .sales-hero p { color: rgba(255,255,255,0.72); font-size: 17px; margin-bottom: 28px; max-width: 600px; margin-inline: auto; }
        .sales-search-wrap { display: flex; align-items: center; gap: 10px; max-width: 540px; margin: 0 auto 18px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); border-radius: 14px; padding: 12px 18px; color: rgba(255,255,255,0.6); backdrop-filter: blur(10px); transition: border-color var(--transition-fast), background var(--transition-fast); }
        .sales-search-wrap:focus-within { border-color: rgba(255,255,255,0.30); background: rgba(255,255,255,0.12); }
        .sales-search-wrap input { flex: 1; background: none; border: none; color: white; font-size: 15px; font-family: inherit; outline: none; }
        .sales-search-wrap input::placeholder { color: rgba(255,255,255,0.4); }
        .sales-count { color: rgba(255,255,255,0.3); font-size: 13px; }
        .sales-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; max-width: 500px; margin: 0 auto; }
        .sales-sort { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-family: inherit; cursor: pointer; outline: none; }
        .sales-sort option { background: #1e293b; color: white; }

        /* Grid */
        .sales-grid-section { padding: 40px 0 60px; }
        .sales-loading { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .sales-empty { text-align: center; padding: 60px 0; color: var(--text-muted); }
        .sales-empty h3 { margin: 12px 0 4px; font-size: 18px; color: var(--text-primary); }
        .sales-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

        /* Card */
        .sale-card { background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-light); overflow: hidden; cursor: pointer; transition: all 0.3s; position: relative; }
        .sale-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); border-color: var(--accent); }
        .sale-featured-badge { position: absolute; top: 12px; right: 12px; z-index: 2; background: linear-gradient(135deg, #f59e0b, #f97316); color: white; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px; }
        .sale-discount-badge { position: absolute; top: 12px; left: 12px; z-index: 2; background: var(--danger); color: white; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; }
        .sale-card-img { position: relative; height: 200px; background: #f0f2f5; overflow: hidden; }
        .sale-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
        .sale-card:hover .sale-card-img img { transform: scale(1.05); }
        .sale-card-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 80px; background: linear-gradient(135deg, #f8fafc, #e2e8f0); }
        .sale-card-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; }
        .sale-card:hover .sale-card-overlay { opacity: 1; }
        .sale-card-overlay span { color: white; font-size: 14px; font-weight: 700; background: rgba(0,0,0,0.5); padding: 8px 20px; border-radius: 50px; }

        .sale-card-body { padding: 16px; }
        .sale-card-body h3 { font-size: 17px; font-weight: 700; margin-bottom: 2px; }
        .sale-card-year { font-size: 13px; color: var(--accent); font-weight: 600; margin-bottom: 10px; }
        .sale-card-specs { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
        .sale-card-specs span { font-size: 11px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; background: var(--bg-primary); padding: 4px 10px; border-radius: 6px; }
        .sale-card-price-row { display: flex; justify-content: space-between; align-items: center; }
        .sale-old-price { text-decoration: line-through; color: var(--text-muted); font-size: 12px; display: block; }
        .sale-price { font-size: 22px; font-weight: 900; color: var(--success); }
        .sale-price small { font-size: 12px; font-weight: 400; }
        .sale-wa-btn { display: flex; align-items: center; gap: 6px; background: #25d366; color: white; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; transition: all 0.2s; text-decoration: none; }
        .sale-wa-btn:hover { background: #1da851; transform: scale(1.05); }

        /* Modal */
        .sale-modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto; }
        .sale-modal { background: var(--bg-card); border-radius: 20px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; }
        .sale-modal-close { position: absolute; top: 12px; right: 12px; z-index: 10; width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.5); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }

        .sale-modal-gallery { position: relative; height: 350px; background: #0f172a; }
        .sale-modal-img { width: 100%; height: 100%; object-fit: contain; }
        .sale-modal-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 120px; }
        .gallery-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.15); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .gallery-prev { right: 12px; }
        .gallery-next { left: 12px; }
        .gallery-btn:hover { background: rgba(255,255,255,0.3); }
        .gallery-dots { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; }
        .gallery-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.3); cursor: pointer; }
        .gallery-dot.active { background: white; width: 20px; border-radius: 4px; }

        .sale-modal-body { padding: 24px; }
        .sale-modal-body h2 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
        .sale-modal-price-row { margin-bottom: 20px; }
        .sale-old-price.big { font-size: 16px; }
        .sale-modal-price { font-size: 32px; font-weight: 900; color: var(--success); }
        .sale-modal-price small { font-size: 16px; }

        .sale-modal-specs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
        .spec-item { background: var(--bg-primary); padding: 10px 14px; border-radius: 10px; font-size: 13px; display: flex; align-items: center; gap: 8px; }
        .spec-item span { font-size: 16px; }

        .sale-modal-features, .sale-modal-desc { margin-bottom: 16px; }
        .sale-modal-features h4, .sale-modal-desc h4 { font-size: 14px; font-weight: 700; margin-bottom: 8px; color: var(--text-secondary); }
        .sale-modal-features p, .sale-modal-desc p { font-size: 14px; color: var(--text-primary); }

        .sale-modal-actions { display: flex; gap: 12px; margin-top: 20px; }
        .sale-action-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-success { background: #25d366; color: white; border: none; }
        .btn-success:hover { background: #1da851; }

        @media (max-width: 768px) {
          .sales-loading { grid-template-columns: 1fr; }
          .sales-grid { grid-template-columns: 1fr; }
          .sale-modal-specs { grid-template-columns: repeat(2, 1fr); }
          .sale-modal-gallery { height: 250px; }
          .sale-modal-actions { flex-direction: column; }
        }

        /* Similar Cars */
        .sale-similar { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-light); }
        .sale-similar h4 { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
        .sale-similar-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .sale-similar-card { background: var(--bg-primary); border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.2s; border: 1px solid var(--border-light); }
        .sale-similar-card:hover { border-color: var(--accent); transform: translateY(-2px); }
        .sale-similar-img { height: 80px; overflow: hidden; }
        .sale-similar-img img { width: 100%; height: 100%; object-fit: cover; }
        .sale-similar-info { padding: 8px 10px; }
        .sale-similar-info strong { font-size: 13px; display: block; }

        @media (max-width: 768px) {
          .sale-similar-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
