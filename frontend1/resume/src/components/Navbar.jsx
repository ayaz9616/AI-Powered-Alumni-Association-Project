// import { Link } from 'react-router-dom';

// function Navbar({ userProfile, onLogout }) {
//   return (
//     <nav className="bg-neutral-950 border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
//       <div className="max-w-7xl mx-auto px-6">
//         <div className="flex items-center justify-between h-16">
//           {/* Brand */}
//           <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
//             <span className="text-2xl">🎓</span>
//             <span className="text-white font-bold text-lg">Alumni Connect</span>
//           </Link>

//           {/* Navigation Links */}
//           <div className="flex items-center gap-8">
//             <Link to="/" className="text-sm text-neutral-400 hover:text-white transition font-medium">
//               Home
//             </Link>
//             <Link to="/about" className="text-sm text-neutral-400 hover:text-white transition font-medium">
//               About
//             </Link>
//             <Link to="/features" className="text-sm text-neutral-400 hover:text-white transition font-medium">
//               Features
//             </Link>
            
//             {userProfile ? (
//               <>
//                 <Link to="/profile" className="text-sm text-neutral-400 hover:text-white transition font-medium">
//                   Profile
//                 </Link>
//                 <Link to="/jobs" className="text-sm text-neutral-400 hover:text-white transition font-medium">
//                   Jobs
//                 </Link>
//                 <Link to="/resumate" className="text-sm text-neutral-400 hover:text-white transition font-medium">
//                   ResuMate
//                 </Link>
//                 <Link to="/community" className="text-sm text-neutral-400 hover:text-white transition font-medium">
//                   Community
//                 </Link>
//                 <Link to="/alumni-directory" className="text-sm text-neutral-400 hover:text-white transition font-medium">
//                   Alumni
//                 </Link>
                
//                 {/* User Info */}
//                 <div className="flex items-center gap-4 pl-4 border-l border-white/10">
//                   <span className="text-sm text-white font-medium">
//                     {userProfile.role === 'student' && '🎓'}
//                     {userProfile.role === 'alumni' && '🎖️'}
//                     {' '}{userProfile.name}
//                   </span>
//                   <button 
//                     onClick={onLogout} 
//                     className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <Link 
//                 to="/auth" 
//                 className="px-5 py-2 rounded-full bg-green-500 text-black text-sm font-semibold hover:bg-green-400 transition"
//               >
//                 Get Started
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Navbar({ userProfile, onLogout }) {
  const [style, setStyle] = useState({
    maxWidth: "1200px",
    backgroundColor: "rgba(30,30,30,0.9)",
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");

    const handleScroll = () => {
      if (!hero) return;

      const heroHeight = hero.offsetHeight;
      const scrollY = window.scrollY;

      // Stop shrinking earlier for stability
      const rawProgress = 1 - scrollY / (heroHeight * 0.6);
      const progress = Math.max(0, Math.min(rawProgress, 1));

      // Safe widths for full menu
      const maxWidth = 1200;
      const minWidth = 960;
      const width = minWidth + (maxWidth - minWidth) * progress;

      const maxOpacity = 0.9;
      const minOpacity = 0.45;
      const opacity =
        maxOpacity - (maxOpacity - minOpacity) * (1 - progress);

      setStyle({
        maxWidth: `${width}px`,
        backgroundColor: `rgba(30,30,30,${opacity})`,
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <nav
      style={style}
      className="
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        w-[calc(100%-2rem)]
        backdrop-blur-xl
        transition-all duration-300 ease-out
        rounded-xl px-6 py-3
        will-change-[max-width,background-color]
      "
    >
      <div className="flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          className="text-white font-bold text-lg hover:opacity-80 transition"
        >
          Alumni Connect
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm text-neutral-300 font-medium">
          {userProfile && (
            <>
              <Link to="/jobs" className="hover:text-white transition">Jobs</Link>
              <Link to="/resumate" className="hover:text-white transition">ResuMate</Link>
              <Link to="/community" className="hover:text-white transition">Community</Link>
              <Link to="/alumni-directory" className="hover:text-white transition">Alumni</Link>
            </>
          )}
          <Link to="/donate" className="hover:text-white transition">Donate</Link>
        </div>

        {/* Desktop User / Auth */}
        <div className="hidden md:flex items-center gap-4">
          {userProfile ? (
            <>
              <Link
                to="/profile"
                className="text-sm text-white font-medium truncate max-w-[140px] hover:text-green-400 transition cursor-pointer"
              >
                {userProfile.name}
              </Link>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="bg-green-500 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-400 transition"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5"
        >
                <Link to="/donate" onClick={closeMenu}>Donate</Link>
          <span className={`h-[2px] w-6 bg-white transition ${open && "rotate-45 translate-y-[6px]"}`} />
          <span className={`h-[2px] w-6 bg-white transition ${open && "opacity-0"}`} />
          <span className={`h-[2px] w-6 bg-white transition ${open && "-rotate-45 -translate-y-[6px]"}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/10">
          <div className="flex flex-col gap-4 text-sm text-neutral-300">
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/about" onClick={closeMenu}>About</Link>
            <Link to="/features" onClick={closeMenu}>Features</Link>

            {userProfile ? (
              <>
                <Link to="/profile" onClick={closeMenu} className="text-white font-medium border border-white/20 py-2 px-4 rounded-lg hover:bg-white/5 transition">
                  {userProfile.name}'s Profile
                </Link>
                <Link to="/jobs" onClick={closeMenu}>Jobs</Link>
                <Link to="/resumate" onClick={closeMenu}>ResuMate</Link>
                <Link to="/community" onClick={closeMenu}>Community</Link>
                <Link to="/alumni-directory" onClick={closeMenu}>Alumni</Link>

                <button
                  onClick={() => {
                    closeMenu();
                    onLogout();
                  }}
                  className="mt-2 w-full bg-red-500/10 text-red-400 py-2 rounded-lg hover:bg-red-500/20 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={closeMenu}
                className="mt-2 w-full bg-green-500 text-black py-2 rounded-lg text-center font-semibold hover:bg-green-400 transition"
              >
                Get Started
              </Link>
            )}
            {!userProfile && (
              <Link to="/donate" onClick={closeMenu} className="mt-2 w-full bg-neutral-800 text-white py-2 rounded-lg text-center hover:bg-neutral-700 transition">Donate</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
