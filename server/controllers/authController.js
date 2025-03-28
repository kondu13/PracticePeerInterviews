import User from '../models/User.js';
import { hashPassword, comparePasswords } from './userController.js';

// @desc    Register a new user
// @route   POST /api/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { username, password, fullName, email, experienceLevel, skills, targetRole, bio } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = await User.create({
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
        _id: user._id,
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
};

// @desc    Login user
// @route   POST /api/login
// @access  Public
export const login = (req, res) => {
  // passport.authenticate middleware in routes.js handles authentication
  // If we get here, authentication was successful
  
  // Don't return password in response
  const userResponse = {
    _id: req.user._id,
    username: req.user.username,
    fullName: req.user.fullName,
    email: req.user.email,
    experienceLevel: req.user.experienceLevel,
    skills: req.user.skills,
    targetRole: req.user.targetRole,
    bio: req.user.bio
  };
  
  res.status(200).json(userResponse);
};

// @desc    Logout user
// @route   POST /api/logout
// @access  Private
export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
};

// @desc    Get current user
// @route   GET /api/user
// @access  Private
export const getCurrentUser = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  
  // Don't return password in response
  const userResponse = {
    _id: req.user._id,
    username: req.user.username,
    fullName: req.user.fullName,
    email: req.user.email,
    experienceLevel: req.user.experienceLevel,
    skills: req.user.skills,
    targetRole: req.user.targetRole,
    bio: req.user.bio
  };
  
  res.json(userResponse);
};