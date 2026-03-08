import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { StatusBadge, UrgencyBadge, StatusTracker } from '../components/common/StatusBadge';
import { MapPin, Clock, User, Camera, ArrowLeft, Tag, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportDetail() {
  const { ticketNumber } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgIdx, setImgIdx] = useState(null);

  useEffect(() => {
    api.get(`/reports/ticket/${ticketNumber}`)
      .then(res => setReport(res.data.data))
      .catch(() => setError('Report not found'))
      .finally(() => setLoading(false));
  }, [ticketNumber]);

  if (loading) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div>
        <div className="loading-spin" />
        <p style={{ textAlign:'center', color:'var(--text3)', fontSize:'0.9rem', marginTop: 8 }}>Loading report...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="page">
      <div className="container" style={{ textAlign:'center', paddingTop:80, animation:'fadeUp 0.4s ease both' }}>
        <div style={{ fontSize:'3rem', marginBottom:16 }}>🔍</div>
        <h3 style={{ fontFamily:'var(--font-display)', marginBottom:8 }}>Report Not Found</h3>
        <p style={{ color:'var(--text2)', marginBottom:24 }}>Ticket <strong>{ticketNumber}</strong> doesn't exist or was removed.</p>
        <Link to="/" className="btn btn-primary">← Back to Home</Link>
      </div>
    </div>
  );

  const allPhotos = [...(report.photos || []), ...(report.fixedPhotos || [])];

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Lightbox */}
      {imgIdx !== null && (
        <div onClick={() => setImgIdx(null)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:1000,
          display:'flex', alignItems:'center', justifyContent:'center', padding:20,
          cursor:'zoom-out', animation:'fadeIn 0.2s ease both',
        }}>
          <img src={allPhotos[imgIdx]} alt="" style={{ maxWidth:'90vw', maxHeight:'85vh', borderRadius:12, objectFit:'contain', boxShadow:'0 24px 80px rgba(0,0,0,0.6)' }} />
        </div>
      )}

      <div className="container" style={{ maxWidth: 820 }}>
        <Link to="/" className="animate-fade-up" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--text2)', fontSize:'0.84rem', fontWeight:700, marginBottom:24 }}>
          <ArrowLeft size={14} /> Back to Feed
        </Link>

        {/* Main card */}
        <div className="card animate-fade-up stagger-1" style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:18 }}>
            <span className="ticket-pill" style={{ fontSize:'0.82rem', padding:'4px 12px' }}>#{report.ticketNumber}</span>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <StatusBadge status={report.status} />
              <UrgencyBadge urgency={report.urgency} />
              <span className="badge badge-inprogress"><Tag size={9} /> {report.category}</span>
            </div>
          </div>

          <h1 style={{ fontSize:'1.55rem', fontWeight:800, marginBottom:14, color:'var(--text)', lineHeight:1.3 }}>{report.title}</h1>

          <div style={{ display:'flex', flexWrap:'wrap', gap:16, marginBottom:16, padding:'12px 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
            {[
              { icon:<MapPin size={13}/>, text:`${report.address}, ${report.district}` },
              { icon:<User size={13}/>, text:report.citizenName },
              { icon:<Clock size={13}/>, text:format(new Date(report.createdAt), 'dd MMM yyyy, hh:mm a') },
            ].map((m, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.83rem', color:'var(--text2)' }}>
                <span style={{ color:'var(--accent)' }}>{m.icon}</span> {m.text}
              </div>
            ))}
          </div>

          <p style={{ color:'var(--text2)', lineHeight:1.75, fontSize:'0.95rem' }}>{report.description}</p>

          {report.resolutionNote && (
            <div className="alert alert-success" style={{ marginTop:18, display:'flex', gap:10, alignItems:'flex-start' }}>
              <CheckCircle size={16} style={{ marginTop:1, flexShrink:0 }} />
              <div>
                <strong>Resolution:</strong> {report.resolutionNote}
                {report.resolvedAt && (
                  <div style={{ fontSize:'0.78rem', marginTop:3, opacity:0.8 }}>
                    Resolved in {report.resolutionTimeHours}h · {format(new Date(report.resolvedAt), 'dd MMM yyyy')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Progress tracker */}
        <div className="card animate-fade-up stagger-2" style={{ marginBottom:16 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'0.92rem', fontWeight:700, marginBottom:24 }}>Issue Progress</h3>
          <StatusTracker currentStatus={report.status} />
        </div>

        {/* Photos */}
        {report.photos?.length > 0 && (
          <div className="card animate-fade-up stagger-3" style={{ marginBottom:16 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'0.92rem', fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <Camera size={16} color="var(--accent)" /> Issue Photos
            </h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:10 }}>
              {report.photos.map((p, i) => (
                <div key={i} onClick={() => setImgIdx(i)} style={{ height:130, borderRadius:9, overflow:'hidden', cursor:'zoom-in', boxShadow:'var(--shadow-xs)', transition:'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform=''}
                >
                  <img src={p} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fixed photos */}
        {report.fixedPhotos?.length > 0 && (
          <div className="card animate-fade-up stagger-4" style={{ marginBottom:16, border:'1px solid #bbf7d0' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'0.92rem', fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <Camera size={16} color="#059669" /> Resolution Proof
            </h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:10 }}>
              {report.fixedPhotos.map((p, i) => (
                <div key={i} onClick={() => setImgIdx((report.photos?.length || 0) + i)} style={{ height:130, borderRadius:9, overflow:'hidden', cursor:'zoom-in', boxShadow:'var(--shadow-xs)', transition:'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform=''}
                >
                  <img src={p} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity log */}
        {report.statusHistory?.length > 0 && (
          <div className="card animate-fade-up stagger-5">
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'0.92rem', fontWeight:700, marginBottom:20 }}>Activity Log</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {[...report.statusHistory].reverse().map((h, i) => (
                <div key={i} style={{ display:'flex', gap:14, paddingBottom: i < report.statusHistory.length - 1 ? 16 : 0 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:'var(--accent)', marginTop:4, boxShadow:'0 0 0 3px var(--accent-soft)' }} />
                    {i < report.statusHistory.length - 1 && <div style={{ width:2, flex:1, background:'var(--border)', marginTop:6 }} />}
                  </div>
                  <div style={{ paddingBottom: i < report.statusHistory.length - 1 ? 16 : 0 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'0.86rem', fontWeight:700, color:'var(--text)' }}>{h.status}</div>
                    {h.note && <div style={{ fontSize:'0.8rem', color:'var(--text2)', marginTop:2 }}>{h.note}</div>}
                    <div style={{ fontSize:'0.72rem', color:'var(--text3)', marginTop:4 }}>
                      {h.updatedByRole} · {format(new Date(h.timestamp), 'dd MMM yyyy, hh:mm a')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
