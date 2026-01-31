import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Feed", href: "/community/feed" },
  { label: "Past Events", href: "/community/past-events" },
  { label: "Upcoming Events", href: "/community/upcoming-events" },
  { label: "Students Request", href: "/community/students-request" },
  { label: "Home", href: "/" },
];

const Community = () => {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black flex relative">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-neutral-950 px-6 py-8 overflow-y-auto">
        {/* Brand */}
        <div className="mb-12">
          <h1 className="text-lg font-medium text-white">Community</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Connect & collaborate
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item, idx) => {
            if (item.href === "/") {
              return (
                <button
                  key={idx}
                  onClick={() => navigate(item.href)}
                  className="w-full text-left block rounded-lg px-4 py-2.5 text-sm font-medium transition text-neutral-400 hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </button>
              );
            }

            return (
              <NavLink
                key={idx}
                to={item.href}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-green-500/20 text-green-400"
                      : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-8 left-6 right-6">
          <div className="h-px bg-white/10 mb-4" />
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-neutral-400 hover:bg-white/5 hover:text-white transition font-medium px-3 py-2 rounded-lg"
            type="button"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 w-[calc(100%-16rem)] px-10 py-8 overflow-y-auto h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Community;
