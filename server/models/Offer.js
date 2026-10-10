const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  message: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'countered', 'completed'], 
    default: 'pending' 
  },
  counterAmount: { type: Number }, // Amount if seller makes a counter offer
  counterMessage: { type: String },
  paidAt: { type: Date }
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

module.exports = mongoose.model('Offer', offerSchema);
