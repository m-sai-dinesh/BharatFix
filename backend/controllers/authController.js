const User = require('../models/User');
const { generateToken, generateOTP } = require('../utils/helpers');

// @desc  Send OTP to phone (citizen)
// @route POST /api/auth/send-otp
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number required' });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone, name: 'New User', otp, otpExpiry: expiry });
    } else {
      user.otp = otp;
      user.otpExpiry = expiry;
    }
    await user.save();

    // Simulate SMS
    console.log(`📱 [OTP SIMULATION] Phone: ${phone}, OTP: ${otp}`);

    res.json({ success: true, message: 'OTP sent (simulated)', otp_dev: otp }); // expose in dev only
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Verify OTP & login/register citizen
// @route POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    const user = await User.findOne({ phone });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    if (name && (!user.name || user.name === 'New User')) user.name = name;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: user.toSafeJSON(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Officer login
// @route POST /api/auth/officer-login
const officerLogin = async (req, res) => {
  try {
    const { officerCode, password } = req.body;
    const officer = await User.findOne({ officerCode, role: 'officer' });
    if (!officer || !(await officer.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!officer.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated' });
    }
    officer.lastLogin = new Date();
    await officer.save();

    res.json({
      success: true,
      token: generateToken(officer._id, officer.role),
      user: officer.toSafeJSON(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Super admin login
// @route POST /api/auth/admin-login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: 'super_admin' });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    admin.lastLogin = new Date();
    await admin.save();

    res.json({
      success: true,
      token: generateToken(admin._id, admin.role),
      user: admin.toSafeJSON(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get current user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
};

// @desc  Update profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();
    res.json({ success: true, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendOTP, verifyOTP, officerLogin, adminLogin, getMe, updateProfile };
