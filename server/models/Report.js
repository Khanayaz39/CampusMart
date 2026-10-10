const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedItem: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can be user ID or product ID
  itemType: { type: String, enum: ['product', 'user'], required: true },
  reason: { type: String, enum: ['scam', 'fake', 'inappropriate', 'wrong-info', 'other'], required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'investigating', 'resolved', 'dismissed'], default: 'pending' },
  adminNote: { type: String }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

module.exports = mongoose.model('Report', reportSchema);
