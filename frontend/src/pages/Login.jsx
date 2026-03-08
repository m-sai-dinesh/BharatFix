import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Phone, Shield, ArrowRight, CheckCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: reg2, handleSubmit: handle2, formState: { errors: errors2 } } = useForm();

  const sendOTP = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { phone: data.phone });
      setPhone(data.phone);
      if (res.data.otp_dev) setDevOtp(res.data.otp_dev);
      setStep('otp');
      toast.success('OTP sent successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOTP = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp: data.otp, name: data.name });
      login(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f5ff 0%, #e8f0fe 100%)' }}>
      <div style={{ width: '100%', maxWidth: 440, animation: 'scaleIn 0.4s cubic-bezier(.22,.68,0,1.2) both' }}>
        {/* Steps indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
          {[{ n: 1, l: 'Phone' }, { n: 2, l: 'Verify' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: (step === 'phone' ? i === 0 : true) ? 'var(--accent)' : 'var(--bg3)',
                color: (step === 'phone' ? i === 0 : true) ? 'white' : 'var(--text3)',
                fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-display)',
                transition: 'all 0.3s',
              }}>
                {step === 'otp' && i === 0 ? <CheckCircle size={14} /> : s.n}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)' }}>{s.l}</span>
              {i === 0 && <div style={{ width: 28, height: 2, background: step === 'otp' ? 'var(--accent)' : 'var(--border)', transition: 'background 0.4s', borderRadius: 2 }} />}
            </div>
          ))}
        </div>

        <div className="card" style={{ boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 60, height: 60,
              background: 'linear-gradient(135deg, var(--accent-soft), #dbeafe)',
              borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(37,99,235,0.15)',
              animation: 'bounceIn 0.5s ease both',
            }}>
              {step === 'phone' ? <Phone size={26} color="var(--accent)" /> : <Shield size={26} color="var(--accent)" />}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {step === 'phone' ? 'Citizen Login' : 'Verify OTP'}
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginTop: 6 }}>
              {step === 'phone' ? 'Enter your phone number to receive a one-time password' : `OTP sent to +91 ${phone}`}
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSubmit(sendOTP)}>
              <div className="form-group">
                <label className="label">Mobile Number</label>
                <div style={{ display: 'flex', gap: 0, borderRadius: 9, overflow: 'hidden', border: `1.5px solid ${errors.phone ? 'var(--red)' : 'var(--border)'}`, transition: 'border-color 0.2s', boxShadow: 'var(--shadow-xs)' }}>
                  <div style={{ background: 'var(--bg2)', padding: '0 14px', display: 'flex', alignItems: 'center', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text2)', borderRight: '1px solid var(--border)' }}>+91</div>
                  <input
                    style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 14px', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.94rem' }}
                    placeholder="9XXXXXXXXX"
                    {...register('phone', { required: 'Phone required', pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit number' } })}
                  />
                </div>
                {errors.phone && <div className="error-text">{errors.phone.message}</div>}
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding: '13px', marginTop: 4 }}>
                {loading ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Sending...</> : <><ArrowRight size={16} /> Send OTP</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handle2(verifyOTP)} style={{ animation: 'fadeUp 0.3s ease both' }}>
              {devOtp && (
                <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={14} />
                  <span>Dev OTP: <strong style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{devOtp}</strong></span>
                </div>
              )}
              <div className="form-group">
                <label className="label">Full Name</label>
                <input className={`input ${errors2.name ? 'error' : ''}`} placeholder="Your full name"
                  {...reg2('name', { required: 'Name is required' })} />
                {errors2.name && <div className="error-text">{errors2.name.message}</div>}
              </div>
              <div className="form-group">
                <label className="label">OTP Code</label>
                <input className={`input ${errors2.otp ? 'error' : ''}`}
                  placeholder="Enter 4-digit OTP" maxLength={4}
                  style={{ fontSize: '1.4rem', letterSpacing: '0.3em', textAlign: 'center', fontFamily: 'monospace' }}
                  {...reg2('otp', { required: 'OTP required', minLength: { value: 4, message: 'Enter 4-digit OTP' } })} />
                {errors2.otp && <div className="error-text">{errors2.otp.message}</div>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep('phone')} style={{ flex: '0 0 auto' }}>← Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '13px' }} disabled={loading}>
                  {loading ? 'Verifying...' : <><Shield size={15} /> Verify & Login</>}
                </button>
              </div>
            </form>
          )}

          <div className="divider" />
          <div style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text2)' }}>
            Ward Officer? <Link to="/officer-login" style={{ fontWeight: 700 }}>Officer Login →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
