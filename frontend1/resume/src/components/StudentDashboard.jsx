import { useState, useEffect } from 'react';
import { 
  getStudentProfile, 
  createStudentProfile, 
  findMentors,
  requestSession,
  getMySessions 
} from '../services/mentorshipApi';
import { getUserProfile } from '../lib/authManager';

function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Profile creation form
  const [resumeFile, setResumeFile] = useState(null);
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('1');
  const [careerGoals, setCareerGoals] = useState('');
  const [preferredDomains, setPreferredDomains] = useState('');
  const [mentorshipExpectations, setMentorshipExpectations] = useState('');
  const [creatingProfile, setCreatingProfile] = useState(false);
  
  // Mentor matching
  const [mentors, setMentors] = useState([]);
  const [findingMentors, setFindingMentors] = useState(false);
  
  // Sessions
  const [sessions, setSessions] = useState([]);

  const userProfile = getUserProfile();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getStudentProfile(userProfile.userId);
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
      formData.append('branch', branch);
      formData.append('year', year);
      formData.append('careerGoals', careerGoals);
      formData.append('preferredDomains', preferredDomains);
      formData.append('mentorshipExpectations', mentorshipExpectations);

      const response = await createStudentProfile(formData);
      setProfile(response.profile);
      alert('Profile created successfully! n8n is parsing your resume...');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingProfile(false);
    }
  };

  const handleFindMentors = async () => {
    setFindingMentors(true);
    setError('');
    
    try {
      const response = await findMentors(userProfile.userId, 10);
      setMentors(response.matches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setFindingMentors(false);
    }
  };

  const handleRequestSession = async (alumniId) => {
    try {
      const scheduledDate = prompt('Enter date (YYYY-MM-DD):');
      const startTime = prompt('Enter start time (HH:MM):');
      const endTime = prompt('Enter end time (HH:MM):');
      const agenda = prompt('Session agenda:');

      if (!scheduledDate || !startTime || !endTime) {
        alert('All fields are required');
        return;
      }

      await requestSession({
        alumniId,
        sessionType: '1:1',
        scheduledDate,
        startTime,
        endTime,
        agenda
      });

      alert('Session request sent successfully!');
      loadSessions();
    } catch (err) {
      alert('Failed to request session: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading your profile...</div>;
  }

  if (!profile) {
    return (
      <div className="student-dashboard">
        <h1>🎓 Student Dashboard</h1>
        <p>Welcome {userProfile.name}! Let's create your profile.</p>

        <div className="profile-creation-card">
          <h2>Create Your Student Profile</h2>
          <form onSubmit={handleCreateProfile} className="profile-form">
            <div className="form-group">
              <label>Upload Resume (PDF/DOC) *</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
                required
              />
              <small>n8n will parse your resume automatically</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>

              <div className="form-group">
                <label>Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} required>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Career Goals *</label>
              <textarea
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                placeholder="What's your dream job or career path?"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Preferred Domains (comma-separated)</label>
              <input
                type="text"
                value={preferredDomains}
                onChange={(e) => setPreferredDomains(e.target.value)}
                placeholder="e.g., backend, web development, AI, ML"
              />
            </div>

            <div className="form-group">
              <label>Mentorship Expectations</label>
              <textarea
                value={mentorshipExpectations}
                onChange={(e) => setMentorshipExpectations(e.target.value)}
                placeholder="What do you hope to gain from mentorship?"
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

  return (
    <div className="student-dashboard">
      <h1>🎓 Student Dashboard</h1>
      <p>Welcome back, {userProfile.name}!</p>

      <div className="dashboard-grid">
        {/* Profile Summary */}
        <div className="card">
          <h2>Your Profile</h2>
          <div className="profile-info">
            <p><strong>Branch:</strong> {profile.branch}</p>
            <p><strong>Year:</strong> {profile.year}</p>
            <p><strong>Career Goals:</strong> {profile.careerGoals}</p>
            <p><strong>Skills:</strong> {profile.parsedResume.skills.join(', ')}</p>
            {profile.atsScore && (
              <p><strong>ATS Score:</strong> {profile.atsScore}/100</p>
            )}
          </div>
        </div>

        {/* Find Mentors */}
        <div className="card">
          <h2>Find Mentors</h2>
          <button 
            onClick={handleFindMentors} 
            disabled={findingMentors}
            className="primary-button"
          >
            {findingMentors ? 'Finding Mentors...' : '🔍 Find Matching Mentors'}
          </button>

          {mentors.length > 0 && (
            <div className="mentors-list">
              <h3>Top Matches</h3>
              {mentors.map((match, idx) => (
                <div key={idx} className="mentor-card">
                  <div className="mentor-info">
                    <h4>{match.alumni.name}</h4>
                    <p>{match.alumni.currentRole} at {match.alumni.company}</p>
                    <p><strong>Match Score:</strong> {(match.matchScore * 100).toFixed(0)}%</p>
                    <p><strong>Domains:</strong> {match.alumni.domainsOfExpertise.join(', ')}</p>
                    <p><strong>Why:</strong> {match.reasons[0]}</p>
                  </div>
                  <button 
                    onClick={() => handleRequestSession(match.alumni.userId)}
                    className="secondary-button"
                  >
                    Request Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Sessions */}
        <div className="card full-width">
          <h2>My Sessions</h2>
          {sessions.length === 0 ? (
            <p>No sessions yet. Find mentors and request a session!</p>
          ) : (
            <div className="sessions-list">
              {sessions.map((session) => (
                <div key={session.sessionId} className="session-card">
                  <p><strong>Status:</strong> {session.status}</p>
                  <p><strong>Date:</strong> {new Date(session.scheduledDate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {session.startTime} - {session.endTime}</p>
                  {session.agenda && <p><strong>Agenda:</strong> {session.agenda}</p>}
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

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default StudentDashboard;
