import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiCalendar, FiImage, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaPalette, FaGasPump, FaCar } from 'react-icons/fa';
import api from '../../api/client';
import { carImageUrl } from '../../utils/imageUrl';

const STATUS_LABELS = {
  available: { label: 'متاحة', class: 'available', icon: '✅' },
  rented: { label: 'محجوزة', class: 'rented', icon: '🔒' },
  maintenance: { label: 'صيانة', class: 'maintenance', icon: '🔧' },
};

export default function Fleet() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [filter, setFilter] = useState('all');
  const [carImageIndex, setCarImageIndex] = useState(0);

  useEffect(() => { fetchCars(); }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/cars/public/all');
      setCars(data.items || []);
    } catch {
      setCars([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { document.title = 'أسطول السيارات — المراكبي لتجارة وإيجار السيارات'; }, []);

  const filteredCars = cars.filter((car) => {
    const term = search.toLowerCase();
    const matchSearch = car.make?.toLowerCase().includes(term) || car.model?.toLowerCase().includes(term) || car.color?.toLowerCase().includes(term);
    const matchFilter = filter === 'all' || car.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: cars.length,
    available: cars.filter(c => c.status === 'available').length,
    rented: cars.filter(c => c.status === 'rented').length,
  };

  const openCarDetail = (car) => {
    setSelectedCar(car);
    setCarImageIndex(0);
  };

  const prevImage = () => {
    if (!selectedCar?.images) return;
    setCarImageIndex(i => (i - 1 + selectedCar.images.length) % selectedCar.images.length);
  };

  const nextImage = () => {
    if (!selectedCar?.images) return;
    setCarImageIndex(i => (i + 1) % selectedCar.images.length);
  };

  return (
    <div className="fleet-page">
      {/* Header */}
      <section className="fleet-header">
        <div className="container">
          <h1>🚗 أسطول السيارات</h1>
          <p>اختر سيارتك المفضلة من مجموعتنا المتنوعة بأفضل الأسعار</p>
          <div className="fleet-search">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="ابحث بالماركة، الموديل، اللون..." className="form-input search-input" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      {/* Filter Tabs + Car Grid */}
      <section className="fleet-grid-section">
        <div className="container">
          {/* Filter */}
          <div className="fleet-filter-bar">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'available', label: '✅ متاحة' },
              { key: 'rented', label: '🔒 محجوزة' },
            ].map(f => (
              <button
                key={f.key}
                className={`fleet-filter-btn ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label} <span className="fleet-filter-count">{counts[f.key]}</span>
              </button>
            ))}
          </div>

          <div className="fleet-results-info"><span>{filteredCars.length} سيارة</span></div>

          {loading ? (
            <div className="grid grid-3">{[1,2,3,4,5,6].map((i) => (
              <div className="car-card" key={i}><div className="skeleton" style={{ height: '200px' }} /><div className="car-info" style={{ padding: '20px' }}><div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '10px' }} /><div className="skeleton" style={{ height: '14px', width: '40%' }} /></div></div>
            ))}</div>
          ) : filteredCars.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🔍</div><div className="empty-text">لا توجد سيارات مطابقة للبحث</div></div>
          ) : (
            <div className="grid grid-3">
              {filteredCars.map((car, index) => {
                const isRented = car.status === 'rented';
                const statusInfo = STATUS_LABELS[car.status] || STATUS_LABELS.available;
                return (
                  <div className={`car-card animate-fade-in ${isRented ? 'car-rented' : ''}`} key={car.id} style={{ animationDelay: `${index * 0.08}s` }}>
                    {/* Car Image */}
                    <div className="car-image" onClick={() => openCarDetail(car)} style={{ cursor: 'pointer' }}>
                      {car.images && car.images.length > 0 ? (
                        <img src={carImageUrl(car.images[0])} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="car-image-placeholder">
                          <FiImage size={48} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      )}
                      <div className={`car-status-badge ${statusInfo.class}`}>{statusInfo.icon} {statusInfo.label}</div>
                      {car.images && car.images.length > 1 && (
                        <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '11px' }}>
                          📷 {car.images.length} صورة
                        </span>
                      )}
                      <div className="car-price-overlay">
                        <div>
                          <span className="price">{Number(car.daily_rate).toLocaleString()}</span>
                          <span className="price-label"> ج.م / يوم</span>
                        </div>
                        {(car.weekly_rate > 0 || car.monthly_rate > 0) && (
                          <div className="car-price-extras">
                            {car.weekly_rate > 0 && <span>{Number(car.weekly_rate).toLocaleString()} / أسبوع</span>}
                            {car.monthly_rate > 0 && <span>{Number(car.monthly_rate).toLocaleString()} / شهر</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Car Info */}
                    <div className="car-info">
                      <div className="car-name">{car.make} {car.model} {car.year}</div>
                      <div className="car-details">
                        <span className="car-detail"><FaPalette size={12} /> {car.color}</span>
                        <span className="car-detail"><FaCar size={12} /> {car.plate_number}</span>
                        <span className="car-detail"><FaGasPump size={12} /> {(car.current_mileage || 0).toLocaleString()} كم</span>
                      </div>

                      {/* Car Description — preserve line breaks */}
                      {car.notes && (
                        <div className="car-description" style={{ whiteSpace: 'pre-line' }}>
                          📝 {car.notes.length > 80 ? car.notes.substring(0, 80) + '...' : car.notes}
                        </div>
                      )}

                      {/* Available After Badge for rented cars */}
                      {isRented && car.available_after && (
                        <div className="car-available-after">
                          <FiClock size={13} />
                          متاحة بعد: {new Date(car.available_after).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                    <div className="car-actions">
                      {isRented ? (
                        <button className="btn btn-outline btn-block" disabled style={{ opacity: 0.5 }}>
                          🔒 محجوزة حالياً
                        </button>
                      ) : car.status === 'maintenance' ? (
                        <button className="btn btn-outline btn-block" disabled style={{ opacity: 0.5 }}>
                          🔧 في الصيانة
                        </button>
                      ) : (
                        <Link to={`/book/${car.id}`} className="btn btn-primary btn-block">
                          <FiCalendar size={16} /> احجز الآن
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Car Detail Modal with Image Carousel */}
      {selectedCar && (
        <div className="modal-overlay" onClick={() => setSelectedCar(null)} style={{ zIndex: 200 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>🚗 {selectedCar.make} {selectedCar.model} {selectedCar.year}</h3>
              <button className="btn-icon" onClick={() => setSelectedCar(null)} style={{ background: 'var(--bg-primary)' }}>✕</button>
            </div>
            <div className="modal-body">
              {/* Image Carousel */}
              {selectedCar.images && selectedCar.images.length > 0 ? (
                <div className="car-carousel" style={{ position: 'relative', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden' }}>
                  <img
                    src={carImageUrl(selectedCar.images[carImageIndex])}
                    alt={`صورة ${carImageIndex + 1}`}
                    style={{ width: '100%', height: '350px', objectFit: 'cover', display: 'block' }}
                  />
                  {/* Navigation Arrows */}
                  {selectedCar.images.length > 1 && (
                    <>
                      <button onClick={nextImage} className="carousel-arrow carousel-arrow-right" aria-label="الصورة التالية">
                        <FiChevronRight size={22} />
                      </button>
                      <button onClick={prevImage} className="carousel-arrow carousel-arrow-left" aria-label="الصورة السابقة">
                        <FiChevronLeft size={22} />
                      </button>
                      {/* Image Counter */}
                      <div className="carousel-counter">
                        {carImageIndex + 1} / {selectedCar.images.length}
                      </div>
                      {/* Dots Indicator */}
                      <div className="carousel-dots">
                        {selectedCar.images.map((_, i) => (
                          <button key={i} className={`carousel-dot ${i === carImageIndex ? 'active' : ''}`} onClick={() => setCarImageIndex(i)} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-primary)', borderRadius: '12px', marginBottom: '20px', color: 'var(--text-muted)' }}>
                  <FiImage size={48} /><p style={{ marginTop: '8px' }}>لا توجد صور</p>
                </div>
              )}

              {/* Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'الماركة', value: selectedCar.make },
                  { label: 'الموديل', value: selectedCar.model },
                  { label: 'سنة الصنع', value: selectedCar.year },
                  { label: 'اللون', value: selectedCar.color },
                  { label: 'رقم اللوحة', value: selectedCar.plate_number },
                  { label: 'الكيلومترات', value: `${Number(selectedCar.current_mileage).toLocaleString()} كم` },
                ].map((spec, i) => (
                  <div key={i} style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{spec.label}</span>
                    <strong style={{ fontSize: '13px' }}>{spec.value}</strong>
                  </div>
                ))}
              </div>

              {/* Car Description/Notes — preserve line breaks */}
              {selectedCar.notes && (
                <div style={{ marginTop: '16px', padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: '12px', borderRight: '4px solid var(--info)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--info)', display: 'block', marginBottom: '6px' }}>📝 الوصف</span>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>{selectedCar.notes}</p>
                </div>
              )}

              {/* Status + Available After */}
              {selectedCar.status === 'rented' && selectedCar.available_after && (
                <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(245,158,11,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#92400e', fontSize: '14px', fontWeight: 600 }}>
                  <FiClock size={18} />
                  هذه السيارة محجوزة حالياً — متاحة بعد: {new Date(selectedCar.available_after).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}

              {/* Price & Book */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '16px', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', borderRadius: '12px', color: 'white' }}>
                <div>
                  <span style={{ fontSize: '13px', opacity: 0.7 }}>السعر اليومي</span>
                  <div><strong style={{ fontSize: '28px' }}>{Number(selectedCar.daily_rate).toLocaleString()}</strong><span style={{ fontSize: '14px', marginRight: '4px' }}>ج.م</span></div>
                  {selectedCar.weekly_rate > 0 && <div style={{ fontSize: '12px', opacity: 0.7 }}>أسبوعي: {Number(selectedCar.weekly_rate).toLocaleString()} ج.م</div>}
                  {selectedCar.monthly_rate > 0 && <div style={{ fontSize: '12px', opacity: 0.7 }}>شهري: {Number(selectedCar.monthly_rate).toLocaleString()} ج.م</div>}
                </div>
                {selectedCar.status === 'available' ? (
                  <Link to={`/book/${selectedCar.id}`} className="btn btn-lg" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700 }} onClick={() => setSelectedCar(null)}>
                    احجز الآن ←
                  </Link>
                ) : (
                  <span style={{ fontSize: '14px', opacity: 0.7 }}>{STATUS_LABELS[selectedCar.status]?.icon} {STATUS_LABELS[selectedCar.status]?.label}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fleet-header {
          position: relative;
          background: var(--grad-hero);
          color: white;
          padding: var(--space-3xl) 0 var(--space-2xl);
          text-align: center;
          overflow: hidden;
          isolation: isolate;
        }
        .fleet-header::before {
          content: '';
          position: absolute; inset: 0;
          background: var(--grad-hero-radial);
          pointer-events: none;
        }
        .fleet-header::after {
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
        .fleet-header > * { position: relative; z-index: 1; }
        .fleet-header h1 { font-size: clamp(2rem, 4.5vw, 3rem); font-weight: 900; margin-bottom: var(--space-sm); letter-spacing: -0.02em; }
        .fleet-header p { color: rgba(255,255,255,0.72); font-size: var(--font-size-lg); margin-bottom: var(--space-xl); }
        .fleet-search { max-width: 540px; margin: 0 auto; position: relative; }
        .search-icon { position: absolute; right: 18px; top: 50%; transform: translateY(-50%); color: var(--text-muted); z-index: 1; }
        .search-input { padding-right: 48px; border: none; border-radius: var(--radius-full); box-shadow: var(--shadow-xl); font-size: var(--font-size-sm); height: 50px; }
        .fleet-grid-section { padding: var(--space-2xl) 0; }

        .fleet-filter-bar { display: flex; gap: 8px; margin-bottom: var(--space-lg); flex-wrap: wrap; }
        .fleet-filter-btn { padding: 6px 14px; border-radius: var(--radius-full); border: 2px solid var(--border-light); background: var(--bg-card); font-size: var(--font-size-xs); font-weight: 600; cursor: pointer; transition: all 0.2s; color: var(--text-secondary); font-family: inherit; }
        .fleet-filter-btn:hover { border-color: var(--accent); }
        .fleet-filter-btn.active { border-color: var(--accent); background: var(--accent); color: white; }
        .fleet-filter-count { background: rgba(0,0,0,0.1); padding: 1px 8px; border-radius: 12px; font-size: 11px; margin-right: 4px; }
        .fleet-filter-btn.active .fleet-filter-count { background: rgba(255,255,255,0.2); }

        .fleet-results-info { margin-bottom: var(--space-lg); font-size: var(--font-size-sm); color: var(--text-secondary); font-weight: 600; }
        .car-image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0f2f5, #e4e8ec); }

        .car-card.car-rented { opacity: 0.85; }
        .car-card.car-rented .car-image::after { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.15); pointer-events: none; }
        .car-status-badge.rented { background: rgba(245,158,11,0.9) !important; }
        .car-status-badge.maintenance { background: rgba(59,130,246,0.9) !important; }

        .car-available-after { display: flex; align-items: center; gap: 6px; margin-top: 8px; padding: 6px 10px; background: rgba(245,158,11,0.1); border-radius: 8px; font-size: 12px; font-weight: 600; color: #92400e; }
        .car-description { margin-top: 8px; padding: 6px 10px; background: var(--bg-primary); border-radius: 8px; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
        .car-price-extras { display: flex; gap: 8px; margin-top: 4px; }
        .car-price-extras span { font-size: 10px; opacity: 0.8; background: rgba(255,255,255,0.15); padding: 1px 8px; border-radius: 8px; }

        /* ─── Image Carousel ──────────────────────────────────── */
        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          backdrop-filter: blur(4px);
          z-index: 2;
        }
        .carousel-arrow:hover { background: rgba(0,0,0,0.75); transform: translateY(-50%) scale(1.1); }
        .carousel-arrow-right { right: 10px; }
        .carousel-arrow-left { left: 10px; }
        .carousel-counter {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0,0,0,0.55);
          color: white;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          backdrop-filter: blur(4px);
          z-index: 2;
        }
        .carousel-dots {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 5px;
          z-index: 2;
        }
        .carousel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
        }
        .carousel-dot.active {
          background: white;
          transform: scale(1.3);
          box-shadow: 0 0 6px rgba(255,255,255,0.5);
        }
        .carousel-dot:hover:not(.active) { background: rgba(255,255,255,0.7); }
      `}</style>
    </div>
  );
}
