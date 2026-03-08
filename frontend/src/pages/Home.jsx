import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, AlertTriangle, CheckCircle, Clock, Search, SlidersHorizontal, X, TrendingUp, Users, Shield } from 'lucide-react';
import api from '../utils/api';
import { INDIAN_STATES_DISPLAY, CATEGORIES } from '../utils/constants';
import ReportCard from '../components/common/ReportCard';
import { useAuth } from '../context/AuthContext';

const FloatingOrb = ({ style }) => (
  <div style={{
    position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
    background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
    animation: 'float 6s ease-in-out infinite',
    ...style,
  }} />
);

export default function Home() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: '', category: '', status: '', urgency: '' });
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [ticket, setTicket] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [counters, setCounters] = useState({ total: 0, pending: 0, resolved: 0 });
  const counterRef = useRef(null);
  const hasAnimated = useRef(false);

  const animateCounter = (target, key) => {
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCounters(prev => ({ ...prev, [key]: start }));
      if (start >= target) clearInterval(timer);
    }, 28);
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
      const res = await api.get(`/reports/public?${params}`);
      const data = res.data.data || [];
      setReports(data);
      const t = res.data.total || 0;
      const p = data.filter(r => r.status === 'Pending').length;
      const rv = data.filter(r => r.status === 'Resolved').length;
      setStats({ total: t, pending: p, resolved: rv });
      if (!hasAnimated.current) {
        hasAnimated.current = true;
        animateCounter(t, 'total');
        animateCounter(p, 'pending');
        animateCounter(rv, 'resolved');
      } else {
        setCounters({ total: t, pending: p, resolved: rv });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, [filters]);

  const handleTicketSearch = (e) => {
    e.preventDefault();
    if (ticket.trim()) window.location.href = `/report/${ticket.trim().toUpperCase()}`;
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="page" style={{ paddingTop: 0 }}>
      {/* ── HERO ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(165deg, #f0f5ff 0%, #e8f0fe 40%, #f4f7ff 70%, #fdfeff 100%)',
        borderBottom: '1px solid var(--border)',
        paddingTop: 112, paddingBottom: 64,
      }}>
        <FloatingOrb style={{ width: 480, height: 480, top: -120, right: -100, animationDelay: '0s' }} />
        <FloatingOrb style={{ width: 300, height: 300, bottom: -80, left: '30%', animationDelay: '2s' }} />
        <FloatingOrb style={{ width: 200, height: 200, top: 80, left: '10%', animationDelay: '4s' }} />

        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          opacity: 0.35,
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <div className="animate-fade-up" style={{ marginBottom: 18 }}>
            <span className="section-tag">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse-dot 2s infinite', display: 'inline-block' }} />
              Live · 28 States · Civic Reporting Platform
            </span>
          </div>

          <h1 className="animate-fade-up stagger-1" style={{
            fontSize: 'clamp(2.6rem, 6vw, 4.2rem)', fontWeight: 800,
            lineHeight: 1.08, marginBottom: 20, color: 'var(--text)',
          }}>
            Fix India,<br />
            <span style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #6366f1 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>One Issue at a Time.</span>
          </h1>

          <p className="animate-fade-up stagger-2" style={{
            color: 'var(--text2)', fontSize: '1.1rem', maxWidth: 540,
            marginBottom: 36, lineHeight: 1.7,
          }}>
            Report potholes, broken streetlights, garbage dumps — every civic issue gets routed to the right ward officer across all 28 Indian states.
          </p>

          <div className="animate-fade-up stagger-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
            {user?.role === 'citizen' ? (
              <Link to="/submit" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: '0.95rem' }}>
                <AlertTriangle size={16} /> Report an Issue
              </Link>
            ) : !user ? (
              <Link to="/login" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: '0.95rem' }}>
                <AlertTriangle size={16} /> Get Started — It's Free
              </Link>
            ) : null}

            <form onSubmit={handleTicketSearch} style={{ display: 'flex', gap: 0, borderRadius: 9, overflow: 'hidden', boxShadow: 'var(--shadow)', border: '1.5px solid var(--border)' }}>
              <input
                style={{
                  border: 'none', outline: 'none', padding: '0 16px',
                  background: 'white', color: 'var(--text)', fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem', width: 220,
                }}
                placeholder="Track ticket: TG-2026-00123"
                value={ticket}
                onChange={e => setTicket(e.target.value)}
              />
              <button type="submit" style={{
                background: 'var(--accent)', color: 'white', border: 'none',
                padding: '0 18px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', gap: 6,
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                <Search size={14} /> Track
              </button>
            </form>
          </div>

          {/* Stats row */}
          <div className="animate-fade-up stagger-4" style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Reports', value: counters.total, color: '#2563eb', icon: <TrendingUp size={18} />, bg: '#eff4ff' },
              { label: 'Pending', value: counters.pending, color: '#d97706', icon: <Clock size={18} />, bg: '#fefce8' },
              { label: 'Resolved', value: counters.resolved, color: '#059669', icon: <CheckCircle size={18} />, bg: '#f0fdf4' },
            ].map((s, i) => (
              <div key={s.label} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 32px', borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.7rem', color: s.color, lineHeight: 1 }}>
                    {s.value.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '14px 0', position: 'sticky', top: 62, zIndex: 50,
        boxShadow: '0 2px 12px rgba(37,99,235,0.05)',
      }}>
        <div className="container" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className={`btn btn-sm ${filtersOpen ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltersOpen(v => !v)}
          >
            <SlidersHorizontal size={14} /> Filters {hasFilters && <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 10, padding: '0 5px', fontSize: '0.7rem' }}>{Object.values(filters).filter(Boolean).length}</span>}
          </button>

          {filtersOpen && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', animation: 'fadeIn 0.2s ease' }}>
              {[
                { key: 'state', opts: INDIAN_STATES_DISPLAY.map(s => ({ v: s.value, l: s.label })), ph: 'All States' },
                { key: 'category', opts: CATEGORIES.map(c => ({ v: c, l: c })), ph: 'All Categories' },
                { key: 'status', opts: ['Pending','In Progress','Resolved','Closed'].map(s => ({ v: s, l: s })), ph: 'All Statuses' },
                { key: 'urgency', opts: ['Emergency','High','Medium','Low'].map(u => ({ v: u, l: u })), ph: 'All Urgencies' },
              ].map(f => (
                <select key={f.key}
                  style={{
                    background: 'var(--surface2)', border: '1.5px solid var(--border)',
                    borderRadius: 8, padding: '7px 12px', fontSize: '0.83rem',
                    color: filters[f.key] ? 'var(--accent)' : 'var(--text2)',
                    cursor: 'pointer', outline: 'none', fontFamily: 'var(--font-body)',
                    borderColor: filters[f.key] ? 'var(--accent-mid)' : 'var(--border)',
                  }}
                  value={filters[f.key]}
                  onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                >
                  <option value="">{f.ph}</option>
                  {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              ))}
              {hasFilters && (
                <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ state:'', category:'', status:'', urgency:'' })}>
                  <X size={13} /> Clear all
                </button>
              )}
            </div>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text3)', fontWeight: 600 }}>
            {reports.length} reports
          </div>
        </div>
      </div>

      {/* ── REPORTS GRID ── */}
      <div className="container" style={{ paddingTop: 36, paddingBottom: 40 }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 14, overflow: 'hidden', animation: `fadeIn 0.4s ${i * 0.06}s both` }}>
                <div className="skeleton" style={{ height: 150 }} />
                <div style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 14px 14px' }}>
                  <div className="skeleton" style={{ height: 14, marginBottom: 10, width: '60%' }} />
                  <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16, filter: 'grayscale(1)', opacity: 0.3 }}>🗺️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text2)', marginBottom: 8 }}>No reports found</h3>
            <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Try adjusting filters or check a different state.</p>
          </div>
        ) : (
          <div className="grid-3">
            {reports.map((r, i) => <ReportCard key={r._id} report={r} delay={i * 0.04} />)}
          </div>
        )}
      </div>

      <style>{`
        @keyframes float { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-10px) } }
      `}</style>
    </div>
  );
}
