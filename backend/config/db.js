const mongoose = require('mongoose');

// ── Hardcoded for local dev. Move to .env when deploying. ──
const MONGO_URI = 'mongodb://127.0.0.1:27017/bharatfix';

const INDIAN_STATES = [
  'andhra_pradesh', 'arunachal_pradesh', 'assam', 'bihar', 'chhattisgarh',
  'goa', 'gujarat', 'haryana', 'himachal_pradesh', 'jharkhand',
  'karnataka', 'kerala', 'madhya_pradesh', 'maharashtra', 'manipur',
  'meghalaya', 'mizoram', 'nagaland', 'odisha', 'punjab',
  'rajasthan', 'sikkim', 'tamil_nadu', 'telangana', 'tripura',
  'uttar_pradesh', 'uttarakhand', 'west_bengal'
];

const STATE_CODE_MAP = {
  'andhra_pradesh': 'AP', 'arunachal_pradesh': 'AR', 'assam': 'AS',
  'bihar': 'BR', 'chhattisgarh': 'CG', 'goa': 'GA', 'gujarat': 'GJ',
  'haryana': 'HR', 'himachal_pradesh': 'HP', 'jharkhand': 'JH',
  'karnataka': 'KA', 'kerala': 'KL', 'madhya_pradesh': 'MP',
  'maharashtra': 'MH', 'manipur': 'MN', 'meghalaya': 'ML',
  'mizoram': 'MZ', 'nagaland': 'NL', 'odisha': 'OD', 'punjab': 'PB',
  'rajasthan': 'RJ', 'sikkim': 'SK', 'tamil_nadu': 'TN',
  'telangana': 'TG', 'tripura': 'TR', 'uttar_pradesh': 'UP',
  'uttarakhand': 'UK', 'west_bengal': 'WB'
};

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB connected → ${MONGO_URI}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    console.error('   Make sure MongoDB is running: mongod --dbpath /data/db');
    process.exit(1);
  }
};

module.exports = { connectDB, INDIAN_STATES, STATE_CODE_MAP, MONGO_URI };
