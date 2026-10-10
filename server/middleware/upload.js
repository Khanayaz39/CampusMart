const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Use memory storage for Multer (files are kept in RAM as Buffer objects)
const storage = multer.memoryStorage();

// Initialize Multer upload configuration
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit per file
});

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer from Multer.
 * @returns {Promise<Object>} - Cloudinary upload result.
 */
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve) => {
    // If Cloudinary credentials are still placeholder, provide fallback image
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
      return resolve({ secure_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'campusmart' },
      (error, result) => {
        if (error) {
          console.warn('Cloudinary upload error, using fallback:', error.message);
          return resolve({ secure_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600' });
        }
        resolve(result);
      }
    );
    // Write buffer to stream and end it
    uploadStream.end(fileBuffer);
  });
};

module.exports = { upload, uploadToCloudinary };
