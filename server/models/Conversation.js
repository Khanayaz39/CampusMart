const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // The product they are discussing
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
}, { timestamps: { createdAt: false, updatedAt: 'updatedAt' } });

module.exports = mongoose.model('Conversation', conversationSchema);
