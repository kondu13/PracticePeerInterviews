import { createServer } from 'http';
import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import { log } from './vite.js';
import connectDB from './config/db.js';
import User from './models/User.js';
import { comparePasswords } from './controllers/userController.js';

// Import controllers
import * as authController from './controllers/authController.js';
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

// Connect MongoDB Session Store
const MongoStore = connectMongo(session);

export async function registerRoutes(app) {
  // Connect to MongoDB
  const conn = await connectDB();
  
  // Session configuration
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || 'interview-platform-secret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ 
      mongoUrl: conn.connection.client.options.credentials.credentials.source,
      collectionName: 'sessions'
    }),
    cookie: { 
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      sameSite: 'lax'
    }
  };

  // In production, set secure cookie
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    sessionSettings.cookie.secure = true; // serve secure cookies
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Passport local strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      
      const isMatch = await comparePasswords(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Authentication Routes
  app.post('/api/register', authController.register);
  app.post('/api/login', passport.authenticate('local'), authController.login);
  app.post('/api/logout', authController.logout);
  app.get('/api/user', authController.getCurrentUser);
  
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