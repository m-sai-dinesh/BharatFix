import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CATEGORIES } from '../utils/constants';
import { Upload, MapPin, Send, X, ImagePlus, Loader2, CheckCircle } from 'lucide-react';

const steps = [
  { n: 1, label: 'Issue Details' },
  { n: 2, label: 'Location' },
  { n: 3, label: 'Photos' },
];

export default function SubmitReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [locating, setLocating] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // Try multiple times to get best accuracy
  const getHighAccuracyLocation = async () => {
    const attempts = [];
    
    for (let i = 0; i < 3; i++) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        
        attempts.push({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        
        // If we get good accuracy, break early
        if (position.coords.accuracy <= 20) {
          break;
        }
        
        // Wait a bit between attempts
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.log(`Attempt ${i + 1} failed:`, error);
      }
    }
    
    // Return the most accurate reading
    if (attempts.length > 0) {
      return attempts.reduce((best, current) => 
        current.accuracy < best.accuracy ? current : best
      );
    }
    
    throw new Error('Failed to get location');
  };

  const getLocation = async () => {
    setLocating(true);
    setAddressData(null);
    
    try {
      const loc = await getHighAccuracyLocation();
      
      setLocationData(loc);
      setValue('locationStr', `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`);
      
      // Fetch address from backend
      const response = await api.post('/location/address', { lat: loc.lat, lng: loc.lng });
      
      if (response.data.success) {
        setAddressData(response.data.data);
        
        // Show accuracy-based message
        if (loc.accuracy <= 5) {
          toast.success('Excellent precision location captured!');
        } else if (loc.accuracy <= 10) {
          toast.success('High precision location captured!');
        } else if (loc.accuracy <= 20) {
          toast.success('Location captured with good accuracy');
        } else if (loc.accuracy <= 50) {
          toast('Location captured (moderate accuracy)', { icon: '📍' });
        } else {
          toast('Location captured (low accuracy - move to open area)', { icon: '⚠️' });
        }
      }
    } catch (error) {
      // Fallback to simulated location for demo
      const loc = { lat: 17.45209, lng: 78.42259, accuracy: 5 };
      setLocationData(loc);
      setValue('locationStr', `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`);
      
      // Try to get address for simulated location
      try {
        const response = await api.post('/location/address', { lat: loc.lat, lng: loc.lng });
        if (response.data.success) {
          setAddressData(response.data.data);
        }
      } catch (addrError) {
        // Use fallback address
        setAddressData({
          state: 'Telangana',
          district: 'Hyderabad',
          area: 'Hyderabad',
          ward: 'Ward 1',
          fullAddress: 'Hyderabad, Telangana, India'
        });
      }
      
      toast('Using demo location', { icon: '📍' });
    } finally {
      setLocating(false);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setPhotos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removePhoto = (i) => {
    setPhotos(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (data) => {
    if (!locationData || !addressData) {
      toast.error('Please capture your location first');
      return;
    }
    
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', data.title);
      fd.append('description', data.description);
      fd.append('category', data.category);
      fd.append('location', JSON.stringify(locationData));
      photos.forEach(p => fd.append('photos', p));
      
      const res = await api.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`Report submitted! Ticket: ${res.data.data.ticketNumber}`);
      navigate(`/report/${res.data.data.ticketNumber}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { 
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ background: 'linear-gradient(180deg, #f0f5ff 0%, var(--bg) 300px)' }}>
      <div className="container" style={{ maxWidth: 740 }}>
        {/* Header */}
        <div className="animate-fade-up page-header">
          <h1 className="page-title">Report a Civic Issue</h1>
          <p className="page-subtitle">Your report is routed to the correct state and ward authority automatically.</p>
        </div>

        {/* Progress steps */}
        <div className="animate-fade-up stagger-1" style={{ display: 'flex', gap: 0, marginBottom: 32, background: 'var(--surface)', borderRadius: 12, padding: 6, border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}>
          {steps.map((s, i) => (
            <div key={s.n} onClick={() => setActiveStep(i)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
              background: activeStep === i ? 'var(--accent)' : 'transparent',
              color: activeStep === i ? 'white' : activeStep > i ? 'var(--accent)' : 'var(--text3)',
              transition: 'all 0.2s',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: activeStep === i ? 'rgba(255,255,255,0.25)' : activeStep > i ? 'var(--accent-soft)' : 'var(--bg3)',
                fontSize: '0.72rem', fontWeight: 800,
              }}>
                {activeStep > i ? '✓' : s.n}
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 700 }}>{s.label}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1 */}
          <div className="card animate-fade-up stagger-2" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily:'var(--font-display)', fontWeight: 800, color: 'var(--accent)', fontSize: '0.85rem' }}>1</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Issue Details</h3>
            </div>

            <div className="form-group">
              <label className="label">Title *</label>
              <input className={`input ${errors.title ? 'error' : ''}`} placeholder="e.g. Deep pothole on Main Road near market junction"
                {...register('title', { required: 'Title is required', maxLength: { value: 100, message: 'Max 100 chars' } })} />
              {errors.title && <div className="error-text">{errors.title.message}</div>}
            </div>

            <div className="form-group">
              <label className="label">Category *</label>
              <select className={`input ${errors.category ? 'error' : ''}`} {...register('category', { required: 'Category required' })}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <div className="error-text">{errors.category.message}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">Description *</label>
              <textarea className={`input ${errors.description ? 'error' : ''}`}
                placeholder="Describe the issue in detail. Include when you first noticed it, how it affects people, and any relevant context..."
                rows={4}
                {...register('description', { required: 'Description required', minLength: { value: 20, message: 'At least 20 characters' } })} />
              {errors.description && <div className="error-text">{errors.description.message}</div>}
            </div>
          </div>

          {/* Step 2 */}
          <div className="card animate-fade-up stagger-3" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily:'var(--font-display)', fontWeight: 800, color: '#059669', fontSize: '0.85rem' }}>2</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Location (Auto-detected)</h3>
            </div>

            <div style={{ marginBottom: 20 }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={getLocation} 
                disabled={locating}
                style={{ 
                  width: '100%', 
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: '0.95rem',
                  background: addressData ? '#f0fdf4' : undefined,
                  color: addressData ? '#059669' : undefined,
                  borderColor: addressData ? '#bbf7d0' : undefined
                }}
              >
                {locating ? (
                  <><Loader2 size={16} className="animate-spin" /> Getting your location...</>
                ) : addressData ? (
                  <><CheckCircle size={16} /> Location Captured ✓</>
                ) : (
                  <><MapPin size={16} /> Capture My Location</>
                )}
              </button>
            </div>

            {addressData && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 16,
                marginBottom: 20
              }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 8, fontWeight: 600 }}>Detected Address:</div>
                <div style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.5 }}>
                  <div style={{ marginBottom: 4 }}><strong>State:</strong> {addressData.state}</div>
                  <div style={{ marginBottom: 4 }}><strong>District:</strong> {addressData.district}</div>
                  {addressData.area && <div style={{ marginBottom: 4 }}><strong>Area:</strong> {addressData.area}</div>}
                  {addressData.ward && <div style={{ marginBottom: 4 }}><strong>Ward:</strong> {addressData.ward}</div>}
                  <div><strong>Full Address:</strong> {addressData.fullAddress}</div>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">GPS Coordinates</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  className="input" 
                  readOnly 
                  placeholder={addressData ? "Location captured successfully" : "Click 'Capture My Location' to auto-fill"} 
                  style={{ 
                    flex: 1, 
                    background: addressData ? '#f0fdf4' : undefined, 
                    borderColor: addressData ? '#bbf7d0' : undefined 
                  }}
                  {...register('locationStr')} 
                />
              </div>
              {locationData && (
                <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
                  <span style={{ 
                    color: locationData.accuracy <= 10 ? '#059669' : 
                           locationData.accuracy <= 20 ? '#d97706' : '#dc2626',
                    fontWeight: 600
                  }}>
                    Accuracy: ±{locationData.accuracy.toFixed(0)}m
                    {locationData.accuracy <= 5 && ' (Excellent)'}
                    {locationData.accuracy > 5 && locationData.accuracy <= 10 && ' (High)'}
                    {locationData.accuracy > 10 && locationData.accuracy <= 20 && ' (Good)'}
                    {locationData.accuracy > 20 && locationData.accuracy <= 50 && ' (Moderate)'}
                    {locationData.accuracy > 50 && ' (Low - move to open area)'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Step 3 */}
          <div className="card animate-fade-up stagger-4" style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily:'var(--font-display)', fontWeight: 800, color: '#d97706', fontSize: '0.85rem' }}>3</div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Photos</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 2 }}>Clear photos help officers identify and resolve issues faster</p>
              </div>
            </div>

            <label style={{
              display: 'block', border: '2px dashed var(--border2)', borderRadius: 10, padding: '28px 24px', textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.2s', background: 'var(--surface2)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--accent-soft)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.background='var(--surface2)'; }}
            >
              <ImagePlus size={28} color="var(--accent)" style={{ margin: '0 auto 10px', display: 'block', opacity: 0.7 }} />
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text2)', marginBottom: 4 }}>Click to upload photos</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>Up to 5 photos · JPG, PNG, WebP · Max 5MB each</p>
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoChange} />
            </label>

            {previews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10, marginTop: 16 }}>
                {previews.map((p, i) => (
                  <div key={i} style={{ position: 'relative', height: 100, borderRadius: 9, overflow: 'hidden', boxShadow: 'var(--shadow-xs)', animation: `bounceIn 0.3s ${i * 0.06}s both` }}>
                    <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removePhoto(i)} style={{
                      position: 'absolute', top: 5, right: 5, width: 22, height: 22,
                      background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white',
                    }}>
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full animate-fade-up stagger-5" disabled={loading} style={{ padding: '15px', fontSize: '0.98rem' }}>
            {loading ? (
              <><div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Submitting your report...</>
            ) : (
              <><Send size={17} /> Submit Report</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
