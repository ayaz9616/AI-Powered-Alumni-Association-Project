import { useState, useEffect } from 'react';
import { 
  getAdminOverview,
  getAlumniPerformance,
  getFeedbackSummary,
  getPopularDomains
} from '../services/mentorshipApi';

function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [topAlumni, setTopAlumni] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [domains, setDomains] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewRes, alumniRes, feedbackRes, domainsRes] = await Promise.all([
        getAdminOverview(),
        getAlumniPerformance(10),
        getFeedbackSummary(),
        getPopularDomains()
      ]);

      setOverview(overviewRes.overview);
      setTopAlumni(alumniRes.topAlumni || []);
      setFeedback(feedbackRes.feedbackSummary);
      setDomains(domainsRes.popularDomains);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>👨‍💼 Admin Dashboard</h1>
      <p>Platform Analytics & Insights</p>

      {overview && (
        <>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-value">{overview.users.total}</div>
              <div className="stat-label">Total Users</div>
              <div className="stat-breakdown">
                {overview.users.students} Students | {overview.users.alumni} Alumni
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{overview.profiles.studentProfiles}</div>
              <div className="stat-label">Student Profiles</div>
              <div className="stat-breakdown">
                {overview.profiles.profileCompletionRate.students} completion
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{overview.profiles.alumniProfiles}</div>
              <div className="stat-label">Alumni Profiles</div>
              <div className="stat-breakdown">
                {overview.profiles.profileCompletionRate.alumni} completion
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{overview.sessions.completed}</div>
              <div className="stat-label">Sessions Completed</div>
              <div className="stat-breakdown">
                {overview.sessions.completionRate} completion rate
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{overview.sessions.pending}</div>
              <div className="stat-label">Pending Requests</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{overview.sessions.total}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
          </div>

          {/* Top Alumni */}
          <div className="section-card">
            <h2>🏆 Top Performing Alumni</h2>
            {topAlumni.length === 0 ? (
              <p>No data yet</p>
            ) : (
              <div className="alumni-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Company</th>
                      <th>Sessions</th>
                      <th>Rating</th>
                      <th>Impact Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAlumni.map((alum, idx) => (
                      <tr key={idx}>
                        <td>{alum.name}</td>
                        <td>{alum.currentRole}</td>
                        <td>{alum.company}</td>
                        <td>{alum.sessionsCompleted}</td>
                        <td>{alum.averageRating}</td>
                        <td>{alum.impactScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Feedback Summary */}
          {feedback && feedback.totalFeedbacks > 0 && (
            <div className="section-card">
              <h2>📊 Feedback Summary</h2>
              <div className="feedback-stats">
                <div className="feedback-item">
                  <span>Total Feedbacks:</span>
                  <strong>{feedback.totalFeedbacks}</strong>
                </div>
                <div className="feedback-item">
                  <span>Avg Rating:</span>
                  <strong>{feedback.averages.rating} / 5</strong>
                </div>
                <div className="feedback-item">
                  <span>Avg Usefulness:</span>
                  <strong>{feedback.averages.usefulness} / 5</strong>
                </div>
                <div className="feedback-item">
                  <span>Avg Clarity:</span>
                  <strong>{feedback.averages.clarity} / 5</strong>
                </div>
              </div>

              <h3>Rating Distribution</h3>
              <div className="rating-bars">
                {feedback.ratingDistribution.map((item) => (
                  <div key={item.rating} className="rating-bar">
                    <span className="rating-label">{item.rating} ⭐</span>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(item.count / feedback.totalFeedbacks) * 100}%`
                        }}
                      />
                    </div>
                    <span className="rating-count">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Domains */}
          {domains && (
            <div className="section-card">
              <h2>🔥 Popular Domains</h2>
              <div className="domains-grid">
                <div>
                  <h3>Student Preferences</h3>
                  <ul className="domains-list">
                    {domains.studentPreferences.slice(0, 10).map((d, idx) => (
                      <li key={idx}>
                        <span>{d.domain}</span>
                        <span className="domain-count">{d.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Alumni Expertise</h3>
                  <ul className="domains-list">
                    {domains.alumniExpertise.slice(0, 10).map((d, idx) => (
                      <li key={idx}>
                        <span>{d.domain}</span>
                        <span className="domain-count">{d.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
