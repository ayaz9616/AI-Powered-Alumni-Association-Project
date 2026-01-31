import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ResumeUpload from './ResumeUpload';
import ResumeAnalysis from './ResumeAnalysis';
import ResumeImprovement from './ResumeImprovement';
import ResumeQA from './ResumeQA';
import MockInterview from './MockInterview';
import JobSearch from './JobSearch';
import Settings from './Settings';
import N8nTest from './N8nTest';

function ResuMate() {
  const [activeTab, setActiveTab] = useState('upload');

  const resumeNavItems = [
    { id: 'upload', label: '📄 Upload', path: '/resumate/upload' },
    { id: 'analysis', label: '🎯 Analysis', path: '/resumate/analysis' },
    { id: 'improvement', label: '✨ Improvement', path: '/resumate/improvement' },
    { id: 'qa', label: '💬 Q&A', path: '/resumate/qa' },
    { id: 'interview', label: '🎤 Interview', path: '/resumate/interview' },
    { id: 'jobs', label: '🔍 Job Search', path: '/resumate/jobs' },
    { id: 'n8n', label: '🧪 n8n Test', path: '/resumate/n8n-test' },
    { id: 'settings', label: '⚙️ Settings', path: '/resumate/settings' },
  ];

  return (
    <div className="resumate-container">
      <header className="resumate-header">
        <div className="header-content">
          <h1 className="resumate-title">🤖 ResuMate</h1>
          <p className="resumate-subtitle">AI-Powered Resume Assistant</p>
        </div>
      </header>

      <nav className="resumate-nav">
        <div className="nav-container">
          {resumeNavItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="resumate-main">
        <div className="main-container">
          <Routes>
            <Route path="/upload" element={<ResumeUpload />} />
            <Route path="/analysis" element={<ResumeAnalysis />} />
            <Route path="/improvement" element={<ResumeImprovement />} />
            <Route path="/qa" element={<ResumeQA />} />
            <Route path="/interview" element={<MockInterview />} />
            <Route path="/jobs" element={<JobSearch />} />
            <Route path="/n8n-test" element={<N8nTest />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default ResuMate;
