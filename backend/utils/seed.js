const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const { getStateModel } = require('../models/StateReport');

const seed = async () => {
  await connectDB();

  // Super Admin
  await User.deleteMany({ role: 'super_admin' });
  await User.create({
    name: 'Super Admin',
    phone: '9000000000',
    email: 'superadmin@bharatfix.gov.in',
    role: 'super_admin',
    password: 'BharatFix@Admin2026',
  });
  console.log('✅ Super admin created');

  // Ward Officers
  await User.deleteMany({ role: 'officer' });
  const officers = [
    { name: 'Ravi Kumar', phone: '9111111111', officerCode: 'TG-045-GHMC001', wardId: 'W-001', wardName: 'Banjara Hills Ward', state: 'telangana', password: 'Officer@123' },
    { name: 'Priya Reddy', phone: '9222222222', officerCode: 'TG-046-GHMC002', wardId: 'W-002', wardName: 'Jubilee Hills Ward', state: 'telangana', password: 'Officer@123' },
    { name: 'Suresh Naik', phone: '9333333333', officerCode: 'KA-012-BBMP001', wardId: 'W-003', wardName: 'Whitefield Ward', state: 'karnataka', password: 'Officer@123' },
  ];
  for (const o of officers) await User.create({ ...o, role: 'officer' });
  console.log('✅ 3 ward officers created');

  // Sample Telangana reports
  const TGModel = getStateModel('telangana');
  await TGModel.deleteMany({});
  const tgReports = [
    { ticketNumber:'TG-2026-00001', citizenPhone:'9500000001', citizenName:'Arjun Rao', title:'Deep pothole on Madhapur Main Road', description:'There is a 3-foot deep pothole near Madhapur junction causing accidents to two-wheelers daily. The pothole has been here for 2 weeks.', category:'Pothole', district:'Hyderabad', ward:'W-001', address:'Madhapur Main Road, Hyderabad', status:'Pending', urgency:'High', location:{ lat:17.4483, lng:78.3915 } },
    { ticketNumber:'TG-2026-00002', citizenPhone:'9500000002', citizenName:'Kavitha Sharma', title:'Streetlight not working — Film Nagar', description:'The streetlight at Film Nagar bus stop has not been working for 3 days. The area is completely dark at night making it unsafe for pedestrians.', category:'Streetlight', district:'Hyderabad', ward:'W-001', address:'Film Nagar, near bus stop, Hyderabad', status:'In Progress', urgency:'Medium', location:{ lat:17.4126, lng:78.4071 } },
    { ticketNumber:'TG-2026-00003', citizenPhone:'9500000003', citizenName:'Mohan Das', title:'Garbage not collected near ZPHS School', description:'Uncollected garbage has been piling up near ZPHS School Hanamkonda for over a week. The smell is unbearable and children are affected.', category:'Garbage', district:'Warangal', ward:'W-003', address:'ZPHS School Road, Hanamkonda, Warangal', status:'Resolved', urgency:'Emergency', resolutionNote:'Garbage cleared by sanitation team. Regular schedule restored.', resolvedAt:new Date(), resolutionTimeHours:18, location:{ lat:17.9784, lng:79.5941 } },
    { ticketNumber:'TG-2026-00004', citizenPhone:'9500000004', citizenName:'Lakshmi Devi', title:'Water supply disruption — Secunderabad', description:'No water supply for the past 2 days in our colony. Around 50 households are affected. Pipeline appears to be broken.', category:'Water Supply', district:'Hyderabad', ward:'W-002', address:'RK Nagar, Secunderabad', status:'Pending', urgency:'Emergency', location:{ lat:17.4399, lng:78.4983 } },
  ];
  for (const r of tgReports) {
    await TGModel.create({ ...r, citizenId: new mongoose.Types.ObjectId(), state:'telangana', stateCode:'TG', photos:[], statusHistory:[{ status:r.status, updatedByRole:'citizen', note:'Submitted by citizen', timestamp:new Date() }] });
  }
  console.log('✅ 4 sample Telangana reports created');

  // Sample Karnataka report
  const KAModel = getStateModel('karnataka');
  await KAModel.deleteMany({});
  await KAModel.create({
    ticketNumber:'KA-2026-00001', citizenId:new mongoose.Types.ObjectId(),
    citizenPhone:'9600000001', citizenName:'Akash Hegde',
    title:'Road damage after heavy rain — Whitefield',
    description:'Heavy rains have caused major road damage on Whitefield main road. Multiple potholes and road caving have appeared. Vehicles are struggling to pass.',
    category:'Road Damage', state:'karnataka', stateCode:'KA',
    district:'Bengaluru', ward:'W-003', address:'Whitefield Main Road, Bengaluru',
    status:'Pending', urgency:'High', photos:[], location:{ lat:12.9698, lng:77.7500 },
    statusHistory:[{ status:'Pending', updatedByRole:'citizen', note:'Submitted', timestamp:new Date() }]
  });
  console.log('✅ 1 Karnataka report created');

  console.log('\n' + '─'.repeat(50));
  console.log('🎉 Seed complete!\n');
  console.log('Credentials:');
  console.log('  Citizen login:   any phone + OTP shown in response');
  console.log('  Officer login:   TG-045-GHMC001  /  Officer@123');
  console.log('  Admin login:     superadmin@bharatfix.gov.in  /  BharatFix@Admin2026');
  console.log('  Admin URL:       http://localhost:5173/admin-login');
  console.log('─'.repeat(50) + '\n');
  process.exit(0);
};

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
