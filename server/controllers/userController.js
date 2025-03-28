import { storage } from '../storage.js';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

export async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return Buffer.from(hashedBuf).equals(Buffer.from(suppliedBuf));
}

export const getUsers = async (req, res) => {
  try {
    const users = await storage.getUsers();
    // Filter out sensitive information
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    res.status(200).json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await storage.getUser(parseInt(req.params.id));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Filter out sensitive information
    const { password, ...safeUser } = user;
    
    res.status(200).json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

export const getUsersByExperienceLevel = async (req, res) => {
  try {
    const users = await storage.getUsersByExperienceLevel(req.params.level);
    
    // Filter out sensitive information
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    res.status(200).json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users by experience level', error: error.message });
  }
};

export const getUsersBySkill = async (req, res) => {
  try {
    const users = await storage.getUsersBySkill(req.params.skill);
    
    // Filter out sensitive information
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    res.status(200).json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users by skill', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    // Ensure the authenticated user is updating their own profile
    if (parseInt(req.params.id) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this user profile' });
    }
    
    const updates = req.body;
    
    // Don't allow password updates through this endpoint
    if (updates.password) {
      delete updates.password;
    }
    
    const updatedUser = await storage.updateUser(parseInt(req.params.id), updates);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Filter out sensitive information
    const { password, ...safeUser } = updatedUser;
    
    res.status(200).json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};