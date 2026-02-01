import { getUserId } from '../lib/authManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Generic API client with authentication headers
 */
class MentorshipAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const userId = getUserId();
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(text || `HTTP ${response.status}`);
        }
        return { success: true, data: text };
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async uploadFile(endpoint, formData) {
    const userId = getUserId();
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-user-id': userId
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Upload Error [${endpoint}]:`, error);
      throw error;
    }
  }
}

const api = new MentorshipAPI();

// ==================== PARSE RESUME ====================

export const parseResume = async (formData) => {
  return api.uploadFile('/api/mentorship/parse-resume', formData);
};

// ==================== USER MANAGEMENT ====================

export const loginUser = async (email, password) => {
  return api.post('/api/mentorship/user/login', { email, password });
};

export const registerUser = async (userData) => {
  return api.post('/api/mentorship/user/register', userData);
};

export const getUser = async (userId) => {
  return api.get(`/api/mentorship/user/${userId}`);
};

// ==================== STUDENT PROFILE ====================

export const createStudentProfile = async (formData) => {
  return api.uploadFile('/api/mentorship/student/profile/create', formData);
};

export const createStudentProfileManual = async (profileData) => {
  return api.post('/api/mentorship/student/profile/manual', profileData);
};

export const getStudentProfile = async (userId) => {
  return api.get(`/api/mentorship/student/profile/${userId}`);
};

export const updateStudentProfile = async (userId, updates) => {
  return api.put(`/api/mentorship/student/profile/${userId}`, updates);
};

export const findMentors = async (userId, limit = 10) => {
  return api.post(`/api/mentorship/student/${userId}/find-mentors`, { limit });
};

// ==================== ALUMNI PROFILE ====================

export const createAlumniProfile = async (formData) => {
  return api.uploadFile('/api/mentorship/alumni/profile/create', formData);
};

export const createAlumniProfileManual = async (profileData) => {
  return api.post('/api/mentorship/alumni/profile/manual', profileData);
};

export const getAlumniProfile = async (userId) => {
  return api.get(`/api/mentorship/alumni/profile/${userId}`);
};

export const updateAlumniProfile = async (userId, updates) => {
  return api.put(`/api/mentorship/alumni/profile/${userId}`, updates);
};

export const updateAlumniAvailability = async (userId, availabilitySlots) => {
  return api.put(`/api/mentorship/alumni/profile/${userId}/availability`, { availabilitySlots });
};

export const listAlumni = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/api/mentorship/alumni/list?${params}`);
};

// ==================== SESSIONS ====================

export const requestSession = async (sessionData) => {
  return api.post('/api/mentorship/session/request', sessionData);
};

export const acceptSession = async (sessionId, meetingLink = '') => {
  return api.post(`/api/mentorship/session/${sessionId}/accept`, { meetingLink });
};

export const rejectSession = async (sessionId) => {
  return api.post(`/api/mentorship/session/${sessionId}/reject`);
};

export const completeSession = async (sessionId, notes = '') => {
  return api.post(`/api/mentorship/session/${sessionId}/complete`, { notes });
};

export const getMySessions = async (status = null) => {
  const params = status ? `?status=${status}` : '';
  return api.get(`/api/mentorship/session/my-sessions${params}`);
};

export const getSession = async (sessionId) => {
  return api.get(`/api/mentorship/session/${sessionId}`);
};

// ==================== FEEDBACK ====================

export const submitStudentFeedback = async (sessionId, feedback) => {
  return api.post(`/api/mentorship/session/${sessionId}/feedback/student`, feedback);
};

export const submitAlumniFeedback = async (sessionId, feedback) => {
  return api.post(`/api/mentorship/session/${sessionId}/feedback/alumni`, feedback);
};

// ==================== ADMIN ====================

export const getAdminOverview = async () => {
  return api.get('/api/mentorship/admin/stats/overview');
};

export const getAlumniPerformance = async (limit = 20) => {
  return api.get(`/api/mentorship/admin/stats/alumni-performance?limit=${limit}`);
};

export const getEngagementTrends = async () => {
  return api.get('/api/mentorship/admin/stats/engagement-trends');
};

export const getFeedbackSummary = async () => {
  return api.get('/api/mentorship/admin/stats/feedback-summary');
};

export const getPopularDomains = async () => {
  return api.get('/api/mentorship/admin/stats/popular-domains');
};

// ==================== JOBS ====================

export const createJob = async (jobData) => {
  return api.post('/api/mentorship/jobs/create', jobData);
};

export const getMyJobs = async (status) => {
  const query = status ? `?status=${status}` : '';
  return api.get(`/api/mentorship/jobs/my-jobs${query}`);
};

export const getAllJobs = async () => {
  return api.get('/api/mentorship/jobs/all');
};

export const getJob = async (jobId) => {
  return api.get(`/api/mentorship/jobs/${jobId}`);
};

export const updateJob = async (jobId, jobData) => {
  return api.put(`/api/mentorship/jobs/${jobId}`, jobData);
};

export const deleteJob = async (jobId) => {
  return api.delete(`/api/mentorship/jobs/${jobId}`);
};

export const matchStudentsToJob = async (jobId, filters) => {
  return api.post(`/api/mentorship/jobs/${jobId}/match-students`, filters);
};

export const referStudents = async (jobId, studentIds, alumniNotes) => {
  return api.post(`/api/mentorship/jobs/${jobId}/refer`, { studentIds, alumniNotes });
};

export const getJobReferrals = async (jobId) => {
  return api.get(`/api/mentorship/jobs/${jobId}/referrals`);
};

export const updateReferralStatus = async (referralId, status, notes) => {
  return api.put(`/api/mentorship/jobs/referrals/${referralId}/status`, { status, notes });
};

export const getMyReferrals = async (status) => {
  const query = status ? `?status=${status}` : '';
  return api.get(`/api/mentorship/jobs/my-referrals${query}`);
};

// Student marks interest in a job
export const markJobInterest = async (jobId) => {
  return api.post(`/api/mentorship/jobs/${jobId}/interest`);
};

// Alumni fetch interested students for their job
export const getInterestedStudents = async (jobId) => {
  return api.get(`/api/mentorship/jobs/${jobId}/interested`);
};

export const listAllUsers = async (role = null, limit = 50, skip = 0) => {
  const params = new URLSearchParams({ limit, skip });
  if (role) params.append('role', role);
  return api.get(`/api/mentorship/admin/users/list?${params.toString()}`);
};

export default api;
