import { Link } from 'react-router-dom';
import { MapPin, Clock, Tag, ArrowUpRight } from 'lucide-react';
import { StatusBadge, UrgencyBadge } from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

const categoryIcons = {
  'Pothole': '🕳️', 'Streetlight': '💡', 'Garbage': '🗑️', 'Water Supply': '💧',
  'Sewage': '🚰', 'Road Damage': '🛣️', 'Encroachment': '🚧',
  'Stray Animals': '🐕', 'Noise Pollution': '📢', 'Other': '📋'
};

export default function ReportCard({ report, delay = 0 }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="card card-interactive"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer', padding: 0, overflow: 'hidden',
        animation: `fadeUp 0.45s cubic-bezier(.22,.68,0,1.2) ${delay}s both`,
        transition: 'transform 0.3s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s, border-color 0.3s',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-xs)',
        borderColor: hovered ? 'var(--accent-mid)' : 'var(--border)',
      }}
    >
      {/* Photo strip or category bar */}
      {report.photos?.[0] ? (
        <div style={{ height: 158, overflow: 'hidden', position: 'relative' }}>
          <img src={report.photos[0]} alt="" style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.5s ease',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 50%, rgba(26,32,53,0.5) 100%)',
          }} />
          <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', gap: 6 }}>
            <StatusBadge status={report.status} />
            <UrgencyBadge urgency={report.urgency} />
          </div>
        </div>
      ) : (
        <div style={{
          height: 72,
          background: 'linear-gradient(135deg, var(--accent-soft) 0%, #e0eaff 100%)',
          borderBottom: '1px solid var(--accent-mid)',
          display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px',
        }}>
          <span style={{ fontSize: '2rem', lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
            {categoryIcons[report.category] || '📋'}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <StatusBadge status={report.status} />
            <UrgencyBadge urgency={report.urgency} />
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, color: 'var(--text3)',
            background: 'var(--bg2)', padding: '2px 8px', borderRadius: 5,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Tag size={9} /> {report.category}
          </span>
        </div>

        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '0.97rem', fontWeight: 700,
          marginBottom: 7, color: 'var(--text)', lineHeight: 1.35,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {report.title}
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.76rem', color: 'var(--text3)' }}>
            <MapPin size={11} />
            {report.district}, {report.stateCode}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} />
            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
          </div>
        </div>

        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="ticket-pill">#{report.ticketNumber}</span>
          <Link to={`/report/${report.ticketNumber}`} style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)',
            opacity: hovered ? 1 : 0.7, transition: 'opacity 0.2s',
          }}>
            View <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
