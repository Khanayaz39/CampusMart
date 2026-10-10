const mongoose = require('mongoose');

/**
 * Connects to the MongoDB database using Mongoose.
 * If connection fails, the server still runs (so you can see the UI)
 * but API routes that need the database won't work until connected.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️  MongoDB connection failed: ${error.message}`);
    console.error('   The server will still run, but database features won\'t work.');
    console.error('   To fix: Set MONGO_URI in .env to a valid MongoDB connection string.');
    console.error('   Get a free one at: https://www.mongodb.com/atlas');
  }
};

module.exports = connectDB;
