import fetch from 'node-fetch';

// API URLs
const API_BASE_URL = 'http://localhost:5000/api';
const LOGIN_URL = `${API_BASE_URL}/login`;
const INTERVIEW_SLOT_URL = `${API_BASE_URL}/interview-slots`;
const MATCH_REQUEST_URL = `${API_BASE_URL}/match-requests`;
const USERS_URL = `${API_BASE_URL}/users`;

// Helper to login and get authentication cookie
async function login(username, password) {
  const response = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Login failed for ${username}: ${await response.text()}`);
  }
  
  const cookie = response.headers.get('set-cookie');
  return cookie;
}

// Helper to create an interview slot
async function createInterviewSlot(username, slotData) {
  try {
    // Login first to get cookie
    const cookie = await login(username, 'password123');
    
    // Create interview slot
    const response = await fetch(INTERVIEW_SLOT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie,
      },
      body: JSON.stringify(slotData),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create interview slot: ${await response.text()}`);
    }
    
    const slot = await response.json();
    console.log(`Created interview slot for ${username} at ${new Date(slot.startTime).toLocaleString()}`);
    return slot;
  } catch (error) {
    console.error(`Error creating interview slot for ${username}:`, error.message);
    return null;
  }
}

// Helper to create a match request
async function createMatchRequest(username, requestData) {
  try {
    // Login first to get cookie
    const cookie = await login(username, 'password123');
    
    // Create match request
    const response = await fetch(MATCH_REQUEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie,
      },
      body: JSON.stringify(requestData),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create match request: ${await response.text()}`);
    }
    
    const request = await response.json();
    console.log(`Created match request from ${username} to ${requestData.matchedPeerId}`);
    return request;
  } catch (error) {
    console.error(`Error creating match request for ${username}:`, error.message);
    return null;
  }
}

// Helper to get all users
async function getUsers(username) {
  try {
    // Login first to get cookie
    const cookie = await login(username, 'password123');
    
    // Get users
    const response = await fetch(USERS_URL, {
      headers: {
        'Cookie': cookie,
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get users: ${await response.text()}`);
    }
    
    const users = await response.json();
    return users;
  } catch (error) {
    console.error('Error getting users:', error.message);
    return [];
  }
}

// Main function to create test data
async function createTestData() {
  console.log('Starting to create test data...');
  console.log('Ensure your application is running on http://localhost:5000');
  
  try {
    // Get all users first
    console.log('Fetching users...');
    const users = await getUsers('alice_dev');
    
    if (!users || users.length === 0) {
      console.error('No users found! Please run create-users-api.js first.');
      return;
    }
    
    console.log(`Found ${users.length} users`);
    
    // Find specific users
    const alice = users.find(u => u.username === 'alice_dev');
    const bob = users.find(u => u.username === 'bob_coder');
    const charlie = users.find(u => u.username === 'charlie_tech');
    const dana = users.find(u => u.username === 'dana_coding');
    const eli = users.find(u => u.username === 'eli_dev');
    
    if (!alice || !bob || !charlie || !dana || !eli) {
      console.error('Could not find all required users!');
      return;
    }
    
    // Create interview slots
    console.log('\nCreating interview slots...');
    
    // Tomorrow at 10 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    // Day after tomorrow at 2 PM
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 0, 0, 0);
    
    // Next week at 3 PM
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(15, 0, 0, 0);
    
    // Charlie creates interview slots
    await createInterviewSlot('charlie_tech', {
      startTime: tomorrow.toISOString(),
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(),
      meetingType: 'zoom',
      meetingLink: 'https://zoom.us/j/example',
      notes: 'Happy to help with system design interviews or any Java questions'
    });
    
    // Bob creates interview slots
    await createInterviewSlot('bob_coder', {
      startTime: dayAfter.toISOString(),
      endTime: new Date(dayAfter.getTime() + 60 * 60 * 1000).toISOString(),
      meetingType: 'google-meet',
      meetingLink: 'https://meet.google.com/example',
      notes: 'Can help with backend interview prep and code review'
    });
    
    // Eli creates interview slots
    await createInterviewSlot('eli_dev', {
      startTime: nextWeek.toISOString(),
      endTime: new Date(nextWeek.getTime() + 60 * 60 * 1000).toISOString(),
      meetingType: 'zoom',
      meetingLink: 'https://zoom.us/j/example2',
      notes: 'Frontend interview practice focusing on React and CSS'
    });
    
    // Create match requests
    console.log('\nCreating match requests...');
    
    // Alice creates a match request for Charlie
    await createMatchRequest('alice_dev', {
      matchedPeerId: charlie.id,
      targetExperienceLevel: 'advanced',
      targetSkills: ['React', 'JavaScript', 'System Design'],
      preferredTimes: ['Evenings', 'Weekends'],
      notes: 'I would like to practice frontend interview questions focused on React.'
    });
    
    // Dana creates a match request for Bob
    await createMatchRequest('dana_coding', {
      matchedPeerId: bob.id,
      targetExperienceLevel: 'intermediate',
      targetSkills: ['Node.js', 'Express', 'API Design'],
      preferredTimes: ['Mornings', 'Weekdays'],
      notes: 'Looking for someone to practice pair programming exercises with me.'
    });
    
    // Eli creates a match request for Charlie
    await createMatchRequest('eli_dev', {
      matchedPeerId: charlie.id,
      targetExperienceLevel: 'advanced',
      targetSkills: ['System Design', 'Career Growth'],
      preferredTimes: ['Afternoons', 'Weekends'],
      notes: 'Need help preparing for my senior frontend engineer interview.'
    });
    
    console.log('\nTest data creation completed successfully!');
    
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

// Execute the function
createTestData().catch(error => {
  console.error('Unhandled error in create-test-data script:', error);
  process.exit(1);
});