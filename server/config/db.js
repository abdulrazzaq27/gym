const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const logger = require('../utils/logger');

async function connectDB(retries = 5, delay = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });

      logger.info(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      
      // Connection event listeners
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Attempting to reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected successfully');
      });

      return conn;
    } catch (err) {
      logger.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, err.message);
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, err.message);
      
      if (attempt === retries) {
        logger.error('❌ All MongoDB connection attempts failed. Exiting...');
        console.error('❌ All MongoDB connection attempts failed. Exiting...');
        process.exit(1);
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      logger.info(`Retrying in ${waitTime / 1000} seconds...`);
      console.log(`Retrying in ${waitTime / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

module.exports = connectDB;