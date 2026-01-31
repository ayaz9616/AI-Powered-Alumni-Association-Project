import { useState } from 'react';
import { interviewAPI } from '../services/api';

function MockInterview() {
  const [step, setStep] = useState('setup'); // setup, interview, summary
  const [config, setConfig] = useState({
    question_types: ['Technical'],
    difficulty: 'Medium',
    num_questions: 5,
    max_duration_minutes: 15,
  });
  const [interview, setInterview] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const questionTypes = ['Technical', 'Behavioral', 'System Design', 'Coding'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleTypeToggle = (type) => {
    setConfig(prev => ({
      ...prev,
      question_types: prev.question_types.includes(type)
        ? prev.question_types.filter(t => t !== type)
        : [...prev.question_types, type]
    }));
  };

  const startInterview = async () => {
    if (config.question_types.length === 0) {
      alert('Please select at least one question type');
      return;
    }

    setLoading(true);
    try {
      const response = await interviewAPI.startInterview(config);
      setInterview(response.data);
      setStep('interview');
      setCurrentQuestionIdx(0);
      setAnswers([]);
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer');
      return;
    }

    setLoading(true);
    try {
      const submission = {
        question_id: currentQuestionIdx,
        transcript: answer,
      };

      const response = await interviewAPI.submitAnswer(interview.interview_id, submission);
      setAnswers(prev => [...prev, { question: interview.questions[currentQuestionIdx].question_text, answer, score: response.data.scores }]);
      setAnswer('');

      if (response.data.next_question_id !== null) {
        setCurrentQuestionIdx(response.data.next_question_id);
      } else {
        // Interview complete, fetch summary
        const summaryResponse = await interviewAPI.getSummary(interview.interview_id);
        setSummary(summaryResponse.data);
        setStep('summary');
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    setStep('setup');
    setInterview(null);
    setCurrentQuestionIdx(0);
    setAnswer('');
    setAnswers([]);
    setSummary(null);
  };

  return (
    <div className="mock-interview">
      {step === 'setup' && (
        <div className="interview-setup">
          <h2>🎤 Mock Interview Setup</h2>
          <p className="description">Configure your mock interview session</p>

          <div className="config-section">
            <h3>Question Types</h3>
            <div className="type-buttons">
              {questionTypes.map(type => (
                <button
                  key={type}
                  className={`type-btn ${config.question_types.includes(type) ? 'active' : ''}`}
                  onClick={() => handleTypeToggle(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="config-section">
            <h3>Difficulty</h3>
            <div className="difficulty-buttons">
              {difficulties.map(diff => (
                <button
                  key={diff}
                  className={`diff-btn ${config.difficulty === diff ? 'active' : ''}`}
                  onClick={() => setConfig(prev => ({ ...prev, difficulty: diff }))}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="config-section">
            <h3>Number of Questions</h3>
            <input
              type="number"
              min="1"
              max="20"
              value={config.num_questions}
              onChange={(e) => setConfig(prev => ({ ...prev, num_questions: parseInt(e.target.value) }))}
            />
          </div>

          <div className="config-section">
            <h3>Duration (minutes)</h3>
            <input
              type="number"
              min="5"
              max="60"
              value={config.max_duration_minutes}
              onChange={(e) => setConfig(prev => ({ ...prev, max_duration_minutes: parseInt(e.target.value) }))}
            />
          </div>

          <button className="btn-start" onClick={startInterview} disabled={loading}>
            {loading ? '⏳ Starting...' : '🚀 Start Interview'}
          </button>
        </div>
      )}

      {step === 'interview' && interview && (
        <div className="interview-session">
          <div className="interview-header">
            <h2>Question {currentQuestionIdx + 1} of {interview.questions.length}</h2>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentQuestionIdx + 1) / interview.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="question-card">
            <div className="question-type">
              {interview.questions[currentQuestionIdx].question_type}
            </div>
            <h3>{interview.questions[currentQuestionIdx].question_text}</h3>
          </div>

          <div className="answer-section">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows="8"
              disabled={loading}
            />
          </div>

          <div className="interview-actions">
            <button className="btn-submit" onClick={submitAnswer} disabled={loading || !answer.trim()}>
              {loading ? '⏳ Submitting...' : currentQuestionIdx < interview.questions.length - 1 ? '➡️ Next Question' : '✅ Finish Interview'}
            </button>
          </div>
        </div>
      )}

      {step === 'summary' && summary && (
        <div className="interview-summary">
          <h2>🎉 Interview Complete!</h2>
          
          <div className="summary-stats">
            <div className="stat-card">
              <div className="stat-value">{summary.answered_questions}/{summary.total_questions}</div>
              <div className="stat-label">Questions Answered</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.overall_score.toFixed(1)}/10</div>
              <div className="stat-label">Overall Score</div>
            </div>
            <div className="stat-card decision">
              <div className="stat-value">{summary.decision}</div>
              <div className="stat-label">Decision</div>
            </div>
          </div>

          <div className="summary-scores">
            <div className="score-item">
              <span className="score-label">Communication</span>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${summary.average_communication * 10}%` }}></div>
              </div>
              <span className="score-value">{summary.average_communication.toFixed(1)}/10</span>
            </div>
            <div className="score-item">
              <span className="score-label">Technical Knowledge</span>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${summary.average_technical * 10}%` }}></div>
              </div>
              <span className="score-value">{summary.average_technical.toFixed(1)}/10</span>
            </div>
            <div className="score-item">
              <span className="score-label">Problem Solving</span>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${summary.average_problem_solving * 10}%` }}></div>
              </div>
              <span className="score-value">{summary.average_problem_solving.toFixed(1)}/10</span>
            </div>
          </div>

          <div className="summary-feedback">
            <h3>Detailed Feedback</h3>
            <p>{summary.detailed_feedback}</p>
          </div>

          <div className="summary-lists">
            <div className="strength-section">
              <h3>💪 Strengths</h3>
              <ul>
                {summary.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>
            <div className="improvement-section">
              <h3>📈 Areas for Improvement</h3>
              <ul>
                {summary.areas_for_improvement.map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            </div>
          </div>

          <button className="btn-restart" onClick={resetInterview}>
            🔄 Start New Interview
          </button>
        </div>
      )}
    </div>
  );
}

export default MockInterview;
