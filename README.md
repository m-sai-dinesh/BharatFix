# BharatFix - Civic Issue Reporting Platform

BharatFix is a full-stack web application that allows Indian citizens to report civic issues (potholes, broken streetlights, garbage dumps, etc.) with GPS-verified location data. Reports are automatically routed to the responsible ward officer based on the detected location. Officers can update status, upload resolution photos, and close tickets. A super admin oversees the entire system across all Indian states.

---

## Table of Contents


1. [System Overview](#system-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [User Roles and Flows](#user-roles-and-flows)
7. [Setup and Installation](#setup-and-installation)
8. [Environment Variables](#environment-variables)
9. [Default Credentials](#default-credentials)
10. [Key Subsystems Explained](#key-subsystems-explained)
11. [Troubleshooting](#troubleshooting)

---

## System Overview

The platform has three distinct user roles: citizens, ward officers, and a super admin.

| Actor | What they do |
|-------|--------------|
| Citizen | Logs in via phone OTP, captures GPS location, submits a report with photos and description, tracks status via ticket number |
| Ward Officer | Logs in with officer code, views reports assigned to their ward, updates status, uploads resolution evidence |
| Super Admin | Manages officers across all states, monitors all reports, views system-wide analytics, can delete any report |

The system performs reverse geocoding using the OpenStreetMap Nominatim API to determine the state, district, and ward from GPS coordinates. Each report is stored in a state-specific MongoDB collection and routed to the appropriate ward officer automatically.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Backend Runtime | Node.js | Server-side JavaScript runtime |
| Backend Framework | Express.js | HTTP routing and middleware |
| Database | MongoDB | State-partitioned document storage |
| Authentication | JWT | Stateless role-based access control |
| Image Storage | Cloudinary | Cloud image hosting and CDN delivery |
| Geocoding | OpenStreetMap Nominatim API | Reverse geocoding from GPS coordinates |
| Frontend Framework | React + Vite | UI with fast dev server and HMR |
| Styling | Custom CSS | Design system with responsive layout |
| State Management | React Context API + Hooks | Auth state and token management |
| HTTP Client | Axios | API calls with Vite proxy to backend |

---

## Architecture

```
bharatfix/
  backend/
    server.js              # Express app entry point
    config/
      db.js                # MongoDB connection
      cloudinary.js        # Cloudinary SDK config
    models/
      User.js              # Citizens, officers, admin schema
    routes/
      auth.js              # OTP login, officer login, admin login
      reports.js           # CRUD for civic reports
      location.js          # GPS address resolution
      geocoder.js          # Reverse geocoding + state validation
      wards.js             # Officer and dashboard management
    middleware/
      auth.js              # JWT verification middleware
    seed.js                # Creates initial officers and admin
  frontend/
    src/
      App.jsx              # Route definitions
      context/
        AuthContext.jsx    # Auth state and token management
      pages/
        CitizenLogin.jsx
        CitizenDashboard.jsx
        ReportForm.jsx
        OfficerLogin.jsx
        OfficerDashboard.jsx
        AdminLogin.jsx
        AdminDashboard.jsx
      components/          # Reusable UI components
    vite.config.js         # Proxy: /api -> localhost:5000
```

The frontend proxies all `/api` requests to the backend running on port 5000. This avoids CORS issues during development. In production, configure a reverse proxy (Nginx) to handle this.

---

## Database Schema

### Users Collection (`users`)

Stores all three user types in one collection. The `role` field controls access.

```javascript
{
  name: String,
  phone: String,           // For citizens
  email: String,           // For officers and admin
  password: String,        // Hashed, for officers and admin
  role: String,            // 'citizen' | 'officer' | 'super_admin'
  officerCode: String,     // Unique code for officers (e.g., TG-045-GHMC001)
  wardId: String,
  wardName: String,
  state: String,
  isActive: Boolean,
  lastLogin: Date
}
```

### Report Collections (State-Partitioned)

Each Indian state gets its own MongoDB collection, named using the pattern `<state>_bharatfix_reports`. For example, Telangana reports go into `telangana_bharatfix_reports`, Karnataka into `karnataka_bharatfix_reports`, and so on. This keeps collections manageable and allows per-state querying without global filters.

```javascript
{
  ticketNumber: String,          // Auto-generated unique ID shown to citizen
  citizenId: ObjectId,
  citizenPhone: String,
  citizenName: String,
  title: String,
  description: String,
  category: String,              // E.g., 'Pothole', 'Garbage', 'Streetlight'
  state: String,
  stateCode: String,
  district: String,
  ward: String,
  address: String,               // Human-readable full address
  location: {
    lat: Number,
    lng: Number,
    accuracy: Number             // GPS accuracy in meters
  },
  photos: [String],              // Cloudinary URLs, max 5
  fixedPhotos: [String],         // Evidence after resolution
  status: String,                // 'Pending' | 'In Progress' | 'Resolved' | 'Closed'
  urgency: String,               // 'Low' | 'Medium' | 'High' | 'Emergency'
  statusHistory: [
    {
      status: String,
      updatedBy: ObjectId,
      updatedByRole: String,
      note: String,
      timestamp: Date
    }
  ],
  geocodedData: {
    fullAddress: String,
    state: String,
    district: String,
    area: String,
    ward: String,
    pincode: String
  },
  isFake: Boolean,               // Flagged by admin if location is suspicious
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Reference

All endpoints are prefixed with `/api`.

### Authentication (`/api/auth`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/send-otp` | No | Send OTP to citizen phone number. In development, the OTP is returned in the response body for testing. |
| POST | `/auth/verify-otp` | No | Verify OTP. Returns a JWT token on success. |
| POST | `/auth/officer-login` | No | Officer login using officer code + password. Returns JWT. |
| POST | `/auth/admin-login` | No | Super admin login using email + password. Returns JWT. |
| GET | `/auth/me` | Yes (any role) | Returns the currently authenticated user's profile. |
| PUT | `/auth/profile` | Yes (any role) | Update name, email, or other profile fields. |

### Reports (`/api/reports`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/reports/public` | No | Returns recent resolved reports. Used for the public landing page. |
| GET | `/reports/ticket/:ticketNumber` | No | Lookup a report by ticket number. Citizens use this to track status without logging in. |
| POST | `/reports` | Yes (citizen) | Submit a new report. GPS coordinates must be included; the backend validates they fall within India before accepting. |
| GET | `/reports/my` | Yes (citizen) | Returns all reports submitted by the logged-in citizen. |
| GET | `/reports/officer` | Yes (officer) | Returns reports assigned to the logged-in officer's ward. |
| GET | `/reports/all` | Yes (admin) | Returns all reports across all state collections. |
| PUT | `/reports/:state/:id` | Yes (officer/admin) | Update report status, add notes, upload fixed photos. |
| DELETE | `/reports/:state/:id` | Yes (admin) | Permanently delete a report. |

### Location Services

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/location/address` | No | Takes `{ lat, lng }` and returns a structured address using OpenStreetMap. |
| POST | `/location/validate` | No | Validates that coordinates fall within Indian boundaries. |
| POST | `/geocoder/reverse` | No | Full reverse geocoding, returns state, district, ward, pincode. |
| POST | `/geocoder/validate` | No | Validates that the resolved state is a recognized Indian state. |

### Admin and Ward Management (`/api/wards`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/wards/stats` | Yes (admin) | Returns report counts by status and state, officer activity stats. |
| GET | `/wards/officers` | Yes (admin) | Lists all officers with their ward assignments and active status. |
| POST | `/wards/officers` | Yes (admin) | Create a new ward officer account. |
| PUT | `/wards/officers/:id` | Yes (admin) | Update officer details or toggle active/inactive. |
| PUT | `/wards/officers/:id/reset-password` | Yes (admin) | Reset an officer's password. |
| DELETE | `/wards/officers/:id` | Yes (admin) | Remove an officer account. |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Returns API documentation and available endpoints. |
| GET | `/api/health` | Health check. Returns server status and uptime. |
| GET | `/api/superadmin-bf2026/verify` | Secret URL for super admin access verification. The path segment is configurable via `SUPER_ADMIN_SECRET_URL`. |

---

## User Roles and Flows

### Citizen

1. Open the app and enter a 10-digit Indian phone number.
2. Click "Send OTP". In development, the OTP is printed in the API response. In production, integrate an SMS gateway (e.g., Twilio, MSG91) in the `/auth/send-otp` route.
3. Enter the OTP to receive a JWT token. The token is stored in React context and sent as a Bearer token on all subsequent requests.
4. On the report form, click "Capture My Location". The browser's Geolocation API is called with `enableHighAccuracy: true`. The app makes multiple attempts and picks the reading with the best accuracy.
5. The coordinates are sent to `/api/geocoder/reverse`. The returned state, district, and ward fields auto-populate the form.
6. Fill in title, description, category, and urgency. Upload up to 5 photos.
7. Submit. The backend validates the GPS location is within India, uploads photos to Cloudinary, and creates the document in the appropriate state collection with a unique ticket number.
8. The citizen can track status anytime using the ticket number without logging in.

### Ward Officer

1. Log in using the officer code (format: `STATE-WARD-BODY###`) and password.
2. The dashboard loads reports filtered to the officer's assigned ward from their state collection.
3. The officer changes status from "Pending" to "In Progress" when work begins.
4. After fixing the issue, the officer uploads resolution photos and adds a note, then sets status to "Resolved".
5. The status history array in the document records every change with timestamp, updatedBy, and note.

### Super Admin

1. Log in via the admin login page using email and password.
2. The dashboard shows aggregated stats: total reports, breakdown by status, breakdown by state, and active officer count.
3. Admin can create new officers by specifying name, officer code, ward, state, and password.
4. Admin can deactivate officers (sets `isActive: false`), which blocks their login.
5. Admin can view and delete any report across all states.
6. The admin secret URL (`/api/superadmin-bf2026/verify`) is a security mechanism to verify admin access. Change `SUPER_ADMIN_SECRET_URL` in production.

---

## Setup and Installation

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 16 or higher | [nodejs.org](https://nodejs.org) |
| MongoDB | 4.4 or higher | Must be running on `localhost:27017` |
| Cloudinary Account | Any | Free tier sufficient for development. Get credentials from [cloudinary.com](https://cloudinary.com) |

### Step 1: Clone and install dependencies

```bash
git clone https://github.com/m-sai-dinesh/BharatFix.git
cd bharatfix

cd backend
npm install

cd ../frontend
npm install
```

### Step 2: Configure environment variables

Navigate to the `backend/` directory and create a `.env` file by copying the example:

| OS | Command |
|----|---------|
| Windows (Command Prompt) | `copy .env.example .env` |
| Mac (Terminal) | `cp .env.example .env` |

Then open `.env` in any text editor and fill in your values (see the Environment Variables section below).

### Step 3: Seed the database

The seed script creates the default ward officers and the super admin account. Run it once before starting the server.

```bash
cd backend
npm run seed
```

### Step 4: Start the backend

```bash
cd backend
nodemon server.js
# Server starts on http://localhost:5000
```

### Step 5: Start the frontend

```bash
cd frontend
npm run dev
# App starts on http://localhost:5173
```

Vite's dev server is configured to proxy `/api/*` requests to `http://localhost:5000`. This is defined in `vite.config.js` and requires no additional CORS configuration during development.

---

## Environment Variables

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `PORT` | `5000` | Port the Express server listens on |
| `MONGO_URI` | `mongodb://localhost:27017/bharatfix` | MongoDB connection string |
| `JWT_SECRET` | `replace_with_long_random_string` | Secret used to sign JWTs. Change before production. |
| `JWT_EXPIRE` | `7d` | Token expiry duration |
| `SUPER_ADMIN_SECRET_URL` | `superadmin-bf2026` | Path segment for the admin verify endpoint. Change before production. |
| `SUPER_ADMIN_EMAIL` | `superadmin@bharatfix.gov.in` | Admin login email |
| `SUPER_ADMIN_PASSWORD` | `BharatFix@Admin2026` | Admin login password. Change before production. |
| `NODE_ENV` | `development` | Set to `production` for deployment |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | `your_api_key` | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | From your Cloudinary dashboard |

Full `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bharatfix
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRE=7d

# The secret path segment for the super admin verify endpoint
SUPER_ADMIN_SECRET_URL=superadmin-bf2026

# Super admin credentials (used by seed.js and admin-login route)
SUPER_ADMIN_EMAIL=superadmin@bharatfix.gov.in
SUPER_ADMIN_PASSWORD=BharatFix@Admin2026

NODE_ENV=development

# Cloudinary - get these from your Cloudinary dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Change `JWT_SECRET`, `SUPER_ADMIN_PASSWORD`, and `SUPER_ADMIN_SECRET_URL` before any production deployment.

---

## Default Credentials

These are created by `npm run seed`. Use them to test the system end-to-end.

| Role | Login | Password |
|------|-------|----------|
| Citizen | Any 10-digit phone (e.g., 9500000001) | OTP returned in API response (dev mode) |
| Ward Officer (Telangana) | TG-045-GHMC001 | Officer@123 |
| Ward Officer (Karnataka) | KA-012-BBMP001 | Officer@123 |
| Super Admin | superadmin@bharatfix.gov.in | BharatFix@Admin2026 |

---

## Key Subsystems Explained

### GPS and Location Validation

When a citizen clicks "Capture My Location", the frontend calls `navigator.geolocation.getCurrentPosition()` with high accuracy enabled. To get a reliable reading, the app makes multiple attempts and compares accuracy values, keeping the best result (target: under 20 meters).

The coordinates are then sent to `/api/location/validate`. The backend checks whether the lat/lng falls within India's bounding box. If the location is outside India, the report submission is rejected. This prevents misrouted reports and fake location submissions.

After validation, `/api/geocoder/reverse` calls the OpenStreetMap Nominatim API with the coordinates and parses the response to extract state, district, area, ward, and pincode. These values are auto-filled in the report form and stored in `geocodedData` on the report document.

### State-Partitioned Collections

Instead of storing all reports in one collection, the backend dynamically accesses a collection named `<state>_bharatfix_reports` based on the state extracted from geocoding. For example:

```javascript
const collection = db.collection(`${state.toLowerCase()}_bharatfix_reports`);
```

This makes state-level queries fast and keeps collection sizes bounded as the system scales. The admin's "view all reports" endpoint queries all known state collections and merges the results.

### Image Upload Flow

Photos are uploaded from the frontend as multipart form data. The backend receives the files using `multer` (in-memory storage), then streams each file buffer to Cloudinary using the Cloudinary Node.js SDK. Cloudinary returns a secure URL for each uploaded image. These URLs are stored in the `photos` array on the report document. Resolution evidence photos uploaded by officers are stored in `fixedPhotos`.

### JWT Authentication and Middleware

After a successful login (OTP verify, officer login, or admin login), the server signs a JWT containing the user's ID, role, and state. The token is returned to the frontend and stored in React context.

Every protected route passes through the `auth` middleware (`middleware/auth.js`), which:

1. Reads the `Authorization: Bearer <token>` header.
2. Verifies the token signature using `JWT_SECRET`.
3. Attaches the decoded payload to `req.user`.
4. Calls `next()` if valid, or returns a 401 if invalid or expired.

Role-based access is enforced by additional middleware functions (e.g., `requireOfficer`, `requireAdmin`) applied per route.

### Real-Time Dashboard

The admin and officer dashboards poll the backend every 30 seconds using `setInterval` in a `useEffect` hook. This is a simple polling approach rather than WebSockets. Stats are fetched from `/api/wards/stats`, which aggregates counts across state collections using MongoDB's aggregation pipeline.

---

## Troubleshooting

**GPS location not capturing**
The browser requires HTTPS to access the Geolocation API on most mobile browsers. During development on localhost, it works over HTTP. For any deployed environment, ensure SSL is configured. If testing on a device without GPS, use the demo location fallback in the UI.

**"Cannot GET /" in the browser**
The backend server is not running. Start it with `npm start` in the `backend/` directory and ensure port 5000 is not in use.

| OS | Command to check port 5000 |
|----|----------------------------|
| Windows | `netstat -ano \| findstr :5000` |
| Mac | `lsof -i :5000` |

**EADDRINUSE error on startup**
Port 5000 is already occupied. Kill the existing process:

| OS | Command |
|----|---------|
| Windows | `netstat -ano \| findstr :5000` then `taskkill /PID <pid> /F` |
| Mac | `kill -9 $(lsof -t -i:5000)` |

**MongoDB connection refused**
MongoDB is not running. Start it:

| OS | Command |
|----|---------|
| Windows | Open Services (`services.msc`) and start `MongoDB` service, or run `net start MongoDB` in Command Prompt as Administrator |
| Mac | `brew services start mongodb-community` |

**Cloudinary upload failing**
Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `.env` match exactly what is shown in your Cloudinary dashboard. Restart the backend after any `.env` change.

**OTP not arriving**
In development mode, the OTP is returned directly in the `/auth/send-otp` response body. Check the API response in your browser's network tab or Postman. Real SMS delivery requires integrating an SMS provider in the `send-otp` route handler.

**Verifying database state**
```bash
mongosh bharatfix
show collections
db.users.find({ role: 'officer' }).pretty()
db.telangana_bharatfix_reports.countDocuments()
```
