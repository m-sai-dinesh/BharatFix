import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { BadgeCheck, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function OfficerLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/officer-login', data);
      login(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name}!`);
      navigate('/officer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0f9ff 100%)' }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'scaleIn 0.4s cubic-bezier(.22,.68,0,1.2) both' }}>
        <div className="card" style={{ boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 60, height: 60,
              background: 'linear-gradient(135deg, #f0fdf4, #bbf7d0)',
              borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(5,150,105,0.15)',
              animation: 'bounceIn 0.5s ease both',
            }}>
              <BadgeCheck size={28} color="#059669" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Officer Login</h2>
            <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginTop: 6 }}>Access your ward dashboard</p>
          </div>

          <div className="alert alert-success" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <BadgeCheck size={15} style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: '0.82rem' }}>
              <strong>Demo credentials:</strong><br />
              Code: <code>TG-045-GHMC001</code> · Password: <code>Officer@123</code>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="label">Officer Code</label>
              <input className={`input ${errors.officerCode ? 'error' : ''}`}
                placeholder="e.g. TG-045-GHMC001"
                style={{ fontFamily: 'monospace', fontSize: '0.92rem', letterSpacing: '0.04em' }}
                {...register('officerCode', { required: 'Officer code required' })} />
              {errors.officerCode && <div className="error-text">{errors.officerCode.message}</div>}
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className={`input ${errors.password ? 'error' : ''}`}
                  type={showPass ? 'text' : 'password'} placeholder="Your password"
                  style={{ paddingRight: 44 }}
                  {...register('password', { required: 'Password required' })} />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer',
                  padding: 4, borderRadius: 4, transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <div className="error-text">{errors.password.message}</div>}
            </div>
            <button type="submit" className="btn btn-full" disabled={loading} style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white', padding: '13px',
              boxShadow: '0 3px 12px rgba(5,150,105,0.3)',
            }}>
              {loading ? 'Logging in...' : <><BadgeCheck size={16} /> Login as Officer</>}
            </button>
          </form>

          <div className="divider" />
          <div style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text2)' }}>
            Citizen? <Link to="/login" style={{ fontWeight: 700 }}>Citizen Login →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
