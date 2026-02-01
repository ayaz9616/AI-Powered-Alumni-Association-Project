import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Settings API
export const settingsAPI = {
  getSettings: (userId = 1) => api.get(`/api/settings?user_id=${userId}`),
  updateSettings: (settings, userId = 1) => api.put(`/api/settings?user_id=${userId}`, settings),
};

// Resume API
export const resumeAPI = {
  uploadResume: (file, userId = 1) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/resume/upload?user_id=${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  listResumes: (userId = 1) => api.get(`/api/resume/list?user_id=${userId}`),
  analyzeResume: (data, resumeId = null, userId = 1) => {
    const params = new URLSearchParams({ user_id: userId });
    if (resumeId) params.append('resume_id', resumeId);
    return api.post(`/api/resume/analyze?${params}`, data);
  },
  improveResume: (data, resumeId = null, userId = 1) => {
    const params = new URLSearchParams({ user_id: userId });
    if (resumeId) params.append('resume_id', resumeId);
    return api.post(`/api/resume/improve?${params}`, data);
  },
  askQuestion: (data, resumeId = null, userId = 1) => {
    const params = new URLSearchParams({ user_id: userId });
    if (resumeId) params.append('resume_id', resumeId);
    return api.post(`/api/resume/ask?${params}`, data);
  },
};

// Interview API
export const interviewAPI = {
  startInterview: (data, resumeId = null, userId = 1) => {
    const params = new URLSearchParams({ user_id: userId });
    if (resumeId) params.append('resume_id', resumeId);
    return api.post(`/api/interview/start?${params}`, data);
  },
  submitAnswer: (interviewId, data, userId = 1) => {
    return api.post(`/api/interview/submit?interview_id=${interviewId}&user_id=${userId}`, data);
  },
  getSummary: (interviewId, userId = 1) => {
    return api.get(`/api/interview/summary/${interviewId}?user_id=${userId}`);
  },
};

// Job Search API
export const jobsAPI = {
  searchJobs: (data, platform = 'adzuna', userId = 1) => {
    return api.post(`/api/jobs/search?platform=${platform}&user_id=${userId}`, data);
  },
};

// Health check
export const healthCheck = () => api.get('/api/health');

// Donation API
export const donationAPI = {
  createOrder: (data) => api.post(`/api/donations/order`, data),
  verifyPayment: (data) => api.post(`/api/donations/verify`, data),
};

export default api;
