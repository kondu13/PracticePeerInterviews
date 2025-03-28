import mongoose from 'mongoose';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

// We'll create a MongoDB Memory Server instance for the script
let mongoServer;

// Define schemas directly in this file
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  experienceLevel: { type: String, required: true, enum: ['beginner', 'intermediate', 'advanced'] },
  skills: [{ type: String }],
  targetRole: { type: String },
  bio: { type: String },
  avatarUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);

// Helper for password hashing
const scryptAsync = promisify(scrypt);

// Password hash function
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// Main function to seed users
async function seedUsers() {
  try {
    // Create MongoDB Memory Server instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log(`MongoDB Memory Server started at: ${mongoUri}`);
    
    // Connect to MongoDB Memory Server
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Memory Server');
    
    // Create test users with hashed passwords
    const hashedPassword = await hashPassword('password123');
    
    const users = [
      {
        username: 'alice_dev',
        password: hashedPassword,
        name: 'Alice Developer',
        email: 'alice@example.com',
        experienceLevel: 'beginner',
        skills: ['JavaScript', 'React', 'HTML', 'CSS'],
        targetRole: 'Frontend Developer',
        bio: 'I am a beginner developer looking to improve my frontend skills.'
      },
      {
        username: 'bob_coder',
        password: hashedPassword,
        name: 'Bob Coder',
        email: 'bob@example.com',
        experienceLevel: 'intermediate',
        skills: ['Python', 'Django', 'API Design', 'SQL'],
        targetRole: 'Backend Developer',
        bio: 'Backend developer with 2 years of experience in Python and Django.'
      },
      {
        username: 'charlie_tech',
        password: hashedPassword,
        name: 'Charlie Tech',
        email: 'charlie@example.com',
        experienceLevel: 'advanced',
        skills: ['System Design', 'Java', 'Microservices', 'AWS'],
        targetRole: 'Senior Software Engineer',
        bio: 'Experienced engineer with 7+ years in distributed systems and cloud architecture.'
      },
      {
        username: 'dana_coding',
        password: hashedPassword,
        name: 'Dana Coding',
        email: 'dana@example.com',
        experienceLevel: 'beginner',
        skills: ['JavaScript', 'Node.js', 'Express'],
        targetRole: 'Full Stack Developer',
        bio: 'Learning full stack development with a focus on Node.js and React.'
      },
      {
        username: 'eli_dev',
        password: hashedPassword,
        name: 'Eli Developer',
        email: 'eli@example.com',
        experienceLevel: 'intermediate',
        skills: ['React', 'TypeScript', 'CSS', 'UI/UX'],
        targetRole: 'Frontend Engineer',
        bio: 'Frontend specialist with a passion for beautiful and accessible user interfaces.'
      }
    ];
    
    // Insert all users at once
    await User.insertMany(users);
    
    console.log(`Created ${users.length} test users`);
    console.log('Data seeding completed successfully!');
    console.log('You can now login with any of the following accounts:');
    console.log('- alice_dev / password123 (beginner)');
    console.log('- bob_coder / password123 (intermediate)');
    console.log('- charlie_tech / password123 (advanced)');
    console.log('- dana_coding / password123 (beginner)');
    console.log('- eli_dev / password123 (intermediate)');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    // Stop MongoDB Memory Server
    if (mongoServer) {
      await mongoServer.stop();
      console.log('MongoDB Memory Server stopped');
    }
    
    process.exit(0);
  }
}

// Run the seeding function
seedUsers();