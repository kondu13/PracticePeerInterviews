// Simplified server entry point
import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { registerRoutes } from './server/routes.js';
import { log } from './server/vite.js';
import { storage } from './server/storage.js';
import { seedTestUsers } from './server/config/seed-data.js';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

async function main() {
  try {
    // Seed the in-memory database with test users
    await seedTestUsers();
    log('Seeded test users to in-memory storage', 'seed');
  } catch (error) {
    log(`Failed to seed test data: ${error.message}`, 'error');
    throw error;
  }
  
  // Create Express app
  const app = express();
  
  // Enable CORS for development with credentials
  app.use(cors({
    origin: 'http://localhost:5173', // Client URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  // Add JSON middleware
  app.use(express.json());
  
  // Register routes and get HTTP server
  const server = await registerRoutes(app);
  
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
  const PORT = 5000;
  server.listen(PORT, '0.0.0.0', () => {
    log(`serving on port ${PORT}`);
  });
}

main().catch(error => {
  log(`Fatal error: ${error.message}`, "error");
  process.exit(1);
});