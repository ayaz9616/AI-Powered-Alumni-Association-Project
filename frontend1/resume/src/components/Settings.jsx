import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

function Settings() {
  const [settings, setSettings] = useState({
    provider: 'groq',
    api_key: '',
    model: '',
    ollama_base_url: 'http://localhost:11434',
    ollama_model: 'llama3.1:8b',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    setMessage('');
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      await settingsAPI.updateSettings(settings);
      setMessage('✅ Settings saved successfully!');
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.detail || 'Failed to save settings'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings">
      <div className="settings-container">
        <h2>⚙️ Settings</h2>
        <p className="description">Configure your AI provider and API keys</p>

        <div className="settings-form">
          <div className="form-group">
            <label>LLM Provider</label>
            <select name="provider" value={settings.provider} onChange={handleChange} disabled={loading}>
              <option value="groq">Groq</option>
              <option value="openai">OpenAI</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>

          {(settings.provider === 'groq' || settings.provider === 'openai') && (
            <div className="form-group">
              <label>API Key</label>
              <input
                type="password"
                name="api_key"
                value={settings.api_key || ''}
                onChange={handleChange}
                placeholder="Enter your API key"
                disabled={loading}
              />
              <small className="hint">
                {settings.provider === 'groq' ? 'Get your Groq API key from groq.com' : 'Get your OpenAI API key from platform.openai.com'}
              </small>
            </div>
          )}

          {(settings.provider === 'groq' || settings.provider === 'openai') && (
            <div className="form-group">
              <label>Model (Optional)</label>
              <input
                type="text"
                name="model"
                value={settings.model || ''}
                onChange={handleChange}
                placeholder={settings.provider === 'groq' ? 'e.g., llama-3.1-8b-instant' : 'e.g., gpt-4'}
                disabled={loading}
              />
            </div>
          )}

          {settings.provider === 'ollama' && (
            <>
              <div className="form-group">
                <label>Ollama Base URL</label>
                <input
                  type="text"
                  name="ollama_base_url"
                  value={settings.ollama_base_url || ''}
                  onChange={handleChange}
                  placeholder="http://localhost:11434"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Ollama Model</label>
                <input
                  type="text"
                  name="ollama_model"
                  value={settings.ollama_model || ''}
                  onChange={handleChange}
                  placeholder="llama3.1:8b"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <button className="btn-save" onClick={handleSave} disabled={loading}>
            {loading ? '⏳ Saving...' : '💾 Save Settings'}
          </button>

          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="settings-info">
          <h3>ℹ️ Information</h3>
          <ul>
            <li><strong>Groq:</strong> Fast and free API for Llama models</li>
            <li><strong>OpenAI:</strong> Access to GPT models (paid)</li>
            <li><strong>Ollama:</strong> Run models locally on your machine</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Settings;
