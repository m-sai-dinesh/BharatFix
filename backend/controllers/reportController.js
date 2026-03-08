const { getStateModel } = require('../models/StateReport');
const { generateTicketNumber, sendSMSNotification } = require('../utils/helpers');
const { uploadToCloudinary } = require('../config/cloudinary');
const { getAddressFromCoords, validateIndianState } = require('../config/geocoder');

const createReport = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    const geocodedAddress = req.geocodedAddress;
    const locationData = req.locationData;
    
    const normalizedState = geocodedAddress.state.toLowerCase().replace(/ /g, '_');
    const StateModel = getStateModel(normalizedState);

    const ticketNumber = await generateTicketNumber(normalizedState, StateModel);
    
    let photos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        photos.push(result.secure_url);
      }
    }

    const report = await StateModel.create({
      ticketNumber,
      citizenId: req.user._id,
      citizenPhone: req.user.phone,
      citizenName: req.user.name,
      title, description, category,
      state: normalizedState,
      stateCode: ticketNumber.split('-')[0],
      district: geocodedAddress.district,
      ward: geocodedAddress.ward,
      address: geocodedAddress.fullAddress,
      location: locationData,
      photos,
      geocodedData: geocodedAddress,
      statusHistory: [{
        status: 'Pending',
        updatedBy: req.user._id,
        updatedByRole: 'citizen',
        note: 'Report submitted with GPS location',
      }]
    });

    res.status(201).json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get citizen's own reports
// @route GET /api/reports/my
const getMyReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const { INDIAN_STATES } = require('../config/db');
    let allReports = [];

    for (const state of INDIAN_STATES) {
      try {
        const StateModel = getStateModel(state);
        const filter = { citizenId: req.user._id };
        if (status) filter.status = status;
        if (category) filter.category = category;
        const reports = await StateModel.find(filter).sort({ createdAt: -1 });
        allReports = allReports.concat(reports);
      } catch (_) {}
    }

    allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const start = (page - 1) * limit;
    const paginated = allReports.slice(start, start + Number(limit));

    res.json({ success: true, total: allReports.length, data: paginated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get report by ticket number
// @route GET /api/reports/ticket/:ticketNumber
const getByTicket = async (req, res) => {
  try {
    const { INDIAN_STATES } = require('../config/db');
    for (const state of INDIAN_STATES) {
      try {
        const StateModel = getStateModel(state);
        const report = await StateModel.findOne({ ticketNumber: req.params.ticketNumber })
          .populate('assignedOfficerId', 'name officerCode wardName');
        if (report) return res.json({ success: true, data: report });
      } catch (_) {}
    }
    res.status(404).json({ success: false, message: 'Report not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get reports for officer's ward/state
// @route GET /api/reports/officer
const getOfficerReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, urgency, category } = req.query;
    const state = req.user.state;
    const StateModel = getStateModel(state);
    const filter = {};
    if (req.user.wardId) filter.ward = req.user.wardId;
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    if (category) filter.category = category;

    const total = await StateModel.countDocuments(filter);
    const reports = await StateModel.find(filter)
      .sort({ urgency: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), data: reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update report (officer)
// @route PUT /api/reports/:state/:id
const updateReport = async (req, res) => {
  try {
    const { state, id } = req.params;
    const { status, urgency, resolutionNote } = req.body;
    const StateModel = getStateModel(state);
    const report = await StateModel.findById(id);

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    // Officers can only update assigned ward
    if (req.user.role === 'officer') {
      if (report.ward && req.user.wardId && report.ward !== req.user.wardId) {
        return res.status(403).json({ success: false, message: 'Not authorized for this ward' });
      }
    }

    const prevStatus = report.status;
    if (status) report.status = status;
    if (urgency) report.urgency = urgency;
    if (resolutionNote) report.resolutionNote = resolutionNote;

    // Handle fixed photos
    if (req.files && req.files.length > 0) {
      let fixedPhotos = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        fixedPhotos.push(result.secure_url);
      }
      report.fixedPhotos = fixedPhotos;
    }

    if (status === 'Resolved' && prevStatus !== 'Resolved') {
      report.resolvedAt = new Date();
      const hoursElapsed = (report.resolvedAt - report.createdAt) / 3600000;
      report.resolutionTimeHours = Math.round(hoursElapsed * 10) / 10;

      // Simulate SMS to citizen
      sendSMSNotification(
        report.citizenPhone,
        `BharatFix: Your issue #${report.ticketNumber} has been resolved. Resolution: ${resolutionNote || 'Issue fixed'}. Thank you!`
      );
    }

    if (status === 'Closed') report.closedAt = new Date();

    report.statusHistory.push({
      status: status || report.status,
      updatedBy: req.user._id,
      updatedByRole: req.user.role,
      note: req.body.note || '',
    });

    if (!report.assignedOfficerId && req.user.role === 'officer') {
      report.assignedOfficerId = req.user._id;
      report.assignedOfficerCode = req.user.officerCode;
    }

    await report.save();
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all reports (super admin) with state filter
// @route GET /api/reports/all
const getAllReports = async (req, res) => {
  try {
    const { state, status, category, urgency, page = 1, limit = 50 } = req.query;
    const { INDIAN_STATES } = require('../config/db');
    const statesToSearch = state ? [state.toLowerCase().replace(/ /g, '_')] : INDIAN_STATES;
    let allReports = [];

    for (const s of statesToSearch) {
      try {
        const StateModel = getStateModel(s);
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (urgency) filter.urgency = urgency;
        const reports = await StateModel.find(filter).sort({ createdAt: -1 }).limit(200);
        allReports = allReports.concat(reports);
      } catch (_) {}
    }

    allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = allReports.length;
    const start = (page - 1) * limit;
    const paginated = allReports.slice(start, start + Number(limit));

    res.json({ success: true, total, page: Number(page), data: paginated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete/mark fake report (super admin)
// @route DELETE /api/reports/:state/:id
const deleteReport = async (req, res) => {
  try {
    const { state, id } = req.params;
    const StateModel = getStateModel(state);
    const report = await StateModel.findById(id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    report.isFake = true;
    report.deletedBy = req.user._id;
    await report.save();
    res.json({ success: true, message: 'Report marked as fake/deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get public reports (home feed)
// @route GET /api/reports/public
const getPublicReports = async (req, res) => {
  try {
    const { state, category, status, urgency, page = 1, limit = 20 } = req.query;
    const { INDIAN_STATES } = require('../config/db');
    const statesToSearch = state ? [state.toLowerCase().replace(/ /g, '_')] : INDIAN_STATES.slice(0, 5);
    let allReports = [];

    for (const s of statesToSearch) {
      try {
        const StateModel = getStateModel(s);
        const filter = { isFake: { $ne: true } };
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (urgency) filter.urgency = urgency;
        const reports = await StateModel.find(filter)
          .select('ticketNumber title category state district status urgency photos createdAt citizenName')
          .sort({ createdAt: -1 })
          .limit(50);
        allReports = allReports.concat(reports);
      } catch (_) {}
    }

    allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = allReports.length;
    const paginated = allReports.slice((page - 1) * limit, page * limit);

    res.json({ success: true, total, data: paginated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createReport, getMyReports, getByTicket, getOfficerReports,
  updateReport, getAllReports, deleteReport, getPublicReports
};
