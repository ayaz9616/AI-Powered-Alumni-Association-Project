/**
 * Community API Test Script
 * Run this in browser console or use Postman to test endpoints
 */

// Configuration
const API_BASE = 'http://localhost:8000/api/community';
const TEST_USER_ID = 'test_user_' + Date.now();

// Set up test user in localStorage
localStorage.setItem('resumate_user_id', TEST_USER_ID);
localStorage.setItem('resumate_user_name', 'Test User');
localStorage.setItem('resumate_user_role', 'student');
localStorage.setItem('resumate_user_branch', 'CSE');

console.log('✅ Test user created:', TEST_USER_ID);

// Helper function for API calls
async function apiCall(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': TEST_USER_ID
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    console.log(`${method} ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Error in ${method} ${endpoint}:`, error);
    return null;
  }
}

// Test Suite
async function runTests() {
  console.log('\n🧪 Starting Community API Tests...\n');
  
  // Test 1: Create a post
  console.log('📝 Test 1: Create Post');
  const post = await apiCall('POST', '/feed/create', {
    title: 'My First Post',
    content: 'Testing the community feed feature!',
    authorName: 'Test User',
    authorRole: 'student',
    authorBranch: 'CSE'
  });
  
  // Test 2: Get all posts
  console.log('\n📋 Test 2: Get All Posts');
  const posts = await apiCall('GET', '/feed');
  
  // Test 3: Vote on post
  if (post?.post?.postId) {
    console.log('\n👍 Test 3: Upvote Post');
    await apiCall('POST', `/feed/${post.post.postId}/vote`, {
      voteType: 'upvote'
    });
  }
  
  // Test 4: Create session request
  console.log('\n🎓 Test 4: Create Session Request');
  const session = await apiCall('POST', '/session-requests/create', {
    topic: 'Interview Preparation',
    description: 'Need help with DSA and system design',
    proposedByName: 'Test User'
  });
  
  // Test 5: Vote on session
  if (session?.session?.sessionId) {
    console.log('\n✅ Test 5: Vote on Session');
    await apiCall('POST', `/session-requests/${session.session.sessionId}/vote`);
  }
  
  // Test 6: Get session requests
  console.log('\n📊 Test 6: Get Session Requests');
  const sessions = await apiCall('GET', '/session-requests');
  
  // Test 7: Create event (as alumni)
  console.log('\n📅 Test 7: Create Event');
  localStorage.setItem('resumate_user_role', 'alumni');
  const event = await apiCall('POST', '/events/create', {
    title: 'Tech Talk: AI & ML',
    description: 'Learn about latest AI trends',
    date: '2026-03-15',
    time: '18:00',
    duration: '2 hours',
    location: 'Online',
    meetLink: 'https://meet.google.com/test',
    hostName: 'Test Alumni',
    hostRole: 'alumni'
  });
  
  // Test 8: Get upcoming events
  console.log('\n📆 Test 8: Get Upcoming Events');
  const upcomingEvents = await apiCall('GET', '/events/upcoming');
  
  // Test 9: Join event
  if (event?.event?.eventId) {
    console.log('\n🎉 Test 9: Join Event');
    localStorage.setItem('resumate_user_role', 'student');
    await apiCall('POST', `/events/${event.event.eventId}/join`);
  }
  
  // Test 10: Get notifications
  console.log('\n🔔 Test 10: Get Notifications');
  const notifications = await apiCall('GET', '/notifications');
  
  console.log('\n✅ All tests completed!\n');
  console.log('Summary:');
  console.log('- Posts:', posts?.posts?.length || 0);
  console.log('- Sessions:', sessions?.sessions?.length || 0);
  console.log('- Events:', upcomingEvents?.events?.length || 0);
  console.log('- Notifications:', notifications?.notifications?.length || 0);
}

// Run tests
console.log('🚀 Community API Test Suite Ready');
console.log('Run runTests() to execute all tests');
console.log('Or use individual apiCall() functions for specific tests');

// Uncomment to auto-run tests
// runTests();

// Export functions for manual testing
window.communityTests = {
  runTests,
  apiCall,
  API_BASE,
  TEST_USER_ID
};
