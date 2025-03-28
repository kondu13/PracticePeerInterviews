// Main server entry point
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { startMongoMemoryServer, stopMongoMemoryServer } from './config/mongodb.js';
import { seedTestUsers } from './config/seed-data.js';
import { registerRoutes } from './routes.js';
import { log, setupVite, serveStatic } from './vite.js';

// Load environment variables from .env file
dotenv.config();

// Handle application shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.disconnect();
    log('Mongoose disconnected through app termination', 'mongodb');
    
    await stopMongoMemoryServer();
    
    process.exit(0);
  } catch (error) {
    log(`Error during shutdown: ${error.message}`, 'error');
    process.exit(1);
  }
});

async function main() {
  try {
    // Start MongoDB Memory Server
    const mongoUri = await startMongoMemoryServer();
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    log('Connected to MongoDB', 'mongodb');
    
    // Load models - must be done before seeding
    await import('./models/User.js');
    await import('./models/MatchRequest.js');
    await import('./models/InterviewSlot.js');
    
    // Seed the database with test users
    await seedTestUsers();
  } catch (error) {
    log(`Failed to start MongoDB or connect: ${error.message}`, 'error');
    throw error;
  }
  
  // Create Express app
  const app = express();
  
  // Add JSON middleware
  app.use(express.json());
  
  // Register routes and get HTTP server
  const server = await registerRoutes(app);
  
  // For production, serve static files from the client/dist directory
  if (process.env.NODE_ENV === 'production') {
    serveStatic(app);
  } else {
    // For development, set up Vite dev server
    await setupVite(app, server);
  }
  
  // Global error handler
  app.use((err, _req, res, _next) => {
    log(`Error: ${err.message}`, "error");
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  });
  
  // Start the server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    log(`serving on port ${PORT}`);
  });
}

main().catch(error => {
  log(`Fatal error: ${error.message}`, "error");
  process.exit(1);
});