import { useState } from 'react';
import { resumeAPI } from '../services/api';

function ResumeUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resumes, setResumes] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      setMessage('Only PDF and TXT files are supported');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await resumeAPI.uploadResume(file);
      setMessage(`✅ ${response.data.message}`);
      setFile(null);
      document.getElementById('file-input').value = '';
      if (onUploadSuccess) onUploadSuccess(response.data);
      loadResumes();
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.detail || 'Upload failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadResumes = async () => {
    try {
      const response = await resumeAPI.listResumes();
      setResumes(response.data.resumes || []);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    }
  };

  useState(() => {
    loadResumes();
  }, []);

  return (
    <div className="resume-upload">
      <div className="upload-card">
        <h2>📄 Upload Resume</h2>
        <p className="description">Upload your resume in PDF or TXT format</p>
        
        <div className="upload-area">
          <input
            id="file-input"
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            disabled={loading}
          />
          {file && <p className="file-name">Selected: {file.name}</p>}
        </div>

        <button
          className="btn-primary"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? '⏳ Uploading...' : '📤 Upload Resume'}
        </button>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      {resumes.length > 0 && (
        <div className="resumes-list">
          <h3>Your Resumes</h3>
          <div className="resumes-grid">
            {resumes.map((resume) => (
              <div key={resume.id} className="resume-item">
                <span className="resume-name">{resume.filename}</span>
                <span className="resume-date">
                  {new Date(resume.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
