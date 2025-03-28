// Seed data configuration
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { log } from '../vite.js';
import { storage } from '../storage.js';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// Test users data
const testUsers = [
  {
    username: 'alice_dev',
    password: 'password123',
    fullName: 'Alice Developer',
    email: 'alice@example.com',
    experienceLevel: 'beginner',
    skills: ['JavaScript', 'React', 'HTML', 'CSS'],
    targetRole: 'Frontend Developer',
    bio: 'I am a beginner developer looking to improve my frontend skills.'
  },
  {
    username: 'bob_coder',
    password: 'password123',
    fullName: 'Bob Coder',
    email: 'bob@example.com',
    experienceLevel: 'intermediate',
    skills: ['Python', 'Django', 'API Design', 'SQL'],
    targetRole: 'Backend Developer',
    bio: 'Backend developer with 2 years of experience in Python and Django.'
  },
  {
    username: 'charlie_tech',
    password: 'password123',
    fullName: 'Charlie Tech',
    email: 'charlie@example.com',
    experienceLevel: 'advanced',
    skills: ['System Design', 'Java', 'Microservices', 'AWS'],
    targetRole: 'Senior Software Engineer',
    bio: 'Experienced engineer with 7+ years in distributed systems and cloud architecture.'
  },
  {
    username: 'dana_coding',
    password: 'password123',
    fullName: 'Dana Coding',
    email: 'dana@example.com',
    experienceLevel: 'beginner',
    skills: ['JavaScript', 'Node.js', 'Express'],
    targetRole: 'Full Stack Developer',
    bio: 'Learning full stack development with a focus on Node.js and React.'
  },
  {
    username: 'eli_dev',
    password: 'password123',
    fullName: 'Eli Developer',
    email: 'eli@example.com',
    experienceLevel: 'intermediate',
    skills: ['React', 'TypeScript', 'CSS', 'UI/UX'],
    targetRole: 'Frontend Engineer',
    bio: 'Frontend specialist with a passion for beautiful and accessible user interfaces.'
  },
];

export async function seedTestUsers() {
  try {
    // Check if users already exist
    const existingUsers = await storage.getUsers();
    if (existingUsers.length > 0) {
      log(`Storage already has ${existingUsers.length} users, skipping seed`, 'seed');
      return;
    }
    
    log('Seeding test users to in-memory storage...', 'seed');
    
    // Create test users
    const createdUsers = [];
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await storage.getUserByUsername(userData.username);
        if (existingUser) {
          log(`User ${userData.username} already exists, skipping`, 'seed');
          continue;
        }
        
        // Hash the password
        const hashedPassword = await hashPassword(userData.password);
        
        // Create the user with the hashed password
        const user = await storage.createUser({
          ...userData,
          password: hashedPassword
        });
        
        createdUsers.push(user);
        log(`Created test user: ${user.fullName} (${user.username})`, 'seed');
      } catch (error) {
        log(`Error creating user ${userData.username}: ${error.message}`, 'error');
      }
    }
    
    log(`Successfully created ${createdUsers.length} test users`, 'seed');
  } catch (error) {
    log(`Error seeding database: ${error.message}`, 'error');
  }
}