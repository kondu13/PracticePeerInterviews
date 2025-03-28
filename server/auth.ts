import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import mongoose from "mongoose";
import { log } from "./vite";
import MongoStore from "connect-mongo";

// Adapt mongoose models to fit our type definitions
type MongoUser = any;

declare global {
  namespace Express {
    interface User extends MongoUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    log(`Error comparing passwords: ${error}`, 'auth');
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "mock-interview-secret-key",
    resave: false,
    saveUninitialized: false,
    store: process.env.MONGODB_URI 
      ? MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
      : storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // First check if mongoose is connected
        if (mongoose.connection.readyState === 1) {
          // Use Mongoose model directly
          const User = mongoose.model('User');
          const user = await User.findOne({ username });
          
          if (!user) {
            log(`User ${username} not found`, 'auth');
            return done(null, false);
          }
          
          const isMatch = await comparePasswords(password, user.password);
          if (!isMatch) {
            log(`Password does not match for user ${username}`, 'auth');
            return done(null, false);
          }
          
          return done(null, user);
        } else {
          // Fall back to storage
          const user = await storage.getUserByUsername(username);
          if (!user || !(await comparePasswords(password, user.password))) {
            log(`User ${username} not found or password does not match`, 'auth');
            return done(null, false);
          } else {
            return done(null, user);
          }
        }
      } catch (error) {
        log(`Error in LocalStrategy: ${error}`, 'error');
        return done(error);
      }
    }),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id || user._id);
  });
  
  passport.deserializeUser(async (id: any, done) => {
    try {
      // First check if mongoose is connected
      if (mongoose.connection.readyState === 1) {
        // Use Mongoose model directly
        const User = mongoose.model('User');
        const user = await User.findOne({ 
          $or: [{ id }, { _id: id }]
        });
        
        if (!user) {
          log(`User with id ${id} not found during deserialization`, 'auth');
          return done(null, false);
        }
        
        return done(null, user);
      } else {
        // Fall back to storage
        const user = await storage.getUser(id);
        return done(null, user);
      }
    } catch (error) {
      log(`Error in deserializeUser: ${error}`, 'error');
      return done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if mongoose is connected
      if (mongoose.connection.readyState === 1) {
        const User = mongoose.model('User');
        
        // Check if user already exists
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
          return res.status(400).json({ message: "Username already exists" });
        }
        
        // Hash password
        const hashedPassword = await hashPassword(req.body.password);
        
        // Create new user
        const newUser = await User.create({
          ...req.body,
          password: hashedPassword
        });
        
        // Login the user
        req.login(newUser, (err) => {
          if (err) return next(err);
          
          // Don't send password back to client
          const userResponse = { ...newUser.toObject() };
          delete userResponse.password;
          
          res.status(201).json(userResponse);
        });
      } else {
        // Fall back to storage
        const existingUser = await storage.getUserByUsername(req.body.username);
        if (existingUser) {
          return res.status(400).send("Username already exists");
        }

        const user = await storage.createUser({
          ...req.body,
          password: await hashPassword(req.body.password),
        });

        req.login(user, (err) => {
          if (err) return next(err);
          
          // Don't send password back to client
          const userResponse = { ...user };
          delete userResponse.password;
          
          res.status(201).json(userResponse);
        });
      }
    } catch (error: any) {
      log(`Error in register: ${error.message}`, 'error');
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        log(`Error in login authentication: ${err}`, 'error');
        return next(err);
      }
      
      if (!user) {
        log(`Login failed: User not found or invalid credentials`, 'auth');
        return res.status(401).send("Unauthorized");
      }
      
      req.login(user, (err) => {
        if (err) {
          log(`Error in login session: ${err}`, 'error');
          return next(err);
        }
        
        // Don't send password back to client
        const userResponse = { ...user._doc || user };
        delete userResponse.password;
        
        res.status(200).json(userResponse);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Don't send password back to client
    const userResponse = { ...req.user._doc || req.user };
    delete userResponse.password;
    
    res.json(userResponse);
  });
}
