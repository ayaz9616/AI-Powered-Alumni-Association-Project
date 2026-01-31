import { useState } from 'react';
import { resumeAPI } from '../services/api';

function ResumeImprovement() {
  const [focusAreas, setFocusAreas] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImprove = async () => {
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        focus_areas: focusAreas ? focusAreas.split(',').map(s => s.trim()) : null,
      };

      const response = await resumeAPI.improveResume(payload);
      setResult(response.data);
    } catch (error) {
      alert(error.response?.data?.detail || 'Improvement generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-improvement">
      <div className="improvement-form">
        <h2>✨ Resume Improvement</h2>
        <p className="description">Get AI-powered suggestions to enhance your resume</p>

        <div className="form-group">
          <label>Focus Areas (Optional, comma-separated)</label>
          <input
            type="text"
            value={focusAreas}
            onChange={(e) => setFocusAreas(e.target.value)}
            placeholder="e.g., Experience, Skills, Education"
            disabled={loading}
          />
        </div>

        <button className="btn-primary" onClick={handleImprove} disabled={loading}>
          {loading ? '⏳ Generating Improvements...' : '🚀 Get Improvements'}
        </button>
      </div>

      {result && (
        <div className="improvement-results">
          <div className="overall-section">
            <h3>📊 Overall Improvements</h3>
            <div className="content-box">
              {result.overall_improvements}
            </div>
          </div>

          {result.improved_sections && Object.keys(result.improved_sections).length > 0 && (
            <div className="sections-grid">
              <h3>📝 Improved Sections</h3>
              {Object.entries(result.improved_sections).map(([section, content]) => (
                <div key={section} className="section-card">
                  <h4>{section}</h4>
                  <div className="section-content">
                    {content.description && (
                      <p className="section-description">{content.description}</p>
                    )}
                    {content.specific && content.specific.length > 0 && (
                      <div className="specific-suggestions">
                        <strong>Specific Improvements:</strong>
                        <ul>
                          {content.specific.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {content.before_after && (
                      <div className="before-after">
                        <div className="before">
                          <strong>Before:</strong>
                          <pre>{content.before_after.before}</pre>
                        </div>
                        <div className="after">
                          <strong>After:</strong>
                          <pre>{content.before_after.after}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.suggestions && result.suggestions.length > 0 && (
            <div className="suggestions-section">
              <h3>💡 Suggestions</h3>
              <ul className="suggestions-list">
                {result.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="suggestion-item">
                    <span className="suggestion-icon">💡</span>
                    <span className="suggestion-text">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResumeImprovement;
