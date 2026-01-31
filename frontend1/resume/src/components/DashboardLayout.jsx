import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { getUserProfile, logout } from '../lib/authManager';

const navItems = [
  { label: "Profile", href: "/profile" },
  { label: "Jobs", href: "/jobs" },
  { label: "ResuMate Tools", href: "/resumate" },
  { label: "Community", href: "/community" },
  { label: "Alumni Directory", href: "/alumni-directory" },
];

const DashboardLayout = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userProfile = getUserProfile();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleHome = () => {
    navigate('/');
  };

  const isActive = (href) => {
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-neutral-950 px-6 py-8 overflow-y-auto z-50">
        {/* Brand */}
        <div className="mb-12">
          <h1 className="text-lg font-medium text-white">
            {role === 'alumni' ? 'Alumni Portal' : 'Student Dashboard'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {userProfile?.name || 'Mentorship Platform'}
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={`w-full text-left block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
          
          <button
            onClick={handleHome}
            className="w-full text-left block rounded-lg px-4 py-2.5 text-sm font-medium transition text-neutral-400 hover:bg-white/5 hover:text-white"
          >
            Home
          </button>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-8 left-6 right-6">
          <div className="h-px bg-white/10 mb-4" />
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition font-medium px-3 py-2 rounded-lg"
            type="button"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 w-[calc(100%-16rem)] min-h-screen bg-black">
        <div className="px-10 py-8">
          {/* Remove the default navbar */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
