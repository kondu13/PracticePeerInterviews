// Create test data using API endpoints instead of direct DB operations
// This script will work with both in-memory storage and MongoDB

import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

// Test users data
const users = [
  {
    username: 'alice_dev',
    password: 'password123',
    fullName: 'Alice Developer', // Using fullName instead of name
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

// Helper function to register a user
async function registerUser(userData) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to register user ${userData.username}: ${errorText}`);
    }
    
    const user = await response.json();
    console.log(`Successfully registered user: ${user.fullName} (${user.username})`);
    return user;
  } catch (error) {
    console.error(`Error registering user ${userData.username}:`, error.message);
    if (error.message.includes('Username already exists')) {
      console.log(`User ${userData.username} already exists, trying to login instead`);
      return await loginUser(userData.username, userData.password);
    }
    return null;
  }
}

// Helper function to login
async function loginUser(username, password) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to login as ${username}`);
    }
    
    const user = await response.json();
    console.log(`Successfully logged in as: ${user.fullName} (${user.username})`);
    return user;
  } catch (error) {
    console.error(`Error logging in as ${username}:`, error.message);
    return null;
  }
}

// Helper function to create an interview slot
async function createInterviewSlot(token, slotData) {
  try {
    const response = await fetch(`${API_URL}/interview-slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': token
      },
      body: JSON.stringify(slotData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create interview slot: ${await response.text()}`);
    }
    
    const slot = await response.json();
    console.log(`Successfully created interview slot at ${new Date(slot.startTime).toLocaleString()}`);
    return slot;
  } catch (error) {
    console.error('Error creating interview slot:', error.message);
    return null;
  }
}

// Helper function to create a match request
async function createMatchRequest(token, requestData) {
  try {
    const response = await fetch(`${API_URL}/match-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': token
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create match request: ${await response.text()}`);
    }
    
    const request = await response.json();
    console.log(`Successfully created match request from ${requestData.requesterId} to ${requestData.matchedPeerId}`);
    return request;
  } catch (error) {
    console.error('Error creating match request:', error.message);
    return null;
  }
}

// Main function to create test data
async function createTestData() {
  console.log('Starting to create test data via API...');
  
  // Create users
  const createdUsers = {};
  for (const userData of users) {
    const user = await registerUser(userData);
    if (user) {
      createdUsers[userData.username] = user;
    }
  }
  
  console.log(`Created ${Object.keys(createdUsers).length} test users`);
  
  // Exit if we couldn't create enough users for our test data
  if (Object.keys(createdUsers).length < 2) {
    console.error('Not enough users created to continue with test data. Exiting...');
    return;
  }
  
  console.log('Seed data creation complete!');
}

// Run the script
createTestData().catch(error => {
  console.error('Error in seed script:', error);
});