import { useState } from 'react';
import { resumeAPI } from '../services/api';

function ResumeAnalysis() {
  const [formData, setFormData] = useState({
    role: '',
    cutoff_score: 75,
    jd_text: '',
    custom_skills: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = async () => {
    if (!formData.role.trim()) {
      alert('Please enter a job role');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const payload = {
        role: formData.role,
        cutoff_score: parseInt(formData.cutoff_score),
        jd_text: formData.jd_text || null,
        custom_skills: formData.custom_skills ? formData.custom_skills.split(',').map(s => s.trim()) : null,
      };

      const response = await resumeAPI.analyzeResume(payload);
      setResult(response.data);
    } catch (error) {
      alert(error.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-analysis">
      <div className="analysis-form">
        <h2>🎯 Resume Analysis</h2>
        <p className="description">Analyze your resume against job requirements</p>

        <div className="form-group">
          <label>Job Role *</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g., Software Engineer, Data Scientist"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Cutoff Score (0-100)</label>
          <input
            type="number"
            name="cutoff_score"
            value={formData.cutoff_score}
            onChange={handleChange}
            min="0"
            max="100"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Job Description (Optional)</label>
          <textarea
            name="jd_text"
            value={formData.jd_text}
            onChange={handleChange}
            placeholder="Paste the job description here..."
            rows="4"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Custom Skills (Optional, comma-separated)</label>
          <input
            type="text"
            name="custom_skills"
            value={formData.custom_skills}
            onChange={handleChange}
            placeholder="Python, JavaScript, React, Machine Learning"
            disabled={loading}
          />
        </div>

        <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
          {loading ? '⏳ Analyzing...' : '🔍 Analyze Resume'}
        </button>
      </div>

      {result && (
        <div className="analysis-results">
          <div className="score-card">
            <h3>Overall Score</h3>
            <div className="score-circle">
              <span className="score-value">{result.overall_score.toFixed(1)}</span>
              <span className="score-label">/ 100</span>
            </div>
          </div>

          <div className="results-grid">
            <div className="result-section">
              <h3>✅ Matching Skills ({result.matching_skills.length})</h3>
              <div className="skills-list">
                {result.matching_skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag match">{skill}</span>
                ))}
              </div>
            </div>

            <div className="result-section">
              <h3>❌ Missing Skills ({result.missing_skills.length})</h3>
              <div className="skills-list">
                {result.missing_skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag missing">{skill}</span>
                ))}
              </div>
            </div>

            <div className="result-section">
              <h3>💪 Strengths</h3>
              <ul>
                {result.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="result-section">
              <h3>📈 Recommendations</h3>
              <ul>
                {result.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {result.skill_scores && Object.keys(result.skill_scores).length > 0 && (
            <div className="skill-scores">
              <h3>Skill Ratings</h3>
              {Object.entries(result.skill_scores).map(([skill, score]) => (
                <div key={skill} className="skill-bar">
                  <span className="skill-name">{skill}</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: `${(score / 10) * 100}%` }}></div>
                  </div>
                  <span className="skill-score">{score.toFixed(1)}/10</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResumeAnalysis;
