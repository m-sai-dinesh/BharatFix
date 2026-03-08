import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ReportCard from '../components/common/ReportCard';
import { Plus, Bell, TrendingUp, Clock, CheckCircle, Archive } from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/reports/my')
      .then(res => setReports(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? reports.filter(r => r.status === filter) : reports;
  const stats = [
    { label: 'Total', value: reports.length, color: '#2563eb', bg: '#eff4ff', icon: <TrendingUp size={20} /> },
    { label: 'Pending', value: reports.filter(r => r.status === 'Pending').length, color: '#d97706', bg: '#fef9c3', icon: <Clock size={20} /> },
    { label: 'In Progress', value: reports.filter(r => r.status === 'In Progress').length, color: '#2563eb', bg: '#dbeafe', icon: <Bell size={20} /> },
    { label: 'Resolved', value: reports.filter(r => r.status === 'Resolved').length, color: '#059669', bg: '#d1fae5', icon: <CheckCircle size={20} /> },
  ];

  const filters = ['', 'Pending', 'In Progress', 'Resolved', 'Closed'];
  const filterLabels = { '': 'All', 'Pending': 'Pending', 'In Progress': 'In Progress', 'Resolved': 'Resolved', 'Closed': 'Closed' };

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="container">
        {/* Header */}
        <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              Welcome back
            </p>
            <h1 className="page-title">{user?.name}</h1>
            <p className="page-subtitle">Track your reported civic issues across India.</p>
          </div>
          <Link to="/submit" className="btn btn-primary animate-fade-up stagger-2" style={{ padding: '12px 22px' }}>
            <Plus size={16} /> Report New Issue
          </Link>
        </div>

        {/* Stats */}
        <div className="grid-4 animate-fade-up stagger-1" style={{ marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={s.label} className="stat-card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              style={{ position: 'relative' }}>
              {filterLabels[f]}
              {f && reports.filter(r => f === '' || r.status === f).length > 0 && (
                <span style={{
                  background: filter === f ? 'rgba(255,255,255,0.25)' : 'var(--bg3)',
                  color: filter === f ? 'white' : 'var(--text2)',
                  borderRadius: 10, padding: '1px 6px', fontSize: '0.7rem', fontWeight: 800,
                }}>
                  {reports.filter(r => r.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reports */}
        {loading ? (
          <div className="grid-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ borderRadius: 14 }}>
                <div className="skeleton" style={{ height: 150, borderRadius: '14px 14px 0 0' }} />
                <div style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 14px 14px' }}>
                  <div className="skeleton" style={{ height: 14, marginBottom: 8, width: '55%' }} />
                  <div className="skeleton" style={{ height: 18 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 0', animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16, opacity: 0.25 }}>📋</div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text2)', marginBottom: 10 }}>No reports yet</h3>
            <p style={{ color: 'var(--text3)', marginBottom: 24, fontSize: '0.9rem' }}>See something broken? Report it and track its resolution.</p>
            <Link to="/submit" className="btn btn-primary">Submit your first report</Link>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map((r, i) => <ReportCard key={r._id} report={r} delay={i * 0.05} />)}
          </div>
        )}
      </div>
    </div>
  );
}
