import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = user?.role === 'citizen'
    ? [{ to: '/', label: 'Home' }, { to: '/submit', label: 'Report Issue' }, { to: '/dashboard', label: 'My Reports' }]
    : user?.role === 'officer' ? [{ to: '/officer', label: 'Dashboard' }]
    : user?.role === 'super_admin' ? [{ to: '/admin', label: 'Admin Panel' }]
    : [{ to: '/', label: 'Home' }];

  const roleColors = { citizen: '#2563eb', officer: '#059669', super_admin: '#dc2626' };
  const roleLabels = { citizen: 'Citizen', officer: 'Ward Officer', super_admin: 'Super Admin' };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 62,
      background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
      boxShadow: scrolled ? '0 2px 20px rgba(37,99,235,0.08)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(37,99,235,0.3)', transition: 'transform 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(-8deg) scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            <MapPin size={17} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.18rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Bharat<span style={{ color: 'var(--accent)' }}>Fix</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navLinks.map(l => {
            const active = location.pathname === l.to;
            return (
              <Link key={l.to} to={l.to} style={{
                padding: '6px 14px', borderRadius: 8,
                color: active ? 'var(--accent)' : 'var(--text2)',
                background: active ? 'var(--accent-soft)' : 'transparent',
                fontFamily: 'var(--font-display)', fontSize: '0.86rem', fontWeight: 700,
                transition: 'all 0.18s', textDecoration: 'none',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-soft)'; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.background = 'transparent'; }}}
              >{l.label}</Link>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 12px', borderRadius: 9,
                background: 'var(--surface2)', border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 27, height: 27, borderRadius: '50%',
                  background: `${roleColors[user.role]}18`,
                  border: `2px solid ${roleColors[user.role]}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.68rem',
                  color: roleColors[user.role],
                }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.2 }}>
                    {user.name?.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '0.67rem', color: roleColors[user.role], fontWeight: 700 }}>
                    {roleLabels[user.role]}
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} title="Logout" style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '7px 9px', cursor: 'pointer', color: 'var(--text3)',
                display: 'flex', alignItems: 'center', transition: 'all 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.background='#fff5f5'; e.currentTarget.style.borderColor='#fecaca'; }}
                onMouseLeave={e => { e.currentTarget.style.color='var(--text3)'; e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.borderColor='var(--border)'; }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/officer-login" className="btn btn-secondary btn-sm">Officer Login</Link>
              <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
