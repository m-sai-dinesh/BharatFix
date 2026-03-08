const jwt = require('jsonwebtoken');
const { STATE_CODE_MAP } = require('../config/db');

// Hardcoded for local dev — move to env before deploying
const JWT_SECRET = 'bharatfix_jwt_secret_local_dev_2026';
const JWT_EXPIRE = '7d';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const generateTicketNumber = async (state, StateModel) => {
  const stateCode = STATE_CODE_MAP[state] || 'XX';
  const year = new Date().getFullYear();
  const count = await StateModel.countDocuments();
  const seq = String(count + 1).padStart(5, '0');
  return `${stateCode}-${year}-${seq}`;
};

const generateOTP = () => String(Math.floor(1000 + Math.random() * 9000));

const sendSMSNotification = (phone, message) => {
  console.log(`\n📱 [SMS SIMULATION]`);
  console.log(`   To: +91 ${phone}`);
  console.log(`   Message: ${message}\n`);
  return { success: true, simulated: true };
};

module.exports = { generateToken, verifyToken, generateTicketNumber, generateOTP, sendSMSNotification };
