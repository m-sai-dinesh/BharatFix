const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  role: { type: String, enum: ['citizen', 'officer', 'super_admin'], default: 'citizen' },
  password: { type: String },
  // Officer-specific
  officerCode: { type: String }, // e.g. TG-045-GHMC001
  wardId: { type: String },
  wardName: { type: String },
  state: { type: String },
  isActive: { type: Boolean, default: true },
  // OTP simulation
  otp: { type: String },
  otpExpiry: { type: Date },
  lastLogin: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
