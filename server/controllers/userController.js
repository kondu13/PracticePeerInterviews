import User from '../models/User.js';
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

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get users by experience level
// @route   GET /api/users/experience/:level
// @access  Private
export const getUsersByExperienceLevel = async (req, res) => {
  try {
    const users = await User.find({ 
      experienceLevel: req.params.level 
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get users by skill
// @route   GET /api/users/skill/:skill
// @access  Private
export const getUsersBySkill = async (req, res) => {
  try {
    const users = await User.find({ 
      skills: { $in: [req.params.skill] } 
    }).select('-password');
    
    res.json(users);
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
    
    // Find user by ID
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is updating their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(401).json({ message: 'Not authorized to update this profile' });
    }
    
    // Update user fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.experienceLevel = experienceLevel || user.experienceLevel;
    user.skills = skills || user.skills;
    user.targetRole = targetRole || user.targetRole;
    user.bio = bio || user.bio;
    
    // Save updated user
    await user.save();
    
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
    
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};