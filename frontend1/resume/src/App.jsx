import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';
import Home from './components/Home';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import StudentProfile from './components/StudentProfile';
import AlumniProfile from './components/AlumniProfile';
import AlumniJobs from './components/AlumniJobs';
import StudentJobs from './components/StudentJobs';
import ResuMate from './components/ResuMate';
import Community from './components/community/Community';
import CommunityFeed from './components/community/CommunityFeed';
import CommunityUpcomingEvents from './components/community/CommunityUpcomingEvents';
import CommunityPastEvents from './components/community/CommunityPastEvents';
import CommunityStudentsRequest from './components/community/CommunityStudentsRequest';
import AlumniDirectory from './components/alumni/AlumniDirectory';
import { getUserProfile, isAuthenticated, isProfileComplete, logout } from './lib/authManager';
import './App.css';

// Wrapper to conditionally show navbar
function AppContent({ userProfile, onLogout }) {
  const location = useLocation();
  const hiddenNavbarPaths = ['/profile', '/jobs', '/resumate', '/community', '/alumni-directory'];
  const shouldHideNavbar = isAuthenticated() && isProfileComplete() && 
    hiddenNavbarPaths.some(path => location.pathname.startsWith(path));

  return (
    <>
      {!shouldHideNavbar && <Navbar userProfile={userProfile} onLogout={onLogout} />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Home />} />
        <Route path="/features" element={<Home />} />
        <Route path="/auth" element={
          isAuthenticated() 
            ? <Navigate to="/" replace />
            : <Auth onAuthSuccess={() => window.location.reload()} />
        } />

        {/* Onboarding Route */}
        <Route path="/onboarding" element={
          isAuthenticated() && !isProfileComplete()
            ? <Onboarding />
            : isAuthenticated() && isProfileComplete()
            ? <Navigate to="/" replace />
            : <Navigate to="/auth" replace />
        } />

        {/* Dashboard Routes with Sidebar Layout */}
        {isAuthenticated() && isProfileComplete() && (
          <Route element={<DashboardLayout role={userProfile?.role} />}>
            <Route path="/profile" element={
              userProfile?.role === 'student' ? <StudentProfile /> : <AlumniProfile />
            } />
            <Route path="/jobs" element={
              userProfile?.role === 'alumni' ? <AlumniJobs /> : <StudentJobs />
            } />
            <Route path="/resumate/*" element={<ResuMate />} />
          </Route>
        )}

        {/* Community Routes */}
        {isAuthenticated() && isProfileComplete() && (
          <Route path="/community" element={<Community />}>
            <Route index element={<Navigate to="/community/feed" replace />} />
            <Route path="feed" element={<CommunityFeed />} />
            <Route path="upcoming-events" element={<CommunityUpcomingEvents />} />
            <Route path="past-events" element={<CommunityPastEvents />} />
            <Route path="students-request" element={<CommunityStudentsRequest />} />
          </Route>
        )}

        {/* Alumni Directory Route */}
        {isAuthenticated() && isProfileComplete() && (
          <Route path="/alumni-directory" element={<AlumniDirectory />} />
        )}

        {/* Redirect old routes */}
        <Route path="/student/dashboard" element={<Navigate to="/profile" replace />} />
        <Route path="/alumni/dashboard" element={<Navigate to="/profile" replace />} />
        <Route path="/student/profile" element={<Navigate to="/profile" replace />} />
        <Route path="/alumni/profile" element={<Navigate to="/profile" replace />} />
        <Route path="/mentorship" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  const [userProfile, setUserProfile] = useState(() => {
    return isAuthenticated() ? getUserProfile() : null;
  });

  useEffect(() => {
    if (isAuthenticated()) {
      const profile = getUserProfile();
      if (JSON.stringify(profile) !== JSON.stringify(userProfile)) {
        setUserProfile(profile);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    setUserProfile(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="app">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#171717',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#171717',
              },
            },
          }}
        />
        <AppContent userProfile={userProfile} onLogout={handleLogout} />
      </div>
    </Router>
  );
}

export default App;
