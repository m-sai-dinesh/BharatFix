const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();

connectDB();

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/wards',   require('./routes/wardRoutes'));
app.use('/api/geocoder', require('./routes/geocoderRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'BharatFix API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      reports: '/api/reports',
      wards: '/api/wards',
      geocoder: '/api/geocoder',
      location: '/api/location'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'BharatFix API is running', time: new Date().toISOString() });
});

app.get('/api/superadmin-bf2026/verify', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress;
  const isLocal = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip);
  if (!isLocal) return res.status(403).json({ success: false, message: 'Access restricted to localhost' });
  res.json({ success: true, message: 'Super admin portal accessible' });
});

app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/send-otp',
      'POST /api/auth/verify-otp',
      'POST /api/auth/officer-login',
      'POST /api/auth/admin-login',
      'GET /api/auth/me',
      'PUT /api/auth/profile',
      'GET /api/reports/public',
      'GET /api/reports/ticket/:ticketNumber',
      'POST /api/reports',
      'GET /api/reports/my',
      'GET /api/reports/officer',
      'GET /api/reports/all',
      'PUT /api/reports/:state/:id',
      'DELETE /api/reports/:state/:id',
      'GET /api/wards/stats',
      'GET /api/wards/officers',
      'POST /api/wards/officers',
      'PUT /api/wards/officers/:id',
      'PUT /api/wards/officers/:id/reset-password',
      'DELETE /api/wards/officers/:id',
      'POST /api/geocoder/reverse',
      'POST /api/geocoder/validate',
      'POST /api/location/address',
      'POST /api/location/validate'
    ]
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 BharatFix API Server Started`);
  console.log(`📡 API Base URL: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Frontend: http://localhost:5173`);
  console.log(`📚 API Docs: http://localhost:${PORT}/`);
  console.log(`\n🔐 Login Credentials:`);
  console.log(`   Super Admin: superadmin@bharatfix.gov.in / BharatFix@Admin2026`);
  console.log(`   Officer: TG-045-GHMC001 / Officer@123`);
  console.log(`   Citizen: Any phone + OTP (simulated)`);
  console.log(`\n⚡ All endpoints are ready!`);
});
