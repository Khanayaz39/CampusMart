const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

/**
 * Configures Cloudinary with credentials from environment variables.
 * Cloudinary is used to store and serve user-uploaded images.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
