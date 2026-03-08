const mongoose = require('mongoose');
const { INDIAN_STATES } = require('../config/db');

// Reuse the same schema for all state collections
const reportSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  citizenPhone: { type: String, required: true },
  citizenName: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Pothole', 'Streetlight', 'Garbage', 'Water Supply', 'Sewage', 'Road Damage', 'Encroachment', 'Stray Animals', 'Noise Pollution', 'Other'],
    required: true
  },
  state: { type: String, required: true },
  stateCode: { type: String, required: true },
  district: { type: String, required: true },
  ward: { type: String },
  address: { type: String, required: true },
  location: { lat: Number, lng: Number, accuracy: Number },
  photos: [String],
  fixedPhotos: [String],
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending'
  },
  urgency: {
    type: String,
    enum: ['Emergency', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  assignedOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedOfficerCode: String,
  statusHistory: [{
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedByRole: String,
    note: String,
    timestamp: { type: Date, default: Date.now }
  }],
  resolutionNote: String,
  resolvedAt: Date,
  closedAt: Date,
  resolutionTimeHours: Number,
  isFake: { type: Boolean, default: false },
}, { timestamps: true });

// Cache models to avoid re-registering
const stateModels = {};

const getStateModel = (state) => {
  const normalizedState = state.toLowerCase().replace(/ /g, '_');
  if (!INDIAN_STATES.includes(normalizedState)) {
    throw new Error(`Invalid state: ${state}`);
  }
  const collectionName = `${normalizedState}_bharatfix_reports`;
  if (!stateModels[normalizedState]) {
    stateModels[normalizedState] = mongoose.model(
      `Report_${normalizedState}`,
      reportSchema,
      collectionName
    );
  }
  return stateModels[normalizedState];
};

module.exports = { getStateModel, INDIAN_STATES };
