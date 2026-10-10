const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // College email is expected
  password: { type: String, required: true }, // Hashed password
  phone: { type: String },
  profileImage: { type: String, default: 'https://res.cloudinary.com/demo/image/upload/v1580928731/avatar.png' },
  role: { type: String, enum: ['buyer', 'seller', 'both', 'admin'], default: 'both' },
  college: { type: String },
  hostel: { type: String },
  roomNumber: { type: String },
  year: { type: Number }, // e.g., 1, 2, 3, 4
  department: { type: String },
  bio: { type: String },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationStatus: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    college: { type: Boolean, default: false }
  },
  isDeleted: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  upiId: { type: String, default: '' },
  upiQrImage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to hash the password before saving to the database
userSchema.pre('save', async function (next) {
  // Only hash if the password was modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
