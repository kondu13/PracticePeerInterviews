// MongoDB Memory Server configuration
import { MongoMemoryServer } from 'mongodb-memory-server';
import { log } from '../vite.js';

let mongoServer;

export async function startMongoMemoryServer() {
  try {
    // Create MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Set to environment for other parts of the application
    process.env.MONGODB_URI = mongoUri;
    
    log(`MongoDB Memory Server running at ${mongoUri}`, 'mongodb');
    return mongoUri;
  } catch (error) {
    log(`Failed to start MongoDB Memory Server: ${error.message}`, 'error');
    throw error;
  }
}

export async function stopMongoMemoryServer() {
  if (mongoServer) {
    await mongoServer.stop();
    log('MongoDB Memory Server stopped', 'mongodb');
  }
}