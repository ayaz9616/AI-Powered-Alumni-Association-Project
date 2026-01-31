import { Link } from 'react-router-dom';

function Navbar({ userProfile, onLogout }) {
  return (
    <nav className="bg-neutral-950 border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-2xl">🎓</span>
            <span className="text-white font-bold text-lg">Alumni Connect</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="text-sm text-neutral-400 hover:text-white transition font-medium">
              Home
            </Link>
            <Link to="/about" className="text-sm text-neutral-400 hover:text-white transition font-medium">
              About
            </Link>
            <Link to="/features" className="text-sm text-neutral-400 hover:text-white transition font-medium">
              Features
            </Link>
            
            {userProfile ? (
              <>
                <Link to="/profile" className="text-sm text-neutral-400 hover:text-white transition font-medium">
                  Profile
                </Link>
                <Link to="/jobs" className="text-sm text-neutral-400 hover:text-white transition font-medium">
                  Jobs
                </Link>
                <Link to="/resumate" className="text-sm text-neutral-400 hover:text-white transition font-medium">
                  ResuMate
                </Link>
                <Link to="/community" className="text-sm text-neutral-400 hover:text-white transition font-medium">
                  Community
                </Link>
                <Link to="/alumni-directory" className="text-sm text-neutral-400 hover:text-white transition font-medium">
                  Alumni
                </Link>
                
                {/* User Info */}
                <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                  <span className="text-sm text-white font-medium">
                    {userProfile.role === 'student' && '🎓'}
                    {userProfile.role === 'alumni' && '🎖️'}
                    {' '}{userProfile.name}
                  </span>
                  <button 
                    onClick={onLogout} 
                    className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="px-5 py-2 rounded-full bg-green-500 text-black text-sm font-semibold hover:bg-green-400 transition"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
