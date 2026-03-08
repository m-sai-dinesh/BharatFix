import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/admin-login', data);
      login(res.data.token, res.data.user);
      toast.success('Super Admin access granted');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Access denied');
    } finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 50%, #fff7f7 100%)' }}>
      <div style={{ width: '100%', maxWidth: 400, animation: 'scaleIn 0.4s cubic-bezier(.22,.68,0,1.2) both' }}>
        <div className="card" style={{ boxShadow: 'var(--shadow-xl)', border: '1px solid #fecaca' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 60, height: 60, background: 'linear-gradient(135deg, #fff5f5, #fecaca)',
              borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(220,38,38,0.15)',
              animation: 'bounceIn 0.5s ease both',
            }}>
              <ShieldAlert size={28} color="#dc2626" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Super Admin</h2>
            <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginTop: 6 }}>Restricted — localhost access only</p>
          </div>

          <div className="alert alert-error">
            <strong>⚠️ Secure Zone:</strong> This portal is restricted to authorized administrators only.
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="label">Admin Email</label>
              <input className="input" type="email" placeholder="superadmin@bharatfix.gov.in"
                {...register('email', { required: true })} />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••••"
                {...register('password', { required: true })} />
            </div>
            <button type="submit" className="btn btn-full" disabled={loading} style={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: 'white', padding: '13px',
              boxShadow: '0 3px 12px rgba(220,38,38,0.25)',
            }}>
              {loading ? 'Authenticating...' : <><ShieldAlert size={15} /> Access Admin Panel</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
