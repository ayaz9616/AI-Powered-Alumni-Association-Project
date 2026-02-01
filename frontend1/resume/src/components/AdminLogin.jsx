import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser } from '../services/mentorshipApi';
import { setUserProfile } from '../lib/authManager';

const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin@gmail.com'
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (credentials.email === ADMIN_CREDENTIALS.email && credentials.password === ADMIN_CREDENTIALS.password) {
        // Call backend login to ensure admin user exists and capture userId
        try {
          const res = await loginUser(credentials.email, credentials.password);
          if (res?.success && res?.data) {
            setUserProfile({
              userId: res.data.userId,
              role: res.data.role,
              name: res.data.name,
              email: res.data.email,
            });
          }
        } catch (_e) {
          // Continue with local admin auth even if backend call fails
        }

        localStorage.setItem('adminAuth', 'true');
        toast.success('Admin login successful');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid credentials!');
      }
    } catch (err) {
      toast.error('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-top bg-repeat"
        style={{
          backgroundImage: "url('/gotbackground.png')",
          backgroundSize: "400px 400px",
        }}
      />
      <div className="absolute inset-0 bg-[rgba(19,20,20,0.85)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(19,20,20,0)_35%,rgba(19,20,20,0.95)_100%)]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-neutral-950/90 backdrop-blur-xl px-8 py-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
              <Lock size={32} className="text-green-500" />
            </div>
            <h1 className="text-3xl font-medium text-white mb-2">Admin Login</h1>
            <p className="text-sm text-neutral-400">Access the admin dashboard</p>
          </div>

          {/* Credentials Display */}
          <div className="mb-6 p-4 bg-neutral-900 border border-white/10 rounded-lg">
            <p className="text-xs text-neutral-500 mb-2">Demo Credentials:</p>
            <p className="text-sm text-neutral-300">Email: <span className="text-green-400">admin@gmail.com</span></p>
            <p className="text-sm text-neutral-300">Password: <span className="text-green-400">admin@gmail.com</span></p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Email
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  placeholder="Enter email"
                  className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  placeholder="Enter password"
                  className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 rounded-lg bg-green-500 hover:bg-green-400 text-black font-medium transition"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-neutral-400 hover:text-white transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
