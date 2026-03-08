const mongoose = require('mongoose');

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

  location: {
    lat: { type: Number },
    lng: { type: Number },
    accuracy: { type: Number }
  },

  photos: [{ type: String }], // file paths
  fixedPhotos: [{ type: String }], // uploaded by officer

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
  assignedOfficerCode: { type: String },

  statusHistory: [{
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedByRole: String,
    note: String,
    timestamp: { type: Date, default: Date.now }
  }],

  resolutionNote: { type: String },
  resolvedAt: { type: Date },
  closedAt: { type: Date },
  resolutionTimeHours: { type: Number },

  isFake: { type: Boolean, default: false },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Helper: get collection name for state
reportSchema.statics.getCollectionName = function (state) {
  return `${state}_bharatfix_reports`;
};

module.exports = mongoose.model('Report', reportSchema);
