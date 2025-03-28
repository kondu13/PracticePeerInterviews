import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { storage } from './storage.js';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return Buffer.from(hashedBuf).equals(Buffer.from(suppliedBuf));
}

export function setupAuth(app) {
  // Session configuration using the storage's memory store
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "mock-interview-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
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
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
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
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication Routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, fullName, email, experienceLevel, skills, targetRole, bio } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create new user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        fullName,
        email,
        experienceLevel,
        skills: skills || [],
        targetRole,
        bio
      });

      // Log in the user after registration
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't return password in response
        const userResponse = {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          experienceLevel: user.experienceLevel,
          skills: user.skills,
          targetRole: user.targetRole,
          bio: user.bio
        };
        
        res.status(201).json(userResponse);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Don't return password in response
    const userResponse = {
      id: req.user.id,
      username: req.user.username,
      fullName: req.user.fullName,
      email: req.user.email,
      experienceLevel: req.user.experienceLevel,
      skills: req.user.skills,
      targetRole: req.user.targetRole,
      bio: req.user.bio
    };
    
    res.status(200).json(userResponse);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Don't return password in response
    const userResponse = {
      id: req.user.id,
      username: req.user.username,
      fullName: req.user.fullName,
      email: req.user.email,
      experienceLevel: req.user.experienceLevel,
      skills: req.user.skills,
      targetRole: req.user.targetRole,
      bio: req.user.bio
    };
    
    res.json(userResponse);
  });
}