import { useState } from 'react';
import { resumeAPI } from '../services/api';

function ResumeQA() {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    const userMessage = { role: 'user', content: question };
    setChatHistory(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await resumeAPI.askQuestion({
        question,
        chat_history: chatHistory,
      });

      const assistantMessage = { role: 'assistant', content: response.data.answer };
      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${error.response?.data?.detail || 'Failed to get answer'}`,
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  return (
    <div className="resume-qa">
      <div className="qa-container">
        <div className="qa-header">
          <h2>💬 Resume Q&A</h2>
          <p className="description">Ask questions about your resume</p>
          {chatHistory.length > 0 && (
            <button className="btn-clear" onClick={clearChat}>
              🗑️ Clear Chat
            </button>
          )}
        </div>

        <div className="chat-container">
          {chatHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💭</div>
              <p>Ask me anything about your resume!</p>
              <div className="example-questions">
                <p><strong>Example questions:</strong></p>
                <ul>
                  <li>"What are my key skills?"</li>
                  <li>"Summarize my work experience"</li>
                  <li>"What are my weaknesses?"</li>
                  <li>"What projects have I worked on?"</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="chat-messages">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="message-content">
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message assistant">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="input-container">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question here..."
            rows="3"
            disabled={loading}
          />
          <button
            className="btn-send"
            onClick={handleAsk}
            disabled={loading || !question.trim()}
          >
            {loading ? '⏳' : '📤'} Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumeQA;
