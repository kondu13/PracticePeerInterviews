import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

// Helper for password hashing
const scryptAsync = promisify(scrypt);

// Password hash function
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// MongoDB models
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

const matchRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchedPeerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'canceled'], default: 'pending' },
  targetExperienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'any'], default: 'any' },
  targetSkills: [{ type: String }],
  preferredTimes: [{ type: String }],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const interviewSlotSchema = new mongoose.Schema({
  interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  intervieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['available', 'booked', 'completed', 'canceled'], default: 'available' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  meetingType: { type: String, enum: ['zoom', 'google-meet', 'teams', 'other'], default: 'zoom' },
  meetingLink: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const MatchRequest = mongoose.model('MatchRequest', matchRequestSchema);
const InterviewSlot = mongoose.model('InterviewSlot', interviewSlotSchema);

async function seed() {
  let mongoServer;
  
  try {
    // Determine if we're using a provided MongoDB URI or creating a temporary server
    if (!process.env.MONGODB_URI) {
      console.log('No MongoDB URI provided, starting in-memory server...');
      mongoServer = await MongoMemoryServer.create();
      process.env.MONGODB_URI = mongoServer.getUri();
      console.log(`Using in-memory MongoDB: ${process.env.MONGODB_URI}`);
    } else {
      console.log(`Connecting to MongoDB: ${process.env.MONGODB_URI}`);
    }
    
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clean existing data
    await User.deleteMany({});
    await MatchRequest.deleteMany({});
    await InterviewSlot.deleteMany({});
    console.log('Cleared existing data');
    
    // Create users with hashed passwords
    const hashedPassword = await hashPassword('password123');
    
    const alice = await User.create({
      username: 'alice_dev',
      password: hashedPassword,
      name: 'Alice Developer',
      email: 'alice@example.com',
      experienceLevel: 'beginner',
      skills: ['JavaScript', 'React', 'HTML', 'CSS'],
      targetRole: 'Frontend Developer',
      bio: 'I am a beginner developer looking to improve my frontend skills.'
    });
    
    const bob = await User.create({
      username: 'bob_coder',
      password: hashedPassword,
      name: 'Bob Coder',
      email: 'bob@example.com',
      experienceLevel: 'intermediate',
      skills: ['Python', 'Django', 'API Design', 'SQL'],
      targetRole: 'Backend Developer',
      bio: 'Backend developer with 2 years of experience in Python and Django.'
    });
    
    const charlie = await User.create({
      username: 'charlie_tech',
      password: hashedPassword,
      name: 'Charlie Tech',
      email: 'charlie@example.com',
      experienceLevel: 'advanced',
      skills: ['System Design', 'Java', 'Microservices', 'AWS'],
      targetRole: 'Senior Software Engineer',
      bio: 'Experienced engineer with 7+ years in distributed systems and cloud architecture.'
    });
    
    const dana = await User.create({
      username: 'dana_coding',
      password: hashedPassword,
      name: 'Dana Coding',
      email: 'dana@example.com',
      experienceLevel: 'beginner',
      skills: ['JavaScript', 'Node.js', 'Express'],
      targetRole: 'Full Stack Developer',
      bio: 'Learning full stack development with a focus on Node.js and React.'
    });
    
    const eli = await User.create({
      username: 'eli_dev',
      password: hashedPassword,
      name: 'Eli Developer',
      email: 'eli@example.com',
      experienceLevel: 'intermediate',
      skills: ['React', 'TypeScript', 'CSS', 'UI/UX'],
      targetRole: 'Frontend Engineer',
      bio: 'Frontend specialist with a passion for beautiful and accessible user interfaces.'
    });
    
    console.log('Created test users');
    
    // Create interview slots
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 0, 0, 0);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(15, 0, 0, 0);
    
    // Charlie creates interview slots
    await InterviewSlot.create({
      interviewerId: charlie._id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hour later
      meetingType: 'zoom',
      meetingLink: 'https://zoom.us/j/example',
      notes: 'Happy to help with system design interviews or any Java questions'
    });
    
    // Bob creates interview slots
    await InterviewSlot.create({
      interviewerId: bob._id,
      startTime: dayAfter,
      endTime: new Date(dayAfter.getTime() + 60 * 60 * 1000), // 1 hour later
      meetingType: 'google-meet',
      meetingLink: 'https://meet.google.com/example',
      notes: 'Can help with backend interview prep and code review'
    });
    
    // Eli creates interview slots
    await InterviewSlot.create({
      interviewerId: eli._id,
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 60 * 60 * 1000), // 1 hour later
      meetingType: 'zoom',
      meetingLink: 'https://zoom.us/j/example2',
      notes: 'Frontend interview practice focusing on React and CSS'
    });
    
    console.log('Created interview slots');
    
    // Create match requests
    // Alice creates a match request for Charlie
    await MatchRequest.create({
      requesterId: alice._id,
      matchedPeerId: charlie._id,
      targetExperienceLevel: 'advanced',
      targetSkills: ['React', 'JavaScript', 'System Design'],
      preferredTimes: ['Evenings', 'Weekends'],
      notes: 'I would like to practice frontend interview questions focused on React.'
    });
    
    // Dana creates a match request for Bob
    await MatchRequest.create({
      requesterId: dana._id,
      matchedPeerId: bob._id,
      targetExperienceLevel: 'intermediate',
      targetSkills: ['Node.js', 'Express', 'API Design'],
      preferredTimes: ['Mornings', 'Weekdays'],
      notes: 'Looking for someone to practice pair programming exercises with me.'
    });
    
    // Eli creates a match request for Charlie
    await MatchRequest.create({
      requesterId: eli._id,
      matchedPeerId: charlie._id,
      targetExperienceLevel: 'advanced',
      targetSkills: ['System Design', 'Career Growth'],
      preferredTimes: ['Afternoons', 'Weekends'],
      notes: 'Need help preparing for my senior frontend engineer interview.'
    });
    
    console.log('Created match requests');
    console.log('Data seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Cleanup
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    if (mongoServer) {
      await mongoServer.stop();
      console.log('Stopped in-memory MongoDB server');
    }
    
    process.exit(0);
  }
}

// Run the seeding function
seed();