import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUserProfile, setUserProfile, generateUserId } from '../lib/authManager';
import { registerUser, loginUser } from '../services/mentorshipApi';

function Auth({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email');
      }

      // Call login API
      const response = await loginUser(email, password);
      
      if (response.success && response.data) {
        // Save user profile to localStorage
        setUserProfile({
          userId: response.data.userId,
          role: response.data.role,
          name: response.data.name,
          email: response.data.email
        });

        onAuthSuccess(response.data);
      } else {
        throw new Error(response.error || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = (err && err.message) ? err.message : '';
      if (msg.includes('Failed to fetch')) {
        setError('Backend unreachable. Please start the API server at http://localhost:8000 and try again.');
      } else {
        setError(msg || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!name || !email || !password || !role) {
        throw new Error('All fields are required');
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Generate new userId
      const userId = generateUserId();

      // Register user with password
      const response = await registerUser({
        userId,
        email,
        name,
        role,
        password,
        profilePicture: ''
      });

      if (response.success) {
        // Save to localStorage
        setUserProfile({
          userId,
          role,
          name,
          email
        });

        // Redirect to onboarding
        navigate('/onboarding');
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email) {
        throw new Error('Please enter your email address');
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email');
      }

      // TODO: Implement actual forgot password API call
      // For now, just show success message
      setResetSent(true);
      setTimeout(() => {
        setResetSent(false);
        setMode('login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setResetSent(false);
  };

  return (
    <section className="min-h-screen bg-black flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-neutral-950" />
      
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-8"
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="text-4xl mb-4">🎓</div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 mb-3">
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Get started'}
            {mode === 'forgot' && 'Reset password'}
          </p>
          <h1 className="text-3xl font-medium text-white tracking-tight">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Forgot your password?'}
          </h1>
        </div>

        {/* Mode Tabs */}
        {mode !== 'forgot' && (
          <div className="flex gap-2 mb-8">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition ${
                mode === 'login'
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-500 hover:text-white hover:bg-white/5'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition ${
                mode === 'signup'
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-500 hover:text-white hover:bg-white/5'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs text-neutral-400 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institute.edu"
                className="w-full rounded-lg bg-black border border-white/10 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-black border border-white/10 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-xs text-neutral-500 hover:text-white transition"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-green-500 py-3 text-black text-sm font-medium hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-xs text-neutral-400 mb-2">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-lg bg-black border border-white/10 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institute.edu"
                className="w-full rounded-lg bg-black border border-white/10 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full rounded-lg bg-black border border-white/10 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-green-500"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-2">
                I am a...
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500"
                required
              >
                <option value="student">🎓 Student (seeking mentorship)</option>
                <option value="alumni">🎖️ Alumni (offering mentorship)</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-green-500 py-3 text-black text-sm font-medium hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-xs text-neutral-400">
              <p className="font-medium text-white mb-2">Role Information:</p>
              <ul className="space-y-1">
                <li>• <strong className="text-white">Student:</strong> Find mentors, schedule sessions, get career guidance</li>
                <li>• <strong className="text-white">Alumni:</strong> Mentor students, share experience, give back</li>
              </ul>
            </div>
          </form>
        )}

        {/* Forgot Password Form */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-xs text-neutral-400 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institute.edu"
                className="w-full rounded-lg bg-black border border-white/10 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            {resetSent && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg text-sm">
                ✅ Password reset link sent! Check your email.
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || resetSent}
              className="w-full rounded-full bg-green-500 py-3 text-black text-sm font-medium hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-xs text-neutral-500 hover:text-white transition"
              >
                ← Back to sign in
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </section>
  );
}

export default Auth;
