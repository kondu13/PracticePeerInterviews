import mongoose from 'mongoose';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { log } from '../server/vite.js';

// Load environment variables
dotenv.config();

const scryptAsync = promisify(scrypt);

// Hash password function
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mockinterviews';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected');
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

// Create User Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  experienceLevel: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  targetRole: String,
  bio: String,
  avatarUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create test users data
const testUsers = [
  {
    username: 'alice_dev',
    password: 'password123',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    experienceLevel: 'Junior',
    skills: ['JavaScript', 'React', 'CSS'],
    targetRole: 'Frontend Developer',
    bio: 'Junior developer looking to improve my React skills through mock interviews.',
  },
  {
    username: 'bob_coder',
    password: 'password123',
    name: 'Bob Smith',
    email: 'bob@example.com',
    experienceLevel: 'Mid-level',
    skills: ['Python', 'Django', 'SQL'],
    targetRole: 'Backend Developer',
    bio: 'Mid-level backend developer with 3 years of experience. Looking to practice system design interviews.',
  },
  {
    username: 'charlie_tech',
    password: 'password123',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    experienceLevel: 'Senior',
    skills: ['Java', 'Spring', 'Microservices', 'AWS'],
    targetRole: 'Senior Software Engineer',
    bio: 'Senior engineer with 8+ years of experience. Happy to help junior developers with mock interviews.',
  },
  {
    username: 'dana_coding',
    password: 'password123',
    name: 'Dana Wilson',
    email: 'dana@example.com',
    experienceLevel: 'Junior',
    skills: ['JavaScript', 'Node.js', 'Express'],
    targetRole: 'Full Stack Developer',
    bio: 'Junior full stack developer looking to improve interviewing skills.',
  },
  {
    username: 'eli_dev',
    password: 'password123',
    name: 'Eli Rodriguez',
    email: 'eli@example.com',
    experienceLevel: 'Mid-level',
    skills: ['React', 'TypeScript', 'GraphQL'],
    targetRole: 'Frontend Developer',
    bio: 'Frontend developer interested in practicing behavioral interviews.',
  }
];

// Create Match Request Schema
const MatchRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchedPeerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  topics: {
    type: [String],
    required: true
  },
  requestType: {
    type: String,
    enum: ['GiveInterview', 'TakeInterview', 'Practice'],
    required: true
  },
  preferredTimes: [Date],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create Interview Slot Schema
const InterviewSlotSchema = new mongoose.Schema({
  interviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  intervieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Completed', 'Cancelled'],
    default: 'Available'
  },
  topics: [String],
  meetingLink: String,
  notes: String,
  feedback: {
    rating: Number,
    comments: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Main function to create test data
async function createTestData() {
  const connection = await connectDB();
  
  // Create models
  const User = mongoose.model('User', UserSchema);
  const MatchRequest = mongoose.model('MatchRequest', MatchRequestSchema);
  const InterviewSlot = mongoose.model('InterviewSlot', InterviewSlotSchema);
  
  try {
    // Clear existing data
    await User.deleteMany({});
    await MatchRequest.deleteMany({});
    await InterviewSlot.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users with hashed passwords
    const createdUsers = [];
    
    for (const userData of testUsers) {
      const hashedPassword = await hashPassword(userData.password);
      const newUser = new User({
        ...userData,
        password: hashedPassword
      });
      
      const savedUser = await newUser.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${savedUser.name}`);
    }
    
    // Create some match requests
    const matchRequests = [
      {
        requesterId: createdUsers[0]._id, // Alice
        matchedPeerId: createdUsers[2]._id, // Charlie
        status: 'Pending',
        topics: ['React', 'Frontend Development'],
        requestType: 'TakeInterview',
        notes: 'Looking for practice with React component design questions.'
      },
      {
        requesterId: createdUsers[3]._id, // Dana
        matchedPeerId: createdUsers[1]._id, // Bob
        status: 'Accepted',
        topics: ['Node.js', 'Express', 'API Design'],
        requestType: 'Practice',
        notes: 'Would like to practice building RESTful APIs.'
      }
    ];
    
    for (const requestData of matchRequests) {
      const newRequest = new MatchRequest(requestData);
      await newRequest.save();
      console.log('Created match request');
    }
    
    // Create some interview slots
    // Now + 2 days
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 2);
    futureDate1.setHours(10, 0, 0, 0);
    
    // Now + 3 days
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 3);
    futureDate2.setHours(14, 0, 0, 0);
    
    // Now + 4 days
    const futureDate3 = new Date();
    futureDate3.setDate(futureDate3.getDate() + 4);
    futureDate3.setHours(15, 0, 0, 0);
    
    const interviewSlots = [
      {
        interviewerId: createdUsers[2]._id, // Charlie (Senior)
        startTime: futureDate1,
        endTime: new Date(futureDate1.getTime() + 60 * 60 * 1000), // 1 hour later
        status: 'Available',
        topics: ['System Design', 'Java', 'Microservices']
      },
      {
        interviewerId: createdUsers[1]._id, // Bob (Mid-level)
        intervieweeId: createdUsers[3]._id, // Dana (Junior)
        startTime: futureDate2,
        endTime: new Date(futureDate2.getTime() + 60 * 60 * 1000), // 1 hour later
        status: 'Booked',
        topics: ['Node.js', 'Express', 'API Design'],
        meetingLink: 'https://meet.google.com/test-link'
      },
      {
        interviewerId: createdUsers[4]._id, // Eli (Mid-level)
        startTime: futureDate3,
        endTime: new Date(futureDate3.getTime() + 60 * 60 * 1000), // 1 hour later
        status: 'Available',
        topics: ['React', 'TypeScript', 'Frontend Architecture']
      }
    ];
    
    for (const slotData of interviewSlots) {
      const newSlot = new InterviewSlot(slotData);
      await newSlot.save();
      console.log('Created interview slot');
    }
    
    console.log('Test data creation complete!');
    
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    // Close the connection
    await connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
createTestData().catch(console.error);