import { createServer } from 'http';
import { log } from './vite.js';
import connectDB from './config/db.js';
import { setupAuth } from './auth.js';

// Import controllers
import * as userController from './controllers/userController.js';
import * as matchRequestController from './controllers/matchRequestController.js';
import * as interviewSlotController from './controllers/interviewSlotController.js';

// Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Not authenticated' });
};

export async function registerRoutes(app) {
  // Connect to MongoDB
  await connectDB();
  
  // Setup authentication
  setupAuth(app);
  
  // Authentication Routes are set up in setupAuth
  
  // User Routes
  app.get('/api/users', isAuthenticated, userController.getUsers);
  app.get('/api/users/:id', isAuthenticated, userController.getUserById);
  app.get('/api/users/experience/:level', isAuthenticated, userController.getUsersByExperienceLevel);
  app.get('/api/users/skill/:skill', isAuthenticated, userController.getUsersBySkill);
  app.put('/api/users/:id', isAuthenticated, userController.updateUser);
  
  // Match Request Routes
  app.post('/api/match-requests', isAuthenticated, matchRequestController.createMatchRequest);
  app.get('/api/match-requests/incoming', isAuthenticated, matchRequestController.getIncomingMatchRequests);
  app.get('/api/match-requests/outgoing', isAuthenticated, matchRequestController.getOutgoingMatchRequests);
  app.get('/api/match-requests/:id', isAuthenticated, matchRequestController.getMatchRequestById);
  app.get('/api/match-requests', isAuthenticated, matchRequestController.getAllMatchRequests);
  app.put('/api/match-requests/:id/status', isAuthenticated, matchRequestController.updateMatchRequestStatus);
  
  // Interview Slot Routes
  app.post('/api/interview-slots', isAuthenticated, interviewSlotController.createInterviewSlot);
  app.get('/api/interview-slots/available', isAuthenticated, interviewSlotController.getAvailableSlots);
  app.get('/api/interview-slots/upcoming', isAuthenticated, interviewSlotController.getUserUpcomingInterviews);
  app.get('/api/interview-slots/past', isAuthenticated, interviewSlotController.getUserPastInterviews);
  app.get('/api/interview-slots/:id', isAuthenticated, interviewSlotController.getInterviewSlotById);
  app.get('/api/interview-slots', isAuthenticated, interviewSlotController.getAllUserInterviews);
  app.put('/api/interview-slots/:id/book', isAuthenticated, interviewSlotController.bookInterviewSlot);
  app.put('/api/interview-slots/:id/cancel', isAuthenticated, interviewSlotController.cancelInterviewSlot);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}