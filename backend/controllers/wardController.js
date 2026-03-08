const User = require('../models/User');
const { getStateModel } = require('../models/StateReport');
const { INDIAN_STATES } = require('../config/db');

// @desc  Create ward officer
// @route POST /api/wards/officers
const createOfficer = async (req, res) => {
  try {
    const { name, phone, email, officerCode, wardId, wardName, state, password } = req.body;

    const exists = await User.findOne({ $or: [{ phone }, { officerCode }] });
    if (exists) return res.status(400).json({ success: false, message: 'Officer with phone/code already exists' });

    const officer = await User.create({
      name, phone, email, officerCode, wardId, wardName,
      state: state.toLowerCase().replace(/ /g, '_'),
      password, role: 'officer',
    });

    res.status(201).json({ success: true, data: officer.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all officers
// @route GET /api/wards/officers
const getAllOfficers = async (req, res) => {
  try {
    const { state, page = 1, limit = 20 } = req.query;
    const filter = { role: 'officer' };
    if (state) filter.state = state.toLowerCase().replace(/ /g, '_');

    const total = await User.countDocuments(filter);
    const officers = await User.find(filter)
      .select('-password -otp')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, total, data: officers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update officer
// @route PUT /api/wards/officers/:id
const updateOfficer = async (req, res) => {
  try {
    const { name, wardId, wardName, isActive, password } = req.body;
    const officer = await User.findById(req.params.id);
    if (!officer || officer.role !== 'officer') {
      return res.status(404).json({ success: false, message: 'Officer not found' });
    }
    if (name) officer.name = name;
    if (wardId) officer.wardId = wardId;
    if (wardName) officer.wardName = wardName;
    if (typeof isActive === 'boolean') officer.isActive = isActive;
    if (password) officer.password = password;
    await officer.save();
    res.json({ success: true, data: officer.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete officer
// @route DELETE /api/wards/officers/:id
const deleteOfficer = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Officer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Reset officer password
// @route PUT /api/wards/officers/:id/reset-password
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const officer = await User.findById(req.params.id);
    if (!officer) return res.status(404).json({ success: false, message: 'User not found' });
    officer.password = newPassword;
    await officer.save();
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get dashboard stats (super admin)
// @route GET /api/wards/stats
const getDashboardStats = async (req, res) => {
  try {
    const stats = {
      totalReports: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      byState: [],
      byCategory: {},
    };

    const catCounts = {};
    for (const state of INDIAN_STATES) {
      try {
        const StateModel = getStateModel(state);
        const total = await StateModel.countDocuments({ isFake: { $ne: true } });
        const pending = await StateModel.countDocuments({ status: 'Pending' });
        const inProgress = await StateModel.countDocuments({ status: 'In Progress' });
        const resolved = await StateModel.countDocuments({ status: 'Resolved' });
        const closed = await StateModel.countDocuments({ status: 'Closed' });

        stats.totalReports += total;
        stats.pending += pending;
        stats.inProgress += inProgress;
        stats.resolved += resolved;
        stats.closed += closed;

        if (total > 0) {
          stats.byState.push({ state, total, pending, resolved });
        }
      } catch (_) {}
    }

    const totalOfficers = await User.countDocuments({ role: 'officer' });
    const totalCitizens = await User.countDocuments({ role: 'citizen' });

    res.json({ success: true, data: { ...stats, totalOfficers, totalCitizens } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOfficer, getAllOfficers, updateOfficer, deleteOfficer, resetPassword, getDashboardStats };
