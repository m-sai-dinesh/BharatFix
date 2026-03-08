import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { StatusBadge, UrgencyBadge } from '../components/common/StatusBadge';
import { INDIAN_STATES_DISPLAY } from '../utils/constants';
import { Plus, Trash2, RefreshCw, BarChart2, Users, FileText, ShieldAlert, ToggleLeft, ToggleRight, Eye } from 'lucide-react';

function StatBar({ label, value, max, color }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:'0.8rem', fontWeight:700 }}>
        <span style={{ color:'var(--text2)', textTransform:'capitalize' }}>{label.replace(/_/g,' ')}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div style={{ height:7, background:'var(--bg3)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${max ? (value/max)*100 : 0}%`, background:color, borderRadius:4, transition:'width 0.8s cubic-bezier(.22,.68,0,1.2)', animation:'progress 0.8s ease both' }} />
      </div>
    </div>
  );
}

function StatsTab() {
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wards/stats');
      setStats(response.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      toast.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div className="loading-spin" />;
  const maxState = Math.max(...(stats.byState.map(s => s.total) || [1]));

  return (
    <div style={{ animation:'fadeUp 0.35s ease both' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>Real-time Dashboard</h3>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {lastUpdated && (
            <span style={{ fontSize:'0.75rem', color:'var(--text3)' }}>
              Last: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom:32 }}>
        {[
          { label:'Total Reports', value:stats.totalReports, color:'#2563eb', bg:'#eff4ff' },
          { label:'Pending', value:stats.pending, color:'#d97706', bg:'#fef9c3' },
          { label:'Resolved', value:stats.resolved, color:'#059669', bg:'#d1fae5' },
          { label:'Officers', value:stats.totalOfficers, color:'#7c3aed', bg:'#ede9fe' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:6 }}>
              <div style={{ width:16, height:16, borderRadius:'50%', background:s.color }} />
            </div>
            <div className="stat-value" style={{ color:s.color }}>{s.value.toLocaleString()}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:20 }}>Reports by State (Live)</h3>
        {stats.byState.length === 0 ? (
          <p style={{ color:'var(--text3)', fontSize:'0.9rem' }}>No state data yet — run the seed script to populate.</p>
        ) : (
          <div>
            {stats.byState.map(s => (
              <StatBar key={s.state} label={s.state} value={s.total} max={maxState} color="var(--accent)" />
            ))}
            <div style={{ marginTop:16, padding:12, background:'var(--surface2)', borderRadius:8, fontSize:'0.8rem', color:'var(--text3)' }}>
              Data updates automatically every 30 seconds
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OfficersTab() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { register, handleSubmit, reset, formState:{errors} } = useForm();

  const fetch = () => { 
    setLoading(true); 
    api.get('/wards/officers').then(r => {
      setOfficers(r.data.data||[]);
      setLastUpdated(new Date());
    }).finally(() => setLoading(false)); 
  };

  useEffect(() => { 
    fetch();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  const onCreate = async (data) => {
    try { await api.post('/wards/officers', data); toast.success('Officer created'); reset(); setShowCreate(false); fetch(); }
    catch(err) { toast.error(err.response?.data?.message||'Error'); }
  };
  const onDelete = async (id) => {
    if (!confirm('Delete this officer account?')) return;
    try { await api.delete(`/wards/officers/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };
  const onToggle = async (id, cur) => {
    try { await api.put(`/wards/officers/${id}`, { isActive:!cur }); fetch(); }
    catch { toast.error('Update failed'); }
  };
  const onResetPwd = async (id) => {
    const p = prompt('New password for officer:');
    if (!p) return;
    try { await api.put(`/wards/officers/${id}/reset-password`, { newPassword:p }); toast.success('Password reset'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div style={{ animation:'fadeUp 0.35s ease both' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20, alignItems:'center' }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>
          Ward Officers <span style={{ color:'var(--text3)', fontWeight:400 }}>({officers.length})</span>
          {lastUpdated && (
            <span style={{ fontSize:'0.75rem', color:'var(--text3)', marginLeft:8 }}>
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </h3>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetch} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(v=>!v)}>
            <Plus size={14} /> {showCreate ? 'Close' : 'Add Officer'}
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="card animate-scale-in" style={{ marginBottom:20, borderColor:'var(--accent-mid)', background:'var(--accent-soft)' }}>
          <h4 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:20, color:'var(--accent)' }}>Create New Officer Account</h4>
          <form onSubmit={handleSubmit(onCreate)}>
            <div className="grid-2">
              {[
                { name:'name', ph:'Full Name', req:true },
                { name:'phone', ph:'Phone Number', req:true },
                { name:'officerCode', ph:'TG-045-GHMC001', req:true },
                { name:'password', ph:'Password', req:true, type:'password' },
                { name:'wardName', ph:'Ward Name', req:false },
              ].map(f => (
                <div key={f.name} className="form-group">
                  <label className="label">{f.name.replace(/([A-Z])/g,' $1').trim()}</label>
                  <input className="input" placeholder={f.ph} type={f.type||'text'} {...register(f.name, { required: f.req })} />
                </div>
              ))}
              <div className="form-group">
                <label className="label">State</label>
                <select className="input" {...register('state', { required:true })}>
                  <option value="">Select state</option>
                  {INDIAN_STATES_DISPLAY.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Officer</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="loading-spin" /> : officers.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text3)' }}>No officers yet. Add one above.</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {officers.map((o, i) => (
            <div key={o._id} className="card" style={{ padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, animation:`fadeUp 0.35s ${i*0.04}s both` }}>
              <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background: o.isActive ? 'var(--accent-soft)' : 'var(--bg3)', border: `2px solid ${o.isActive ? 'var(--accent-mid)' : 'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:800, color: o.isActive ? 'var(--accent)' : 'var(--text3)', fontSize:'0.82rem' }}>
                  {o.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontFamily:'var(--font-display)', fontSize:'0.9rem' }}>{o.name}</div>
                  <div style={{ fontSize:'0.77rem', color:'var(--text2)', marginTop:2 }}>
                    <code style={{ background:'var(--bg2)', padding:'1px 6px', borderRadius:4, fontSize:'0.72rem' }}>{o.officerCode}</code>
                    {' · '}{o.wardName}{' · '}{o.state?.replace(/_/g,' ')}
                  </div>
                  <div style={{ fontSize:'0.7rem', marginTop:3, display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background: o.isActive ? '#22c55e' : '#ef4444' }} />
                    <span style={{ color: o.isActive ? '#059669' : '#dc2626', fontWeight:700 }}>{o.isActive ? 'Active' : 'Deactivated'}</span>
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:7 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => onToggle(o._id, o.isActive)} title={o.isActive ? 'Deactivate' : 'Activate'}>
                  {o.isActive ? <ToggleRight size={14} color="#059669" /> : <ToggleLeft size={14} />}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => onResetPwd(o._id)} title="Reset password">
                  <RefreshCw size={13} />
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(o._id)} title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state:'', status:'' });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetch = () => {
    setLoading(true);
    const p = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v])=>v)));
    api.get(`/reports/all?${p}`).then(r => {
      setReports(r.data.data||[]);
      setLastUpdated(new Date());
    }).finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetch();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [filters]);

  const markFake = async (state, id) => {
    if (!confirm('Mark this report as fake/spam?')) return;
    try { await api.delete(`/reports/${state}/${id}`); toast.success('Report removed'); fetch(); }
    catch { toast.error('Error'); }
  };

  return (
    <div style={{ animation:'fadeUp 0.35s ease both' }}>
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <select className="input" style={{ width:190 }} value={filters.state} onChange={e => setFilters(f=>({...f,state:e.target.value}))}>
          <option value="">All States</option>
          {INDIAN_STATES_DISPLAY.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="input" style={{ width:160 }} value={filters.status} onChange={e => setFilters(f=>({...f,status:e.target.value}))}>
          <option value="">All Statuses</option>
          {['Pending','In Progress','Resolved','Closed'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={fetch} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
        <span style={{ fontSize:'0.8rem', color:'var(--text3)', marginLeft:'auto' }}>
          {reports.length} reports
          {lastUpdated && ` · Last: ${lastUpdated.toLocaleTimeString()}`}
        </span>
      </div>

      {loading ? <div className="loading-spin" /> : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {reports.map((r, i) => (
            <div key={r._id} className="card" style={{
              padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center',
              flexWrap:'wrap', gap:12, opacity: r.isFake ? 0.45 : 1,
              animation:`fadeUp 0.35s ${i*0.03}s both`,
              borderLeft: r.isFake ? '3px solid #ef4444' : '3px solid transparent',
            }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:7, marginBottom:7, flexWrap:'wrap' }}>
                  <StatusBadge status={r.status} />
                  <UrgencyBadge urgency={r.urgency} />
                  {r.isFake && <span className="badge badge-emergency">FAKE</span>}
                </div>
                <div style={{ fontWeight:700, fontFamily:'var(--font-display)', fontSize:'0.9rem', marginBottom:3 }}>{r.title}</div>
                <div style={{ fontSize:'0.77rem', color:'var(--text2)' }}>{r.stateCode} · {r.district} · {r.category}</div>
                <span className="ticket-pill" style={{ marginTop:5, display:'inline-block' }}>#{r.ticketNumber}</span>
              </div>
              <div style={{ display:'flex', gap:7 }}>
                <a href={`/report/${r.ticketNumber}`} className="btn btn-secondary btn-sm"><Eye size={12} /> View</a>
                {!r.isFake && (
                  <button className="btn btn-danger btn-sm" onClick={() => markFake(r.state, r._id)}>
                    <Trash2 size={12} /> Fake
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState('stats');
  const tabs = [
    { id:'stats', label:'Dashboard', icon:<BarChart2 size={15}/> },
    { id:'officers', label:'Officers', icon:<Users size={15}/> },
    { id:'reports', label:'All Reports', icon:<FileText size={15}/> },
  ];

  return (
    <div className="page" style={{ background:'var(--bg)' }}>
      <div className="container">
        {/* Header */}
        <div className="animate-fade-up page-header">
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:8 }}>
            <div style={{ width:44, height:44, borderRadius:13, background:'#fff5f5', border:'1px solid #fecaca', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ShieldAlert size={22} color="#dc2626" />
            </div>
            <div>
              <h1 className="page-title">Super Admin Panel</h1>
              <p style={{ fontSize:'0.75rem', color:'var(--text3)', fontWeight:600, letterSpacing:'0.04em' }}>BHARATFIX SYSTEM CONTROL · LOCALHOST ONLY</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:28, background:'var(--surface)', padding:5, borderRadius:11, border:'1px solid var(--border)', boxShadow:'var(--shadow-xs)', width:'fit-content' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`btn btn-sm ${tab===t.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius:8, gap:6 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'stats'   && <StatsTab />}
        {tab === 'officers' && <OfficersTab />}
        {tab === 'reports'  && <ReportsTab />}
      </div>
    </div>
  );
}
