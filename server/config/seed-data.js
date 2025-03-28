import { storage } from '../storage.js';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

export async function seedTestUsers() {
  try {
    // Check if we already have users
    const existingUsers = await storage.getUsers();
    if (existingUsers.length > 0) {
      console.log('Database already has users, skipping seed');
      return;
    }

    // Test users data
    const users = [
      {
        username: 'alice',
        password: await hashPassword('alice123'),
        fullName: 'Alice Johnson',
        email: 'alice@example.com',
        skills: ['JavaScript', 'React', 'Node.js'],
        experienceLevel: 'Junior',
        targetRole: 'Frontend Developer',
        bio: 'Junior developer with 1 year of experience in web development.'
      },
      {
        username: 'bob',
        password: await hashPassword('bob123'),
        fullName: 'Bob Smith',
        email: 'bob@example.com',
        skills: ['Python', 'Django', 'Flask'],
        experienceLevel: 'Mid-level',
        targetRole: 'Backend Developer',
        bio: 'Mid-level developer with 3 years of experience in backend technologies.'
      },
      {
        username: 'charlie',
        password: await hashPassword('charlie123'),
        fullName: 'Charlie Davis',
        email: 'charlie@example.com',
        skills: ['Java', 'Spring', 'Hibernate'],
        experienceLevel: 'Senior',
        targetRole: 'Software Architect',
        bio: 'Senior developer with 7 years of experience in enterprise applications.'
      },
      {
        username: 'dana',
        password: await hashPassword('dana123'),
        fullName: 'Dana Martinez',
        email: 'dana@example.com',
        skills: ['C#', '.NET', 'SQL'],
        experienceLevel: 'Mid-level',
        targetRole: 'Full Stack Developer',
        bio: 'Mid-level developer with 4 years of experience in full stack development.'
      },
      {
        username: 'eli',
        password: await hashPassword('eli123'),
        fullName: 'Eli Wong',
        email: 'eli@example.com',
        skills: ['Ruby', 'Rails', 'PostgreSQL'],
        experienceLevel: 'Senior',
        targetRole: 'Lead Developer',
        bio: 'Senior developer with 6 years of experience leading development teams.'
      }
    ];

    // Create users
    for (const user of users) {
      await storage.createUser(user);
    }

    console.log('Test users seeded successfully');

    // Create some test interview slots
    const now = new Date();
    
    // Create slots for the next 7 days
    for (let i = 1; i <= 7; i++) {
      const slotDate = new Date(now);
      slotDate.setDate(now.getDate() + i);
      
      // Morning slot
      slotDate.setHours(10, 0, 0, 0);
      
      // Create a slot for each user
      for (let userId = 1; userId <= 5; userId++) {
        await storage.createInterviewSlot({
          interviewerId: userId,
          slotTime: new Date(slotDate),
          duration: 60,
          topic: 'General Technical Interview',
          notes: 'Practice for coding interviews.',
          status: 'Available'
        });
        
        // Add an afternoon slot too
        const afternoonDate = new Date(slotDate);
        afternoonDate.setHours(14, 0, 0, 0);
        
        await storage.createInterviewSlot({
          interviewerId: userId,
          slotTime: afternoonDate,
          duration: 60,
          topic: 'Behavioral Interview',
          notes: 'Practice for behavioral questions.',
          status: 'Available'
        });
      }
    }

    console.log('Test interview slots seeded successfully');

    // Create some test match requests
    const matchRequests = [
      { requesterId: 1, matchedPeerId: 2, message: 'Would love to practice React interviews with you!', status: 'Pending' },
      { requesterId: 3, matchedPeerId: 5, message: 'Looking for Java interview practice partner.', status: 'Pending' },
      { requesterId: 2, matchedPeerId: 4, message: 'Can we practice Django interviews?', status: 'Accepted' },
      { requesterId: 5, matchedPeerId: 1, message: 'Need Rails interview practice.', status: 'Pending' },
      { requesterId: 4, matchedPeerId: 3, message: 'Looking for .NET mock interview partner.', status: 'Rejected' }
    ];

    for (const request of matchRequests) {
      await storage.createMatchRequest(request);
    }

    console.log('Test match requests seeded successfully');

    // Book some interview slots
    // Bob books Alice's morning slot
    const aliceSlot = (await storage.getAvailableSlots()).find(
      slot => slot.interviewerId === 1 && new Date(slot.slotTime).getHours() === 10
    );
    
    if (aliceSlot) {
      await storage.bookInterviewSlot(aliceSlot.id, 2); // Bob books Alice's slot
    }
    
    // Charlie books Dana's afternoon slot
    const danaSlot = (await storage.getAvailableSlots()).find(
      slot => slot.interviewerId === 4 && new Date(slot.slotTime).getHours() === 14
    );
    
    if (danaSlot) {
      await storage.bookInterviewSlot(danaSlot.id, 3); // Charlie books Dana's slot
    }

    console.log('Test bookings completed successfully');

  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
}