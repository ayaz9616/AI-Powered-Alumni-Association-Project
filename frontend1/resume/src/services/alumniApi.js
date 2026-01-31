import api from './api';

// Get all alumni with filters
export const getAlumni = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.course) params.append('course', filters.course);
    if (filters.batch) params.append('batch', filters.batch);
    if (filters.city) params.append('city', filters.city);
    if (filters.company) params.append('company', filters.company);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/api/alumni?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alumni:', error);
    throw error;
  }
};

// Get alumni statistics
export const getAlumniStats = async () => {
  try {
    const response = await api.get('/api/alumni/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching alumni stats:', error);
    throw error;
  }
};

// Get single alumni by ID
export const getAlumniById = async (id) => {
  try {
    const response = await api.get(`/api/alumni/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alumni:', error);
    throw error;
  }
};
