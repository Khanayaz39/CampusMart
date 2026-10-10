const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Books & Notes', 'Electronics', 'Furniture', 'Room Essentials', 'Transport', 'Clothing', 'Entertainment', 'Kitchen Items', 'Electrical', 'Miscellaneous']
  },
  images: [{ type: String }], // Array of Cloudinary URLs
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  condition: { 
    type: String, 
    enum: ['new', 'like-new', 'good', 'fair', 'poor']
  },
  status: { 
    type: String, 
    enum: ['available', 'sold', 'reserved'], 
    default: 'available' 
  },
  college: { type: String }, // For filtering items by college
  hostel: { type: String }, // Optional finer-grained location
  tags: [{ type: String }],
  views: { type: Number, default: 0 },
  negotiable: { type: Boolean, default: true }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('Product', productSchema);
