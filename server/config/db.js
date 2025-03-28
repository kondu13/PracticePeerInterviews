import mongoose from 'mongoose';
import { log } from '../vite.js';

// MongoDB connection function
const connectDB = async () => {
  try {
    // Use local MongoDB for development
    const localURI = 'mongodb://localhost:27017/interview-platform';
    // Allow for a production MongoDB connection string in environment
    const mongoURI = process.env.MONGO_URI || localURI;
    
    const conn = await mongoose.connect(mongoURI);
    
    log(`MongoDB Connected: ${conn.connection.host}`, 'mongodb');
    return conn;
  } catch (error) {
    log(`Error: ${error.message}`, 'mongodb');
    process.exit(1);
  }
};

export default connectDB;