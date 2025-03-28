import fetch from 'node-fetch';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

// Helper for password hashing
const scryptAsync = promisify(scrypt);

// Password hash function for creating passwords that can be compared by passport
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// API endpoint for creating users
const API_URL = 'http://localhost:5000/api/register';

// Create a user through the API
async function createUser(userData) {
  try {
    const hashedPassword = await hashPassword(userData.password);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        password: hashedPassword,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create user ${userData.username}: ${errorText}`);
      return null;
    }
    
    const user = await response.json();
    console.log(`Created user: ${user.username}`);
    return user;
  } catch (error) {
    console.error(`Error creating user ${userData.username}:`, error);
    return null;
  }
}

// Create all test users using the API
async function createAllUsers() {
  const users = [
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
    }
  ];
  
  console.log('Starting to create users through the API...');
  console.log('Ensure your application is running on http://localhost:5000');
  
  const results = [];
  for (const userData of users) {
    const user = await createUser(userData);
    if (user) results.push(user);
  }
  
  console.log('------------------------------------');
  console.log(`Successfully created ${results.length} out of ${users.length} users`);
  console.log('You can now login with any of the created accounts, for example:');
  console.log('- alice_dev / password123 (beginner)');
  console.log('- bob_coder / password123 (intermediate)');
  console.log('- charlie_tech / password123 (advanced)');
}

// Execute the function
createAllUsers().catch(error => {
  console.error('Error in create-users-api script:', error);
  process.exit(1);
});