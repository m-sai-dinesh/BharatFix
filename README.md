# 🇮🇳 BharatFix - Civic Issue Reporting Platform

A comprehensive platform for citizens to report civic issues with GPS-based location detection, real-time tracking, and automated routing to appropriate authorities.

## 🚀 Features

### Core Features
- **GPS-Based Location Detection** - Automatic address fetching from coordinates
- **Online Image Storage** - Cloudinary integration for photo uploads
- **Real-Time Dashboard** - Live data updates every 30 seconds
- **Multi-Role System** - Citizens, Officers, and Super Admins
- **State-Wise Data Management** - Separate collections for each Indian state
- **Mobile Responsive** - Works seamlessly on all devices

### Advanced Features
- **High-Precision GPS** - Multiple attempts for best accuracy (5-20m)
- **Reverse Geocoding** - Automatic state, district, ward detection
- **Indian Location Validation** - Only accepts locations within India
- **Cloudinary Storage** - Secure online image hosting
- **Real-Time Notifications** - Live updates across all dashboards
- **Comprehensive Analytics** - State-wise report statistics

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- **Server**: Express.js with comprehensive error handling
- **Database**: MongoDB with state-wise collections
- **Authentication**: JWT-based with role-based access
- **File Storage**: Cloudinary integration
- **Geocoding**: OpenStreetMap API integration

### Frontend (React + Vite)
- **Framework**: React with Vite for fast development
- **Styling**: Custom CSS with design system
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios with proxy configuration
- **UI Components**: Custom component library

## 📡 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to citizen phone
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/officer-login` - Ward officer login
- `POST /api/auth/admin-login` - Super admin login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Reports
- `GET /api/reports/public` - Get public reports
- `GET /api/reports/ticket/:ticketNumber` - Get report by ticket
- `POST /api/reports` - Create new report (GPS required)
- `GET /api/reports/my` - Get citizen's reports
- `GET /api/reports/officer` - Get officer's assigned reports
- `GET /api/reports/all` - Get all reports (admin only)
- `PUT /api/reports/:state/:id` - Update report status
- `DELETE /api/reports/:state/:id` - Delete report (admin only)

### Location Services
- `POST /api/location/address` - Get address from GPS coordinates
- `POST /api/location/validate` - Validate GPS coordinates
- `POST /api/geocoder/reverse` - Reverse geocoding
- `POST /api/geocoder/validate` - Validate Indian state

### Admin Management
- `GET /api/wards/stats` - Get dashboard statistics
- `GET /api/wards/officers` - Get all officers
- `POST /api/wards/officers` - Create new officer
- `PUT /api/wards/officers/:id` - Update officer
- `PUT /api/wards/officers/:id/reset-password` - Reset officer password
- `DELETE /api/wards/officers/:id` - Delete officer

### System
- `GET /` - API documentation and endpoints
- `GET /api/health` - Health check endpoint
- `GET /api/superadmin-bf2026/verify` - Super admin access verification

## 🔐 Login Credentials

| Role | Login | Password/OTP | Access |
|------|-------|------|--------|
| **Citizen** | Any phone (e.g. 9500000001) | OTP shown in response (simulated) | Public access |
| **Ward Officer** | `TG-045-GHMC001` | `Officer@123` | Officer dashboard |
| **Ward Officer** | `KA-012-BBMP001` | `Officer@123` | Officer dashboard |
| **Super Admin** | `superadmin@bharatfix.gov.in` | `BharatFix@Admin2026` | Full system access |

## 🎯 User Flows

### Citizen Report Flow
1. **Login** with phone number + OTP
2. **Capture GPS Location** - High-precision location detection
3. **Auto-Fetch Address** - State, district, ward automatically populated
4. **Enter Details** - Title, description, category
5. **Upload Photos** - Up to 5 photos via Cloudinary
6. **Submit Report** - Gets unique ticket number
7. **Track Status** - Real-time status updates

### Officer Workflow
1. **Login** with officer code + password
2. **View Assigned Reports** - Filtered by ward/area
3. **Update Status** - Change from Pending → In Progress → Resolved
4. **Upload Evidence** - Add fixed photos
5. **Add Resolution Notes** - Document actions taken
6. **Communicate** - Status updates visible to citizens

### Admin Management
1. **Login** with admin credentials
2. **Dashboard Analytics** - Real-time statistics
3. **Manage Officers** - Create, activate, deactivate officers
4. **Monitor Reports** - View all reports across states
5. **System Health** - Monitor API performance

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- Cloudinary account (for image storage)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your credentials
npm run seed  # Create initial data
npm start     # Start server on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev   # Start on port 5173
```

### Environment Variables
```env
# Backend .env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bharatfix
JWT_SECRET=bharatfix_super_secret_key_change_in_production
JWT_EXPIRE=7d
SUPER_ADMIN_SECRET_URL=superadmin-bf2026
SUPER_ADMIN_EMAIL=superadmin@bharatfix.gov.in
SUPER_ADMIN_PASSWORD=BharatFix@Admin2026
NODE_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 📊 Database Structure

### Users Collection
```javascript
{
  name: String,
  phone: String,
  email: String,
  password: String,
  role: String, // 'citizen', 'officer', 'super_admin'
  officerCode: String, // For officers
  wardId: String,
  wardName: String,
  state: String,
  isActive: Boolean,
  lastLogin: Date
}
```

### State Reports Collections (e.g., telangana_bharatfix_reports)
```javascript
{
  ticketNumber: String,
  citizenId: ObjectId,
  citizenPhone: String,
  citizenName: String,
  title: String,
  description: String,
  category: String,
  state: String,
  stateCode: String,
  district: String,
  ward: String,
  address: String,
  location: { lat: Number, lng: Number, accuracy: Number },
  photos: [String], // Cloudinary URLs
  fixedPhotos: [String],
  status: String, // 'Pending', 'In Progress', 'Resolved', 'Closed'
  urgency: String, // 'Low', 'Medium', 'High', 'Emergency'
  statusHistory: [{
    status: String,
    updatedBy: ObjectId,
    updatedByRole: String,
    note: String,
    timestamp: Date
  }],
  geocodedData: {
    fullAddress: String,
    state: String,
    district: String,
    area: String,
    ward: String,
    pincode: String
  },
  isFake: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Features in Detail

### GPS Location System
- **High Precision**: Multiple attempts for best accuracy
- **Indian Validation**: Only accepts locations within India
- **Auto Address Fetch**: State, district, ward automatically detected
- **Accuracy Indicators**: Visual feedback on GPS quality
- **Fallback System**: Demo location for testing

### Image Storage
- **Cloudinary Integration**: Secure online storage
- **Multiple Photos**: Up to 5 photos per report
- **Fixed Photos**: After-resolution evidence
- **Compression**: Automatic optimization
- **CDN Delivery**: Fast image loading

### Real-Time Dashboard
- **Live Updates**: Auto-refresh every 30 seconds
- **State-wise Stats**: Comprehensive analytics
- **Officer Management**: Real-time status tracking
- **Report Monitoring**: Live status updates
- **Performance Metrics**: System health indicators

## 🔧 Troubleshooting

### Common Issues
1. **GPS Location Required**: Ensure you click "Capture My Location" first
2. **Cannot GET /**: Backend server not running - check port 5000
3. **EADDRINUSE**: Port already in use - kill existing process
4. **MongoDB Connection**: Ensure MongoDB is running on localhost:27017
5. **Cloudinary Errors**: Check API credentials in .env

### Debug Commands
```bash
# Check MongoDB collections
mongosh bharatfix --eval "show collections"

# Check backend logs
npm start

# Check frontend proxy
curl http://localhost:5000/api/health
```

## 🌟 Key Highlights

- **Production Ready**: Comprehensive error handling and validation
- **Scalable**: State-wise data distribution
- **Secure**: JWT authentication with role-based access
- **Modern**: React + Node.js with latest features
- **Responsive**: Mobile-first design approach
- **Real-Time**: Live updates across all interfaces
- **GPS-Powered**: Automatic location detection
- **Cloud Storage**: Reliable image hosting
- **Analytics**: Comprehensive reporting dashboard

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Verify all environment variables
3. Ensure MongoDB and Node.js are running
4. Check browser console for frontend errors
5. Review backend logs for API issues

---

**BharatFix** - Empowering citizens to report civic issues efficiently! 🇮🇳