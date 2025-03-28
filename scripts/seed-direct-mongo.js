// Direct MongoDB seeding script
import mongoose from 'mongoose';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// User schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  targetRole: {
    type: String,
    trim: true
  },
  bio: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  avatarUrl: {
    type: String,
    default: null
  }
});

const User = mongoose.model('User', UserSchema);

// Function to hash a password
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

// Main function to seed the database
async function seedDatabase() {
  try {
    // Get MongoDB URI from environment
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('MONGODB_URI environment variable is not set');
      process.exit(1);
    }
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB at ${mongoURI}`);
    
    // Clear existing users
    const deletedCount = await User.deleteMany({});
    console.log(`Cleared ${deletedCount.deletedCount} existing users`);
    
    // Create test users
    const createdUsers = [];
    for (const userData of testUsers) {
      try {
        // Hash the password
        const hashedPassword = await hashPassword(userData.password);
        
        // Create the user with the hashed password
        const user = await User.create({
          ...userData,
          password: hashedPassword
        });
        
        createdUsers.push(user);
        console.log(`Created test user: ${user.fullName} (${user.username})`);
      } catch (error) {
        console.error(`Error creating user ${userData.username}:`, error.message);
      }
    }
    
    console.log(`Successfully created ${createdUsers.length} test users`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seeding function
seedDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});