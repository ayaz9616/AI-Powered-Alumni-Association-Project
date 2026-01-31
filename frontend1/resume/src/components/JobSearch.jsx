import { useState } from 'react';
import { jobsAPI } from '../services/api';

function JobSearch() {
  const [formData, setFormData] = useState({
    query: '',
    location: '',
    max_results: 10,
    platform: 'adzuna',
  });
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    if (!formData.query.trim()) {
      alert('Please enter a search query');
      return;
    }

    setLoading(true);
    setJobs([]);

    try {
      const payload = {
        query: formData.query,
        location: formData.location || null,
        max_results: parseInt(formData.max_results),
      };

      const response = await jobsAPI.searchJobs(payload, formData.platform);
      setJobs(response.data.jobs || []);
    } catch (error) {
      alert(error.response?.data?.detail || 'Job search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-search">
      <div className="search-form">
        <h2>🔍 Job Search</h2>
        <p className="description">Find your next opportunity</p>

        <div className="search-inputs">
          <div className="form-group">
            <label>Job Title / Keywords *</label>
            <input
              type="text"
              name="query"
              value={formData.query}
              onChange={handleChange}
              placeholder="e.g., Software Engineer, Data Analyst"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., New York, Remote"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Platform</label>
              <select name="platform" value={formData.platform} onChange={handleChange} disabled={loading}>
                <option value="adzuna">Adzuna</option>
                <option value="jooble">Jooble</option>
              </select>
            </div>

            <div className="form-group">
              <label>Max Results</label>
              <input
                type="number"
                name="max_results"
                value={formData.max_results}
                onChange={handleChange}
                min="1"
                max="50"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <button className="btn-search" onClick={handleSearch} disabled={loading}>
          {loading ? '⏳ Searching...' : '🚀 Search Jobs'}
        </button>
      </div>

      {jobs.length > 0 && (
        <div className="jobs-results">
          <h3>Found {jobs.length} Jobs</h3>
          <div className="jobs-grid">
            {jobs.map((job, idx) => (
              <div key={idx} className="job-card">
                <div className="job-header">
                  <h4>{job.title}</h4>
                  <span className="company">{job.company}</span>
                </div>
                <div className="job-location">📍 {job.location}</div>
                <div className="job-description">
                  {job.description.substring(0, 200)}...
                </div>
                {job.url && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn-apply">
                    Apply Now →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && jobs.length === 0 && formData.query && (
        <div className="no-results">
          <div className="empty-icon">🔍</div>
          <p>No jobs found. Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
}

export default JobSearch;
