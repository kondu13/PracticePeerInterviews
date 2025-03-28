import { storage } from '../storage.js';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Hash password helper function
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// Compare passwords helper function
export async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Helper function to strip password from user object
const sanitizeUser = (user) => {
  if (!user) return null;
  
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const users = await storage.getUsers();
    // Remove passwords before returning
    const sanitizedUsers = users.map(sanitizeUser);
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await storage.getUser(parseInt(req.params.id));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get users by experience level
// @route   GET /api/users/experience/:level
// @access  Private
export const getUsersByExperienceLevel = async (req, res) => {
  try {
    const users = await storage.getUsersByExperienceLevel(req.params.level);
    const sanitizedUsers = users.map(sanitizeUser);
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get users by skill
// @route   GET /api/users/skill/:skill
// @access  Private
export const getUsersBySkill = async (req, res) => {
  try {
    const users = await storage.getUsersBySkill(req.params.skill);
    const sanitizedUsers = users.map(sanitizeUser);
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new user
// @route   POST /api/register
// @access  Public
export const createUser = async (req, res) => {
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

    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const { fullName, email, experienceLevel, skills, targetRole, bio } = req.body;
    const userId = parseInt(req.params.id);
    
    // Find user by ID
    let user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is updating their own profile
    if (req.user.id !== userId) {
      return res.status(401).json({ message: 'Not authorized to update this profile' });
    }
    
    // Prepare updates object
    const updates = {
      fullName: fullName || user.fullName,
      email: email || user.email,
      experienceLevel: experienceLevel || user.experienceLevel,
      skills: skills || user.skills,
      targetRole: targetRole || user.targetRole,
      bio: bio || user.bio
    };
    
    // Update user in storage
    const updatedUser = await storage.updateUser(userId, updates);
    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to update user' });
    }
    
    res.json(sanitizeUser(updatedUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};