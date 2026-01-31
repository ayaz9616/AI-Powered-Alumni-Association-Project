import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, GraduationCap, Mail, Linkedin, Github, Twitter, Facebook, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAlumni, getAlumniStats } from '../../services/alumniApi';
import toast from 'react-hot-toast';

const AlumniDirectory = () => {
  const [alumni, setAlumni] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    course: '',
    batch: '',
    city: '',
    company: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState(null);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await getAlumni(filters);
      setAlumni(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load alumni');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getAlumniStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchAlumni();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.course, filters.batch, filters.city, filters.company, filters.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Just update filters, useEffect will handle the fetch
    setFilters(prev => ({ ...prev, search: prev.search, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      course: '',
      batch: '',
      city: '',
      company: '',
      page: 1,
      limit: 12
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const extractCompany = (experience) => {
    if (!experience) return 'Not specified';
    const match = experience.match(/(?:at|@)\s+([^,\n]+)/i);
    return match ? match[1].trim() : experience.split(',')[0].trim() || 'Not specified';
  };

  const extractRole = (experience) => {
    if (!experience) return '';
    const match = experience.match(/^([^@,]+)/);
    return match ? match[1].trim() : '';
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-2">Alumni Directory</h1>
        <p className="text-white/60">Connect with {pagination?.total || 0} alumni from IIIT Bhagalpur</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-neutral-950 border border-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-500">{stats.total}</div>
            <div className="text-white/60 text-sm">Total Alumni</div>
          </div>
          {stats.byCourse.slice(0, 3).map((stat) => (
            <div key={stat.course} className="bg-neutral-950 border border-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-500">{stat.count}</div>
              <div className="text-white/60 text-sm">{stat.course}</div>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-neutral-950 border border-white/10 rounded-lg p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-green-500 hover:text-green-400"
                >
                  Clear
                </button>
              </div>

              {/* Course Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Course</label>
                <select
                  value={filters.course}
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="">All Courses</option>
                  {stats?.byCourse.map((stat) => (
                    <option key={stat.course} value={stat.course}>
                      {stat.course} ({stat.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Batch</label>
                <select
                  value={filters.batch}
                  onChange={(e) => handleFilterChange('batch', e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="">All Batches</option>
                  {stats?.byBatch.map((stat) => (
                    <option key={stat.batch} value={stat.batch}>
                      {stat.batch} ({stat.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="Search by city..."
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Company Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Company</label>
                <input
                  type="text"
                  value={filters.company}
                  onChange={(e) => handleFilterChange('company', e.target.value)}
                  placeholder="Search by company..."
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search by name, skills, experience..."
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-green-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Alumni Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-neutral-950 border border-white/10 rounded-lg p-6 animate-pulse">
                    <div className="h-16 w-16 bg-white/10 rounded-full mb-4"></div>
                    <div className="h-4 bg-white/10 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-white/10 rounded mb-2 w-1/2"></div>
                    <div className="h-3 bg-white/10 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : alumni.length === 0 ? (
              <div className="bg-neutral-950 border border-white/10 rounded-lg p-12 text-center">
                <Search className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No alumni found matching your criteria</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-green-500 hover:text-green-400"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {alumni.map((person) => (
                    <div
                      key={person.id}
                      className="bg-neutral-950 border border-white/10 rounded-lg p-6 hover:border-green-500/50 transition-colors group"
                    >
                      {/* Avatar */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="h-16 w-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                          {getInitials(person.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold mb-1 truncate">{person.name}</h3>
                          {person.experience && (
                            <>
                              <p className="text-sm text-white/80 truncate">{extractRole(person.experience)}</p>
                              <p className="text-sm text-white/60 truncate">{extractCompany(person.experience)}</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <GraduationCap className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{person.course.name} - {person.batch.year}</span>
                        </div>
                        {person.livesIn?.city && (
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{person.livesIn.city}</span>
                          </div>
                        )}
                      </div>

                      {/* Social Links */}
                      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                        {person.email && (
                          <a
                            href={`mailto:${person.email}`}
                            className="text-white/60 hover:text-green-500 transition-colors"
                            title="Email"
                          >
                            <Mail className="h-5 w-5" />
                          </a>
                        )}
                        {person.social?.linkedin && (
                          <a
                            href={person.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-green-500 transition-colors"
                            title="LinkedIn"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                        {person.social?.github && (
                          <a
                            href={person.social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-green-500 transition-colors"
                            title="GitHub"
                          >
                            <Github className="h-5 w-5" />
                          </a>
                        )}
                        {person.social?.twitter && (
                          <a
                            href={person.social.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-green-500 transition-colors"
                            title="Twitter"
                          >
                            <Twitter className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                      disabled={!pagination.hasPrevPage}
                      className="p-2 rounded-lg bg-neutral-950 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-500/50 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {[...Array(pagination.totalPages)].map((_, i) => {
                        const page = i + 1;
                        // Show first 2, last 2, and current with neighbors
                        if (
                          page === 1 ||
                          page === 2 ||
                          page === pagination.totalPages ||
                          page === pagination.totalPages - 1 ||
                          (page >= filters.page - 1 && page <= filters.page + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setFilters({ ...filters, page })}
                              className={`w-10 h-10 rounded-lg ${
                                page === filters.page
                                  ? 'bg-green-600 text-white'
                                  : 'bg-neutral-950 border border-white/10 hover:border-green-500/50'
                              } transition-colors`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === 3 || page === pagination.totalPages - 2) {
                          return <span key={page} className="text-white/40">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      disabled={!pagination.hasNextPage}
                      className="p-2 rounded-lg bg-neutral-950 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-500/50 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDirectory;
