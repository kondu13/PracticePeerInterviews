import mongoose from 'mongoose';
import { log } from '../vite.js';

// MongoDB connection function
const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variable
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mockinterviews';
    
    const conn = await mongoose.connect(mongoURI);
    
    log(`MongoDB Connected: ${conn.connection.host}`, 'mongodb');
    return conn;
  } catch (error) {
    log(`Error connecting to MongoDB: ${error.message}`, 'mongodb');
    process.exit(1);
  }
};

export default connectDB;