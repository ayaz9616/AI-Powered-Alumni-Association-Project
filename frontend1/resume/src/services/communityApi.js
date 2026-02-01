import axios from 'axios';

const API_URL = 'http://localhost:8000/api/community';

// Helper to get user ID from localStorage
const getUserId = () => {
  return localStorage.getItem('resumate_user_id');
};

// Helper to get user data
const getUserData = () => {
  const userId = localStorage.getItem('resumate_user_id');
  const userName = localStorage.getItem('resumate_user_name');
  const userRole = localStorage.getItem('resumate_user_role');
  const userBranch = localStorage.getItem('resumate_user_branch') || '';
  
  return { userId, userName, userRole, userBranch };
};

// ==================== FEED API ====================

export const getFeedPosts = async (page = 1, limit = 20) => {
  try {
    const userId = getUserId();
    const response = await axios.get(`${API_URL}/feed`, {
      params: { page, limit },
      headers: {
        'x-user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    throw error;
  }
};

export const createPost = async (title, content) => {
  try {
    const { userId, userName, userRole, userBranch } = getUserData();
    
    if (!userId || !userName || !userRole) {
      throw new Error('User authentication required');
    }
    
    const response = await axios.post(
      `${API_URL}/feed/create`,
      {
        title,
        content,
        authorName: userName,
        authorRole: userRole,
        authorBranch: userBranch
      },
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const voteOnPost = async (postId, voteType) => {
  try {
    const userId = getUserId();
    const response = await axios.post(
      `${API_URL}/feed/${postId}/vote`,
      { voteType },
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error voting on post:', error);
    throw error;
  }
};

export const addComment = async (postId, content) => {
  try {
    const { userId, userName, userRole } = getUserData();
    
    const response = await axios.post(
      `${API_URL}/feed/${postId}/comment`,
      {
        content,
        userName,
        userRole
      },
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const updateComment = async (postId, commentId, content) => {
  try {
    const userId = getUserId();
    
    const response = await axios.put(
      `${API_URL}/feed/${postId}/comment/${commentId}`,
      { content },
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

export const deleteComment = async (postId, commentId) => {
  try {
    const userId = getUserId();
    
    const response = await axios.delete(
      `${API_URL}/feed/${postId}/comment/${commentId}`,
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const userId = getUserId();
    const response = await axios.delete(`${API_URL}/feed/${postId}`, {
      headers: {
        'x-user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// ==================== EVENTS API ====================

export const getAllEvents = async (status, hostId) => {
  try {
    const userId = getUserId();
    const response = await axios.get(`${API_URL}/events`, {
      params: { status, hostId },
      headers: {
        'x-user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const getUpcomingEvents = async () => {
  try {
    const userId = getUserId();
    const response = await axios.get(`${API_URL}/events/upcoming`, {
      headers: {
        'x-user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

export const getPastEvents = async () => {
  try {
    const userId = getUserId();
    const response = await axios.get(`${API_URL}/events/past`, {
      headers: {
        'x-user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching past events:', error);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    const { userId, userName, userRole } = getUserData();
    
    const response = await axios.post(
      `${API_URL}/events/create`,
      {
        ...eventData,
        hostName: userName,
        hostRole: userRole
      },
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const joinEvent = async (eventId) => {
  try {
    const userId = getUserId();
    const response = await axios.post(
      `${API_URL}/events/${eventId}/join`,
      {},
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error joining event:', error);
    throw error;
  }
};

export const updateEventStatus = async (eventId, status) => {
  try {
    const userId = getUserId();
    const response = await axios.put(
      `${API_URL}/events/${eventId}/status`,
      { status },
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating event status:', error);
    throw error;
  }
};

export const addEventComment = async (eventId, content) => {
  try {
    const { userId, userName, userRole } = getUserData();
    
    const response = await axios.post(
      `${API_URL}/events/${eventId}/comment`,
      {
        content,
        userName,
        userRole
      },
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding event comment:', error);
    throw error;
  }
};

// ==================== SESSION REQUESTS API ====================

export const getSessionRequests = async (status) => {
  try {
    const userId = getUserId();
    const response = await axios.get(`${API_URL}/session-requests`, {
      params: { status },
      headers: {
        'x-user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching session requests:', error);
    throw error;
  }
};

export const createSessionRequest = async (topic, description) => {
  try {
    const { userId, userName } = getUserData();
    
    const response = await axios.post(
      `${API_URL}/session-requests/create`,
      {
        topic,
        description,
        proposedByName: userName
      },
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating session request:', error);
    throw error;
  }
};

export const voteOnSession = async (sessionId) => {
  try {
    const userId = getUserId();
    const response = await axios.post(
      `${API_URL}/session-requests/${sessionId}/vote`,
      {},
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error voting on session:', error);
    throw error;
  }
};

export const updateSessionRequest = async (sessionId, topic, description) => {
  try {
    const userId = getUserId();
    const response = await axios.put(
      `${API_URL}/session-requests/${sessionId}`,
      { topic, description },
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating session request:', error);
    throw error;
  }
};

export const deleteSessionRequest = async (sessionId) => {
  try {
    const userId = getUserId();
    const response = await axios.delete(
      `${API_URL}/session-requests/${sessionId}`,
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting session request:', error);
    throw error;
  }
};

export const scheduleSession = async (sessionId, scheduleDetails) => {
  try {
    const { userId, userName } = getUserData();
    
    const response = await axios.post(
      `${API_URL}/session-requests/${sessionId}/schedule`,
      {
        ...scheduleDetails,
        scheduledByName: userName
      },
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error scheduling session:', error);
    throw error;
  }
};

// ==================== NOTIFICATIONS API ====================

export const getNotifications = async (unreadOnly = false) => {
  try {
    const userId = getUserId();
    const response = await axios.get(`${API_URL}/notifications`, {
      params: { unreadOnly: unreadOnly.toString() },
      headers: {
        'x-user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const userId = getUserId();
    const response = await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const userId = getUserId();
    const response = await axios.put(
      `${API_URL}/notifications/read-all`,
      {},
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};
