import { MongoMemoryServer } from 'mongodb-memory-server';
import { startMongoMemoryServer } from '../server/config/mongodb.js';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import mongoose from 'mongoose';

// Ensure connection closes when script ends
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  });
});

// Helper for password hashing
const scryptAsync = promisify(scrypt);

// Password hash function
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// Start the MongoDB memory server
async function setup() {
  // Start MongoDB in-memory server
  const mongoUri = await startMongoMemoryServer();
  console.log(`MongoDB Memory Server started at: ${mongoUri}`);
  
  // Connect to database
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Import models
    import('../server/models/User.js').then(module => {
      const User = module.default;
      import('../server/models/MatchRequest.js').then(module => {
        const MatchRequest = module.default;
        import('../server/models/InterviewSlot.js').then(module => {
          const InterviewSlot = module.default;
          
          // Now seed the database with the imported models
          seedDatabase(User, MatchRequest, InterviewSlot);
        });
      });
    });
    
    // Clear existing data
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
    console.log('You can now login with any of the following accounts:');
    console.log('- alice_dev / password123 (beginner)');
    console.log('- bob_coder / password123 (intermediate)');
    console.log('- charlie_tech / password123 (advanced)');
    console.log('- dana_coding / password123 (beginner)');
    console.log('- eli_dev / password123 (intermediate)');
    
    // Clean up
    mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

setup();