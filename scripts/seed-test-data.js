import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../server/models/User.js';
import InterviewSlot from '../server/models/InterviewSlot.js';
import MatchRequest from '../server/models/MatchRequest.js';
import { startMongoMemoryServer } from '../server/config/mongodb.js';

// Load environment variables
dotenv.config();

// Connect to the database
async function connectToDatabase() {
  try {
    let mongoURI;
    
    // Check if we're in the server environment where MongoDB is already running
    if (process.env.MONGODB_URI) {
      mongoURI = process.env.MONGODB_URI;
      console.log('Using existing MongoDB connection');
    } else {
      // Start in-memory MongoDB for standalone script execution
      mongoURI = await startMongoMemoryServer();
      console.log('Started MongoDB Memory Server');
    }

    // Configure mongoose
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

// Seed test data
async function seedTestData() {
  try {
    await connectToDatabase();
    
    // Get all users (already created with create-users-api.js)
    const users = await User.find();
    console.log(`Found ${users.length} users`);
    
    if (users.length === 0) {
      console.error('No users found. Please run create-users-api.js first');
      return;
    }
    
    // Map usernames to user objects
    const userMap = {};
    users.forEach(user => {
      userMap[user.username] = user;
    });
    
    // Check if we have our test users
    const alice = userMap['alice_dev'];
    const bob = userMap['bob_coder'];
    const charlie = userMap['charlie_tech'];
    const dana = userMap['dana_coding'];
    const eli = userMap['eli_dev'];
    
    if (!alice || !bob || !charlie || !dana || !eli) {
      console.error('Missing test users. Please run create-users-api.js first');
      return;
    }
    
    // Create interview slots (senior devs offering interviews)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 0, 0, 0);
    
    // Clear existing interview slots
    await InterviewSlot.deleteMany({});
    console.log('Cleared all existing interview slots');
    
    // Charlie creates an interview slot
    const charlieSlot = new InterviewSlot({
      interviewerId: charlie._id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000),
      topics: ['System Design', 'Java', 'Career Advice'],
      status: 'available',
      meetingType: 'zoom',
      meetingLink: 'https://zoom.us/j/example',
      notes: 'Happy to help with system design interviews or any Java questions',
    });
    await charlieSlot.save();
    console.log(`Created interview slot by Charlie at ${tomorrow.toLocaleString()}`);
    
    // Bob creates an interview slot
    const bobSlot = new InterviewSlot({
      interviewerId: bob._id,
      startTime: dayAfter,
      endTime: new Date(dayAfter.getTime() + 60 * 60 * 1000),
      topics: ['Python', 'Django', 'Backend Development'],
      status: 'available',
      meetingType: 'google-meet',
      meetingLink: 'https://meet.google.com/example',
      notes: 'Can help with backend interview prep and code review',
    });
    await bobSlot.save();
    console.log(`Created interview slot by Bob at ${dayAfter.toLocaleString()}`);
    
    // Eli creates an interview slot
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(15, 0, 0, 0);
    
    const eliSlot = new InterviewSlot({
      interviewerId: eli._id,
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 60 * 60 * 1000),
      topics: ['React', 'CSS', 'Frontend Development'],
      status: 'available',
      meetingType: 'zoom',
      meetingLink: 'https://zoom.us/j/example2',
      notes: 'Frontend interview practice focusing on React and CSS',
    });
    await eliSlot.save();
    console.log(`Created interview slot by Eli at ${nextWeek.toLocaleString()}`);
    
    // Create a slot that's already booked
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() + 3);
    thisWeek.setHours(11, 0, 0, 0);
    
    const bookedSlot = new InterviewSlot({
      interviewerId: charlie._id,
      intervieweeId: alice._id,
      startTime: thisWeek,
      endTime: new Date(thisWeek.getTime() + 60 * 60 * 1000),
      topics: ['JavaScript', 'React', 'Frontend Interviews'],
      status: 'booked',
      meetingType: 'zoom',
      meetingLink: 'https://zoom.us/j/example3',
      notes: 'Mock interview for frontend developer position',
    });
    await bookedSlot.save();
    console.log(`Created booked interview slot between Charlie and Alice at ${thisWeek.toLocaleString()}`);
    
    // Clear existing match requests
    await MatchRequest.deleteMany({});
    console.log('Cleared all existing match requests');
    
    // Alice creates a match request for Charlie
    const aliceRequest = new MatchRequest({
      requesterId: alice._id,
      matchedPeerId: charlie._id,
      targetExperienceLevel: 'advanced',
      targetSkills: ['React', 'JavaScript', 'System Design'],
      preferredTimes: ['Evenings', 'Weekends'],
      status: 'pending',
      notes: 'I would like to practice frontend interview questions focused on React.',
    });
    await aliceRequest.save();
    console.log('Created match request by Alice for Charlie');
    
    // Dana creates a match request for Bob
    const danaRequest = new MatchRequest({
      requesterId: dana._id,
      matchedPeerId: bob._id,
      targetExperienceLevel: 'intermediate',
      targetSkills: ['Node.js', 'Express', 'API Design'],
      preferredTimes: ['Mornings', 'Weekdays'],
      status: 'pending',
      notes: 'Looking for someone to practice pair programming exercises with me.',
    });
    await danaRequest.save();
    console.log('Created match request by Dana for Bob');
    
    // Create an accepted match request
    const acceptedRequest = new MatchRequest({
      requesterId: eli._id,
      matchedPeerId: charlie._id,
      targetExperienceLevel: 'advanced',
      targetSkills: ['System Design', 'Career Growth'],
      preferredTimes: ['Afternoons', 'Weekends'],
      status: 'accepted',
      notes: 'Need help preparing for my senior frontend engineer interview.',
    });
    await acceptedRequest.save();
    console.log('Created accepted match request by Eli for Charlie');
    
    console.log('Successfully seeded test data');
  } catch (error) {
    console.error('Error seeding test data:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Execute the seeding function
seedTestData();