import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBriefcase, FaUserTie, FaUsers, FaCalendarAlt, FaFileAlt, FaChartLine, FaComments, FaNetworkWired } from 'react-icons/fa';

const tools = [
  {
    title: 'Job Board',
    description: 'Post and discover job opportunities within the alumni network',
    icon: FaBriefcase,
    link: '/dashboard/jobs'
  },
  {
    title: 'Alumni Profiles',
    description: 'Connect with accomplished alumni across industries',
    icon: FaUserTie,
    link: '/dashboard/profile'
  },
  {
    title: 'Mentorship',
    description: 'Find mentors or become one to guide students',
    icon: FaUsers,
    link: '/dashboard'
  },
  {
    title: 'Event Calendar',
    description: 'Stay updated on alumni meetups and networking events',
    icon: FaCalendarAlt,
    link: '/dashboard'
  },
  {
    title: 'Resume Tools',
    description: 'Build and optimize your resume with AI assistance',
    icon: FaFileAlt,
    link: '/dashboard/resume-tools'
  },
  {
    title: 'Career Analytics',
    description: 'Track your career progression and opportunities',
    icon: FaChartLine,
    link: '/dashboard'
  },
  {
    title: 'Discussion Forums',
    description: 'Engage in meaningful conversations with peers',
    icon: FaComments,
    link: '/dashboard'
  },
  {
    title: 'Network Graph',
    description: 'Visualize your professional connections',
    icon: FaNetworkWired,
    link: '/dashboard'
  }
];

function ToolCard({ tool }) {
  const Icon = tool.icon;

  return (
    <Link to={tool.link}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-neutral-950 to-black p-6 transition-all duration-300 group hover:border-white/20"
      >
        {/* Grain texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          }}
        />

        {/* Radial hover glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle at center, rgba(74, 222, 128, 0.08) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
              <Icon className="w-5 h-5" />
            </div>
            <svg
              className="w-4 h-4 text-neutral-600 group-hover:text-green-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-white mb-2">{tool.title}</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">{tool.description}</p>
        </div>
      </motion.div>
    </Link>
  );
}

function PlatformModules() {
  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-4">
            Platform Modules
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Explore our suite of tools designed to connect, mentor, and empower the alumni community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tools.map((tool, idx) => (
            <ToolCard key={idx} tool={tool} />
          ))}
        </div>

        <div className="text-center">
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition inline-flex items-center gap-2"
            >
              Get Started
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PlatformModules;
