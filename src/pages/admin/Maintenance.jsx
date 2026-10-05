import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function AdminMaintenance() {
  const [logs, setLogs] = useState([]);
  const [due, setDue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('due');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [logsRes, dueRes] = await Promise.all([
        api.get('/api/maintenance', { params: { page_size: 50 } }),
        api.get('/api/maintenance/due'),
      ]);
      setLogs(logsRes.data.items || []);
      setDue(dueRes.data.cars || []);
    } catch {
      setDue([
        { car_id: '2', car_name: 'هيونداي أكسنت 2023', plate_number: 'د هـ و 5678', current_mileage: 22000, last_oil_change: 17000, km_since_oil_change: 5000, interval: 5000, km_overdue: 0 },
        { car_id: '5', car_name: 'شيفروليه أوبترا 2023', plate_number: 'ع ف ص 7890', current_mileage: 30000, last_oil_change: 24000, km_since_oil_change: 6000, interval: 5000, km_overdue: 1000 },
      ]);
      setLogs([
        { id: 'm1', car_name: 'تويوتا كامري 2024', type: 'oil_change', mileage_at_service: 15000, cost: 350, service_date: '2026-03-15', created_at: '2026-03-15T10:00:00' },
      ]);
    } finally { setLoading(false); }
  };

  const TYPE_MAP = { oil_change: 'تغيير زيت', tire_change: 'تغيير إطارات', brake_service: 'صيانة فرامل', general_service: 'صيانة عامة', accident_repair: 'إصلاح حادث', other: 'أخرى' };

  return (
    <div>
      <div className="page-header"><h1>🔧 الصيانة</h1><p>تتبع صيانة الأسطول وتغيير الزيت</p></div>

      <div className="tabs">
        <button className={`tab ${tab === 'due' ? 'active' : ''}`} onClick={() => setTab('due')}>
          ⚠️ تحتاج صيانة
          {due.length > 0 && <span style={{ background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', marginRight: '6px', fontWeight: 700 }}>{due.length}</span>}
        </button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>📋 سجل الصيانة</button>
      </div>

      {tab === 'due' && (
        <div className="grid grid-2" style={{ gap: '16px' }}>
          {due.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1' }}><div className="card-body text-center" style={{ padding: '60px' }}><p style={{ fontSize: '48px' }}>✅</p><p style={{ fontSize: '18px', fontWeight: 700, marginTop: '12px' }}>جميع السيارات بحالة جيدة</p><p style={{ color: 'var(--text-muted)' }}>لا توجد سيارات تحتاج صيانة حالياً</p></div></div>
          ) : due.map(car => (
            <div className="card" key={car.car_id}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div><strong style={{ fontSize: '16px' }}>{car.car_name}</strong><br /><code style={{ fontSize: '11px', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>{car.plate_number}</code></div>
                  <span className="badge badge-danger">⚠️ صيانة مطلوبة</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div>الكيلومترات الحالية: <strong>{car.current_mileage.toLocaleString()}</strong></div>
                  <div>آخر تغيير زيت: <strong>{car.last_oil_change?.toLocaleString()}</strong></div>
                  <div>كم منذ التغيير: <strong style={{ color: car.km_overdue > 0 ? 'var(--danger)' : 'var(--warning)' }}>{car.km_since_oil_change.toLocaleString()}</strong></div>
                  <div>الحد: <strong>{car.interval.toLocaleString()}</strong> كم</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>السيارة</th><th>النوع</th><th>الكيلومترات</th><th>التكلفة</th><th>التاريخ</th></tr></thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan="5" className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>لا توجد سجلات</td></tr>
                ) : logs.map(l => (
                  <tr key={l.id}>
                    <td><strong>{l.car_name}</strong></td>
                    <td><span className="badge badge-info">{TYPE_MAP[l.type] || l.type}</span></td>
                    <td>{l.mileage_at_service?.toLocaleString()} كم</td>
                    <td><strong>{Number(l.cost).toLocaleString()}</strong> ج.م</td>
                    <td>{l.service_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
