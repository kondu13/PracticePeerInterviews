// A simple script to seed data directly using our models
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import MatchRequest from './models/MatchRequest.js';
import InterviewSlot from './models/InterviewSlot.js';
import { startMongoMemoryServer } from './config/mongodb.js';

dotenv.config();

// MongoDB connection URI from .env or default to local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mockinterviews';

async function connectDatabase() {
  try {
    // If no MONGODB_URI is provided, start the in-memory server
    if (!process.env.MONGODB_URI) {
      console.log('Starting MongoDB Memory Server...');
      await startMongoMemoryServer();
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

async function seedData() {
  try {
    const connected = await connectDatabase();
    if (!connected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }
    
    console.log('Starting to seed data...');
    
    // Clear existing data
    await User.deleteMany({});
    await MatchRequest.deleteMany({});
    await InterviewSlot.deleteMany({});
    
    // Create test users
    const alice = await User.create({
      username: 'alice_dev',
      password: 'password123',
      name: 'Alice Developer',
      email: 'alice@example.com',
      experienceLevel: 'beginner',
      skills: ['JavaScript', 'React', 'HTML', 'CSS'],
      targetRole: 'Frontend Developer',
      bio: 'I am a beginner developer looking to improve my frontend skills.'
    });
    
    const bob = await User.create({
      username: 'bob_coder',
      password: 'password123',
      name: 'Bob Coder',
      email: 'bob@example.com',
      experienceLevel: 'intermediate',
      skills: ['Python', 'Django', 'API Design', 'SQL'],
      targetRole: 'Backend Developer',
      bio: 'Backend developer with 2 years of experience in Python and Django.'
    });
    
    const charlie = await User.create({
      username: 'charlie_tech',
      password: 'password123',
      name: 'Charlie Tech',
      email: 'charlie@example.com',
      experienceLevel: 'advanced',
      skills: ['System Design', 'Java', 'Microservices', 'AWS'],
      targetRole: 'Senior Software Engineer',
      bio: 'Experienced engineer with 7+ years in distributed systems and cloud architecture.'
    });
    
    const dana = await User.create({
      username: 'dana_coding',
      password: 'password123',
      name: 'Dana Coding',
      email: 'dana@example.com',
      experienceLevel: 'beginner',
      skills: ['JavaScript', 'Node.js', 'Express'],
      targetRole: 'Full Stack Developer',
      bio: 'Learning full stack development with a focus on Node.js and React.'
    });
    
    const eli = await User.create({
      username: 'eli_dev',
      password: 'password123',
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
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Run the seeding function
seedData();