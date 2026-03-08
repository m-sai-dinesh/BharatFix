import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, UrgencyBadge } from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { CheckCircle, Upload, X, MapPin, Clock, AlertTriangle, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function UpdateModal({ report, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const { register, handleSubmit } = useForm({ defaultValues: { status: report.status, urgency: report.urgency } });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('status', data.status);
      fd.append('urgency', data.urgency);
      fd.append('resolutionNote', data.resolutionNote || '');
      fd.append('note', data.note || '');
      photos.forEach(p => fd.append('fixedPhotos', p));
      await api.put(`/reports/${report.state}/${report._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Report updated successfully');
      onUpdated(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)', animation:'fadeIn 0.2s ease both' }}>
      <div className="card animate-scale-in" style={{ width:'100%', maxWidth:520, maxHeight:'88vh', overflow:'auto', boxShadow:'var(--shadow-xl)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800 }}>Update Report</h3>
            <span className="ticket-pill" style={{ marginTop:4, display:'inline-block' }}>#{report.ticketNumber}</span>
          </div>
          <button onClick={onClose} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:8, cursor:'pointer', display:'flex', alignItems:'center', color:'var(--text2)', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='#fee2e2'; e.currentTarget.style.color='var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.color='var(--text2)'; }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid-2">
            <div className="form-group">
              <label className="label">Status</label>
              <select className="input" {...register('status')}>
                {['Pending','In Progress','Resolved','Closed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Urgency</label>
              <select className="input" {...register('urgency')}>
                {['Emergency','High','Medium','Low'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Resolution Note</label>
            <textarea className="input" rows={3} placeholder="Describe what action was taken..." {...register('resolutionNote')} />
          </div>
          <div className="form-group">
            <label className="label">Activity Note</label>
            <input className="input" placeholder="Brief note for activity log..." {...register('note')} />
          </div>
          <div className="form-group">
            <label className="label">Proof Photos (optional)</label>
            <input type="file" accept="image/*" multiple className="input" style={{ padding:'8px 12px', fontSize:'0.83rem' }}
              onChange={e => setPhotos(Array.from(e.target.files))} />
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex:'0 0 auto' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={loading}>
              {loading ? 'Saving...' : <><CheckCircle size={14} /> Save Update</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const urgencyOrder = { Emergency: 0, High: 1, Medium: 2, Low: 3 };

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', urgency: '' });
  const [selected, setSelected] = useState(null);

  const fetchReports = () => {
    setLoading(true);
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
    api.get(`/reports/officer?${params}`)
      .then(res => setReports(res.data.data || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchReports(); }, [filters]);

  const sorted = [...reports].sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
  const stats = [
    { label:'Total', value:reports.length, color:'#2563eb', bg:'#eff4ff' },
    { label:'Emergency', value:reports.filter(r => r.urgency==='Emergency').length, color:'#dc2626', bg:'#fee2e2' },
    { label:'Pending', value:reports.filter(r => r.status==='Pending').length, color:'#d97706', bg:'#fef9c3' },
    { label:'Resolved', value:reports.filter(r => r.status==='Resolved').length, color:'#059669', bg:'#d1fae5' },
  ];

  return (
    <div className="page" style={{ background:'var(--bg)' }}>
      <div className="container">
        <div className="animate-fade-up page-header">
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <CheckCircle size={20} color="#059669" />
            </div>
            <div>
              <h1 className="page-title" style={{ fontSize:'1.6rem' }}>Officer Dashboard</h1>
              <p style={{ fontSize:'0.78rem', color:'var(--text3)', fontWeight:600 }}>
                {user?.officerCode} · {user?.wardName} · {user?.state?.replace(/_/g,' ')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid-4 animate-fade-up stagger-1" style={{ marginBottom:28 }}>
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
                <div style={{ width:38, height:38, borderRadius:9, background:s.bg }} />
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Filter:</span>
          {[
            { key:'status', opts:['Pending','In Progress','Resolved','Closed'] },
            { key:'urgency', opts:['Emergency','High','Medium','Low'] },
          ].map(f => (
            <select key={f.key} className="input" style={{ width:150 }} value={filters[f.key]}
              onChange={e => setFilters(p => ({ ...p, [f.key]:e.target.value }))}>
              <option value="">All {f.key}</option>
              {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>

        {/* Reports list */}
        {loading ? <div className="loading-spin" /> : sorted.length === 0 ? (
          <div style={{ textAlign:'center', padding:'72px 0', animation:'fadeUp 0.4s ease both' }}>
            <div style={{ fontSize:'3rem', marginBottom:16, opacity:0.25 }}>📋</div>
            <h3 style={{ fontFamily:'var(--font-display)', color:'var(--text2)' }}>No reports match your filters</h3>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {sorted.map((r, i) => (
              <div key={r._id} className="card" style={{
                padding:'18px 20px', display:'flex', justifyContent:'space-between', alignItems:'center',
                flexWrap:'wrap', gap:14, animation:`fadeUp 0.38s ${i*0.04}s both`,
                borderLeft: r.urgency === 'Emergency' ? '3px solid var(--red)' : r.urgency === 'High' ? '3px solid #f97316' : '3px solid transparent',
              }}>
                <div style={{ flex:1, minWidth:260 }}>
                  <div style={{ display:'flex', gap:7, marginBottom:8, flexWrap:'wrap' }}>
                    <StatusBadge status={r.status} />
                    <UrgencyBadge urgency={r.urgency} />
                    <span style={{ fontSize:'0.7rem', color:'var(--text3)', background:'var(--bg2)', padding:'2px 8px', borderRadius:5, fontWeight:600 }}>{r.category}</span>
                  </div>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:4, fontSize:'0.95rem' }}>{r.title}</div>
                  <div style={{ fontSize:'0.79rem', color:'var(--text2)', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><MapPin size={11} color="var(--accent)" />{r.address}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={11} color="var(--text3)" />{formatDistanceToNow(new Date(r.createdAt), { addSuffix:true })}</span>
                  </div>
                  <span className="ticket-pill" style={{ marginTop:6, display:'inline-block' }}>#{r.ticketNumber}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <a href={`/report/${r.ticketNumber}`} className="btn btn-secondary btn-sm"><Eye size={13} /> View</a>
                  <button className="btn btn-primary btn-sm" onClick={() => setSelected(r)}>
                    <Upload size={13} /> Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && <UpdateModal report={selected} onClose={() => setSelected(null)} onUpdated={fetchReports} />}
      </div>
    </div>
  );
}
