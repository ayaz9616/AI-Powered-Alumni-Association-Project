import { useState, useEffect } from 'react';
import { 
  getAlumniProfile, 
  createAlumniProfile,
  getMySessions,
  acceptSession,
  rejectSession
} from '../services/mentorshipApi';
import { getUserProfile } from '../lib/authManager';

function AlumniDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Profile creation
  const [resumeFile, setResumeFile] = useState(null);
  const [currentRole, setCurrentRole] = useState('');
  const [company, setCompany] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [domainsOfExpertise, setDomainsOfExpertise] = useState('');
  const [mentorshipPreferences, setMentorshipPreferences] = useState('');
  const [creatingProfile, setCreatingProfile] = useState(false);
  
  // Sessions
  const [sessions, setSessions] = useState([]);

  const userProfile = getUserProfile();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getAlumniProfile(userProfile.userId);
      setProfile(response.profile);
      loadSessions();
    } catch (err) {
      console.log('No profile found yet');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await getMySessions();
      setSessions(response.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setCreatingProfile(true);

    try {
      if (!resumeFile) {
        throw new Error('Please upload your resume');
      }

      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('currentRole', currentRole);
      formData.append('company', company);
      formData.append('yearsOfExperience', yearsOfExperience);
      formData.append('domainsOfExpertise', domainsOfExpertise);
      formData.append('mentorshipPreferences', mentorshipPreferences);

      const response = await createAlumniProfile(formData);
      setProfile(response.profile);
      alert('Profile created successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingProfile(false);
    }
  };

  const handleAcceptSession = async (sessionId) => {
    try {
      const meetingLink = prompt('Enter meeting link (Zoom/Google Meet):');
      await acceptSession(sessionId, meetingLink);
      alert('Session accepted!');
      loadSessions();
    } catch (err) {
      alert('Failed to accept session: ' + err.message);
    }
  };

  const handleRejectSession = async (sessionId) => {
    try {
      await rejectSession(sessionId);
      alert('Session rejected');
      loadSessions();
    } catch (err) {
      alert('Failed to reject session: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading your profile...</div>;
  }

  if (!profile) {
    return (
      <div className="alumni-dashboard">
        <h1>🎖️ Alumni Dashboard</h1>
        <p>Welcome {userProfile.name}! Let's create your mentor profile.</p>

        <div className="profile-creation-card">
          <h2>Create Your Alumni Profile</h2>
          <form onSubmit={handleCreateProfile} className="profile-form">
            <div className="form-group">
              <label>Upload Resume (PDF/DOC) *</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Current Role *</label>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>

              <div className="form-group">
                <label>Company *</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Google"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Years of Experience *</label>
              <input
                type="number"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                placeholder="e.g., 5"
                required
              />
            </div>

            <div className="form-group">
              <label>Domains of Expertise (comma-separated) *</label>
              <input
                type="text"
                value={domainsOfExpertise}
                onChange={(e) => setDomainsOfExpertise(e.target.value)}
                placeholder="e.g., backend, system design, cloud"
                required
              />
            </div>

            <div className="form-group">
              <label>Mentorship Preferences</label>
              <textarea
                value={mentorshipPreferences}
                onChange={(e) => setMentorshipPreferences(e.target.value)}
                placeholder="What kind of mentorship do you prefer to provide?"
                rows="3"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={creatingProfile} className="primary-button">
              {creatingProfile ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendingSessions = sessions.filter(s => s.status === 'requested');
  const upcomingSessions = sessions.filter(s => s.status === 'accepted' || s.status === 'scheduled');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="alumni-dashboard">
      <h1>🎖️ Alumni Dashboard</h1>
      <p>Welcome back, {userProfile.name}!</p>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Your Impact</h2>
          <div className="stats">
            <div className="stat-item">
              <div className="stat-value">{profile.sessionsCompleted}</div>
              <div className="stat-label">Sessions Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{profile.averageRating.toFixed(1)}</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{profile.impactScore.toFixed(1)}</div>
              <div className="stat-label">Impact Score</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Your Profile</h2>
          <div className="profile-info">
            <p><strong>Role:</strong> {profile.currentRole}</p>
            <p><strong>Company:</strong> {profile.company}</p>
            <p><strong>Experience:</strong> {profile.yearsOfExperience} years</p>
            <p><strong>Expertise:</strong> {profile.domainsOfExpertise.join(', ')}</p>
          </div>
        </div>

        <div className="card full-width">
          <h2>Pending Session Requests ({pendingSessions.length})</h2>
          {pendingSessions.length === 0 ? (
            <p>No pending requests</p>
          ) : (
            <div className="sessions-list">
              {pendingSessions.map((session) => (
                <div key={session.sessionId} className="session-card pending">
                  <div className="session-info">
                    <p><strong>Date:</strong> {new Date(session.scheduledDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {session.startTime} - {session.endTime}</p>
                    {session.agenda && <p><strong>Agenda:</strong> {session.agenda}</p>}
                  </div>
                  <div className="session-actions">
                    <button onClick={() => handleAcceptSession(session.sessionId)} className="accept-button">
                      ✓ Accept
                    </button>
                    <button onClick={() => handleRejectSession(session.sessionId)} className="reject-button">
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card full-width">
          <h2>Upcoming Sessions ({upcomingSessions.length})</h2>
          {upcomingSessions.length === 0 ? (
            <p>No upcoming sessions</p>
          ) : (
            <div className="sessions-list">
              {upcomingSessions.map((session) => (
                <div key={session.sessionId} className="session-card">
                  <p><strong>Date:</strong> {new Date(session.scheduledDate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {session.startTime} - {session.endTime}</p>
                  {session.meetingLink && (
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                      Join Meeting
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlumniDashboard;
